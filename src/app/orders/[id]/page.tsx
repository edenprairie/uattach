"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Order } from '@/lib/types';

import { useAuth } from '@/context/AuthContext'; // Import Auth
import dynamic from 'next/dynamic';

const PDFThumbnailClient = dynamic(() => import('@/components/PDFThumbnail'), {
    ssr: false,
    loading: () => <div className="w-16 h-16 bg-slate-100 animate-pulse rounded" />
});

export default function OrderDetailPage() {
    const params = useParams();
    const orderId = params.id as string;
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth(); // Get User

    const handleStatusChange = (newStatus: Order['status']) => {
        if (!order) return;

        // Update local state
        const updatedOrder = { ...order, status: newStatus };
        setOrder(updatedOrder);

        // Update localStorage
        const saved = localStorage.getItem('uattach-orders');
        if (saved) {
            const orders = JSON.parse(saved) as Order[];
            const updatedOrders = orders.map(o => o.id === order.id ? updatedOrder : o);
            localStorage.setItem('uattach-orders', JSON.stringify(updatedOrders));
        }
    };

    useEffect(() => {
        const loadOrder = () => {
            const saved = localStorage.getItem('uattach-orders');
            if (saved) {
                try {
                    const orders = JSON.parse(saved) as Order[];
                    const found = orders.find(o => o.id === orderId);
                    setOrder(found || null);
                } catch (e) {
                    console.error('Failed to parse orders', e);
                    setOrder(null);
                }
            }
            setLoading(false);
        };

        loadOrder();
    }, [orderId]);

    if (loading) {
        return (
            <div className="min-h-screen pt-24 px-4 flex justify-center">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen pt-24 px-4 flex flex-col items-center justify-center space-y-4">
                <h1 className="text-2xl font-bold text-slate-900">Order not found</h1>
                <p className="text-slate-600">The order #{orderId} could not be found.</p>
                <Link
                    href="/orders"
                    className="mt-4 text-blue-600 hover:text-blue-800 underline"
                >
                    Back to My Orders
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 bg-slate-50">
            <div className="container mx-auto px-4 max-w-4xl">

                <div className="mb-6 flex items-center justify-between">
                    <Link href="/orders" className="text-slate-500 hover:text-slate-900 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Orders
                    </Link>
                    <button className="text-blue-600 font-medium text-sm hover:underline" onClick={() => window.print()}>
                        Print Invoice
                    </button>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    {/* Header */}
                    <div className="bg-slate-900 text-white px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">Order #{order.id}</h1>
                            <p className="text-slate-300 text-sm mt-1">Placed on {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString()}</p>
                        </div>
                        <div className="flex flex-col items-end">
                            {user?.role === 'admin' ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-300 font-medium">Status:</span>
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(e.target.value as Order['status'])}
                                        className="bg-slate-800 text-white text-sm font-medium px-3 py-1.5 rounded-lg border border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                    </select>
                                </div>
                            ) : (
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase
                                    ${order.status === 'pending' ? 'bg-yellow-400 text-yellow-900' :
                                        order.status === 'processing' ? 'bg-blue-400 text-blue-900' : 'bg-green-400 text-green-900'}`}>
                                    {order.status}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        {/* Shipping Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-slate-100">
                            <div>
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Shipping Address</h3>
                                <address className="not-italic text-slate-900">
                                    <p className="font-semibold">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                                    {order.shippingAddress.company && <p>{order.shippingAddress.company}</p>}
                                    <p>{order.shippingAddress.line1}</p>
                                    {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                                    <p className="mt-2 text-slate-500">{order.shippingAddress.email}</p>
                                    <p className="text-slate-500">{order.shippingAddress.phone}</p>
                                </address>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Order Summary</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Total Items:</span>
                                        <span className="font-medium text-slate-900">{order.items.reduce((acc, i) => acc + i.quantity, 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Total Containers:</span>
                                        <span className="font-medium text-slate-900">{order.containers.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Total Weight:</span>
                                        <span className="font-medium text-slate-900">{order.totalWeightKg.toLocaleString()} kg</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Containers & Items */}
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Shipment Details</h2>
                        <div className="space-y-6">
                            {order.containers.map((container) => (
                                <div key={container.id} className="border border-slate-200 rounded-lg overflow-hidden">
                                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                                        <h3 className="font-semibold text-slate-700">Container #{container.number}</h3>
                                        <span className="text-sm text-slate-500 font-medium">{container.totalWeightKg.toLocaleString()} kg</span>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {container.items?.map((item) => (
                                            <div key={item.product.id} className="p-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
                                                <div className="w-16 h-16 bg-white border border-slate-200 rounded-lg overflow-hidden flex-shrink-0 relative shadow-sm">
                                                    <PDFThumbnailClient pdfUrl={item.product.pdfUrl} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-slate-900">{item.product.name}</h4>
                                                    <p className="text-sm text-slate-500 line-clamp-1">{item.product.description}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-slate-900">{item.quantity}x</p>
                                                    <p className="text-xs text-slate-500">{item.product.weightKg} kg/ea</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
