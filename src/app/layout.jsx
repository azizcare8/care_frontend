import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

export const metadata = {
  title: "Care Foundation - India's Trusted Crowdfunding Platform",
  description: "Raise funds for medical emergencies, education, disaster relief & more. Start your fundraiser on India's most trusted crowdfunding platform.",
  keywords: ["crowdfunding India", "fundraising", "medical fundraising", "education funding", "disaster relief"],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#10b981",
};

// Pre-compute className strings to ensure server/client consistency
const htmlClassName = inter.variable + " overflow-x-hidden";
const bodyClassName = inter.className + " min-h-screen flex flex-col bg-gray-50 overflow-x-hidden";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={htmlClassName}>
      <body className={bodyClassName} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
