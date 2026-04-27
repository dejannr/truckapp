import "@/app/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trucking Analytics",
  description: "Local trucking analytics platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
