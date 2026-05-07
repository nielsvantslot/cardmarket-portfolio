-- Optimize latest-snapshot lookup per user.
CREATE INDEX "PortfolioSnapshot_userId_createdAt_desc_idx"
ON "PortfolioSnapshot"("userId", "createdAt" DESC);

-- Fast path for fetching each user's most recent portfolio snapshot.
CREATE VIEW "UserLatestPortfolioSnapshot" AS
SELECT DISTINCT ON ("userId")
  "userId",
  "totalValue",
  "totalCards",
  "uniqueCards",
  "createdAt"
FROM "PortfolioSnapshot"
ORDER BY "userId", "createdAt" DESC;
