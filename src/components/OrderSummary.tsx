import { useCart } from "@/context/CartContext";

import { useRouter } from 'next/navigation';

interface OrderSummaryProps {
    showCheckoutButton?: boolean;
}

export function OrderSummary({ showCheckoutButton = true }: OrderSummaryProps) {
    const { containers, validation, items, closeCart } = useCart();
    const router = useRouter();

    if (items.length === 0) {
        return (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-slate-500">
                Your order is empty. Select products to see container optimization.
            </div>
        );
    }

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Order Summary</h2>

            <div className="space-y-6 mb-6">
                {containers.map((container, idx) => (
                    <div key={container.id} className="border border-slate-100 rounded-lg p-4 bg-slate-50">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-slate-700">Container #{container.number}</h3>
                            <span className="text-sm text-slate-500">{container.totalWeightKg} / {container.maxWeightKg} kg</span>
                        </div>

                        {/* Visual Bar */}
                        <div className="w-full bg-slate-200 rounded-full h-2.5 mb-3">
                            <div
                                className={`h-2.5 rounded-full ${container.totalWeightKg > container.maxWeightKg ? 'bg-red-500' :
                                    container.totalWeightKg < 1000 ? 'bg-orange-400' : 'bg-green-500'
                                    }`}
                                style={{ width: `${Math.min(100, (container.totalWeightKg / container.maxWeightKg) * 100)}%` }}
                            />
                        </div>

                        <ul className="text-sm text-slate-600 space-y-1">
                            {container.items.map((item, i) => (
                                <li key={i} className="flex justify-between">
                                    <span>{item.quantity}x {item.product.name}</span>
                                    <span>{item.quantity * item.product.weightKg} kg</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {!validation.valid && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100 flex items-start gap-2">
                    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    {validation.message}
                </div>
            )}

            {showCheckoutButton && (
                <div className="border-t border-slate-100 pt-4 mt-6">
                    <div className="flex justify-between font-bold text-slate-900 text-lg mb-4">
                        <span>Total Containers</span>
                        <span>{containers.length}</span>
                    </div>
                    <button
                        disabled={!validation.valid}
                        onClick={() => {
                            closeCart();
                            router.push('/checkout');
                        }}
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                    >
                        Proceed to Checkout
                    </button>
                </div>
            )}
        </div>
    );
}
