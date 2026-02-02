"use client";

import { useEffect } from "react";

interface PDFModalProps {
    isOpen: boolean;
    onClose: () => void;
    pdfUrl: string;
    title: string;
}

export function PDFModal({ isOpen, onClose, pdfUrl, title }: PDFModalProps) {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => { document.body.style.overflow = "unset"; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-5xl h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-10">
                    <h3 className="font-bold text-lg text-slate-800">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* PDF Viewer using object/iframe */}
                <div className="flex-1 bg-slate-50 relative">
                    <object
                        data={pdfUrl}
                        type="application/pdf"
                        className="w-full h-full"
                    >
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500">
                            <p className="mb-4">Unable to display PDF directly.</p>
                            <a
                                href={pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                            >
                                Download PDF
                            </a>
                        </div>
                    </object>
                </div>
            </div>
        </div>
    );
}
