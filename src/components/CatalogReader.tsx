"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Document, Page, pdfjs } from 'react-pdf';
import { SAMPLE_PRODUCTS, SAMPLE_CATALOG_URL } from '@/lib/catalog';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export function CatalogReader() {
    const { user, isLoading } = useAuth();
    const { addToCart, items, syncCartWithProducts } = useCart();
    const viewerRef = useRef<HTMLDivElement>(null);
    const variantSelectRef = useRef<HTMLSelectElement>(null);
    const [viewerWidth, setViewerWidth] = useState(800);
    const [pageCount, setPageCount] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [zoom, setZoom] = useState(1);
    const [selectedId, setSelectedId] = useState(SAMPLE_PRODUCTS[0].id);
    const [quantity, setQuantity] = useState(1);
    const [pageTurn, setPageTurn] = useState(false);
    const [added, setAdded] = useState(false);

    useEffect(() => {
        syncCartWithProducts(SAMPLE_PRODUCTS);
    }, [syncCartWithProducts]);

    useEffect(() => {
        const element = viewerRef.current;
        if (!element) return;
        const observer = new ResizeObserver(([entry]) => setViewerWidth(entry.contentRect.width));
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    const selectedProduct = SAMPLE_PRODUCTS.find((product) => product.id === selectedId) ?? SAMPLE_PRODUCTS[0];
    const selectedQuantity = items.find((item) => item.product.id === selectedProduct.id)?.quantity ?? 0;
    const pageWidth = Math.max(260, Math.min(840, viewerWidth - 82)) * zoom;

    const goToPage = useCallback((nextPage: number) => {
        if (nextPage < 1 || nextPage > pageCount) return;
        setPageTurn(true);
        setPageNumber(nextPage);
        window.setTimeout(() => setPageTurn(false), 450);
    }, [pageCount]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft') goToPage(pageNumber - 1);
            if (event.key === 'ArrowRight') goToPage(pageNumber + 1);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [goToPage, pageNumber]);

    const handleAdd = () => {
        addToCart(selectedProduct, quantity);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 4500);
    };

    if (isLoading) return <div className="route-loading">Opening the member catalog…</div>;

    if (!user || user.role === 'buyer') {
        return (
            <div className="auth-gate">
                <p className="eyebrow"><span /> PARTNER CATALOG</p>
                <h1>{user ? 'This catalog is for Uattach members.' : 'Sign in to open the catalog.'}</h1>
                <p>{user ? 'Your customer account does not have access to the wholesale member catalog.' : 'Approved Uattach members can browse product pages, build quantity lists, and review estimated load weights.'}</p>
                <Link className="button button-red" href={user ? '/customer' : '/login?next=/catalog'}>{user ? 'Go to customer area' : 'Member sign in'} <span>↗</span></Link>
            </div>
        );
    }

    return (
        <div>
            <div className="page-kicker">
                <div><p className="eyebrow"><span /> MEMBER PRODUCT BOOK</p><h1 className="catalog-title">Skid Steer Attachments</h1></div>
                <Link href="/order" className="header-order-link">Order list <span aria-hidden="true">→</span></Link>
            </div>
            <p className="catalog-lead">Browse the sample PDF page by page. Choose a bucket width and quantity to add it to your order list.</p>

            <div className="book-layout">
                <section className="book-stage" aria-label="PDF product catalog viewer">
                    <div className="book-toolbar">
                        <span className="book-toolbar-title">Uattach / Standard Low Pro Bucket</span>
                        <div className="book-tools" aria-label="PDF zoom controls">
                            <button type="button" aria-label="Zoom out" disabled={zoom <= .75} onClick={() => setZoom((value) => Math.max(.75, value - .15))}>−</button>
                            <button type="button" aria-label="Reset zoom" onClick={() => setZoom(1)}>{Math.round(zoom * 100)}%</button>
                            <button type="button" aria-label="Zoom in" disabled={zoom >= 1.6} onClick={() => setZoom((value) => Math.min(1.6, value + .15))}>+</button>
                            <a className="book-open-link" href={SAMPLE_CATALOG_URL} target="_blank" rel="noreferrer" aria-label="Open PDF in a new tab">↗</a>
                        </div>
                    </div>
                    <div className="book-viewer" ref={viewerRef}>
                        <Document
                            file={SAMPLE_CATALOG_URL}
                            onLoadSuccess={({ numPages }) => setPageCount(numPages)}
                            loading={<div className="book-viewer-loading">Preparing catalog page…</div>}
                            error={<div className="book-viewer-loading">This catalog page could not be loaded.</div>}
                        >
                            <div className={`book-paper ${pageTurn ? 'book-paper-turn' : ''}`} key={pageNumber}>
                                <Page pageNumber={pageNumber} width={pageWidth} renderTextLayer={false} renderAnnotationLayer={false} />
                                <button
                                    type="button"
                                    className="page-product-hotspot"
                                    aria-label="Select the Standard Low Pro Bucket shown on this page"
                                    onClick={() => {
                                        setSelectedId(SAMPLE_PRODUCTS[0].id);
                                        variantSelectRef.current?.focus();
                                        if (window.innerWidth <= 720) document.querySelector('.book-order-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                >
                                    <span>Select product</span>
                                </button>
                            </div>
                        </Document>
                    </div>
                    <div className="book-nav">
                        <button type="button" aria-label="Previous page" disabled={pageNumber <= 1} onClick={() => goToPage(pageNumber - 1)}>←</button>
                        <span>PAGE {pageCount ? pageNumber : '–'} / {pageCount || '–'}</span>
                        <button type="button" aria-label="Next page" disabled={!pageCount || pageNumber >= pageCount} onClick={() => goToPage(pageNumber + 1)}>→</button>
                    </div>
                </section>

                <aside className="book-order-card">
                    <p className="eyebrow"><span /> ADD TO ORDER</p>
                    <h2>Standard Low Pro Bucket</h2>
                    <p>Select a width from the specification table. Listed weight includes the bolt-on cutting edge, as shown in the supplied sample PDF.</p>
                    <label className="form-field"><span>Bucket size</span>
                        <select ref={variantSelectRef} value={selectedId} onChange={(event) => { setSelectedId(event.target.value); setAdded(false); }}>
                            {SAMPLE_PRODUCTS.map((product) => <option key={product.id} value={product.id}>{product.name.split(' - ')[1]}</option>)}
                        </select>
                    </label>
                    <label className="form-field"><span>Quantity</span><input type="number" min="1" max="999" value={quantity} onChange={(event) => setQuantity(Math.max(1, Math.min(999, Number(event.target.value) || 1)))} /></label>
                    <div className="book-weight-note"><span>Each unit</span><strong>{selectedProduct.weightKg.toLocaleString()} kg</strong></div>
                    <button className="book-add" type="button" onClick={handleAdd}>Add {quantity} to order</button>
                    {added ? <p className="book-added" role="status">Added. {selectedQuantity + quantity} of this size are now in your order.</p> : null}
                    <Link href="/order" className="book-order-link"><span>Review order list</span><span>{items.reduce((sum, item) => sum + item.quantity, 0)} items →</span></Link>
                    <p className="book-hint">Container weights are planning estimates. Uattach confirms final shipping details after receiving your request.</p>
                </aside>
            </div>
        </div>
    );
}
