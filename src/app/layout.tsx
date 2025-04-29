import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";

const rubik = Rubik({ 
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "SGPJ Volleybalavond Aanmeldingen | Registratie Tracker",
  description: "SGPJ teller voor het registreren van aanmeldingen voor de volleybalavond",
  icons: {
    icon: '/favicon.ico',
  },
  themeColor: '#5B1C51',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className="dark">
      <body className={rubik.className}>{children}</body>
    </html>
  );
}
