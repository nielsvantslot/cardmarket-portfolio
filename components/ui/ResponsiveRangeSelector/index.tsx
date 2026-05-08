"use client";

import {
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react';

import styles from './ResponsiveRangeSelector.module.css';

export interface ResponsiveRangeOption<T extends string> {
  key: T;
  label: string;
}

interface ResponsiveRangeSelectorProps<T extends string> {
  label: string;
  value: T;
  options: Array<ResponsiveRangeOption<T>>;
  onChange: (value: T) => void;
  desktopAriaLabel?: string;
  mobileDialogTitle?: string;
  mobileButtonAriaLabel?: string;
}

export function ResponsiveRangeSelector<T extends string>({
  label,
  value,
  options,
  onChange,
  desktopAriaLabel = "Select range",
  mobileDialogTitle = "Select range",
  mobileButtonAriaLabel = "Open range selector",
}: ResponsiveRangeSelectorProps<T>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const modalId = useId();

  const selectedOption = useMemo(
    () => options.find((option) => option.key === value) ?? options[0],
    [options, value],
  );

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <div className={styles.desktopRail} role="tablist" aria-label={desktopAriaLabel}>
        {options.map((option) => {
          const active = option.key === value;
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => onChange(option.key)}
              className={`${styles.desktopChip} ${active ? styles.desktopChipActive : ""}`}
              aria-pressed={active}
              role="tab"
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className={styles.mobileTriggerRow}>
        <span className={styles.mobileTriggerLabel}>{label}</span>
        <button
          type="button"
          className={styles.mobileTriggerButton}
          onClick={() => setMobileMenuOpen(true)}
          aria-expanded={mobileMenuOpen}
          aria-controls={modalId}
          aria-haspopup="dialog"
          aria-label={mobileButtonAriaLabel}
        >
          <span>{selectedOption.label}</span>
          <span className={styles.mobileTriggerChevron}>▾</span>
        </button>
      </div>

      {mobileMenuOpen && (
        <div
          className={styles.mobileBackdrop}
          onClick={() => setMobileMenuOpen(false)}
          role="presentation"
        >
          <div
            id={modalId}
            className={styles.mobileSheet}
            role="dialog"
            aria-modal="true"
            aria-label={mobileDialogTitle}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.mobileSheetHeader}>
              <div className={styles.mobileSheetTitle}>{mobileDialogTitle}</div>
              <button
                type="button"
                className={styles.mobileSheetClose}
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close range selector"
              >
                Close
              </button>
            </div>

            <div className={styles.mobileOptionGrid}>
              {options.map((option) => {
                const active = option.key === value;
                return (
                  <button
                    key={option.key}
                    type="button"
                    className={`${styles.mobileOption} ${active ? styles.mobileOptionActive : ""}`}
                    onClick={() => {
                      onChange(option.key);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <span>{option.label}</span>
                    {active ? <span className={styles.mobileOptionCheck}>✓</span> : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
