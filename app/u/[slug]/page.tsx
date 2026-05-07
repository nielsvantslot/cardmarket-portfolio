import { notFound } from 'next/navigation';

import { PublicPortfolioClient } from '@/components/PublicPortfolioClient';
import { prisma } from '@/lib/prisma';

export default async function PublicPortfolioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const user = await prisma.user.findUnique({
    where: { publicSlug: slug.toLowerCase() },
    select: {
      name: true,
      username: true,
      portfolioCards: {
        select: { cardId: true, quantity: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const entries = user.portfolioCards.map((entry) => ({
    cardId: entry.cardId,
    quantity: entry.quantity,
    addedAt: entry.createdAt.getTime(),
  }));

  return <PublicPortfolioClient ownerName={user.name ?? user.username ?? "Collector"} entries={entries} />;
}
