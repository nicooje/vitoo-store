import { Suspense } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import CatalogoSection from '@/components/CatalogoSection';
import MayoristaSection from '@/components/MayoristaSection';
import SocialProofSection from '@/components/SocialProofSection';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import Footer from '@/components/Footer';
import CategoryFilter from '@/components/CategoryFilter';
import { getProductsFromSheet } from '@/lib/googleSheets';

export const revalidate = 60; // Actualización Automática (ISR)

export default async function Home(props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined } }) {
  const products = await getProductsFromSheet();
  const searchParams = await Promise.resolve(props.searchParams);
  const activeCategory = (searchParams?.category as string) || 'Todos';

  // Limpieza de categorías para UI prolija (ej: "Verano 25/26 > Bikinis" -> "Bikinis")
  const cleanedProducts = products.map(p => {
    let rawCat = p.category || '';
    if (rawCat.includes('>')) {
      const parts = rawCat.split('>');
      rawCat = parts[parts.length - 1];
    }
    return { ...p, category: rawCat.trim() || 'General' };
  });

  const uniqueCategories = Array.from(new Set(cleanedProducts.map(p => p.category)));
  const filterCategories = ['Todos', ...uniqueCategories];

  const filteredProducts = activeCategory === 'Todos'
    ? cleanedProducts
    : cleanedProducts.filter(p => p.category === activeCategory);

  return (
    <main>
      <Header />
      <HeroSection />

      <section id="catalogo" style={{ padding: '4rem 5%', backgroundColor: 'var(--background)' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', color: 'var(--foreground)', marginBottom: '2rem' }}>
          Nuestro Catálogo
        </h2>
        <Suspense fallback={<div style={{ textAlign: 'center', marginBottom: '2rem' }}>Cargando filtros...</div>}>
          <CategoryFilter categories={filterCategories} />
        </Suspense>
        <CatalogoSection products={filteredProducts} />
      </section>
      <MayoristaSection />
      <SocialProofSection />
      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
