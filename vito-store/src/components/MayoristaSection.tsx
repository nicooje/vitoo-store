export default function MayoristaSection() {
    return (
        <section id="mayorista" className="py-24 px-4 bg-gray-50 border-t border-gray-100">
            <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
                
                {/* Cabecera de la sección */}
                <div className="mb-16 max-w-2xl">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
                        Mayorista & Emprendedoras
                    </h2>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        ¿Querés emprender o sumar ingresos? Sumate a nuestro equipo. Tenemos precios y promos exclusivas por mayor con atención 100% personalizada. ✨
                    </p>
                </div>

                {/* Grilla de Combos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full mb-16">
                    
                    {/* Tarjeta Combo 1 */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-pink-100 hover:shadow-xl transition-shadow flex flex-col h-full text-left relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="text-6xl">🛍️</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Pack Inicio x12</h3>
                        <p className="text-sm font-medium text-pink-600 mb-4">Ideal para probar ingresos</p>
                        <ul className="text-slate-600 text-sm space-y-3 mb-8 flex-1">
                            <li className="flex items-start gap-2">
                                <span className="text-green-500">✔</span> 12 Conjuntos surtidos
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500">✔</span> Talles y colores a elección
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500">✔</span> Precio bomba revendedora
                            </li>
                        </ul>
                    </div>

                    {/* Tarjeta Combo 2 (Destacado) */}
                    <div className="bg-slate-900 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow flex flex-col h-full text-left relative overflow-hidden transform md:-translate-y-4">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-purple-500"></div>
                        <div className="absolute top-4 right-4 bg-pink-600 text-white text-[10px] uppercase font-bold py-1 px-3 rounded-full">
                            Más Vendido
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 mt-4">Combo Emprendedora</h3>
                        <p className="text-sm font-medium text-pink-400 mb-4">Multiplicá tus ganancias</p>
                        <ul className="text-slate-300 text-sm space-y-3 mb-8 flex-1">
                            <li className="flex items-start gap-2">
                                <span className="text-pink-400">✔</span> 24 Conjuntos Premium
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-pink-400">✔</span> Envío GRATIS a sucursal
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-pink-400">✔</span> Acceso a catálogo sin precios
                            </li>
                        </ul>
                    </div>

                    {/* Tarjeta Combo 3 */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-purple-100 hover:shadow-xl transition-shadow flex flex-col h-full text-left relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="text-6xl">🔥</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Combo Surtido Mix</h3>
                        <p className="text-sm font-medium text-purple-600 mb-4">Para enamorar clientas</p>
                        <ul className="text-slate-600 text-sm space-y-3 mb-8 flex-1">
                            <li className="flex items-start gap-2">
                                <span className="text-purple-500">✔</span> Conjuntos, Bikinis y Más (30 u.)
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-500">✔</span> Mezclá categorías a gusto
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-500">✔</span> Asesoramiento por WhatsApp
                            </li>
                        </ul>
                    </div>
                </div>

                {/* CTA General */}
                <a 
                    href="https://wa.me/1234567890?text=Hola,%20me%20interesa%20comprar%20por%20mayor!" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white px-8 py-4 rounded-full font-bold text-lg shadow-[0_4px_20px_rgba(37,211,102,0.3)] hover:shadow-[0_6px_25px_rgba(37,211,102,0.4)] transition-all hover:-translate-y-1"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                    </svg>
                    Armá tu pedido mayorista
                </a>
            </div>
        </section>
    );
}
