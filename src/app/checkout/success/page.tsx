import { redirect } from 'next/navigation';

export default async function LegacyOrderSuccess({ searchParams }: { searchParams: Promise<{ orderId?: string }> }) {
    const { orderId } = await searchParams;
    redirect(`/order/complete${orderId ? `?orderId=${encodeURIComponent(orderId)}` : ''}`);
}
