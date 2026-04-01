import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Magppie Living | Kitchens & Wardrobes",
  description:
    "Explore premium kitchens and wardrobes crafted by Magppie Living. The world's first wellness kitchens, built entirely from stone.",
  openGraph: {
    title: "Magppie Living | Kitchens & Wardrobes",
    description:
      "Explore premium kitchens and wardrobes crafted by Magppie Living.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link rel="dns-prefetch" href="https://magppie.com" />
        <link rel="preload" href="/hero-compressed.mp4" as="video" type="video/mp4" />
        <link rel="preload" href="/media/optimized/images/avif/kitchen-real-001.avif" as="image" type="image/avif" />
        <link rel="preload" href="/media/optimized/images/avif/kitchen-real-002.avif" as="image" type="image/avif" />
        <link rel="preload" href="/media/optimized/images/avif/kitchen-real-003.avif" as="image" type="image/avif" />
      </head>
      <body>{children}</body>
    </html>
  );
}
