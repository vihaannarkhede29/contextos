import { Sidebar, MobileAppNav } from '@/components/sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <MobileAppNav />
      <main className="pb-20 md:pb-0 md:pl-64">{children}</main>
    </div>
  );
}
