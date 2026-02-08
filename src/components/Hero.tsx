import Image from 'next/image';

export function Hero() {
    return (
        <div className="relative w-full h-[600px] overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
                <Image
                    src="/assets/hero-bg.png"
                    alt="Uattach Industrial Background"
                    fill
                    className="object-cover"
                    priority
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-transparent" />
            </div>

            <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
                <div className="max-w-2xl text-white">
                    <div className="inline-block px-3 py-1 mb-6 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 text-sm font-bold tracking-wider uppercase">
                        Premium Heavy Duty Attachments
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
                        Built to <span className="text-blue-500">Perform.</span><br />
                        Built to <span className="text-white">Last.</span>
                    </h1>
                    <p className="text-lg text-slate-300 mb-8 max-w-xl leading-relaxed">
                        Maximize your machinery&apos;s potential with Uattach&apos;s high-grade, precision-engineered buckets and extensions. Designed for the toughest jobs on earth.
                    </p>
                    <div className="flex gap-4">
                        <button className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all hover:scale-105 shadow-lg shadow-blue-900/50">
                            View Catalog
                        </button>
                        <button className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold rounded-lg hover:bg-white/20 transition-all">
                            Contact Sales
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
