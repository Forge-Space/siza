import type { Metadata } from 'next';
import { DM_Sans, Plus_Jakarta_Sans, IBM_Plex_Mono } from 'next/font/google';
import { Suspense } from 'react';
import { QueryProvider } from '@/components/providers/query-provider';
import AnalyticsProvider from '@/components/analytics/AnalyticsProvider';
import { FeatureFlagProvider } from '@/lib/features/provider';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  preload: false,
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-plus-jakarta',
  preload: false,
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-ibm-plex-mono',
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://siza.forgespace.co'),
  title: {
    default: 'Siza — Structured AI Development',
    template: '%s · Siza',
  },
  description:
    'Siza brings real architecture, built-in security, and automated quality gates to AI-powered full-stack development. Open source, MIT licensed.',
  keywords: [
    'AI code generation',
    'full-stack development',
    'structured AI',
    'vibe coding',
    'software architecture',
    'security',
    'code quality',
    'React',
    'Next.js',
    'MCP',
  ],
  authors: [{ name: 'Siza', url: 'https://siza.forgespace.co' }],
  creator: 'Siza',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/monogram.svg', type: 'image/svg+xml' },
    ],
    apple: '/monogram.png',
  },
  openGraph: {
    title: 'Siza — Structured AI Development',
    description:
      'Real architecture, built-in security, and automated quality gates for AI-powered full-stack development.',
    url: 'https://siza.forgespace.co',
    siteName: 'Siza',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Siza — Structured AI Development',
      },
    ],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Siza — Structured AI Development',
    description:
      'Real architecture, built-in security, and automated quality gates for AI-powered full-stack development.',
    images: ['/og-image.png'],
    site: '@forgespace',
  },
  alternates: {
    canonical: 'https://siza.forgespace.co',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${dmSans.variable} ${plusJakartaSans.variable} ${ibmPlexMono.variable}`}
    >
      <body className="font-sans antialiased">
        <a
          href="#main-content"
          className="
            sr-only
            focus:not-sr-only
            focus:fixed focus:left-4 focus:top-4 focus:z-[9999]
            focus:rounded-md focus:bg-[--forge-primary] focus:px-4 focus:py-2
            focus:text-sm focus:font-semibold focus:text-white
            focus:shadow-[var(--forge-focus-ring)]
            focus:outline-none
          "
        >
          Skip to main content
        </a>
        <QueryProvider>
          <Suspense fallback={null}>
            <AnalyticsProvider>
              <FeatureFlagProvider>{children}</FeatureFlagProvider>
            </AnalyticsProvider>
          </Suspense>
        </QueryProvider>
      </body>
    </html>
  );
}
