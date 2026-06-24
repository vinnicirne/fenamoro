import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans, Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fenamoro.app"),
  title: "FéNamoro | Conexões com propósito e fé",
  description: "O primeiro app de relacionamentos intencional para cristãos. Encontre sua parceria de vida com propósito, caráter e fé.",
  keywords: ["namoro cristão", "relacionamento cristão", "app cristão", "namoro evangélico", "FéNamoro"],
  authors: [{ name: "FéNamoro" }],
  openGraph: {
    title: "FéNamoro — Conexões com propósito e fé",
    description: "Encontre sua parceria de vida com propósito, caráter e fé.",
    url: "https://fenamoro.app",
    siteName: "FéNamoro",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FéNamoro",
    description: "Conexões com propósito e fé",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${outfit.variable} ${jakarta.variable} ${manrope.variable}`}
    >
      <body className="bg-whatsapp-dark text-white antialiased font-jakarta">
        {children}
        <Toaster
          richColors
          position="top-center"
          toastOptions={{
            style: {
              background: "#202C33",
              border: "1px solid rgba(37,211,102,0.2)",
              color: "#fff",
              fontFamily: "var(--font-jakarta)",
            },
          }}
        />
      </body>
    </html>
  );
}
