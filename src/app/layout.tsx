import type { Metadata } from "next";
import localFont from 'next/font/local';
import "./globals.css";

// Load SF Pro font files
const sfPro = localFont({
  src: [
    {
      path: '../../public/fonts/SF-Pro-Display-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/SF-Pro-Display-Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/SF-Pro-Display-Semibold.otf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/SF-Pro-Display-Bold.otf',
      weight: '700',
      style: 'normal',
    }
  ],
  variable: '--font-sf-pro'
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
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-PYDYLH50LN"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-PYDYLH50LN');
            `,
          }}
        />
      </head>
      <body className={`${sfPro.variable} font-sf-pro antialiased`}>
        {children}
      </body>
    </html>
  );
}
