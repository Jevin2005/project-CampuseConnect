import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import AuthBootstrap from "@/components/AuthBootstrap";

export const metadata = {
  title: "CampusConnect — Your College Marketplace",
  description:
    "CampusConnect is the exclusive student marketplace for buying and selling notes, video courses, textbooks, electronics and more — privately within your college.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0A0E1A" />
        {/* Preconnect for fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Load Sora + DM Sans with display=swap so text shows immediately */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-main antialiased">
        {/* AuthBootstrap is a tiny 'use client' component that silently refreshes
            the access token. Kept separate so this layout stays a Server Component
            and Next.js can SSR/stream every page immediately. */}
        <AuthBootstrap />
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
