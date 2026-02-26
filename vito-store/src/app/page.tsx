import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import CatalogoSection from '@/components/CatalogoSection';
import MayoristaSection from '@/components/MayoristaSection';
import SocialProofSection from '@/components/SocialProofSection';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import Footer from '@/components/Footer';
import { getProductsFromSheet } from '@/lib/googleSheets';

export default async function Home() {
  const products = await getProductsFromSheet();

  return (
    <main>
      <Header />
      <HeroSection />
      <CatalogoSection products={products} />
      <MayoristaSection />
      <SocialProofSection />
      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
