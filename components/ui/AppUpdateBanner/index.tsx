"use client";

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import styles from './AppUpdateBanner.module.css';

interface VersionResponse {
  version: string;
}

const VERSION_CHECK_MS = 5 * 60 * 1000;

async function fetchCurrentVersion(signal?: AbortSignal): Promise<string | null> {
  try {
    const response = await fetch("/api/version", {
      cache: "no-store",
      signal,
      headers: {
        "cache-control": "no-cache",
      },
    });

    if (!response.ok) return null;
    const payload = (await response.json()) as VersionResponse;
    return payload.version ?? null;
  } catch {
    return null;
  }
}

export function AppUpdateBanner() {
  const [nextVersion, setNextVersion] = useState<string | null>(null);
  const [dismissedVersion, setDismissedVersion] = useState<string | null>(null);
  const baselineVersionRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const checkForUpdate = async (isInitial = false) => {
      const version = await fetchCurrentVersion(controller.signal);
      if (!version || cancelled) return;

      if (isInitial || baselineVersionRef.current == null) {
        baselineVersionRef.current = version;
        return;
      }

      if (version !== baselineVersionRef.current && version !== dismissedVersion) {
        setNextVersion(version);
      }
    };

    void checkForUpdate(true);

    const interval = window.setInterval(() => {
      void checkForUpdate(false);
    }, VERSION_CHECK_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void checkForUpdate(false);
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      controller.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [dismissedVersion]);

  if (!nextVersion) return null;

  return (
    <div className={styles.banner} role="status" aria-live="polite">
      <div className={styles.content}>
        <strong className={styles.title}>Update available</strong>
        <span className={styles.message}>A newer app version is ready.</span>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => {
            setDismissedVersion(nextVersion);
            setNextVersion(null);
          }}
        >
          Later
        </button>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => {
            window.location.reload();
          }}
        >
          Update now
        </button>
      </div>
    </div>
  );
}
