import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NovaFlow — Student Area',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
