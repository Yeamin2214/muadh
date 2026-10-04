export const metadata = { title: "Mu'adh", description: "A gentle companion for new Muslims, with a human mentor always in the loop." };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
