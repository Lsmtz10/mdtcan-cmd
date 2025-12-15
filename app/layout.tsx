import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Customer Application Form",
  description: "Medtronic Canada",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
