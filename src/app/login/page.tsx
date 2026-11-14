"use client";

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        setLoading(true);
        const signedInUser = await login(username, password);
        setLoading(false);

        if (signedInUser) {
            if (signedInUser.role === 'buyer') {
                router.push('/customer');
                return;
            }
            const next = new URLSearchParams(window.location.search).get('next');
            router.push(next?.startsWith('/') ? next : '/catalog');
        } else {
            setError('We could not verify those sign-in details. Please try again or check with your Uattach contact.');
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-story">
                <div>
                    <p className="eyebrow"><span /> UATTACH PARTNER ROOM</p>
                    <h1>Product know-how.<br /><em>Freight, figured.</em></h1>
                    <p>Sign in to browse the working catalog, build a quantity list, and review an estimated container plan.</p>
                </div>
                <div className="auth-proof"><i /> Private access for approved Uattach business partners</div>
            </section>
            <section className="auth-panel">
                <div className="auth-card">
                    <p className="eyebrow"><span /> MEMBER ACCESS</p>
                    <h2>Welcome back.</h2>
                    <p>Use your partner account to continue to the product catalog.</p>
                    {error ? <div className="auth-error" role="alert">{error}</div> : null}
                    <form onSubmit={handleSubmit}>
                        <label className="form-field"><span>Email or username</span><input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required /></label>
                        <label className="form-field"><span>Password</span><input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
                        <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Checking access…' : 'Sign in to member catalog'}</button>
                    </form>
                    <div className="auth-footnote">Need an account? Ask your Uattach business contact for an invitation. Member access is intended for approved wholesale partners.</div>
                    <Link href="/" className="auth-back">← Back to Uattach</Link>
                </div>
            </section>
        </main>
    );
}
