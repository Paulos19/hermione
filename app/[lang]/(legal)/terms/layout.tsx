import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso | Hermione",
  description: "Termos e condições de uso da plataforma Hermione - Estúdio de Escrita Inteligente.",
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
