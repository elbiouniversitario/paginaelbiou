import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Historia from "./components/Historia";
import Plantel from "./components/Plantel";
import Calendario from "./components/Calendario";
import Tienda from "./components/Tienda";
import CartProvider from "./components/CartProvider";
import CartDrawer from "./components/CartDrawer";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <CartProvider>
      <Navbar />
      <main>
        <Hero />
        <Historia />
        <Plantel />
        <Calendario />
        <Tienda />
      </main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}
