"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import confetti from 'canvas-confetti';

export default function SuccessPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId') || '------';

    useEffect(() => {
        // Fire confetti on load
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen pt-24 pb-12 bg-slate-50 flex items-center justify-center">
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl max-w-lg w-full text-center border border-slate-100">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold text-slate-900 mb-2">Order Confirmed!</h1>
                <p className="text-slate-600 mb-8">
                    Thank you for your order. We have received your request and will be in touch shortly to coordinate shipping container details.
                </p>

                <div className="bg-slate-50 rounded-lg p-4 mb-8 text-left text-sm text-slate-600 border border-slate-200">
                    <p className="font-semibold mb-1">Order Reference:</p>
                    <p className="font-mono text-slate-900 text-lg">#{orderId}</p>
                </div>

                <Link
                    href="/"
                    className="inline-flex w-full items-center justify-center px-6 py-4 border border-transparent text-base font-bold rounded-xl text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    Return to Catalog
                </Link>
            </div>
        </div>
    );
}
