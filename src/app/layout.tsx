import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces, Source_Serif_4 } from "next/font/google";
import { AppNav } from "@/components/navigation/AppNav";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
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

const themeBootScript = `(function(){try{var k="gre-learn-theme";var s=localStorage.getItem(k);var p=s==="light"||s==="dark"||s==="system"?s:"system";var d=p==="dark"||(p==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light";document.documentElement.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body
        className={`${display.variable} ${body.variable} ${ui.variable} antialiased bg-grain`}
      >
        <ThemeProvider>
          <div className="mx-auto min-h-dvh w-full max-w-3xl px-4 pb-28 pt-4 sm:px-6">
            <AppNav />
            <main>{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
