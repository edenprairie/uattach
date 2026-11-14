"use client";

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { bootstrapAdmin } from '@/app/actions';
import { useAuth } from '@/context/AuthContext';

export default function AdministratorSetupPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [setupToken, setSetupToken] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { setUser } = useAuth();
    const router = useRouter();

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        try {
            const user = await bootstrapAdmin({ username, email, password, setupToken });
            setUser(user);
            router.push('/catalog');
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'Administrator setup failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-story"><div><p className="eyebrow"><span /> INITIAL ACCOUNT SETUP</p><h1>Start the<br /><em>Uattach partner room.</em></h1><p>Create the first administrator account after configuring the one-time setup secret on the Worker.</p></div><div className="auth-proof"><i /> Setup closes automatically after an administrator exists</div></section>
            <section className="auth-panel"><div className="auth-card"><p className="eyebrow"><span /> ADMINISTRATOR</p><h2>Create account.</h2><p>Use the one-time setup token configured for this deployment.</p>
                {error ? <div className="auth-error" role="alert">{error}</div> : null}
                <form onSubmit={submit}>
                    <label className="form-field"><span>Username</span><input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} minLength={3} required /></label>
                    <label className="form-field"><span>Email</span><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
                    <label className="form-field"><span>Password</span><input type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={12} required /></label>
                    <label className="form-field"><span>One-time setup token</span><input type="password" autoComplete="off" value={setupToken} onChange={(event) => setSetupToken(event.target.value)} required /></label>
                    <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Creating account…' : 'Create administrator account'}</button>
                </form>
            </div></section>
        </main>
    );
}
