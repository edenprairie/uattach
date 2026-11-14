import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';

export default async function MemberOrderLayout({ children }: { children: React.ReactNode }) {
    const user = await getSessionUser();
    if (!user) redirect('/login?next=/order');
    if (user.role === 'buyer') redirect('/customer');
    return children;
}
