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
};

/**
 * Root layout.
 *
 * An inline script in <head> sets the dark class on <html> before React
 * hydrates to avoid a flash of wrong theme. The script reads from
 * localStorage or defaults to dark mode.
 *
 * suppressHydrationWarning on <html> and <body> prevents React warnings
 * caused by browser extensions (e.g. Vimium) that mutate the DOM.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
      <body className="min-h-full flex flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
