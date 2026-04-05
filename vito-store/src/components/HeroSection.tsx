export default function HeroSection() {
    return (
        <section className="px-5 lg:px-8 pt-8 pb-12 bg-white">
            <div className="max-w-7xl mx-auto relative rounded-3xl overflow-hidden bg-slate-100 min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-24 shadow-sm">
                
                {/* Decorative background image overlay (si tuvieras una foto, iría aquí como bg-image o <img>) */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-slate-50/90 z-0"></div>

                <div className="relative z-10 max-w-3xl">
                    <h1 className="text-5xl md:text-7xl font-black text-slate-950 tracking-tight leading-[1.1]">
                        Lencería que te <br className="hidden md:block" />
                        <span className="text-pink-600">abraza</span>
                    </h1>
                    
                    <p className="mt-6 text-lg md:text-xl text-slate-700 font-medium max-w-2xl mx-auto">
                        Descubrí nuestros conjuntos, trajes de baño y pijamas diseñados para tu comodidad, empoderamiento y estilo íntimo.
                    </p>
                    
                    <div className="mt-10 flex justify-center">
                        <a href="#catalogo" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-pink-600 hover:bg-pink-700 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-pink-600/30">
                            Descubrir Colección
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
