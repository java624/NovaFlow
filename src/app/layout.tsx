import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script"; 
import { Toaster } from 'sonner';
import "@/app/globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { GoogleAnalytics } from "@next/third-parties/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://novaflow-school.com'),
  title: "NovaFlow — Інтерактивна онлайн-школа іноземних мов",
  description:
    "Онлайн-школа іноземних мов NovaFlow. Індивідуальні заняття, інтерактивні курси, гнучкий графік та розмовна практика. Запишіться на безкоштовний пробний урок!",
  icons: {
    icon: [
      { url: "/img/logo.svg", type: "image/svg+xml" },
    ],
    shortcut: "/img/logo.svg",
    apple: "/img/logo.svg",
  },
  openGraph: {
    title: "NovaFlow — Інтерактивна онлайн-школа іноземних мов",
    description:
      "Онлайн-школа іноземних мов NovaFlow. Індивідуальні заняття, інтерактивні курси, гнучкий графік та розмовна практика. Запишіться на безкоштовний пробний урок!",
    url: "https://novaflow-school.com",
    siteName: "NovaFlow Language School",
    images: [
      {
        url: "/img/og-image.png",
        width: 1200,
        height: 630,
        alt: "NovaFlow — Інтерактивна онлайн-школа іноземних мов",
      },
    ],
    locale: "uk_UA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NovaFlow — Інтерактивна онлайн-школа іноземних мов",
    description:
      "Онлайн-школа іноземних мов NovaFlow. Індивідуальні заняття, інтерактивні курси, гнучкий графік та розмовна практика.",
    images: ["/img/og-image.png"],
  },
  alternates: {
    canonical: "https://novaflow-school.com",
    languages: {
      "x-default": "https://novaflow-school.com",
      "uk": "https://novaflow-school.com/languages/ukrainian",
      "en": "https://novaflow-school.com/languages/english",
      "de": "https://novaflow-school.com/languages/german",
    },
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
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* 👈 2. Додали скрипт Telegram Mini App */}
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        {/* Microsoft Clarity Analytics */}
        {clarityId && (
          <Script
            id="microsoft-clarity"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${clarityId}");
              `,
            }}
          />
        )}
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-white text-gray-900`}
      >
        <LanguageProvider>
          <Toaster position="bottom-right" richColors theme="dark" />
          {children}
        </LanguageProvider>
      </body>
      {/* Google Analytics 4 */}
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  );
}