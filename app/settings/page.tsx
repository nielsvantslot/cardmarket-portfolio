import { redirect } from 'next/navigation';

import { ProfileEditor } from '@/components/ProfileEditor';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function SettingsPage() {
  const session = await getSessionUser();
  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, email: true, name: true, username: true, publicSlug: true, bio: true },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <ProfileEditor
      mode="settings"
      initialUser={user}
      title="Account settings"
      description="Update your profile, public URL, and sharing details."
    />
  );
}
