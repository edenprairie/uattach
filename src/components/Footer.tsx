export function Footer() {
    return (
        <footer className="border-t border-slate-200 bg-white py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-slate-500">
                        © {new Date().getFullYear()} Uattach. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-slate-500">
                        <a href="#" className="hover:text-slate-900">Privacy Policy</a>
                        <a href="#" className="hover:text-slate-900">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
