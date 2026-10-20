import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "AI Interview Mocker: mock interviews, out loud",
  description:
    "Practise job interviews out loud. Five questions for your exact role, answered by voice, each rated out of 10 with feedback and a model answer.",
};

// Clerk's own screens (sign-in, the account menu) in the same palette.
const clerkAppearance = {
  variables: {
    colorPrimary: "#4845d2",
    colorPrimaryForeground: "#ffffff",
    colorBackground: "#ffffff",
    colorForeground: "#111827",
    colorMutedForeground: "#4b5563",
    colorMuted: "#f7f7fb",
    colorInput: "#ffffff",
    colorInputForeground: "#111827",
    colorBorder: "#d1d5db",
    colorRing: "#4845d2",
    colorDanger: "#b42318",
    colorSuccess: "#167a3e",
    colorNeutral: "#111827",
    fontFamily: "var(--font-inter), system-ui, sans-serif",
    borderRadius: "8px",
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html lang="en" className={inter.variable}>
        <body>
          <Toaster />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
