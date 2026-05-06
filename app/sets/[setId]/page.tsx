"use client";

import { useMemo } from 'react';

import {
  useParams,
  useSearchParams,
} from 'next/navigation';

import { SetDetailClient } from '@/components/SetDetailClient';

export default function SetDetailPage() {
  const params = useParams<{ setId: string }>();
  const searchParams = useSearchParams();
  const setId = Array.isArray(params?.setId) ? params.setId[0] : params?.setId ?? "";
  const setNameFromQuery = searchParams.get("name") ?? "";
  const title = useMemo(() => {
    if (setNameFromQuery.trim()) return setNameFromQuery;
    return "Set Detail";
  }, [setNameFromQuery]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h1
        style={{
          fontSize: "clamp(1.5rem, 3.4vw, 2.2rem)",
          fontWeight: 800,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          margin: 0,
        }}
      >
        {title}
      </h1>

      <SetDetailClient setId={setId} />
    </div>
  );
}
