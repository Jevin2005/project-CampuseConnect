import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CampusConnect — College Student Marketplace",
    template: "%s | CampusConnect",
  },
  description:
    "Buy and sell physical goods and protected digital content exclusively within your college community. Join CampusConnect — the secure, DRM-protected student marketplace platform.",
  keywords: [
    "campus marketplace",
    "student marketplace",
    "college buy sell",
    "digital notes",
    "DRM protected content",
    "CampusConnect",
  ],
  openGraph: {
    title: "CampusConnect — College Student Marketplace",
    description:
      "The college-exclusive marketplace for students to buy, sell, and share knowledge securely.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-main antialiased">{children}</body>
    </html>
  );
}
