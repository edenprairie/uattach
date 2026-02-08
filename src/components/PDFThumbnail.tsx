"use client";

import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface PDFThumbnailProps {
    pdfUrl: string;
    className?: string;
    onClick?: () => void;
}

export default function PDFThumbnail({ pdfUrl, className, onClick }: PDFThumbnailProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    }, []);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setLoading(false);
        setError(null);
    }

    function onDocumentLoadError(err: Error) {
        console.error('PDF load error:', err);
        setError('Failed to load PDF');
        setLoading(false);
    }

    if (error) {
        return (
            <div
                className={`relative overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer ${className}`}
                onClick={onClick}
            >
                <div className="text-slate-400 text-xs text-center p-2">
                    <svg className="w-8 h-8 mx-auto mb-1 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    PDF
                </div>
            </div>
        );
    }

    return (
        <div
            className={`relative overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer ${className}`}
            onClick={onClick}
        >
            <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                }
                error={
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-slate-400 text-xs text-center">
                            <svg className="w-8 h-8 mx-auto mb-1 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            PDF
                        </div>
                    </div>
                }
                className="w-full h-full flex items-center justify-center"
            >
                <Page
                    pageNumber={1}
                    width={250}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="shadow-sm transition-transform duration-300 hover:scale-105"
                />
            </Document>

            <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
        </div>
    );
}
