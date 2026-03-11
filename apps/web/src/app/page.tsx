import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { StatsBar } from '@/components/landing/StatsBar';
import { CodeShowcase } from '@/components/landing/CodeShowcase';
import { DashboardPreview } from '@/components/landing/DashboardPreview';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { CapabilitiesSection } from '@/components/landing/CapabilitiesSection';
import { EcosystemSection } from '@/components/landing/EcosystemSection';
import { CTASection } from '@/components/landing/CTASection';
import { getEcosystemSnapshot } from '@/lib/marketing/ecosystem-data';

export default async function HomePage() {
  const snapshot = await getEcosystemSnapshot();

  return (
    <div className="relative isolate overflow-hidden">
      <LandingNav />
      <main id="main-content" className="relative z-10">
        <HeroSection />
        <StatsBar snapshot={snapshot} />
        <CapabilitiesSection />
        <CodeShowcase />
        <EcosystemSection snapshot={snapshot} />
        <DashboardPreview />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
