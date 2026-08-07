import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces, Source_Serif_4 } from "next/font/google";
import { AppNav } from "@/components/navigation/AppNav";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-body",
});

const ui = DM_Sans({
  subsets: ["latin"],
  variable: "--font-ui",
});

export const metadata: Metadata = {
  title: "GRE Learn — Personal Vocabulary Podcast",
  description:
    "Turn GRE words you encounter into a personal vocabulary podcast with roots, mnemonics, and continuous audio review.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1f4b3f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${display.variable} ${body.variable} ${ui.variable} antialiased bg-grain`}
      >
        <div className="mx-auto min-h-dvh w-full max-w-3xl px-4 pb-28 pt-4 sm:px-6">
          <AppNav />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
