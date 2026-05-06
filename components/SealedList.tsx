"use client";

import { useState } from "react";
import { usePortfolioContext } from "@/lib/portfolioContext";
import type { SealedProduct } from "@/lib/types";

const PRODUCT_TYPES: { value: SealedProduct["type"]; label: string; emoji: string }[] = [
  { value: "booster-box", label: "Booster Box", emoji: "📦" },
  { value: "booster-pack", label: "Booster Pack", emoji: "🎴" },
  { value: "etb", label: "Elite Trainer Box", emoji: "🎁" },
  { value: "tin", label: "Tin", emoji: "🥫" },
  { value: "collection-box", label: "Collection Box", emoji: "🗃️" },
  { value: "blister", label: "Blister Pack", emoji: "📋" },
  { value: "other", label: "Other", emoji: "✨" },
];

const TYPE_LABEL: Record<SealedProduct["type"], string> = Object.fromEntries(
  PRODUCT_TYPES.map((t) => [t.value, t.label])
) as Record<SealedProduct["type"], string>;

const TYPE_EMOJI: Record<SealedProduct["type"], string> = Object.fromEntries(
  PRODUCT_TYPES.map((t) => [t.value, t.emoji])
) as Record<SealedProduct["type"], string>;

function AddSealedForm({ onClose }: { onClose: () => void }) {
  const { addSealedItem } = usePortfolioContext();
  const [name, setName] = useState("");
  const [seriesName, setSeriesName] = useState("");
  const [type, setType] = useState<SealedProduct["type"]>("booster-box");
  const [condition, setCondition] = useState<SealedProduct["condition"]>("sealed");
  const [quantity, setQuantity] = useState(1);
  const [purchasePrice, setPurchasePrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [notes, setNotes] = useState("");

  function handleAdd() {
    if (!name.trim()) return;
    addSealedItem({
      name: name.trim(),
      setName: seriesName.trim() || undefined,
      type,
      condition,
      quantity,
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
      currency: purchasePrice ? currency : undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.6rem 0.75rem",
    background: "var(--bg-3)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "var(--text)",
    fontFamily: "var(--font-display)",
    fontSize: "0.875rem",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.7rem",
    fontFamily: "var(--font-mono)",
    color: "var(--text-3)",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: "0.35rem",
    display: "block",
  };

  return (
    <div style={{
      background: "var(--bg-2)",
      border: "1px solid var(--border)",
      borderRadius: 14,
      padding: "1.5rem",
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
    }}>
      <div style={{ fontWeight: 700, fontSize: "1rem", letterSpacing: "-0.02em" }}>
        Add Sealed Product
      </div>

      {/* Name */}
      <div>
        <label style={labelStyle}>Product Name *</label>
        <input
          style={inputStyle}
          placeholder="e.g. Scarlet & Violet Booster Box"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
      </div>

      {/* Set name */}
      <div>
        <label style={labelStyle}>Set / Series</label>
        <input
          style={inputStyle}
          placeholder="e.g. Scarlet & Violet, Celebrations"
          value={seriesName}
          onChange={(e) => setSeriesName(e.target.value)}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
      </div>

      {/* Type + Condition row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <div>
          <label style={labelStyle}>Type</label>
          <select
            style={{ ...inputStyle, cursor: "pointer" }}
            value={type}
            onChange={(e) => setType(e.target.value as SealedProduct["type"])}
          >
            {PRODUCT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Condition</label>
          <select
            style={{ ...inputStyle, cursor: "pointer" }}
            value={condition}
            onChange={(e) => setCondition(e.target.value as SealedProduct["condition"])}
          >
            <option value="sealed">🔒 Sealed</option>
            <option value="opened">📖 Opened</option>
          </select>
        </div>
      </div>

      {/* Qty + Price row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: "0.75rem" }}>
        <div>
          <label style={labelStyle}>Quantity</label>
          <input
            type="number"
            min={1}
            style={inputStyle}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>
        <div>
          <label style={labelStyle}>Purchase Price (per unit)</label>
          <input
            type="number"
            min={0}
            step={0.01}
            style={inputStyle}
            placeholder="0.00"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>
        <div>
          <label style={labelStyle}>Currency</label>
          <select
            style={{ ...inputStyle, cursor: "pointer" }}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label style={labelStyle}>Notes</label>
        <input
          style={inputStyle}
          placeholder="e.g. Anniversary Edition, Language, Condition details..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "0.25rem" }}>
        <button
          onClick={onClose}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: 7,
            border: "1px solid var(--border)",
            background: "transparent",
            color: "var(--text-2)",
            fontSize: "0.85rem",
            fontWeight: 600,
            fontFamily: "var(--font-display)",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleAdd}
          disabled={!name.trim()}
          style={{
            padding: "0.5rem 1.25rem",
            borderRadius: 7,
            border: "none",
            background: name.trim() ? "var(--accent)" : "var(--bg-3)",
            color: name.trim() ? "#fff" : "var(--text-3)",
            fontSize: "0.85rem",
            fontWeight: 700,
            fontFamily: "var(--font-display)",
            cursor: name.trim() ? "pointer" : "not-allowed",
            transition: "all 0.15s",
          }}
        >
          Add Product
        </button>
      </div>
    </div>
  );
}

function SealedCard({ item }: { item: SealedProduct }) {
  const { removeSealedItem, updateSealedItem } = usePortfolioContext();
  const totalCost = item.purchasePrice != null ? item.purchasePrice * item.quantity : null;
  const currencySymbol = item.currency === "EUR" ? "€" : item.currency === "GBP" ? "£" : "$";

  return (
    <div
      className="card-hover animate-fade-up"
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Color stripe by condition */}
      <div style={{
        height: 3,
        background: item.condition === "sealed"
          ? "linear-gradient(90deg, var(--accent), var(--green))"
          : "var(--border-light)",
      }} />

      <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
        {/* Type badge + condition */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{
            fontSize: "0.65rem",
            fontFamily: "var(--font-mono)",
            color: "var(--text-3)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}>
            {TYPE_EMOJI[item.type]} {TYPE_LABEL[item.type]}
          </span>
          <span style={{
            fontSize: "0.62rem",
            fontFamily: "var(--font-mono)",
            padding: "2px 7px",
            borderRadius: 10,
            fontWeight: 600,
            background: item.condition === "sealed" ? "rgba(124,108,255,0.15)" : "var(--bg-3)",
            color: item.condition === "sealed" ? "var(--accent)" : "var(--text-3)",
            border: `1px solid ${item.condition === "sealed" ? "var(--accent)" : "var(--border)"}`,
          }}>
            {item.condition === "sealed" ? "🔒 Sealed" : "📖 Opened"}
          </span>
        </div>

        {/* Name */}
        <div style={{
          fontWeight: 700,
          fontSize: "0.92rem",
          letterSpacing: "-0.02em",
          lineHeight: 1.25,
          color: "var(--text)",
        }}>
          {item.name}
        </div>

        {/* Set */}
        {item.setName && (
          <div style={{
            fontSize: "0.72rem",
            fontFamily: "var(--font-mono)",
            color: "var(--text-3)",
          }}>
            {item.setName}
          </div>
        )}

        {/* Notes */}
        {item.notes && (
          <div style={{
            fontSize: "0.7rem",
            fontFamily: "var(--font-mono)",
            color: "var(--text-3)",
            fontStyle: "italic",
          }}>
            {item.notes}
          </div>
        )}

        {/* Bottom row: qty + price + remove */}
        <div style={{
          marginTop: "auto",
          paddingTop: "0.6rem",
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.5rem",
        }}>
          {/* Qty control */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <button
              onClick={() => updateSealedItem(item.id, { quantity: Math.max(1, item.quantity - 1) })}
              style={{
                width: 22, height: 22, borderRadius: 5,
                border: "1px solid var(--border)", background: "var(--bg-3)",
                color: "var(--text)", cursor: "pointer", fontSize: "0.85rem",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >−</button>
            <span style={{
              minWidth: 24, textAlign: "center",
              fontFamily: "var(--font-mono)", fontSize: "0.82rem", fontWeight: 500,
            }}>
              {item.quantity}
            </span>
            <button
              onClick={() => updateSealedItem(item.id, { quantity: item.quantity + 1 })}
              style={{
                width: 22, height: 22, borderRadius: 5,
                border: "1px solid var(--border)", background: "var(--bg-3)",
                color: "var(--text)", cursor: "pointer", fontSize: "0.85rem",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >+</button>
          </div>

          {/* Price */}
          {totalCost != null ? (
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.78rem",
              color: "var(--green)",
            }}>
              {currencySymbol}{totalCost.toFixed(2)}
            </span>
          ) : (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-3)" }}>
              no price
            </span>
          )}

          {/* Remove */}
          <button
            onClick={() => removeSealedItem(item.id)}
            title="Remove"
            style={{
              background: "none", border: "1px solid var(--border)",
              borderRadius: 6, padding: "3px 7px",
              cursor: "pointer", color: "var(--red)", fontSize: "0.75rem",
            }}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

export function SealedList() {
  const { sealedItems, hydrated } = usePortfolioContext();
  const [showForm, setShowForm] = useState(false);

  if (!hydrated) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 180, borderRadius: 12 }} />
        ))}
      </div>
    );
  }

  const totalCost = sealedItems.reduce((sum, item) => {
    if (item.purchasePrice == null) return sum;
    return sum + item.purchasePrice * item.quantity;
  }, 0);

  const hasCost = sealedItems.some((i) => i.purchasePrice != null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{
            background: "var(--bg-2)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "0.75rem 1.25rem",
          }}>
            <div style={{ fontSize: "0.65rem", fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.2rem" }}>
              Items
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}>
              {sealedItems.reduce((s, i) => s + i.quantity, 0)}
            </div>
          </div>
          {hasCost && (
            <div style={{
              background: "var(--bg-2)", border: "1px solid var(--border)",
              borderRadius: 10, padding: "0.75rem 1.25rem",
            }}>
              <div style={{ fontSize: "0.65rem", fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.2rem" }}>
                Cost Basis
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1, color: "var(--green)" }}>
                ~${totalCost.toFixed(2)}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowForm((v) => !v)}
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            padding: "0.55rem 1.1rem",
            background: showForm ? "var(--bg-3)" : "var(--accent)",
            color: showForm ? "var(--text-2)" : "#fff",
            border: "1px solid",
            borderColor: showForm ? "var(--border)" : "var(--accent)",
            borderRadius: 8,
            fontWeight: 700, fontSize: "0.85rem",
            fontFamily: "var(--font-display)",
            cursor: "pointer", transition: "all 0.15s",
          }}
        >
          {showForm ? "✕ Cancel" : "+ Add Sealed"}
        </button>
      </div>

      {/* Add form */}
      {showForm && <AddSealedForm onClose={() => setShowForm(false)} />}

      {/* Grid */}
      {sealedItems.length === 0 && !showForm ? (
        <div style={{
          textAlign: "center", padding: "4rem 2rem",
          border: "1px dashed var(--border)", borderRadius: 16,
        }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📦</div>
          <div style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.4rem" }}>
            No sealed products yet
          </div>
          <div style={{ color: "var(--text-3)", fontSize: "0.85rem" }}>
            Track booster boxes, ETBs, tins, and more
          </div>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "1rem",
        }}>
          {sealedItems.map((item) => (
            <SealedCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
