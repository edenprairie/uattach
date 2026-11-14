"use client";

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function CompletionDetails() {
    const params = useSearchParams();
    const orderId = params.get('orderId');
    return (
        <main className="customer-page">
            <section className="customer-placeholder">
                <p className="eyebrow"><span /> REQUEST RECEIVED</p>
                <h1>Your order request is in.</h1>
                <p>Uattach has received your quantity list and estimated load plan. The team will review product options and confirm shipment details with your business.</p>
                {orderId ? <div className="customer-status"><strong>Reference</strong><br />{orderId}</div> : null}
                <p className="order-no-price">No prices or payment information were collected.</p>
                <Link href="/catalog" className="button button-red">Return to catalog <span>↗</span></Link>
            </section>
        </main>
    );
}

export default function OrderCompletePage() {
    return <Suspense fallback={<main className="customer-page"><div className="book-viewer-loading">Loading request details…</div></main>}><CompletionDetails /></Suspense>;
}
