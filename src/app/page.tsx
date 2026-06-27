import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Teacher from "@/components/landing/Teacher";
import Certifications from "@/components/landing/Certifications";
import Languages from "@/components/landing/Languages";
import LevelTest from "@/components/landing/LevelTest";
import Reviews from "@/components/landing/Reviews";
import Contact from "@/components/landing/Contact";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <Teacher />
        <Certifications />
        <Languages />
        <LevelTest />
        <Reviews />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
