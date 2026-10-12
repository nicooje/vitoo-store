// Datos de la tienda usados en varias partes del diseño
export const WHATSAPP_NUMBER = '5493794088240';
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const INSTAGRAM_URL = 'https://instagram.com/vitoo.store';
export const MAPS_URL = 'https://maps.app.goo.gl/MQrF2XJRg23bXV2q7';
export const ADDRESS = 'Av. Cangallo 136 · Corrientes Capital';

// Navegación principal (el valor es la categoría tal cual figura en el catálogo)
export const NAV_CATEGORIES: { cat: string; label: string }[] = [
    { cat: 'Conjuntos', label: 'Conjuntos' },
    { cat: 'Corpiños-Tops', label: 'Corpiños y tops' },
    { cat: 'Bombachas', label: 'Bombachas' },
    { cat: 'Medias', label: 'Medias' },
    { cat: 'Invierno', label: 'Invierno' },
    { cat: 'Lubricantes y juegos', label: 'Lubricantes y juegos' },
    { cat: 'Varios', label: 'Varios' },
];

export const categoryHref = (cat: string) => `/?category=${encodeURIComponent(cat)}#catalogo`;

export const formatPrice = (n: number | string | undefined) =>
    '$' + (Number(n) || 0).toLocaleString('es-AR');
