import { IconChat, IconRefresh, IconTag, IconTruck } from './icons';

const BENEFITS = [
    { Icon: IconTruck, title: 'Envíos a todo el país', sub: 'Despachamos desde Corrientes' },
    { Icon: IconTag, title: 'Precios por mayor', sub: 'Llevando 3, 6 o 12 prendas' },
    { Icon: IconChat, title: 'Te asesoramos', sub: 'Talles y colores por WhatsApp' },
    { Icon: IconRefresh, title: 'Cambios sin drama', sub: 'Si no te queda, lo resolvemos' },
];

export default function BenefitsBar() {
    return (
        <section className="bg-white border-y border-line" aria-label="Beneficios">
            <div className="max-w-[1400px] mx-auto grid grid-cols-2 lg:grid-cols-4">
                {BENEFITS.map(({ Icon, title, sub }, i) => (
                    <div
                        key={title}
                        className={`flex flex-col items-center text-center gap-2 px-4 py-9 md:py-12 border-line ${i % 2 === 0 ? 'border-r' : ''} ${i < 2 ? 'border-b lg:border-b-0' : ''} ${i === 1 ? 'lg:border-r' : ''}`}
                    >
                        <Icon className="w-6 h-6 text-primary mb-1" />
                        <p className="eyebrow text-[11px] text-primary-dark">{title}</p>
                        <p className="text-[13px] text-muted">{sub}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
