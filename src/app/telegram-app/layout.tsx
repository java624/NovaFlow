import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NovaFlow — Mini App',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function TelegramAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
