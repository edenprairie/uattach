import { useCart } from "@/context/CartContext";

import { useRouter } from 'next/navigation';

interface OrderSummaryProps {
    showCheckoutButton?: boolean;
}

export function OrderSummary({ showCheckoutButton = true }: OrderSummaryProps) {
    const { containers, validation, items, closeCart, updateQuantity } = useCart();
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
                {/* Editable Items List */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                        <h3 className="font-bold text-slate-700">Cart Items</h3>
                    </div>
                    <ul className="divide-y divide-slate-100">
                        {items.map((item) => (
                            <li key={item.product.id} className="p-4 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold text-slate-900">{item.product.name}</h4>
                                        <p className="text-xs text-slate-500">{item.product.weightKg} kg/unit</p>
                                    </div>
                                    <span className="font-medium text-slate-900">
                                        {(item.quantity * item.product.weightKg).toLocaleString()} kg
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center border border-slate-200 rounded-lg">
                                        <button
                                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                            className="px-3 py-1 hover:bg-slate-50 text-slate-600 border-r border-slate-200 transition-colors"
                                        >−</button>
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                if (!isNaN(val) && val > 0) {
                                                    updateQuantity(item.product.id, val);
                                                }
                                            }}
                                            onFocus={(e) => e.target.select()}
                                            className="w-14 text-center text-sm font-semibold text-slate-900 border-none focus:ring-0 p-1 appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                        <button
                                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                            className="px-3 py-1 hover:bg-slate-50 text-slate-600 border-l border-slate-200 transition-colors"
                                        >+</button>
                                    </div>
                                    <button
                                        onClick={() => updateQuantity(item.product.id, 0)}
                                        className="text-xs text-red-500 hover:text-red-700 hover:underline"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <h3 className="font-bold text-slate-900 pt-2">Container Organization</h3>

                {containers.map((container) => (
                    <div key={container.id} className="border border-slate-100 rounded-lg p-4 bg-slate-50">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-slate-700">Container #{container.number}</h3>
                            <span className="text-sm text-slate-500">{container.totalWeightKg.toLocaleString()} / {container.maxWeightKg.toLocaleString()} kg</span>
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
                            {container.items?.map((item, i) => (
                                <li key={item.product.id} className="flex justify-between">
                                    <span>{item.quantity}x {item.product.name}</span>
                                    <span>{(item.quantity * item.product.weightKg).toLocaleString()} kg</span>
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
