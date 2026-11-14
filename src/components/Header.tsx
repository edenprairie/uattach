"use client";

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export function Header() {
    const { items } = useCart();
    const { user, logout } = useAuth();
    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <header className="site-header">
            <div className="site-header-inner">
                <Link href="/" className="brand-lockup" aria-label="Uattach home">
                    <span className="brand-mark">U</span>
                    <span>attach</span>
                    <span className="brand-divider" />
                    <span className="brand-descriptor">Equipment supply</span>
                </Link>
                <nav className="main-nav" aria-label="Main navigation">
                    <Link href="/#equipment">Equipment</Link>
                    <Link href="/#about">About Uattach</Link>
                    {user && user.role !== 'buyer' ? <Link href="/catalog">Member catalog</Link> : null}
                    <Link href={user?.role === 'buyer' ? '/customer' : '/customer/login'}>Customer access</Link>
                </nav>
                <div className="header-actions">
                    {user && user.role !== 'buyer' ? (
                        <>
                            <Link className="header-order-link" href="/order">
                                Order{cartCount > 0 ? <span className="order-count">{cartCount}</span> : null}
                            </Link>
                            <button className="text-button" onClick={logout} type="button">Sign out</button>
                        </>
                    ) : user?.role === 'buyer' ? (
                        <button className="text-button" onClick={logout} type="button">Sign out</button>
                    ) : (
                        <Link href="/login" className="header-sign-in">Member sign in <span aria-hidden="true">↗</span></Link>
                    )}
                </div>
            </div>
        </header>
    );
}
