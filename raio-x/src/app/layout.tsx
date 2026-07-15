import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Raio-X do Crédito — Descubra sua saúde financeira em 2 minutos",
    template: "%s · Raio-X do Crédito",
  },
  description:
    "Faça o Raio-X do Crédito gratuito: um diagnóstico de 2 minutos que aponta os fatores que podem estar dificultando sua aprovação de crédito. Resultado imediato.",
  keywords: ["raio-x do crédito", "saúde financeira", "análise de crédito", "score", "SCR", "diagnóstico financeiro"],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: "Raio-X do Crédito — Descubra sua saúde financeira em 2 minutos",
    description:
      "Diagnóstico gratuito de 2 minutos com os fatores que podem estar dificultando sua aprovação de crédito.",
    siteName: "Raio-X do Crédito",
  },
  twitter: {
    card: "summary_large_image",
    title: "Raio-X do Crédito",
    description: "Descubra sua saúde financeira em 2 minutos. Gratuito.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
