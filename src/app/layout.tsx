import type { Metadata } from "next";
import { Caveat, Lato, Montserrat } from "next/font/google";
import { RouteTransitionBoundary } from "@/shared/animation/RouteTransitionBoundary";
import { WelcomeTransitionProvider } from "@/shared/animation/welcomeTransitionContext";
import "./globals.css";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  applicationName: "Aventra Billing",
  title: "Aventra Billing",
  description:
    "Aventra Billing is an invoicing and billing application for creating, managing, and tracking invoices.",
};

export type RootLayoutProps = {
  children: React.ReactNode;
};

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html
      lang="en"
      className={`${lato.variable} ${montserrat.variable} ${caveat.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col bg-background font-sans text-foreground"
        suppressHydrationWarning
      >
        <WelcomeTransitionProvider>
          <RouteTransitionBoundary>{children}</RouteTransitionBoundary>
        </WelcomeTransitionProvider>
      </body>
    </html>
  );
};

export default RootLayout;
