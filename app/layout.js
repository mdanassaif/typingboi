import Navbar from './components/Navbar';
import { Geist, Geist_Mono } from "next/font/google";
import './globals.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: 'Typing Boi - Speed Test & Typing Practice',
    template: '%s | Typing Boi'
  },
  description: 'Improve your typing speed and accuracy with our free typing test. Practice your keyboard skills with real-time feedback and track your progress.',
  keywords: ['typing test', 'typing speed', 'typing practice', 'keyboard skills', 'wpm test', 'typing tutor'],
  authors: [{ name: 'Your Name' }],
  openGraph: {
    title: 'Typing Boi - Free Online Typing Speed Test',
    description: 'Measure and improve your typing speed with our interactive typing practice tool. Get real-time results and track your progress!',
    url: 'https://typingboi.vercel.app',
    siteName: 'Typing Boi',
    images: [
      {
        url: 'https://typingboi.vercel.app/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Typing Boi - Free Online Typing Speed Test',
    description: 'Test and improve your typing speed with instant results!',
    images: ['https://typingboi.vercel.app/twitter-image.png'],
  },
  alternates: {
    canonical: 'https://typingboi.vercel.app',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Navbar />
        <main className="   ">{children}</main>
      </body>
    </html>
  );
}