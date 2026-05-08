"use client";

import {
  useEffect,
  useRef,
} from 'react';

interface SearchFieldProps {
  value: string;
  onChange: (nextValue: string) => void;
  placeholder?: string;
  clearLabel?: string;
  autoFocusDesktop?: boolean;
  showLeadingIcon?: boolean;
}

export function SearchField({
  value,
  onChange,
  placeholder = "Search",
  clearLabel = "Clear search",
  autoFocusDesktop = false,
  showLeadingIcon = false,
}: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!autoFocusDesktop) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(max-width: 900px)").matches) return;
    inputRef.current?.focus();
  }, [autoFocusDesktop]);

  return (
    <div className="search-field-wrap">
      {showLeadingIcon && (
        <div
          style={{
            position: "absolute",
            left: "1rem",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-3)",
            pointerEvents: "none",
            lineHeight: 1,
          }}
          aria-hidden
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </div>
      )}

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="portfolio-search-input"
        style={showLeadingIcon ? { paddingLeft: "2.75rem" } : undefined}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
        }}
      />

      {value.trim().length > 0 && (
        <button
          type="button"
          className="search-field-clear"
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
          aria-label={clearLabel}
        >
          ×
        </button>
      )}
    </div>
  );
}