import Navbar from "./components/Navbar";
import HeroSlider from "./components/HeroSlider";
import MatchStats from "./components/MatchStats";
import StorePreview from "./components/StorePreview";
import Historia from "./components/Historia";
import PlayerPortal from "./components/PlayerPortal";
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
        <HeroSlider />
        <MatchStats />
        <StorePreview />
        <Historia />
        <PlayerPortal />
        <Plantel />
        <Calendario />
        <Tienda />
      </main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}
