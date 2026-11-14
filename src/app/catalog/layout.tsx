import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';

export default async function MemberCatalogLayout({ children }: { children: React.ReactNode }) {
    const user = await getSessionUser();
    if (!user) redirect('/login?next=/catalog');
    if (user.role === 'buyer') redirect('/customer');
    return children;
}
