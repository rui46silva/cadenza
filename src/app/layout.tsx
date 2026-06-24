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
      <head>
        {/* Google Consent Mode v2 (avançado) — tem de correr antes do gtag.js carregar. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  var storedConsent = null;
  try { storedConsent = window.localStorage.getItem('cadenza-cookie-consent'); } catch (e) {}
  var status = storedConsent === 'granted' ? 'granted' : 'denied';
  gtag('consent', 'default', {
    'ad_storage': status,
    'ad_user_data': status,
    'ad_personalization': status,
    'analytics_storage': status,
    'functionality_storage': 'granted',
    'security_storage': 'granted',
    'wait_for_update': 500
  });`,
          }}
        />
        {/* Google tag (gtag.js) */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-CT664N9STS"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `gtag('js', new Date());

  gtag('config', 'G-CT664N9STS');`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          <ConsentProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <CookieConsent />
            <AdSenseScript />
          </ConsentProvider>
        </Providers>
      </body>
    </html>
  );
}
