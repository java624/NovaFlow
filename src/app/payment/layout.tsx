import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NovaFlow — Payment',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
