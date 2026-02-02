"use client";

import { useState } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { OrderSummary } from '@/components/OrderSummary';
import { PRODUCTS } from '@/lib/mockData';
import { Hero } from '@/components/Hero';
import { PDFModal } from '@/components/PDFModal';

export default function Home() {
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [currentPdf, setCurrentPdf] = useState<{ url: string, title: string } | null>(null);

  const handleOpenPdf = (url: string, title: string) => {
    setCurrentPdf({ url, title });
    setPdfModalOpen(true);
  };

  const handleClosePdf = () => {
    setPdfModalOpen(false);
    setCurrentPdf(null);
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <Hero />

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Catalog */}
          <div className="lg:col-span-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Our Products</h2>
              <div className="h-1 w-20 bg-blue-600 rounded-full mb-4"></div>
              <p className="text-slate-500 text-lg">Browse our selection of heavy-duty attachment solutions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PRODUCTS.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenPdf={handleOpenPdf}
                />
              ))}
            </div>
          </div>

          {/* Right Column: Order Logic / Summary */}
          <div className="lg:col-span-4 sticky top-24">
            <OrderSummary />
          </div>

        </div>
      </div>

      <PDFModal
        isOpen={pdfModalOpen}
        onClose={handleClosePdf}
        pdfUrl={currentPdf?.url || ''}
        title={currentPdf?.title || 'Product Specification'}
      />
    </main>
  );
}
