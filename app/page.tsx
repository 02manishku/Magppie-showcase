import Hero from "@/components/Hero";
import Philosophy from "@/components/Philosophy";
import Gallery from "@/components/Gallery";
import ContactCTA from "@/components/ContactCTA";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import PageIntro from "@/components/PageIntro";
import Navbar from "@/components/Navbar";

export const dynamic = "force-static";

export default function Home() {
  return (
    <>
      <PageIntro />
      <Navbar />
      <ScrollProgress />
      <main>
        <Hero />
        <Philosophy />
        <Gallery />
        <ContactCTA />
        <Footer />
      </main>
    </>
  );
}
