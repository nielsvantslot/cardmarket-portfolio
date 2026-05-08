import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

function resolveVersion(): string {
  return (
    process.env.NEXT_PUBLIC_APP_VERSION
    || process.env.VERCEL_GIT_COMMIT_SHA
    || process.env.RAILWAY_GIT_COMMIT_SHA
    || process.env.RENDER_GIT_COMMIT
    || process.env.npm_package_version
    || "dev"
  );
}

export async function GET() {
  const version = resolveVersion();

  return NextResponse.json(
    { version },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    },
  );
}
