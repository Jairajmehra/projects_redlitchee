import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from 'next/script';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gujarat Real Estate Directory | RERA Registered Projects in Ahmedabad, Surat, Vadodara & More",
  description: "Explore Gujarat's most comprehensive real estate directory featuring RERA registered residential and commercial projects in Ahmedabad, Surat, Vadodara, Dholera, Jamnagar, Bhavnagar, Junagadh, Gandhinagar, and Rajkot. Find brochures, resale listings, and rental options—all in one place.",
  keywords: "Gujarat real estate, Ahmedabad properties, Surat real estate, Vadodara projects, Dholera real estate, Jamnagar property, Bhavnagar realty, Junagadh real estate, Gandhinagar projects, Rajkot real estate, RERA registered, under construction, ready possession, property brochure directory, resale, rental",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3004'
  ),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: "Gujarat Real Estate Directory | RERA Registered Projects in Ahmedabad, Surat, Vadodara & More",
    description: "Discover Gujarat's top real estate directory showcasing ready & upcoming RERA registered residential and commercial projects. Access brochures and explore resale and rental options in Ahmedabad, Surat, Vadodara, and beyond.",
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-PYDYLH50LN"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-PYDYLH50LN');
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
