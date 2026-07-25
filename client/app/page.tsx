import { Navbar } from '@/components/navbar'
import { HeroSection } from '@/components/sections/hero'
import { StatisticsSection } from '@/components/sections/statistics'
import { FeaturesSection } from '@/components/sections/features'
import { HowItWorksSection } from '@/components/sections/how-it-works'
import { LatestItemsSection } from '@/components/sections/latest-items'
import { Footer } from '@/components/footer'
import { handleGetGlobalStats } from '@/actions/admin/item-actions'

export default async function Page() {
  const statsRes = await handleGetGlobalStats()
  const initialStats = statsRes.status && statsRes.data ? statsRes.data : {
    totalLostItems: 0,
    totalFoundItems: 0,
    totalMatches: 0,
    itemsRecovered: 0,
    registeredUsers: 0,
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <HeroSection />
        <StatisticsSection initialStats={initialStats} />
        <FeaturesSection />
        <HowItWorksSection />
        <LatestItemsSection />
      </main>
      <Footer />
    </>
  )
}

