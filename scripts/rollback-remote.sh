#!/usr/bin/env bash
# Runs ON the server. Points `current` at the previous release (or the one given) and restarts.
# Usage: rollback-remote.sh <app_root> [release_id]
set -euo pipefail
cd "$1"
TARGET=""
if [ -n "${2:-}" ]; then
  TARGET="releases/$2"
else
  CUR="$(readlink current)"
  TARGET="$(ls -1dt releases/*/ | sed 's#/$##' | grep -vx "$CUR" | head -n1)"
fi
[ -d "$TARGET" ] || { echo "no release to roll back to"; exit 1; }
ln -sfn "$TARGET" current.next
mv -T current.next current
touch tmp/restart.txt
echo "current -> $TARGET"
