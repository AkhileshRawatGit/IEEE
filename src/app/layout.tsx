import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'IEEE Student Branch — Swami Rama Himalayan University',
  description: 'Official student registration and membership verification portal for the IEEE Student Branch at Swami Rama Himalayan University (SRHU), Dehradun.',
  keywords: ['IEEE', 'SRHU', 'Swami Rama Himalayan University', 'Student Branch', 'Registration', 'HSST', 'Engineering'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#F7F8FA] text-[#111827]">
        {children}
      </body>
    </html>
  );
}
