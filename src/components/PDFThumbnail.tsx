"use client";

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFThumbnailProps {
    pdfUrl: string;
    className?: string;
    onClick?: () => void;
}

export default function PDFThumbnail({ pdfUrl, className, onClick }: PDFThumbnailProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setLoading(false);
    }

    return (
        <div
            className={`relative overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer ${className}`}
            onClick={onClick}
        >
            <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                }
                className="w-full h-full flex items-center justify-center"
            >
                <Page
                    pageNumber={1}
                    width={250} // Approximate width for card thumbnail
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="shadow-sm transition-transform duration-300 hover:scale-105"
                />
            </Document>

            {/* Overlay for hover effect */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
        </div>
    );
}
