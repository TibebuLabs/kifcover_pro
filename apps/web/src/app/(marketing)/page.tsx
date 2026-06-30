import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/landing/HeroSection'
import { LogoScroll } from '@/components/landing/LogoScroll'
import { FeaturesGrid } from '@/components/landing/FeaturesGrid'
import { ProductsSection } from '@/components/landing/ProductsSection'
import { DeveloperSection } from '@/components/landing/DeveloperSection'
import { CtaSection } from '@/components/landing/CtaSection'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <LogoScroll />
        <FeaturesGrid />
        <ProductsSection />
        <DeveloperSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  )
}
