import type { Metadata } from "next";
import { Barlow_Condensed, Barlow } from "next/font/google";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  weight: ["400", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  display: "swap",
});

const barlow = Barlow({
  weight: ["300", "400", "500", "600"],
  variable: "--font-barlow",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Elbio Universitario FC | Club de Fútbol",
  description:
    "Club Atlético Elbio Universitario — Pasión, historia y garra. Conocé nuestra historia, plantel y novedades.",
  icons: { icon: "/logo.ico" },
  openGraph: {
    title: "Elbio Universitario FC",
    description: "Club de fútbol con historia y pasión",
    type: "website",
    locale: "es_AR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${barlowCondensed.variable} ${barlow.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
