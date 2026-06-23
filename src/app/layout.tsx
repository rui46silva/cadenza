import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import { ConsentProvider } from "@/components/ConsentProvider";
import CookieConsent from "@/components/CookieConsent";
import AdSenseScript from "@/components/AdSenseScript";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cadenza",
  description:
    "Plataforma para músicos de clássica, jazz e pop partilharem, aprenderem e crescerem juntos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <ConsentProvider>
            <Navbar />
            <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
              {children}
            </main>
            <CookieConsent />
            <AdSenseScript />
          </ConsentProvider>
        </Providers>
      </body>
    </html>
  );
}
