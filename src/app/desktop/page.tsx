import Desktop from '@/components/Desktop';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function DesktopPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  return <Desktop />;
}
