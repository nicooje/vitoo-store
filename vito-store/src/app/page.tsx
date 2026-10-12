import { Suspense } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import CategoryShowcase from '@/components/CategoryShowcase';
import CatalogoSection from '@/components/CatalogoSection';
import BenefitsBar from '@/components/BenefitsBar';
import Footer from '@/components/Footer';
import CategoryFilter from '@/components/CategoryFilter';
import Reveal from '@/components/Reveal';
import { getProductsFromSheet } from '@/lib/googleSheets';
import FloatingCart from '@/components/FloatingCart';
import PromoTiles from '@/components/PromoTiles';

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

    const withImages = cleanedProducts.filter(p => p.image_url);
    const promoImage = withImages[5]?.image_url.split(',')[0].trim() || withImages[0]?.image_url.split(',')[0].trim();
    const title = searchQuery ? `"${searchQuery}"` : isBrowsing ? activeCategory.replace('-', ' y ') : 'Lo más deseado';

    return (
        <main className="bg-bg-light min-h-screen">
            <Header />
            {!isBrowsing && <HeroSection products={withImages.slice(0, 5)} />}

            {/* Al navegar por categoria o busqueda, el catalogo es lo principal */}
            {!isBrowsing && <CategoryShowcase products={cleanedProducts} />}

            <section id="catalogo" className={`scroll-mt-16 md:scroll-mt-28 px-4 md:px-8 pb-20 md:pb-28 ${isBrowsing ? 'pt-10 md:pt-14' : 'pt-4'}`}>
                <div className="max-w-[1400px] mx-auto w-full">
                    <Reveal className="mb-6 md:mb-8 flex items-end justify-between gap-6">
                        <div>
                            <p className="eyebrow text-primary mb-2">
                                {searchQuery ? 'Resultados de búsqueda' : isBrowsing ? 'Categoría' : 'Nuestro catálogo'}
                            </p>
                            <h2 className="font-display text-3xl md:text-[44px] leading-tight text-primary-dark">{title}</h2>
                        </div>
                        <p className="text-sm text-muted shrink-0 tabular-nums">{filteredProducts.length} productos</p>
                    </Reveal>

                    <Suspense fallback={<div className="h-[69px] mb-10 border-y border-line" />}>
                        <CategoryFilter categories={filterCategories} />
                    </Suspense>

                    <CatalogoSection key={`${activeCategory}|${searchQuery}|${activeSort}`} products={filteredProducts} />
                </div>
            </section>

            {!isBrowsing && <PromoTiles image={promoImage} />}
            <BenefitsBar />
            <Footer />
            <FloatingCart />
        </main>
    );
}
