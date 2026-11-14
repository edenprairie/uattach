import { cookies } from 'next/headers';
import { getDatabase } from '@/lib/database';

export interface SessionUser {
    id: string;
    username: string;
    email: string | null;
    role: 'admin' | 'user' | 'buyer';
    createdAt: string;
}

const SESSION_COOKIE = 'uattach-session';
const SESSION_LIFETIME_SECONDS = 60 * 60 * 24 * 7;

function toHex(value: Uint8Array): string {
    return Array.from(value, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function createSessionToken(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

async function hashSessionToken(token: string): Promise<string> {
    return toHex(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))));
}

export async function createSession(userId: string) {
    const token = createSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_LIFETIME_SECONDS * 1000);
    const database = await getDatabase();
    await database.prepare('INSERT INTO sessions (id, token_hash, user_id, expires_at) VALUES (?, ?, ?, ?)')
        .bind(crypto.randomUUID(), await hashSessionToken(token), userId, expiresAt.toISOString()).run();
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_LIFETIME_SECONDS,
    });
}

export async function getSessionUser(): Promise<SessionUser | null> {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const database = await getDatabase();
    const tokenHash = await hashSessionToken(token);
    const session = await database.prepare(`
        SELECT u.id, u.username, u.email, u.role, u.created_at AS createdAt, s.id AS sessionId, s.expires_at AS expiresAt
        FROM sessions s JOIN users u ON u.id = s.user_id
        WHERE s.token_hash = ?
    `).bind(tokenHash).first<SessionUser & { sessionId: string; expiresAt: string }>();
    if (!session) return null;
    if (new Date(session.expiresAt) <= new Date()) {
        await database.prepare('DELETE FROM sessions WHERE id = ?').bind(session.sessionId).run();
        return null;
    }
    return {
        id: session.id,
        username: session.username,
        email: session.email,
        role: session.role,
        createdAt: session.createdAt,
    };
}

export async function requireUser(): Promise<SessionUser> {
    const user = await getSessionUser();
    if (!user) throw new Error('You must be signed in to continue.');
    return user;
}

export async function clearSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (token) {
        const database = await getDatabase();
        await database.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await hashSessionToken(token)).run();
    }
    cookieStore.delete(SESSION_COOKIE);
}
