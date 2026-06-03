import { Suspense } from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/landing/Hero'
import Features from '../components/landing/Features'
import PricingSection from '../components/landing/PricingSection'
import Testimonials from '../components/landing/Testimonials'
import CtaBanner from '../components/landing/CtaBanner'
import Footer from '../components/landing/Footer'
import DeletedBanner from '../components/landing/DeletedBanner'

export default function LandingPage() {
  return (
    <main>
      <Suspense>
        <DeletedBanner />
      </Suspense>
      <Navbar />
      <Hero />
      <Features />
      <PricingSection />
      <Testimonials />
      <CtaBanner />
      <Footer />
    </main>
  )
}
