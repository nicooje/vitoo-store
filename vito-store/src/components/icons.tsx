// Set único de íconos de trazo fino (misma familia en toda la web)
type P = { className?: string };
const base = (className = 'w-5 h-5') => ({
    xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, className, 'aria-hidden': true,
});

export const IconSearch = ({ className }: P) => <svg {...base(className)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
export const IconBag = ({ className }: P) => <svg {...base(className)}><path d="M6 7h12l1 14H5L6 7Z" /><path d="M9 7V6a3 3 0 0 1 6 0v1" /></svg>;
export const IconMenu = ({ className }: P) => <svg {...base(className)}><path d="M3 7h18M3 12h18M3 17h18" /></svg>;
export const IconClose = ({ className }: P) => <svg {...base(className)}><path d="M6 6l12 12M18 6 6 18" /></svg>;
export const IconChevronLeft = ({ className }: P) => <svg {...base(className)}><path d="m15 18-6-6 6-6" /></svg>;
export const IconChevronRight = ({ className }: P) => <svg {...base(className)}><path d="m9 18 6-6-6-6" /></svg>;
export const IconArrowRight = ({ className }: P) => <svg {...base(className)}><path d="M4 12h16M14 6l6 6-6 6" /></svg>;
export const IconPlus = ({ className }: P) => <svg {...base(className)}><path d="M12 5v14M5 12h14" /></svg>;
export const IconMinus = ({ className }: P) => <svg {...base(className)}><path d="M5 12h14" /></svg>;
export const IconTrash = ({ className }: P) => <svg {...base(className)}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>;
export const IconTruck = ({ className }: P) => <svg {...base(className)}><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="1.8" /><circle cx="17" cy="18" r="1.8" /></svg>;
export const IconTag = ({ className }: P) => <svg {...base(className)}><path d="M3 12V4h8l10 10-8 8L3 12Z" /><circle cx="7.5" cy="8.5" r="1.3" /></svg>;
export const IconChat = ({ className }: P) => <svg {...base(className)}><path d="M4 5h16v11H9l-5 4V5Z" /><path d="M8 10h8M8 13h5" /></svg>;
export const IconRefresh = ({ className }: P) => <svg {...base(className)}><path d="M20 11a8 8 0 0 0-14.5-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.5 4.5L20 16M20 20v-4h-4" /></svg>;
export const IconPin = ({ className }: P) => <svg {...base(className)}><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z" /><circle cx="12" cy="9" r="2.5" /></svg>;
export const IconCard = ({ className }: P) => <svg {...base(className)}><rect x="3" y="5" width="18" height="14" rx="1" /><path d="M3 10h18M7 15h4" /></svg>;
export const IconStore = ({ className }: P) => <svg {...base(className)}><path d="M4 9h16l-1-5H5L4 9ZM5 9v11h14V9M10 20v-5h4v5" /></svg>;
export const IconCheck = ({ className }: P) => <svg {...base(className)}><path d="m5 12 5 5 9-10" /></svg>;

export const IconInstagram = ({ className = 'w-5 h-5' }: P) => (
    <svg {...base(className)}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" /></svg>
);
export const IconWhatsApp = ({ className = 'w-5 h-5' }: P) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden>
        <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.93 7.93 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.57 6.57 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
    </svg>
);
