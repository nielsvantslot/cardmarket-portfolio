"use client";

import Image from 'next/image';

interface CardImagePaneProps {
  image?: string;
  name: string;
  price: number | null;
  currency: string | null;
}

export function CardImagePane({ image, name, price, currency }: CardImagePaneProps) {
  return (
    <div style={{
      position: 'relative',
      background: 'var(--bg-3)',
      aspectRatio: '2.5/3.5',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {image ? (
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          style={{ objectFit: 'contain', padding: '0.5rem' }}
          unoptimized
        />
      ) : (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '0.5rem',
          color: 'var(--text-3)',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="m8 21 4-4 4 4" />
            <path d="M12 17v4" />
          </svg>
          <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)' }}>NO IMAGE</span>
        </div>
      )}

      {price != null && (
        <div style={{
          position: 'absolute',
          bottom: 6,
          right: 6,
          background: 'rgba(10,10,15,0.85)',
          backdropFilter: 'blur(4px)',
          border: '1px solid var(--border-light)',
          borderRadius: 6,
          padding: '2px 6px',
          fontSize: '0.7rem',
          fontFamily: 'var(--font-mono)',
          fontWeight: 500,
          color: 'var(--green)',
        }}>
          {currency === 'USD' ? '$' : '€'}{price.toFixed(2)}
        </div>
      )}
    </div>
  );
}

interface PortfolioControlsProps {
  quantity: number;
  totalValue: number | null;
  currency: string | null;
  onQuantityChange?: (qty: number) => void;
  onRemove?: () => void;
}

export function PortfolioControls({
  quantity,
  totalValue,
  currency,
  onQuantityChange,
  onRemove,
}: PortfolioControlsProps) {
  return (
    <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
        <QuantityControl value={quantity} onChange={(q) => onQuantityChange?.(q)} />
        <button
          onClick={onRemove}
          title="Remove from portfolio"
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: '3px 7px',
            cursor: 'pointer',
            color: 'var(--red)',
            fontSize: '0.75rem',
            transition: 'all 0.15s',
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      </div>

      {totalValue != null ? (
        <div style={{
          marginTop: '0.35rem',
          textAlign: 'right',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'var(--green)',
        }}>
          total: {currency === 'USD' ? '$' : '€'}{totalValue.toFixed(2)}
        </div>
      ) : (
        <div style={{
          marginTop: '0.35rem',
          textAlign: 'right',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.68rem',
          color: 'var(--text-3)',
        }}>
          no price data
        </div>
      )}
    </div>
  );
}

interface SearchControlsProps {
  searchQty: number;
  onDecrement: () => void;
  onIncrement: () => void;
  onAdd: () => void;
}

export function SearchControls({ searchQty, onDecrement, onIncrement, onAdd }: SearchControlsProps) {
  return (
    <div style={{ paddingTop: '0.5rem' }}>
      {searchQty > 0 ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}
        >
          <button
            onClick={onDecrement}
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              border: '1px solid var(--border)',
              background: 'var(--bg-3)',
              color: 'var(--text)',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            -
          </button>

          <span
            style={{
              flex: 1,
              textAlign: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              color: 'var(--text-2)',
            }}
          >
            {searchQty}
          </span>

          <button
            onClick={onIncrement}
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              border: '1px solid var(--accent)',
              background: 'var(--accent)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            +
          </button>
        </div>
      ) : (
        <button
          onClick={onAdd}
          style={{
            width: '100%',
            padding: '0.4rem',
            borderRadius: 7,
            border: '1px solid var(--accent)',
            fontSize: '0.78rem',
            fontWeight: 600,
            fontFamily: 'var(--font-display)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            background: 'var(--accent)',
            color: '#fff',
          }}
        >
          + Add
        </button>
      )}
    </div>
  );
}

function QuantityControl({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
      <button
        onClick={() => onChange(value - 1)}
        style={{
          width: 22,
          height: 22,
          borderRadius: 5,
          border: '1px solid var(--border)',
          background: 'var(--bg-3)',
          color: 'var(--text)',
          cursor: 'pointer',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >−</button>
      <span style={{
        minWidth: 26,
        textAlign: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.82rem',
        fontWeight: 500,
      }}>
        {value}
      </span>
      <button
        onClick={() => onChange(value + 1)}
        style={{
          width: 22,
          height: 22,
          borderRadius: 5,
          border: '1px solid var(--border)',
          background: 'var(--bg-3)',
          color: 'var(--text)',
          cursor: 'pointer',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >+</button>
    </div>
  );
}
