import Hero from "@/components/Hero";
import Footer from "@/ui/Footer";
import Navbar from "@/ui/Navbar";

export default function Home() {
  return (
    <div className="flex flex-col items-stretch justify-between">
      <Navbar />
      <Hero />
      <Footer />
    </div>
  )
}