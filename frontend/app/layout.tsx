import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";

const minecraft = Press_Start_2P({ weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Monitoring Dashboard",
  description: "Centralized log view"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={minecraft.className}>{children}</body>
    </html>
  );
}
