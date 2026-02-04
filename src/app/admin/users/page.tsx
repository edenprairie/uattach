"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/types';

export default function UserManagementPage() {
    const { user, createUser, isAuthenticated } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form State
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'user' as User['role']
    });

    useEffect(() => {
        if (!isAuthenticated) return;

        // Redirect if not admin
        if (user && user.role !== 'admin') {
            router.push('/');
            return;
        }

        // Load users from localStorage
        // Load users from DB
        const loadUsers = async () => {
            try {
                const { getUsers } = await import('@/app/actions');
                const dbUsers = await getUsers();
                setUsers(dbUsers as any);
            } catch (err) {
                console.error('Failed to load users', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadUsers();
    }, [user, isAuthenticated, router]);

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.username || !formData.password) {
            setError('Username and password are required');
            return;
        }

        try {
            const newUser: User = {
                id: `user-${Date.now()}`,
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: formData.role
            };

            createUser(newUser);

            // Refresh list
            createUser(newUser);

            // Refresh list from DB
            import('@/app/actions').then(({ getUsers }) => {
                getUsers().then((dbUsers) => setUsers(dbUsers as any));
            });

            // Reset form
            setIsCreating(false);
            setFormData({
                username: '',
                email: '',
                password: '',
                role: 'user'
            });
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;
    if (!user || user.role !== 'admin') return null;

    return (
        <main className="min-h-screen bg-slate-50 pt-24 pb-12">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add User
                    </button>
                </div>

                {/* Create User Modal */}
                {isCreating && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-slate-900">Create New User</h2>
                                <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                                        value={formData.username}
                                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-slate-400 font-normal">(Optional)</span></label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                    <select
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                                    >
                                        <option value="user">Regular User</option>
                                        <option value="buyer">Buyer</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreating(false)}
                                        className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Create User
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg mr-3">
                                                {u.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="text-sm font-medium text-slate-900">{u.username}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                u.role === 'buyer' ? 'bg-green-100 text-green-800' :
                                                    'bg-blue-100 text-blue-800'}`}>
                                            {u.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {u.email || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-mono">
                                        {u.id}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {users.length === 0 && (
                        <div className="p-8 text-center text-slate-500">
                            No users found.
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
