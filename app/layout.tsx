import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "TerraGrid Atlas | Global Grid Intelligence",
    template: "%s | TerraGrid Atlas"
  },
  description:
    "A global interactive atlas for exploring power plants, substations, transmission, data centers, and grid intelligence.",
  keywords: [
    "energy infrastructure",
    "grid intelligence",
    "power plants",
    "transmission",
    "data centers",
    "Next.js",
    "MapLibre"
  ],
  openGraph: {
    title: "TerraGrid Atlas",
    description: "Explore the world's power infrastructure.",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
