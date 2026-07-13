import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://novaflowschool.com'),
  title: "NovaFlow — Language School",
  description:
    "Build your language flow. Change your life. Personalized learning paths, flexible schedules, real-world speaking practice.",
  icons: {
    icon: "/img/logo.svg",
  },
  openGraph: {
    title: "NovaFlow — Language School",
    description: "Build your language flow. Change your life. Personalized learning paths, flexible schedules, real-world speaking practice.",
    url: "https://novaflowschool.com",
    siteName: "NovaFlow Language School",
    images: [
      {
        url: "/img/og-image.png",
        width: 1200,
        height: 1200,
        alt: "NovaFlow Language School - Build your language flow",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NovaFlow — Language School",
    description: "Build your language flow. Change your life. Personalized learning paths, flexible schedules, real-world speaking practice.",
    images: ["/img/og-image.png"],
  },
  alternates: {
    canonical: "https://novaflowschool.com",
    languages: {
      "x-default": "https://novaflowschool.com",
      "en": "https://novaflowschool.com",
      "uk": "https://novaflowschool.com/languages/uk",
      "de": "https://novaflowschool.com/languages/de",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} font-sans antialiased bg-white text-gray-900`}
      >
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
