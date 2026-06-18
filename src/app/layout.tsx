import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "keybr Analyzer",
  description: "Analyze your keybr.com export data with charts and averages",
  icons: { icon: "/favicon.svg" },
};

/**
 * Root layout.
 *
 * Sets up fonts, global CSS, favicon, and the no-flash dark mode script.
 * The inline script in <head> reads localStorage before React hydrates so
 * the correct theme class is present on first paint.
 *
 * suppressHydrationWarning prevents React warnings from browser-extension
 * DOM mutations (e.g. Vimium adding classes to <body>).
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.toggle('dark', localStorage.getItem('theme') === 'dark' || localStorage.getItem('theme') === null)`,
          }}
        />
      </head>
      <body
        className="min-h-full flex flex-col bg-beige text-warm-brown dark:bg-[#2C2416] dark:text-beige"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
