import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "ExodusMap — Talent Exodus Map — Financial Services by Firm",
  description: "Quarterly exodus index showing which financial services firms are losing top producers, where they are going, and which ",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: "#0A0508", color: "#E8EAF0", fontFamily: "monospace", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
