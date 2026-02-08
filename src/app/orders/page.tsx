"use client";

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Order } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';

// Dynamic import for PDF thumbnail to avoid SSR issues
const PDFThumbnailClient = dynamic(() => import('@/components/PDFThumbnail'), {
    ssr: false,
    loading: () => <div className="w-16 h-16 bg-slate-100 animate-pulse rounded" />
});

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchOrders = useCallback(async () => {
        try {
            const { getUserOrders } = await import('@/app/actions');
            if (user?.id) {
                const dbOrders = await getUserOrders(user.id);
                const mappedOrders = dbOrders.map((o: any) => ({
                    id: o.id,
                    userId: o.userId,
                    date: o.createdAt?.toISOString() || new Date().toISOString(),
                    items: o.items?.map((i: any) => ({
                        product: {
                            id: i.product.id,
                            name: i.product.name,
                            category: i.product.category,
                            description: i.product.description,
                            weightKg: i.product.weightKg,
                            pdfUrl: i.product.pdfUrl,
                            imageUrl: i.product.imageUrl
                        },
                        quantity: i.quantity
                    })) || [],
                    containers: o.containers || [],
                    shippingAddress: o.shippingAddress,
                    status: o.status || 'pending',
                    totalWeightKg: o.totalWeightKg,
                    splitStrategy: o.splitStrategy || 'weight_optimized'
                }));
                setOrders(mappedOrders);
            } else {
                setOrders([]);
            }
        } catch (e) {
            console.error('Failed to fetch orders', e);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (user) {
            fetchOrders();
        } else {
            setLoading(false);
        }
    }, [user, fetchOrders]);

    if (loading) {
        return (
            <div className="min-h-screen pt-24 px-4 flex justify-center">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="min-h-screen pt-24 px-4 flex flex-col items-center justify-center space-y-4">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-2">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-slate-900">No orders found</h1>
                <p className="text-slate-600">You haven&apos;t placed any orders yet.</p>
                <Link
                    href="/"
                    className="mt-4 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                    Browse Catalog
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 bg-slate-50">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">My Orders</h1>

                <div className="space-y-6">
                    {orders.map((order) => (
                        <Link href={`/orders/${order.id}`} key={order.id} className="block group">
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md group-hover:border-blue-200 transition-all">
                                {/* Order Header */}
                                <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group-hover:bg-blue-50/30 transition-colors">
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700">Order #{order.id}</p>
                                        <p className="text-xs text-slate-500">{new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString()}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                            ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                order.status === 'processing' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                            {order.status}
                                        </span>
                                        <span className="text-sm font-bold text-slate-900">{order.containers.length} Container{order.containers.length !== 1 ? 's' : ''}</span>
                                        <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Order Content */}
                                <div className="p-6">
                                    <div className="space-y-6">
                                        {/* Show only first 2 containers to keep list compact */}
                                        {order.containers.slice(0, 2).map((container) => (
                                            <div key={container.id} className="border border-slate-100 rounded-lg p-4">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h4 className="font-semibold text-slate-700">Container #{container.number}</h4>
                                                    <span className="text-xs text-slate-500">{container.totalWeightKg} kg</span>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {container.items?.map((item) => (
                                                        <div key={item.product.id} className="flex items-center gap-3">
                                                            <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 relative border border-slate-200">
                                                                {/* Simple fallback image if thumbnail fails or just to be lightweight */}
                                                                <PDFThumbnailClient pdfUrl={item.product.pdfUrl} className="w-full h-full" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-slate-900">{item.product.name}</p>
                                                                <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        {order.containers.length > 2 && (
                                            <p className="text-sm text-slate-500 text-center italic">+ {order.containers.length - 2} more containers...</p>
                                        )}
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 opacity-75">
                                        <div>
                                            <h5 className="text-sm font-semibold text-slate-900 mb-2">Shipping Address</h5>
                                            <address className="text-sm text-slate-600 not-italic truncate">
                                                {order.shippingAddress.line1}, {order.shippingAddress.city}...
                                            </address>
                                        </div>
                                        <div className="flex md:justify-end items-end">
                                            <p className="text-sm text-slate-500">Total Weight: <span className="font-bold text-slate-900">{order.totalWeightKg} kg</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
