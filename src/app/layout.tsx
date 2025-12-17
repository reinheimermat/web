import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://barberfy.software"),
  title: {
    default: "Barberfy - Automação de Agendamento para Barbearias",
    template: "%s | Barberfy",
  },
  description:
    "O sistema de gestão completo para barbearias. Agendamento automático via WhatsApp, lembretes de corte e gestão financeira.",
  keywords: [
    "sistema para barbearia",
    "agendamento whatsapp",
    "chatbot barbearia",
    "gestão de barbearia",
    "barberfy",
  ],
  openGraph: {
    title: "Barberfy - Automatize sua Barbearia",
    description:
      "Pare de perder tempo no WhatsApp. Deixe o Barberfy agendar seus cortes automaticamente 24h por dia.",
    url: "https://barberfy.software",
    siteName: "Barberfy Software",
    locale: "pt_BR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "facebook-domain-verification": "on8p05pof5yawyws7o9xvjpjf597f2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
