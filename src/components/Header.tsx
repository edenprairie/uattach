"use client";

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export function Header() {
    const { items, openCart } = useCart();
    const { user, logout } = useAuth();
    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
                        <span className="text-blue-600">U</span>attach
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                        <Link href="/" className="hover:text-slate-900 transition-colors">Catalog</Link>
                        {user && (
                            <Link href="/orders" className="hover:text-slate-900 transition-colors">My Orders</Link>
                        )}
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <span className="hidden sm:inline text-sm font-medium text-slate-700">Hi, {user.username}</span>
                            <button onClick={logout} className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors">
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                            Sign In
                        </Link>
                    )}
                    <button
                        onClick={openCart}
                        className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                    >
                        Cart ({cartCount})
                    </button>
                </div>
            </div>
        </header>
    );
}
