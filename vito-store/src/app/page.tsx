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
        <main className="bg-white font-sans text-gray-900 min-h-screen">
            <Header />
            <HeroSection />

            <section id="catalogo" className="pt-16 pb-24 px-4 md:px-8 bg-white">
                <div className="max-w-[1400px] mx-auto w-full">
                    <h2 className="text-center text-2xl lg:text-3xl font-normal text-gray-900 tracking-tight mb-8">
                        Nuestro Catálogo
                    </h2>

                    <Suspense fallback={<div className="text-center mb-8 font-medium text-slate-500 animate-pulse">Cargando filtros...</div>}>
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
