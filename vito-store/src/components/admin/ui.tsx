// Piezas visuales compartidas del panel (mismo lenguaje que la tienda: bordes finos, sin sombras)
import type { ReactNode } from 'react';

export type Product = {
    id: number;
    name: string;
    category: string;
    price: number;
    image_url: string;
    stock: boolean;
    size?: string;
    color?: string;
    quantity?: number;
    price3?: number;
    price6?: number;
    price9?: number;
    price12?: number;
    description?: string;
};

export type Order = {
    id: string;
    date: string;
    clientName: string;
    whatsapp: string;
    deliveryMethod: string;
    paymentMethod: string;
    total: number;
    items: string;
    status?: string;
};

export type OrderItem = {
    nombre: string;
    cantidad: number;
    precio: number;
    imagenUrl?: string;
    selectedSize?: string;
    selectedColor?: string;
};

export const ESTADOS_PEDIDO = ['Pendiente', 'Pagado', 'Enviado', 'Entregado', 'Cancelado'] as const;

export const estadoClase: Record<string, string> = {
    Pendiente: 'bg-[#fff3e0] text-[#8a4b00]',
    Pagado: 'bg-accent-light text-accent-hover',
    Enviado: 'bg-primary-light text-primary',
    Entregado: 'bg-[#e6f4ea] text-[#1e6b3b]',
    Cancelado: 'bg-sand text-muted',
};

export const money = (n: number | string | undefined) => '$' + Math.round(Number(n) || 0).toLocaleString('es-AR');
export const firstImg = (url?: string) => (url || '').split(',')[0].trim();
export const cleanName = (s: string) => s.replace(/^[^\p{L}\p{N}]+/u, '');
export const LOW_STOCK = 3;

/** Fecha real del pedido: el id es el momento en que se creó (ms). */
export function orderTime(o: Order): number {
    const n = Number(o.id);
    if (n > 1e12) return n;
    const m = /(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(o.date || '');
    return m ? new Date(+m[3], +m[2] - 1, +m[1]).getTime() : 0;
}

export function parseItems(o: Order): OrderItem[] {
    try {
        const arr = JSON.parse(o.items || '[]');
        return Array.isArray(arr) ? arr : [];
    } catch { return []; }
}

/** wa.me necesita el número internacional: 3794123456 -> 5493794123456 */
export function waNumber(raw: string): string {
    let d = (raw || '').replace(/\D/g, '');
    if (d.startsWith('00')) d = d.slice(2);
    if (d.startsWith('0')) d = d.slice(1);
    if (d.length === 10) d = '549' + d;
    else if (d.startsWith('54') && !d.startsWith('549') && d.length === 12) d = '549' + d.slice(2);
    return d;
}

export const fechaCorta = (ms: number) =>
    ms ? new Date(ms).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }).replace('.', '') : '-';
export const fechaHora = (ms: number) =>
    ms ? new Date(ms).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).replace('.', '') : '-';
export function haceCuanto(ms: number) {
    if (!ms) return 'nunca';
    const s = Math.round((Date.now() - ms) / 1000);
    if (s < 60) return 'hace instantes';
    if (s < 3600) return `hace ${Math.round(s / 60)} min`;
    if (s < 86400) return `hace ${Math.round(s / 3600)} h`;
    return `hace ${Math.round(s / 86400)} días`;
}

export function SectionHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 md:mb-8">
            <div>
                {eyebrow && <p className="eyebrow text-primary mb-2">{eyebrow}</p>}
                <h1 className="font-display text-3xl md:text-4xl text-primary-dark leading-tight">{title}</h1>
            </div>
            {children && <div className="flex flex-wrap gap-2">{children}</div>}
        </div>
    );
}

export function Panel({ title, action, children, className = '' }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
    return (
        <section className={`bg-white border border-line ${className}`}>
            {(title || action) && (
                <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-line">
                    {title && <h2 className="eyebrow text-[11px] text-primary-dark">{title}</h2>}
                    {action}
                </div>
            )}
            {children}
        </section>
    );
}

export function Stat({ label, value, hint, onClick, tone = 'default' }: { label: string; value: string; hint?: ReactNode; onClick?: () => void; tone?: 'default' | 'alert' }) {
    const Tag = onClick ? 'button' : 'div';
    return (
        <Tag onClick={onClick} className={`text-left bg-white border border-line p-5 flex flex-col gap-2 ${onClick ? 'hover:border-primary/40 transition-colors' : ''}`}>
            <span className="eyebrow text-[10px] text-muted">{label}</span>
            <span className={`font-display text-3xl md:text-[34px] leading-none tabular-nums ${tone === 'alert' ? 'text-[#8a4b00]' : 'text-primary-dark'}`}>{value}</span>
            {hint && <span className="text-xs text-muted">{hint}</span>}
        </Tag>
    );
}

export function Badge({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <span className={`inline-flex items-center eyebrow text-[9.5px] px-2 py-1 ${className}`}>{children}</span>;
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
    return (
        <div className="text-center py-16 px-6">
            <p className="font-display text-2xl text-primary-dark mb-2">{title}</p>
            {children && <div className="text-sm text-muted">{children}</div>}
        </div>
    );
}

export function Spinner({ className = 'w-4 h-4' }: { className?: string }) {
    return <span className={`inline-block rounded-full border-2 border-current border-r-transparent animate-spin ${className}`} aria-hidden />;
}

export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${checked ? 'bg-primary' : 'bg-ink/20'}`}
        >
            <span className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
        </button>
    );
}

export const inputCls = 'w-full border border-line bg-white px-3 py-2.5 text-[15px] text-ink placeholder:text-muted outline-none focus:border-primary transition-colors min-h-[44px]';
export const labelCls = 'eyebrow text-[10px] text-ink mb-1.5 block';
