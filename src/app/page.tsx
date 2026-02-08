"use client";

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { OrderSummary } from '@/components/OrderSummary';
import { PRODUCTS } from '@/lib/mockData';
import { Hero } from '@/components/Hero';
import { PDFModal } from '@/components/PDFModal';

import { SearchBar } from '@/components/SearchBar';

export default function Home() {
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [currentPdf, setCurrentPdf] = useState<{ url: string, title: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState(PRODUCTS); // Default to mock, replace on load

  useEffect(() => {
    import('@/app/actions').then(({ getProducts }) => {
      getProducts().then((dbProducts) => {
        if (dbProducts && dbProducts.length > 0) {
          setProducts(dbProducts.map((p: any) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            description: p.description,
            weightKg: p.weightKg,
            pdfUrl: p.pdfUrl,
            imageUrl: p.imageUrl,
            features: p.features
          })));
        }
      });
    });
  }, []);

  const handleOpenPdf = (url: string, title: string) => {
    setCurrentPdf({ url, title });
    setPdfModalOpen(true);
  };

  const handleClosePdf = () => {
    setPdfModalOpen(false);
    setCurrentPdf(null);
  };

  const filteredProducts = products.filter(product => {
    const query = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    );
  });

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <Hero />

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Catalog */}
          <div className="lg:col-span-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Our Products</h2>
              <div className="h-1 w-20 bg-blue-600 rounded-full mb-6"></div>
              <SearchBar onSearch={setSearchQuery} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenPdf={handleOpenPdf}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-20 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <div className="text-gray-300 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No products found</h3>
                  <p className="text-slate-500">We couldn&apos;t find matches for &quot;{searchQuery}&quot;</p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-4 text-blue-600 font-medium hover:underline"
                  >
                    Clear Search
                  </button>
                </div>
              )}
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
