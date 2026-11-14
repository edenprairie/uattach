"use client";

import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { US_STATES } from '@/lib/constants';
import type { ShippingAddress } from '@/lib/types';
import { SAMPLE_CATALOG_PREVIEW_URL } from '@/lib/catalog';

const emptyAddress: ShippingAddress = {
    firstName: '', lastName: '', company: '', email: '', phone: '', line1: '', line2: '', city: '', state: '', zip: '',
};

export default function OrderPage() {
    const { user, isLoading: authLoading } = useAuth();
    const { items, containers, validation, updateQuantity, removeFromCart, clearCart } = useCart();
    const [address, setAddress] = useState<ShippingAddress>(() => ({ ...emptyAddress, email: user?.email ?? '' }));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const totalWeightKg = items.reduce((sum, item) => sum + item.product.weightKg * item.quantity, 0);
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

    useEffect(() => {
        if (user?.email) setAddress((current) => current.email ? current : { ...current, email: user.email! });
    }, [user?.email]);

    const updateAddress = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setAddress((current) => ({ ...current, [name]: value }));
    };

    const submitOrder = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        if (!validation.valid) {
            setError(validation.message ?? 'Please review the order weight before continuing.');
            return;
        }
        setLoading(true);
        try {
            const { createOrder } = await import('@/app/actions');
            const order = await createOrder({
                userId: user?.id,
                splitStrategy: 'weight_optimized',
                shippingAddress: address,
                items: items.map(({ product, quantity }) => ({ productId: product.id, quantity })),
            });
            clearCart();
            router.push(`/order/complete?orderId=${encodeURIComponent(order.id)}`);
        } catch (caught) {
            const message = caught instanceof Error ? caught.message : 'The order request could not be submitted.';
            setError(message.includes('Unknown product ID')
                ? 'The catalog is not connected to the order system yet. Please contact Uattach before submitting.'
                : 'We could not submit this order request. Please review your information and try again.');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return <main className="order-page"><div className="route-loading">Opening your order…</div></main>;

    if (!user || user.role === 'buyer') {
        return <main className="order-page"><div className="auth-gate"><p className="eyebrow"><span /> MEMBER ORDER</p><h1>{user ? 'Orders are for Uattach members.' : 'Sign in to continue.'}</h1><p>{user ? 'Your customer account does not have access to member ordering.' : 'Partner orders are available to approved Uattach members.'}</p><Link className="button button-red" href={user ? '/customer' : '/login?next=/order'}>{user ? 'Go to customer area' : 'Member sign in'} <span>↗</span></Link></div></main>;
    }

    if (items.length === 0) {
        return <main className="order-page"><div className="empty-order"><p className="eyebrow" style={{ justifyContent: 'center' }}><span /> MEMBER ORDER</p><h2>Your order list is empty.</h2><p>Choose product sizes and quantities from the catalog to start a load plan.</p><Link className="button button-red" href="/catalog">Return to catalog <span>↗</span></Link></div></main>;
    }

    return (
        <main className="order-page">
            <div className="order-heading"><div><p className="eyebrow"><span /> MEMBER ORDER / REVIEW</p><h1>Build your load.</h1></div><p>Review quantities and estimated container weights, then send your request to Uattach. No prices or payment details are collected here.</p></div>
            <div className="order-columns">
                <section className="order-sheet">
                    <div className="order-sheet-head"><h2>Selected products</h2><span>{totalQuantity} total units</span></div>
                    {items.map(({ product, quantity }) => (
                        <article className="order-line" key={product.id}>
                            <div className="order-line-image"><Image src={SAMPLE_CATALOG_PREVIEW_URL} alt="Standard Low Pro Bucket product catalog" fill sizes="70px" /></div>
                            <div>
                                <h3>{product.name}</h3>
                                <p>{product.weightKg.toLocaleString()} kg each · weight with bolt-on cutting edge</p>
                                <div className="quantity-control" aria-label={`Quantity for ${product.name}`}>
                                    <button type="button" aria-label="Decrease quantity" onClick={() => updateQuantity(product.id, quantity - 1)}>−</button>
                                    <input aria-label="Quantity" type="number" min="1" max="999" value={quantity} onChange={(event) => updateQuantity(product.id, Number(event.target.value) || 0)} />
                                    <button type="button" aria-label="Increase quantity" onClick={() => updateQuantity(product.id, quantity + 1)}>+</button>
                                </div>
                            </div>
                            <div className="order-line-weight"><strong>{(product.weightKg * quantity).toLocaleString()} kg</strong><span>line weight</span><button className="text-button" type="button" onClick={() => removeFromCart(product.id)}>Remove</button></div>
                        </article>
                    ))}
                    <Link href="/catalog" className="text-link" style={{ marginTop: 18 }}>← Add more products</Link>
                    <form className="order-form" onSubmit={submitOrder}>
                        <h3>Delivery contact</h3>
                        <div className="order-form-grid">
                            <label className="form-field"><span>First name</span><input name="firstName" value={address.firstName} onChange={updateAddress} required /></label>
                            <label className="form-field"><span>Last name</span><input name="lastName" value={address.lastName} onChange={updateAddress} required /></label>
                            <label className="form-field"><span>Company</span><input name="company" value={address.company} onChange={updateAddress} /></label>
                            <label className="form-field"><span>Email</span><input type="email" name="email" value={address.email} onChange={updateAddress} required /></label>
                            <label className="form-field"><span>Phone</span><input type="tel" name="phone" value={address.phone} onChange={updateAddress} required /></label>
                            <label className="form-field"><span>Street address</span><input name="line1" value={address.line1} onChange={updateAddress} required /></label>
                            <label className="form-field"><span>Address line 2</span><input name="line2" value={address.line2} onChange={updateAddress} /></label>
                            <label className="form-field"><span>City</span><input name="city" value={address.city} onChange={updateAddress} required /></label>
                            <label className="form-field"><span>State</span><select name="state" value={address.state} onChange={updateAddress} required><option value="">Select state</option>{US_STATES.map((state) => <option key={state.code} value={state.code}>{state.name}</option>)}</select></label>
                            <label className="form-field"><span>ZIP code</span><input name="zip" value={address.zip} onChange={updateAddress} pattern="\d{5}(-\d{4})?" required /></label>
                        </div>
                        {error ? <p className="order-validation" role="alert">{error}</p> : null}
                        <button className="order-submit" type="submit" disabled={loading || !validation.valid}>{loading ? 'Sending request…' : 'Send order request to Uattach'}</button>
                        <p className="order-no-price">No prices or payment information are included.</p>
                    </form>
                </section>

                <aside className="order-summary-panel">
                    <p className="eyebrow"><span /> ESTIMATED LOAD</p>
                    <h2>Container plan</h2>
                    {containers.map((container) => (
                        <div className="container-card" key={container.id}>
                            <div className="container-card-head"><span>Container {String(container.number).padStart(2, '0')}</span><span>{container.totalWeightKg.toLocaleString()} / {container.maxWeightKg.toLocaleString()} kg</span></div>
                            <div className="container-track"><span style={{ width: `${Math.min(100, container.totalWeightKg / container.maxWeightKg * 100)}%` }} /></div>
                            <p>{container.items.map((item) => `${item.quantity} × ${item.product.name}`).join(' · ')}</p>
                        </div>
                    ))}
                    <div className="weight-total"><span>Total estimated product weight</span><strong>{totalWeightKg.toLocaleString()} kg</strong></div>
                    {validation.valid ? <p className="order-helper">This plan follows the current container limits. Uattach will confirm the final shipping plan after reviewing your request.</p> : <p className="order-validation">{validation.message}</p>}
                    <p className="order-helper">Current planner limits: up to 22,000 kg per container, with at least 18,000 kg in the final container.</p>
                    <p className="order-helper">Weights are based on the sample PDF’s listed weights with bolt-on cutting edges. Final shipment weight can vary with options and packing.</p>
                </aside>
            </div>
        </main>
    );
}
