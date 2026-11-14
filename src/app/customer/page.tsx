"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function CustomerPortalPage() {
    const { user } = useAuth();

    if (!user) {
        return <main className="customer-page"><section className="customer-placeholder"><p className="eyebrow"><span /> CUSTOMER ACCESS</p><h1>Sign in to your customer area.</h1><p>This portal is for customers of Uattach’s business partners.</p><Link href="/customer/login" className="button button-red">Customer sign in <span>↗</span></Link></section></main>;
    }

    if (user.role !== 'buyer') {
        return <main className="customer-page"><section className="customer-placeholder"><p className="eyebrow"><span /> CUSTOMER ACCESS</p><h1>This account is a member account.</h1><p>Use the wholesale member catalog and order tools with this account.</p><Link href="/catalog" className="button button-red">Go to member catalog <span>↗</span></Link></section></main>;
    }

    return (
        <main className="customer-page">
            <section className="customer-placeholder">
                <p className="eyebrow"><span /> CUSTOMER AREA</p>
                <h1>Welcome, {user.username}.</h1>
                <p>This separate portal is reserved for customers of Uattach’s business partners. Its product access and account tools will be enabled once the partner workflow is defined.</p>
                <div className="customer-status"><strong>Portal status: preparing your workspace</strong><br />Your customer account is separate from a wholesale member account.</div>
            </section>
        </main>
    );
}
