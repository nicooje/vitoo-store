import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-100 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Lado izquierdo - Menú/Nav */}
                <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-700">
                    <Link href="#catalogo" className="hover:text-pink-600 transition-colors">Catálogo</Link>
                    <Link href="#mayorista" className="hover:text-pink-600 transition-colors">Mayorista</Link>
                    <Link href="#team" className="hover:text-pink-600 transition-colors">Team Vitö</Link>
                </nav>

                {/* Centro - Logo */}
                <div className="flex-1 flex justify-center md:flex-none">
                    <Link href="/" className="flex items-center gap-3 group">
                        <Image src="/vito-logo.png" alt="Vito Store Logo" width={40} height={40} className="rounded-full shadow-sm group-hover:scale-105 transition-transform" />
                        <span className="text-xl font-extrabold text-slate-950 tracking-tight">Vitö Store</span>
                    </Link>
                </div>

                {/* Lado derecho - Carrito enlace (Opcional, el flotante ya existe) */}
                <div className="flex items-center gap-4">
                    <Link href="/checkout" className="text-slate-700 hover:text-pink-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                    </Link>
                </div>
            </div>
        </header>
    );
}
