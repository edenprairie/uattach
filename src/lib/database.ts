import { getCloudflareContext } from '@opennextjs/cloudflare';

export interface D1Result<T> {
    results: T[];
    success: boolean;
    meta: { changes: number; last_row_id: number };
}

export interface D1PreparedStatement {
    bind(...values: unknown[]): D1PreparedStatement;
    first<T>(): Promise<T | null>;
    all<T>(): Promise<D1Result<T>>;
    run(): Promise<D1Result<unknown>>;
}

export interface D1Database {
    prepare(query: string): D1PreparedStatement;
    batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
}

export async function getDatabase(): Promise<D1Database> {
    const { env } = await getCloudflareContext({ async: true });
    const database = (env as typeof env & { APP_DB?: D1Database }).APP_DB;
    if (!database) throw new Error('The Cloudflare D1 binding APP_DB is not configured.');
    return database;
}
