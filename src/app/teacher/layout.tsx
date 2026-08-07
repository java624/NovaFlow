import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NovaFlow — Teacher Portal',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
