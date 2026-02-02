import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const PDFThumbnail = dynamic(() => import('./PDFThumbnail'), {
    ssr: false,
    loading: () => <div className="w-full h-48 bg-slate-100 animate-pulse" />
});

interface ProductCardProps {
    product: Product;
    onOpenPdf: (url: string, title: string) => void;
}

export function ProductCard({ product, onOpenPdf }: ProductCardProps) {
    const { addToCart } = useCart();
    const [qty, setQty] = useState(1);

    return (
        <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="relative h-48 w-full bg-slate-100 p-4">
                <PDFThumbnail
                    pdfUrl={product.pdfUrl}
                    className="w-full h-full object-contain"
                    onClick={() => onOpenPdf(product.pdfUrl, product.name)}
                />

                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-slate-700 z-10 pointer-events-none">
                    {product.weightKg} kg
                </div>
            </div>

            <div className="p-5">
                <div className="mb-2">
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{product.category}</span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-1">{product.name}</h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{product.description}</p>

                <div className="flex items-center gap-2 mb-4">
                    {/* Quantity selector */}
                    <div className="flex items-center border border-slate-200 rounded-lg">
                        <button
                            onClick={() => setQty(Math.max(1, qty - 1))}
                            className="px-3 py-1 hover:bg-slate-50 text-slate-600"
                        >-</button>
                        <span className="w-8 text-center text-sm font-medium">{qty}</span>
                        <button
                            onClick={() => setQty(qty + 1)}
                            className="px-3 py-1 hover:bg-slate-50 text-slate-600"
                        >+</button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => addToCart(product, qty)}
                        className="flex-1 bg-slate-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-slate-800 transition-colors active:scale-95 transform"
                    >
                        Add to Order
                    </button>

                    <button
                        onClick={() => onOpenPdf(product.pdfUrl, product.name)}
                        className="px-3 py-2.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                        title="View Spec Sheet"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
