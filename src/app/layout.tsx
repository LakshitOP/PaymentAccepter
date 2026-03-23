import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Payment Receiver - UNO No Mercy',
  description: 'Pay Rs 20 to play UNO No Mercy',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
