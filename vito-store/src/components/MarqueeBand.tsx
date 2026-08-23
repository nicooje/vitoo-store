const PHRASES = [
    'Vitö Store',
    'Lencería & Moda Femenina',
    'Nuevos ingresos',
    'Hecho con amor 💜',
];

export default function MarqueeBand() {
    const items = [...PHRASES, ...PHRASES];
    return (
        <div className="bg-primary-dark py-5 overflow-hidden border-y border-white/10" aria-hidden="true">
            <div className="flex w-max animate-marquee">
                {[0, 1].map((copy) => (
                    <div key={copy} className="flex shrink-0 items-center">
                        {items.map((p, i) => (
                            <span key={`${copy}-${i}`} className="flex items-center">
                                <span className="font-display italic text-xl md:text-2xl text-primary-light/90 whitespace-nowrap px-6">{p}</span>
                                <span className="text-accent-light/60 text-sm">✦</span>
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
