import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import { ConsentProvider } from "@/components/ConsentProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import CookieConsent from "@/components/CookieConsent";
import AdSenseScript from "@/components/AdSenseScript";
import { NO_FLASH_THEME_SCRIPT } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const description =
  "Plataforma para músicos de clássica, jazz e pop partilharem o seu trabalho, aprenderem com outros e crescerem juntos.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Cadenza — comunidade de músicos",
    template: "%s | Cadenza",
  },
  description,
  keywords: [
    "música",
    "músicos",
    "fórum de música",
    "clássica",
    "jazz",
    "pop",
    "comunidade musical",
    "aprender música",
  ],
  openGraph: {
    title: "Cadenza — comunidade de músicos",
    description,
    url: siteUrl,
    siteName: "Cadenza",
    locale: "pt_PT",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Cadenza — comunidade de músicos",
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Aplica o tema guardado antes da hidratação, para evitar flash. */}
        <script
          dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME_SCRIPT }}
        />
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
        <ThemeProvider>
          <Providers>
            <ConsentProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <CookieConsent />
              <AdSenseScript />
            </ConsentProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
