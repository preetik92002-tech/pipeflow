import type { PGlite } from '@electric-sql/pglite'

/**
 * A small stand-in for the Supabase admin client that runs the same calls on an
 * in-process Postgres, so server code (repository, API routes) is tested against
 * the real tables and SQL functions. Supports only the query methods the app uses.
 */
type Row = Record<string, unknown>
type Result = { data: unknown; error: { message: string; code?: string } | null }

const ident = (name: string) => {
  if (!/^[a-z_][a-z0-9_]*$/.test(name)) throw new Error(`unsupported identifier ${name}`)
  return name
}
// Objects become JSON (jsonb columns and arguments); arrays stay arrays for `in`.
const param = (v: unknown) => (v !== null && typeof v === 'object' && !Array.isArray(v) ? JSON.stringify(v) : v)

class Query implements PromiseLike<Result> {
  private where: string[] = []
  private values: unknown[] = []
  private cols = '*'
  private orderBy = ''
  private max = ''
  private mode: 'many' | 'single' | 'maybe' = 'many'
  private insertRow: Row | null = null

  constructor(private db: PGlite, private table: string) {}

  select(cols = '*') {
    this.cols = cols === '*' ? '*' : cols.split(',').map((c) => ident(c.trim())).join(', ')
    return this
  }
  insert(row: Row) {
    this.insertRow = row
    return this
  }
  private add(sql: (n: string) => string, value: unknown) {
    this.values.push(param(value))
    this.where.push(sql(`$${this.values.length}`))
    return this
  }
  eq(col: string, v: unknown) { return this.add((n) => `${ident(col)} = ${n}`, v) }
  like(col: string, v: string) { return this.add((n) => `${ident(col)} like ${n}`, v) }
  in(col: string, v: unknown[]) { return this.add((n) => `${ident(col)}::text = any(${n}::text[])`, v.map(String)) }
  is(col: string, v: null) {
    if (v !== null) throw new Error('is() only supports null')
    this.where.push(`${ident(col)} is null`)
    return this
  }
  order(col: string, opts: { ascending?: boolean } = {}) {
    this.orderBy = ` order by ${ident(col)} ${opts.ascending === false ? 'desc' : 'asc'}`
    return this
  }
  limit(n: number) {
    this.max = ` limit ${Number(n)}`
    return this
  }
  single() { this.mode = 'single'; return this }
  maybeSingle() { this.mode = 'maybe'; return this }

  private async run(): Promise<Result> {
    try {
      if (this.insertRow) {
        const keys = Object.keys(this.insertRow).map(ident)
        const res = await this.db.query<Row>(
          `insert into ${ident(this.table)} (${keys.join(', ')}) values (${keys.map((_, i) => `$${i + 1}`).join(', ')}) returning *`,
          Object.values(this.insertRow).map(param)
        )
        return { data: res.rows, error: null }
      }
      const sql = `select ${this.cols} from ${ident(this.table)}${this.where.length ? ` where ${this.where.join(' and ')}` : ''}${this.orderBy}${this.max}`
      const rows = (await this.db.query<Row>(sql, this.values)).rows
      if (this.mode === 'many') return { data: rows, error: null }
      if (rows.length > 1) return { data: null, error: { message: 'multiple rows' } }
      if (!rows.length && this.mode === 'single') return { data: null, error: { message: 'no rows', code: 'PGRST116' } }
      return { data: rows[0] ?? null, error: null }
    } catch (e) {
      const err = e as { message: string; code?: string }
      return { data: null, error: { message: err.message, code: err.code } }
    }
  }
  then<A = Result, B = never>(ok?: ((v: Result) => A | PromiseLike<A>) | null, fail?: ((e: unknown) => B | PromiseLike<B>) | null) {
    return this.run().then(ok, fail)
  }
}

export function pgliteSupabase(db: PGlite) {
  return {
    from: (table: string) => new Query(db, table),
    async rpc(fn: string, args: Row): Promise<Result> {
      const keys = Object.keys(args)
      try {
        const res = await db.query<{ r: unknown }>(
          `select ${ident(fn)}(${keys.map((k, i) => `${ident(k)} => $${i + 1}`).join(', ')}) as r`,
          // Function arguments that are objects or arrays are jsonb in our SQL functions.
          keys.map((k) => (args[k] !== null && typeof args[k] === 'object' ? JSON.stringify(args[k]) : args[k]))
        )
        return { data: res.rows[0]?.r ?? null, error: null }
      } catch (e) {
        const err = e as { message: string; code?: string }
        return { data: null, error: { message: err.message, code: err.code } }
      }
    },
  }
}
