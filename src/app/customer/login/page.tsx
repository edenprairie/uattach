"use client";

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function CustomerLoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, logout } = useAuth();
    const router = useRouter();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        setLoading(true);
        const signedInUser = await login(username, password);
        setLoading(false);
        if (!signedInUser) {
            setError('We could not verify those sign-in details. Please try again or check with your business contact.');
            return;
        }
        if (signedInUser.role !== 'buyer') {
            logout();
            setError('That is a wholesale member account. Please use member sign in.');
            return;
        }
        router.push('/customer');
    };

    return (
        <main className="auth-page">
            <section className="auth-story">
                <div><p className="eyebrow"><span /> CUSTOMER ACCESS</p><h1>Your business.<br /><em>Your workspace.</em></h1><p>Sign in to the customer area provided by your equipment partner.</p></div>
                <div className="auth-proof"><i /> Customer accounts are separate from wholesale members</div>
            </section>
            <section className="auth-panel">
                <div className="auth-card">
                    <p className="eyebrow"><span /> CUSTOMER SIGN IN</p>
                    <h2>Welcome back.</h2>
                    <p>Enter the account details provided by your business.</p>
                    {error ? <div className="auth-error" role="alert">{error}</div> : null}
                    <form onSubmit={handleSubmit}>
                        <label className="form-field"><span>Email or username</span><input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required /></label>
                        <label className="form-field"><span>Password</span><input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
                        <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Checking access…' : 'Customer sign in'}</button>
                    </form>
                    <div className="auth-footnote">Customer accounts are not enabled yet. If you are a wholesale Uattach partner, use the member sign-in page.</div>
                    <Link href="/login" className="auth-back">Wholesale member sign in →</Link>
                </div>
            </section>
        </main>
    );
}
