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
    default: "Everyone Santa | Social Wishlist & Gifting Platform",
    template: "%s | Everyone Santa",
  },
  description:
    "The ultimate social wishlist and gifting platform. Create universal wishlists, share with friends, organize Secret Santa events, and find the perfect gifts for any occasion.",
  keywords: [
    "Social Wishlist",
    "Universal Registry",
    "Gift Exchange",
    "Secret Santa",
    "Birthday Wishlist",
    "Group Gifting",
    "Holiday Planner",
    "Gift Ideas",
  ],
  openGraph: {
    title: "Everyone Santa | Social Wishlist & Gifting Platform",
    description:
      "Create universal wishlists, follow friends, and organize gift exchanges. The modern way to give and receive gifts.",
    url: "https://www.everyonesanta.com",
    siteName: "Everyone Santa",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Everyone Santa | Social Wishlist & Gifting Platform",
    description:
      "Create universal wishlists, follow friends, and organize gift exchanges. The modern way to give and receive gifts.",
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
    "@graph": [
      {
        "@type": "WebSite",
        name: "Everyone Santa",
        url: "https://www.everyonesanta.com",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://www.everyonesanta.com/search?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        name: "Everyone Santa",
        url: "https://www.everyonesanta.com",
        logo: "https://www.everyonesanta.com/icon.png",
        sameAs: [
          "https://twitter.com/everyonesanta",
          "https://facebook.com/everyonesanta",
        ],
      },
      {
        "@type": "SoftwareApplication",
        name: "Everyone Santa",
        applicationCategory: "SocialNetworkingApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        featureList: [
          "Universal Wishlist Creation",
          "Friend Subscriptions & Updates",
          "Secret Santa Generator",
          "Event Dashboard",
          "Smart Matching Algorithm",
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a social wishlist?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A social wishlist allows you to create a list of gifts you want from any store and share it with friends and family. You can also follow your friends' lists to know exactly what to get them for birthdays and holidays.",
            },
          },
          {
            "@type": "Question",
            name: "Can I use Everyone Santa for birthdays?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes! Everyone Santa is designed for year-round gifting. Create wishlists for birthdays, weddings, baby showers, or any special occasion.",
            },
          },
          {
            "@type": "Question",
            name: "Is the Secret Santa generator free?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, our Secret Santa generator is completely free to use for organizing holiday gift exchanges with friends, family, or colleagues.",
            },
          },
        ],
      },
    ],
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