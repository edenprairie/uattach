"use client";

import { useState } from 'react';

interface SearchBarProps {
    onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
    const [query, setQuery] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        onSearch(value);
    };

    return (
        <div className="relative max-w-xl mx-auto mb-12">
            <input
                type="text"
                value={query}
                onChange={handleChange}
                placeholder="Search products by name, category, or description..."
                className="w-full px-6 py-4 pl-14 bg-white border border-slate-200 rounded-full shadow-lg shadow-slate-100 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400 text-lg"
            />
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            {query && (
                <button
                    onClick={() => { setQuery(''); onSearch(''); }}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
}
