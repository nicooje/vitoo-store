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

// ISR: Regeneración estática cada 60 segundos
export const revalidate = 60;

export default async function Home(props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined } }) {
  // Obtenemos todos los datos (del Excel o fallback JSON)
  const products = await getProductsFromSheet();

  // Resolvemos los Search Params
  const searchParams = await Promise.resolve(props.searchParams);
  const activeCategory = (searchParams?.category as string) || 'Todos';

  // Limpieza de datos (Separamos ">" y ",", nos quedamos con la primer keyword limpia)
  const cleanedProducts = products.map((p) => {
    let rawCat = p.category || '';

    if (rawCat.includes('>')) {
      const parts = rawCat.split('>');
      rawCat = parts[parts.length - 1];
    }

    if (rawCat.includes(',')) {
      rawCat = rawCat.split(',')[0];
    }

    return { ...p, category: rawCat.trim() || 'General' };
  });

  // Extracción de Categorías Únicas
  const uniqueCategories = Array.from(new Set(cleanedProducts.map((p) => p.category)));
  const filterCategories = ['Todos', ...uniqueCategories];

  // Filtramos la lista final que pasaremos al componente
  const filteredProducts = activeCategory === 'Todos'
    ? cleanedProducts
    : cleanedProducts.filter((p) => p.category === activeCategory);

  return (
    <main>
      <Header />
      <HeroSection />

      <section id="catalogo" className="py-16 px-5 lg:px-20 bg-white">
        <h2 className="text-center text-4xl font-bold text-gray-800 mb-8">
          Nuestro Catálogo
        </h2>
        <h2 className="text-center text-4xl font-bold text-gray-800 mb-8">
          Nuestro Catálogo
        </h2>

        {/* --- AGREGÁ ESTO PARA PROBAR --- */}
        <div className="bg-red-500 text-white p-4 text-center font-bold text-2xl mb-4 border-4 border-black">
          SI VES ESTO, LA PAGINA SE ACTUALIZÓ
        </div>
        {/* ------------------------------- */}

        <Suspense fallback={<div className="text-center mb-8">Cargando filtros...</div>}></Suspense>

        {/* Usamos Suspense porque useSearchParams desactiva el render pre-estático si no lo envolvemos */}
        <Suspense fallback={<div className="text-center mb-8">Cargando filtros...</div>}>
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
