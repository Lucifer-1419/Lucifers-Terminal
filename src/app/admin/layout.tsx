import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session || session.role !== 'ADMIN') {
    redirect('/desktop');
  }

  return (
    <div className="admin-layout">
      <nav className="admin-nav">
        <h1 className="admin-title">ROOT COMMAND CENTER</h1>
        <div className="admin-nav-links">
          <a href="/desktop">Desktop View</a>
        </div>
      </nav>
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
