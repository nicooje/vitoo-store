'use client';

export default function Footer() {
    return (
        <footer className="bg-primary-dark text-slate-100 py-20 px-6 font-sans border-t border-white/5 relative overflow-hidden">
            
            {/* Elemento de diseño de fondo sutil */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 text-center md:text-left relative z-10">
                
                {/* Brand / Info principal */}
                <div className="flex flex-col items-center md:items-start">
                    <h3 className="text-2xl font-black text-white tracking-widest uppercase mb-4">
                        Vitö Store
                    </h3>
                    <p className="text-sm text-slate-300 mb-8 max-w-xs leading-relaxed">
                        Lencería, bombachitas, bikinis, enterizas y pijamas exclusivos con la calidez y el diseño premium que te merecés.
                    </p>
                    
                    {/* Botones de Redes Sociales con micro-animaciones */}
                    <div className="flex items-center gap-4">
                        <a 
                            href="https://instagram.com/vitoo.store" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-slate-100 hover:text-primary-dark hover:bg-white bg-white/10 rounded-xl p-3 shadow-md hover:-translate-y-1 transition-all duration-300 min-h-[48px] min-w-[48px] flex items-center justify-center"
                            aria-label="Instagram"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                            </svg>
                        </a>
                        <a 
                            href="https://wa.me/5493794088240" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-slate-100 hover:text-white hover:bg-[#25D366] bg-white/10 rounded-xl p-3 shadow-md hover:-translate-y-1 transition-all duration-300 min-h-[48px] min-w-[48px] flex items-center justify-center"
                            aria-label="WhatsApp"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.155 1.24 8.404 3.49 2.249 2.25 3.488 5.23 3.487 8.411-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.303 1.655zm6.597-5.615c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.371s-1.04 1.014-1.04 2.476 1.064 2.871 1.213 3.07c.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Info Text */}
                <div className="flex flex-col items-center md:items-start text-sm space-y-4">
                    <h4 className="text-white font-bold uppercase tracking-widest text-xs border-b border-white/10 pb-2 w-full md:w-max">
                        Información
                    </h4>
                    <ul className="space-y-3.5 text-slate-300">
                        <li className="flex items-center gap-3 justify-center md:justify-start">
                            <span className="text-accent-light text-base">✨</span> Venta minorista y mayorista.
                        </li>
                        <li className="flex items-center gap-3 justify-center md:justify-start">
                            <span className="text-accent-light text-base">📍</span> Corrientes Capital, Argentina.
                        </li>
                        <li className="flex items-start gap-3 justify-center md:justify-start">
                            <span className="text-accent-light text-base">📌</span> B° Quintana, Av. Cangallo 136.
                        </li>
                        <li className="flex items-center gap-3 justify-center md:justify-start">
                            <span className="text-accent-light text-base">🇦🇷</span> Envíos a todo el país.
                        </li>
                    </ul>
                </div>

                {/* Links Adicionales */}
                <div className="flex flex-col items-center md:items-start text-sm space-y-4">
                    <h4 className="text-white font-bold uppercase tracking-widest text-xs border-b border-white/10 pb-2 w-full md:w-max">
                        Enlaces Rápidos
                    </h4>
                    <nav className="flex flex-col gap-3 text-slate-300">
                        <a 
                            href="/?category=Conjuntos" 
                            className="hover:text-white hover:underline transition-all duration-300 py-1 min-h-[30px]"
                        >
                            Ver Conjuntos
                        </a>
                        <a 
                            href="#mayorista" 
                            className="hover:text-white hover:underline transition-all duration-300 py-1 min-h-[30px]"
                        >
                            Quiero ser Revendedora
                        </a>
                        <a 
                            href="https://maps.app.goo.gl/MQrF2XJRg23bXV2q7" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="hover:text-white hover:underline transition-all duration-300 py-1 min-h-[30px]"
                        >
                            Ubicación en Google Maps
                        </a>
                    </nav>
                </div>

            </div>

            {/* Copyright */}
            <div className="mt-20 pt-8 border-t border-white/5 text-center text-[11px] tracking-wide text-slate-400">
                © {new Date().getFullYear()} Vitö Store. Todos los derechos reservados. Rediseñado con elegancia premium.
            </div>
        </footer>
    );
}
