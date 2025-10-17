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
  title: "XAODRESCAN",
  description: "Plataforma de leitura de mangás online",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' }
    ],
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
