import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Vito Store | Lencería que te abraza',
  description: 'Descubrí lo mejor en lencería, trajes de baño y pijamas. Envíos a todo el país y venta mayorista en Corrientes.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={outfit.className}>{children}</body>
    </html>
  );
}
