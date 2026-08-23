import { Suspense } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import MarqueeBand from '@/components/MarqueeBand';
import CategoryShowcase from '@/components/CategoryShowcase';
import CatalogoSection from '@/components/CatalogoSection';
import BenefitsBar from '@/components/BenefitsBar';
import Footer from '@/components/Footer';
import CategoryFilter from '@/components/CategoryFilter';
import Reveal from '@/components/Reveal';
import { getProductsFromSheet } from '@/lib/googleSheets';
import FloatingCart from '@/components/FloatingCart';

export const revalidate = 60;

export default async function Home(props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined } }) {
  const products = await getProductsFromSheet();
  const searchParams = await Promise.resolve(props.searchParams);
  const activeCategory = (searchParams?.category as string) || 'Todos';
  const activeSort = (searchParams?.sort as string) || '';
  const searchQuery = (searchParams?.search as string) || '';

  const cleanedProducts = products.map((p) => {
    let rawCat = p.category || '';
    if (rawCat.includes('>')) rawCat = rawCat.split('>')[rawCat.split('>').length - 1];
    if (rawCat.includes(',')) rawCat = rawCat.split(',')[0];
    return { ...p, category: rawCat.trim() || 'General' };
  });

  const uniqueCategories = Array.from(new Set(cleanedProducts.map((p) => p.category)));
  const filterCategories = ['Todos', ...uniqueCategories];

  // Filtramos por categoría primero, y si hay búsqueda, filtramos por texto
  let filteredProducts = activeCategory === 'Todos'
    ? cleanedProducts
    : cleanedProducts.filter((p) => p.category === activeCategory);

  if (searchQuery) {
      filteredProducts = filteredProducts.filter((p) =>
          p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }

  if (activeSort === 'asc') {
      filteredProducts.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (activeSort === 'desc') {
      filteredProducts.sort((a, b) => Number(b.price) - Number(a.price));
  }

  const isBrowsing = Boolean(activeCategory && activeCategory !== 'Todos') || Boolean(searchQuery);

    return (
        <main className="bg-bg-light min-h-screen">
            <Header />
            <HeroSection products={cleanedProducts.filter(p => p.image_url).slice(0, 5)} />
            <MarqueeBand />

            {/* Al navegar por categoria o busqueda, el catalogo es lo principal */}
            {!isBrowsing && <CategoryShowcase products={cleanedProducts} />}

            <section id="catalogo" className="pt-20 pb-28 px-4 md:px-8 bg-bg-light">
                <div className="max-w-[1400px] mx-auto w-full">
                    <Reveal className="text-center mb-12">
                        <p className="font-display italic text-primary text-lg mb-1">
                            {searchQuery ? `Resultados para "${searchQuery}"` : 'Nuestro catálogo'}
                        </p>
                        <h2 className="font-display text-4xl lg:text-5xl text-primary-dark">
                            {isBrowsing ? activeCategory : 'Lo más deseado'}
                        </h2>
                    </Reveal>

                    <Suspense fallback={<div className="text-center mb-8 font-medium text-slate-500 animate-pulse">Cargando filtros...</div>}>
                        <CategoryFilter categories={filterCategories} />
                    </Suspense>

                    <CatalogoSection products={filteredProducts} />
                </div>
            </section>

            <BenefitsBar />
            <Footer />
            <FloatingCart />
        </main>
    );
}
