import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chet-GPT",
  description: "အိမ်မှာရှိတဲ့ပစ္စည်းတွေနဲ့ မြန်မာဟင်းချက်နည်း အကြံပြုချက်များ။",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="my" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
