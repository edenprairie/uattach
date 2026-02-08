"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ShippingAddress, User } from '@/lib/types';
import { US_STATES } from '@/lib/constants';

export default function ProfilePage() {
    const { user, setUser } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const [formData, setFormData] = useState<ShippingAddress>({
        firstName: '',
        lastName: '',
        company: '',
        email: '',
        phone: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        zip: ''
    });

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        // Only update if we have a shipping address and it's different from current (or we are initializing)
        // We can check if email is empty to know if it's initial state
        if (user.shippingAddress) {
            // Simple check to avoid loop if object ref changes but content is same
            if (JSON.stringify(formData) !== JSON.stringify(user.shippingAddress)) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setFormData(user.shippingAddress);
            }
        } else if (!formData.email && user.email) {
            // Pre-fill email from user if available and not already set
            setFormData(prev => ({ ...prev, email: user.email || '' }));
        }
    }, [user, router]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        if (user) {
            const updatedUser: User = {
                ...user,
                shippingAddress: formData
            };

            setUser(updatedUser);
            localStorage.setItem('uattach-user', JSON.stringify(updatedUser));
            setMessage('Profile updated successfully!');
        }

        setLoading(false);
    };

    if (!user) return null;

    return (
        <div className="min-h-screen pt-24 pb-12 bg-slate-50">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-slate-900 px-8 py-6">
                        <h1 className="text-2xl font-bold text-white">Your Profile</h1>
                        <p className="text-slate-400 mt-1">Manage your default shipping address</p>
                    </div>

                    <div className="p-8">
                        {message && (
                            <div className="mb-6 bg-green-50 text-green-700 px-4 py-3 rounded-lg border border-green-200 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Default Shipping Address</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="firstName" className="text-sm font-medium text-slate-700">First Name</label>
                                    <input required name="firstName" value={formData.firstName} onChange={handleChange} type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="lastName" className="text-sm font-medium text-slate-700">Last Name</label>
                                    <input required name="lastName" value={formData.lastName} onChange={handleChange} type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="company" className="text-sm font-medium text-slate-700">Company Name <span className="text-slate-400 font-normal">(Optional)</span></label>
                                <input name="company" value={formData.company} onChange={handleChange} type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</label>
                                    <input required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="phone" className="text-sm font-medium text-slate-700">Phone Number</label>
                                    <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="line1" className="text-sm font-medium text-slate-700">Address Line 1</label>
                                <input required name="line1" value={formData.line1} onChange={handleChange} type="text" placeholder="Street address, P.O. box, etc." className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400" />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="line2" className="text-sm font-medium text-slate-700">Address Line 2 <span className="text-slate-400 font-normal">(Optional)</span></label>
                                <input name="line2" value={formData.line2} onChange={handleChange} type="text" placeholder="Apartment, suite, unit, building, floor, etc." className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="city" className="text-sm font-medium text-slate-700">City</label>
                                    <input required name="city" value={formData.city} onChange={handleChange} type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="state" className="text-sm font-medium text-slate-700">State</label>
                                    <div className="relative">
                                        <select
                                            required
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            className="w-full appearance-none px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-slate-900 placeholder:text-slate-400"
                                        >
                                            <option value="">Select State</option>
                                            {US_STATES.map((state) => (
                                                <option key={state.code} value={state.code}>{state.name}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="zip" className="text-sm font-medium text-slate-700">ZIP Code</label>
                                    <input required name="zip" value={formData.zip} onChange={handleChange} type="text" pattern="\d{5}(-\d{4})?" title="5 digit zip code" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400" />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-slate-200"
                                >
                                    {loading ? 'Saving...' : 'Save Profile'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.push('/')}
                                    className="px-8 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
