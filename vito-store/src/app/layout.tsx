import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import './globals.css';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Vito Store | Lencería que te abraza',
  description: 'Descubrí lo mejor en lencería, trajes de baño y pijamas. Envíos a todo el país y venta mayorista en Corrientes.',
  openGraph: {
    title: 'Vito Store | Lencería',
    description: 'Descubrí lo mejor en lencería y pijamas. Diseños exclusivos y venta mayorista.',
    url: 'https://vito.store', // Placeholder, ideal to use actual URL
    siteName: 'Vito Store',
    images: [
      {
        url: 'https://res.cloudinary.com/dzhz0gz5i/image/upload/v1700000000/vitoo_store/og-image.jpg', // You must upload an og-image to Cloudinary or public folder
        width: 1200,
        height: 630,
        alt: 'Vito Store Lencería',
      },
    ],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vito Store',
    description: 'Lencería, pijamas y trajes de baño únicos.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        {/* Placeholder: Google Analytics */}
        <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'}`}
            strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'}');
            `}
        </Script>

        {/* Placeholder: Meta Pixel */}
        <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${process.env.NEXT_PUBLIC_PIXEL_ID || 'XXXXXXXXXXXXXXXX'}');
              fbq('track', 'PageView');
            `}
        </Script>
      </head>
      <body className={outfit.className}>
        <Toaster position="bottom-center" />
        {children}
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
