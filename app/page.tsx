import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Historia from "./components/Historia";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Historia />
      </main>
      <Footer />
    </>
  );
}
