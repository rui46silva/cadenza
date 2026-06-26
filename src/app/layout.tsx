import type { Metadata } from "next";
import { Poppins, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import { ConsentProvider } from "@/components/ConsentProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import CookieConsent from "@/components/CookieConsent";
import { NO_FLASH_THEME_SCRIPT } from "@/lib/theme";
import "./globals.css";

const sans = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
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
    card: "summary_large_image",
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
  const comingSoon = process.env.COMING_SOON === "true";
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const adsensePublisherId = adsenseClient?.replace(/^ca-/, "");

  return (
    <html
      lang="pt"
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <head>
        {/*
          Google Privacy & Messaging (CMP certificada no IAB TCF), exigida pelo
          AdSense para visitantes no EEE/Reino Unido. Tem de carregar o mais
          cedo possível, antes de qualquer outro script. Sem efeito fora
          dessas regiões e sem efeito se o AdSense não estiver configurado.
          https://support.google.com/adsense/answer/13554116
        */}
        {adsensePublisherId && (
          <>
            <script
              async
              src={`https://fundingchoicesmessages.google.com/i/${adsensePublisherId}?ers=1`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `(function() {function signalGooglefcPresent() {if (!window.frames['googlefcPresent']) {if (document.body) {const iframe = document.createElement('iframe'); iframe.style = 'width: 0; height: 0; border: none; z-index: -1000; left: -1000px; top: -1000px;'; iframe.style.display = 'none'; iframe.name = 'googlefcPresent'; document.body.appendChild(iframe);} else {setTimeout(signalGooglefcPresent, 0);}}}signalGooglefcPresent();})();`,
              }}
            />
          </>
        )}
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
        {/*
          Tag do AdSense exigida pela Google para verificação do site e para
          servir anúncios. Carrega sempre (não depende do consentimento) — a
          personalização de anúncios é controlada pelo Consent Mode v2 acima.
        */}
        {adsenseClient && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <Providers>
            <ConsentProvider>
              {!comingSoon && <Navbar />}
              <main className="flex-1">{children}</main>
              {!comingSoon && <Footer />}
              <CookieConsent />
            </ConsentProvider>
          </Providers>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
