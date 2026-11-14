const ITERATIONS = 100_000;
const encoder = new TextEncoder();

function toHex(value: Uint8Array): string {
    return Array.from(value, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function fromHex(value: string): Uint8Array {
    if (!/^(?:[0-9a-f]{2})+$/i.test(value)) throw new Error('Invalid password hash');
    return Uint8Array.from(value.match(/.{2}/g) ?? [], (byte) => Number.parseInt(byte, 16));
}

async function derivePasswordHash(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
    const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
    const saltBuffer = salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength) as ArrayBuffer;
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: saltBuffer, iterations }, key, 256);
    return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const hash = await derivePasswordHash(password, salt, ITERATIONS);
    return `pbkdf2-sha256$${ITERATIONS}$${toHex(salt)}$${toHex(hash)}`;
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
    const [algorithm, rawIterations, rawSalt, rawHash] = encoded.split('$');
    if (algorithm !== 'pbkdf2-sha256') return false;
    const iterations = Number(rawIterations);
    if (!Number.isInteger(iterations) || iterations !== ITERATIONS) return false;

    try {
        const expected = fromHex(rawHash);
        const actual = await derivePasswordHash(password, fromHex(rawSalt), iterations);
        if (actual.length !== expected.length) return false;
        let difference = 0;
        for (let index = 0; index < actual.length; index += 1) difference |= actual[index] ^ expected[index];
        return difference === 0;
    } catch {
        return false;
    }
}
