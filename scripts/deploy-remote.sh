#!/usr/bin/env bash
# Runs ON the server (uploaded by the deploy workflow). Installs a release tarball as a new
# versioned release, switches the `current` symlink, restarts Passenger and rolls back on failure.
# Touches only: releases/, current, app.js (shim; any old one is backed up), tmp/restart.txt.
# Never touches .env files, uploads or anything else in the app root.
#
# Usage: deploy-remote.sh <app_root> <release_id> <tarball> [health_url]
set -euo pipefail

APP_ROOT="$1"; RELEASE_ID="$2"; TARBALL="$3"; HEALTH_URL="${4:-}"
KEEP=5

[ -d "$APP_ROOT" ] || { echo "app root $APP_ROOT does not exist"; exit 1; }
cd "$APP_ROOT"

# The cPanel Node.js virtual environment is not on PATH in a plain SSH shell.
NODE_BIN="$(ls -d "$HOME"/nodevenv/"$(basename "$APP_ROOT")"/*/bin/node 2>/dev/null | sort -V | tail -n1 || true)"
[ -x "${NODE_BIN:-}" ] || { echo "cPanel Node.js binary not found under ~/nodevenv/$(basename "$APP_ROOT")"; exit 1; }
echo "Using $NODE_BIN ($("$NODE_BIN" -v))"

mkdir -p releases tmp
NEW="releases/$RELEASE_ID"
rm -rf "$NEW"; mkdir -p "$NEW"
tar -xzf "$TARBALL" -C "$NEW"
rm -f "$TARBALL"
if [ ! -s "$NEW/.next/BUILD_ID" ] || [ ! -f "$NEW/server.js" ]; then
  echo "release is incomplete"; rm -rf "$NEW"; exit 1
fi

# Preflight: boot the new release on a loopback port before it can serve real traffic.
PORT=$((20000 + RANDOM % 20000))
(cd "$NEW" && NODE_ENV=production PORT=$PORT HOSTNAME=127.0.0.1 "$NODE_BIN" server.js > "$APP_ROOT/tmp/preflight.log" 2>&1 & echo $! > "$APP_ROOT/tmp/preflight.pid")
ok=0
for _ in $(seq 1 30); do
  if curl -fsS -o /dev/null "http://127.0.0.1:$PORT/robots.txt"; then ok=1; break; fi
  sleep 1
done
kill "$(cat tmp/preflight.pid)" 2>/dev/null || true
if [ "$ok" != 1 ]; then
  echo "Preflight failed; the current release is untouched. Log:"; tail -n 40 tmp/preflight.log
  rm -rf "$NEW"; exit 1
fi
echo "Preflight passed"

PREVIOUS=""
if [ -L current ]; then PREVIOUS="$(readlink current)"; fi

# Stable startup file for cPanel (Application startup file: app.js), pointing at the active release.
if [ ! -f app.js ] || ! grep -q "pipeflow-release-shim" app.js; then
  if [ -f app.js ]; then cp app.js "app.js.bak-$(date +%Y%m%d%H%M%S)"; fi
  printf '%s\n' "// pipeflow-release-shim: starts the Next.js standalone server of the active release." "require('./current/server.js')" > app.js
fi

ln -sfn "$NEW" current.next
mv -T current.next current
touch tmp/restart.txt
echo "Switched current -> $NEW (previous: ${PREVIOUS:-none})"

if [ -n "$HEALTH_URL" ]; then
  healthy=0; code=000
  for _ in $(seq 1 20); do
    sleep 3
    code="$(curl -s -o /dev/null -w '%{http_code}' "$HEALTH_URL" || true)"
    if [ "$code" = 200 ]; then healthy=1; break; fi
  done
  if [ "$healthy" != 1 ]; then
    echo "Health check failed for $HEALTH_URL (last status $code)."
    if [ -n "$PREVIOUS" ] && [ -d "$PREVIOUS" ]; then
      ln -sfn "$PREVIOUS" current.next; mv -T current.next current; touch tmp/restart.txt
      echo "Rolled back to $PREVIOUS"
    else
      echo "No previous release to roll back to."
    fi
    exit 1
  fi
  echo "Health check passed ($HEALTH_URL)"
fi

# Keep the newest releases, never the active or previous one.
ls -1dt releases/*/ 2>/dev/null | tail -n +$((KEEP + 1)) | while read -r old; do
  old="${old%/}"
  [ "$old" = "$(readlink current)" ] && continue
  [ "$old" = "${PREVIOUS:-}" ] && continue
  rm -rf "$old"
done
echo "Deploy complete: $RELEASE_ID"
