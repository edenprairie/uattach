"use client";

import { CheckoutForm } from '@/components/CheckoutForm';
import { OrderSummary } from '@/components/OrderSummary';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function CheckoutPage() {
    const { items } = useCart();

    if (items.length === 0) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center justify-center space-y-4">
                <h1 className="text-2xl font-bold text-slate-900">Your cart is empty</h1>
                <p className="text-slate-600">Add some items to proceed to checkout.</p>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                    Return to Catalog
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 bg-slate-50">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Left Column: Form */}
                    <div className="w-full md:w-2/3">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
                            <p className="text-slate-600 mt-2">Please enter your shipping details to complete your order.</p>
                        </div>
                        <CheckoutForm />
                    </div>

                    {/* Right Column: Order Summary (Sticky) */}
                    <div className="w-full md:w-1/3 sticky top-24">
                        <OrderSummary showCheckoutButton={false} />

                        <div className="mt-4 text-center">
                            <Link href="/" className="text-sm text-slate-500 hover:text-slate-900 underline">
                                Return to Catalog
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
