import { redirect } from 'next/navigation';

import { ProfileEditor } from '@/components/ProfileEditor';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function OnboardingPage() {
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

  if (user.username && user.publicSlug) {
    redirect("/portfolio");
  }

  return (
    <ProfileEditor
      mode="onboarding"
      initialUser={user}
      title="Set up your profile"
      description="Choose a username and public portfolio URL before you continue."
    />
  );
}
