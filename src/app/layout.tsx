import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CEO Bench",
  description: "Track the traders on Terminal Markets!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
