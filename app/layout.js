import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata = {
  metadataBase: new URL("https://www.everyonesanta.com"),
  title: {
    default: "Secret Santa - Start Your Tradition",
    template: "%s | Everyone Santa",
  },
  description:
    "Experience the art of giving. Organize sophisticated Secret Santa events with ease. The premium platform for your holiday gift exchanges.",
  keywords: [
    "Secret Santa",
    "Gift Exchange",
    "Holiday",
    "Christmas",
    "Event Organizer",
    "Wishlist",
  ],
  openGraph: {
    title: "Secret Santa - Start Your Tradition",
    description:
      "Experience the art of giving. Organize sophisticated Secret Santa events with ease.",
    url: "https://www.everyonesanta.com",
    siteName: "Everyone Santa",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Secret Santa - Start Your Tradition",
    description:
      "Experience the art of giving. Organize sophisticated Secret Santa events with ease.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Use the provided Google Analytics ID
const GA_TRACKING_ID = "G-V02C9MJH5S";

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Everyone Santa",
    url: "https://www.everyonesanta.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://www.everyonesanta.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en">
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}');
          `,
        }}
      />
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}