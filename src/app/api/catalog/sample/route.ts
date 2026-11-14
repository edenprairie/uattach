import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getSessionUser } from '@/lib/auth';

interface PrivateCatalogBucket {
    get(key: string): Promise<{
        body: ReadableStream<Uint8Array>;
        size: number;
        httpEtag: string;
        writeHttpMetadata(headers: Headers): void;
    } | null>;
}

export async function GET() {
    const user = await getSessionUser();
    if (!user || user.role === 'buyer') {
        return new Response('Authentication required', {
            status: 401,
            headers: { 'Cache-Control': 'no-store' },
        });
    }

    const { env } = await getCloudflareContext({ async: true });
    const bucket = (env as typeof env & { CATALOG?: PrivateCatalogBucket }).CATALOG;
    if (!bucket) {
        return new Response('Catalog storage is not configured', {
            status: 503,
            headers: { 'Cache-Control': 'no-store' },
        });
    }
    const object = await bucket.get('standard-low-pro-bucket.pdf');
    if (!object) {
        return new Response('Catalog file is not configured', {
            status: 404,
            headers: { 'Cache-Control': 'no-store' },
        });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', 'inline; filename="standard-low-pro-bucket.pdf"');
    headers.set('Content-Length', String(object.size));
    headers.set('ETag', object.httpEtag);
    headers.set('Cache-Control', 'private, no-store');
    headers.set('X-Content-Type-Options', 'nosniff');

    return new Response(object.body, { headers });
}
