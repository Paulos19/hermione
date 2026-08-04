import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | Hermione",
  description: "Política de privacidade da plataforma Hermione - Estúdio de Escrita Inteligente.",
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
