import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script"; 
import { Toaster } from 'sonner';
import "@/app/globals.css";
import { LanguageProvider } from "@/context/LanguageContext";

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
    icon: "/img/logo.svg",
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
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* 👈 2. Додали скрипт Telegram Mini App */}
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-white text-gray-900`}
      >
        <LanguageProvider>
          <Toaster position="bottom-right" richColors theme="dark" />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}