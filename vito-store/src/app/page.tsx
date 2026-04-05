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
import FloatingCart from '@/components/FloatingCart';

export const revalidate = 60;

export default async function Home(props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined } }) {
  const products = await getProductsFromSheet();
  const searchParams = await Promise.resolve(props.searchParams);
  const activeCategory = (searchParams?.category as string) || 'Todos';

  const cleanedProducts = products.map((p) => {
    let rawCat = p.category || '';
    if (rawCat.includes('>')) rawCat = rawCat.split('>')[rawCat.split('>').length - 1];
    if (rawCat.includes(',')) rawCat = rawCat.split(',')[0];
    return { ...p, category: rawCat.trim() || 'General' };
  });

  const uniqueCategories = Array.from(new Set(cleanedProducts.map((p) => p.category)));
  const filterCategories = ['Todos', ...uniqueCategories];

  const filteredProducts = activeCategory === 'Todos'
    ? cleanedProducts
    : cleanedProducts.filter((p) => p.category === activeCategory);

  return (
    <main className="bg-slate-50 font-sans text-slate-900 min-h-screen">
      <Header />
      <HeroSection />

      <section id="catalogo" className="py-24 px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-4xl lg:text-5xl font-black text-slate-950 tracking-tight mb-12">
            Nuestro Catálogo
          </h2>

          <Suspense fallback={<div className="text-center mb-8 font-medium text-slate-500 animate-pulse">Cargando catálogo...</div>}>
            <CategoryFilter categories={filterCategories} />
          </Suspense>

          <CatalogoSection products={filteredProducts} />
        </div>
      </section>

      <MayoristaSection />
      <SocialProofSection />
      <Footer />
      <FloatingCart />
      <FloatingWhatsApp />
    </main>
  );
}
