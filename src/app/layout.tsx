import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import NotificationContainer from "@/components/NotificationContainer";
import LoadingSpinner from "@/components/LoadingSpinner";
import NoSSR from "@/components/NoSSR";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "XAODRESCAN - Leia Mangás Online Grátis",
    template: "%s | XAODRESCAN"
  },
  description: "Leia mangás online grátis no XAODRESCAN. Milhares de mangás em português, atualizações diárias e interface otimizada para leitura.",
  keywords: ["mangás online", "leia mangás grátis", "mangás em português", "scanlator", "manga reader", "xaodrescan"],
  authors: [{ name: "XAODRESCAN" }],
  creator: "XAODRESCAN",
  publisher: "XAODRESCAN",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://xaodrescan.mangazinho.site'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://xaodrescan.mangazinho.site',
    siteName: 'XAODRESCAN',
    title: 'XAODRESCAN - Leia Mangás Online Grátis',
    description: 'Leia mangás online grátis no XAODRESCAN. Milhares de mangás em português, atualizações diárias e interface otimizada para leitura.',
    images: [
      {
        url: '/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'XAODRESCAN - Leia Mangás Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XAODRESCAN - Leia Mangás Online Grátis',
    description: 'Leia mangás online grátis no XAODRESCAN. Milhares de mangás em português, atualizações diárias.',
    images: ['/images/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' }
    ],
    apple: '/favicon.png',
  },
  verification: {
    google: 'seu-google-verification-code-aqui',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2659758647211399"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <NoSSR>
          <AuthProvider>
            <NotificationProvider>
              <LoadingSpinner />
              <Header />
              <div className="pt-16 pb-12 min-h-screen bg-[var(--color-bg)]">
                {children}
              </div>
              <Footer />
              <NotificationContainer />
            </NotificationProvider>
          </AuthProvider>
        </NoSSR>
      </body>
    </html>
  );
}
