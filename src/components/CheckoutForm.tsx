"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { US_STATES } from '@/lib/constants';
import { Order, ShippingAddress } from '@/lib/types';

export function CheckoutForm() {
    const router = useRouter();
    const { items, containers, clearCart } = useCart();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    // Form State
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Create Order Object
        const orderId = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        const totalWeight = containers.reduce((sum, c) => sum + c.totalWeightKg, 0);

        const newOrder: Order = {
            id: orderId,
            userId: user?.id, // Attach User ID if logged in
            date: new Date().toISOString(),
            status: 'pending',
            items: items,
            containers: containers,
            shippingAddress: formData,
            totalWeightKg: totalWeight,
            splitStrategy: 'weight_optimized'
        };

        // Save to LocalStorage
        const existingOrders = JSON.parse(localStorage.getItem('uattach-orders') || '[]');
        localStorage.setItem('uattach-orders', JSON.stringify([newOrder, ...existingOrders]));

        clearCart();
        router.push(`/checkout/success?orderId=${orderId}`);
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Contact Information</h2>

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

            <h2 className="text-xl font-bold text-slate-900 pt-4 mb-2">Shipping Address</h2>

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

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing...
                        </>
                    ) : (
                        `Submit Order`
                    )}
                </button>
            </div>
        </form>
    );
}
