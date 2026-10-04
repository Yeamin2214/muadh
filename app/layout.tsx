import "./globals.css";
import { AppProvider } from "@/components/AppProvider";

export const metadata = {
  title: "Mu'adh",
  description: "A gentle companion for new Muslims, with a human mentor always in the loop.",
};

export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#121212" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:wght@400;500;600&family=Amiri:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600&family=Hind+Siliguri:wght@400;500;600&display=swap"
        />
      </head>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
