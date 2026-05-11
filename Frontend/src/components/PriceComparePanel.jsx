import { useEffect, useRef } from "react";
import axios from "axios";

/* ─── Verdict colour map ─────────────────────────────────────── */
const VERDICT_STYLES = {
  good_deal:  { bg: "#d1fae5", color: "#065f46", icon: "🎉", border: "#6ee7b7" },
  fair_price: { bg: "#fef3c7", color: "#92400e", icon: "⚖️", border: "#fcd34d" },
  overpriced: { bg: "#fee2e2", color: "#991b1b", icon: "⚠️", border: "#fca5a5" },
};

/* ─── Skeleton loader ─────────────────────────────────────────── */
const Skeleton = ({ w = "100%", h = 16, r = 8, mb = 0 }) => (
  <div
    style={{
      width: w, height: h, borderRadius: r, marginBottom: mb,
      background: "linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite linear",
    }}
  />
);

/* ─── Individual site card ────────────────────────────────────── */
const SiteCard = ({ site, loading }) => {
  const hasPriceRange = site?.estimatedMin != null && site?.estimatedMax != null;

  if (loading) {
    return (
      <div style={cardStyle(false, false)}>
        <Skeleton w={48} h={48} r={12} mb={10} />
        <Skeleton w="70%" h={14} mb={6} />
        <Skeleton w="50%" h={12} mb={10} />
        <Skeleton w="80%" h={34} r={8} />
      </div>
    );
  }

  return (
    <div style={cardStyle(site.isBestDeal, true)}>
      {site.isBestDeal && (
        <span style={bestBadgeStyle}>🏆 Best Deal</span>
      )}

      {/* Logo */}
      <img
        src={site.logo}
        alt={site.name}
        style={{ width: 44, height: 44, objectFit: "contain", borderRadius: 10, marginBottom: 8, background: "#f9fafb", padding: 4 }}
        onError={(e) => {
          e.target.style.display = "none";
          e.target.nextSibling.style.display = "flex";
        }}
      />
      {/* Fallback icon */}
      <div style={{ display: "none", width: 44, height: 44, background: "#6366f1", borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 8, color: "#fff", fontWeight: 700, fontSize: 18 }}>
        {site.name[0]}
      </div>

      <p style={{ fontWeight: 700, fontSize: 14, color: "#111827", margin: "0 0 4px", textAlign: "center" }}>
        {site.name}
      </p>

      {hasPriceRange ? (
        <p style={{ fontSize: 13, color: "#4b5563", margin: "0 0 12px", textAlign: "center" }}>
          ₹{site.estimatedMin.toLocaleString("en-IN")}
          {" – "}
          ₹{site.estimatedMax.toLocaleString("en-IN")}
        </p>
      ) : (
        <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 12px", textAlign: "center" }}>
          Check site for price
        </p>
      )}

      <a
        href={site.searchUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={visitBtnStyle(site.isBestDeal)}
        onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
      >
        Visit Site →
      </a>
    </div>
  );
};

/* ─── Main Panel ──────────────────────────────────────────────── */
const PriceComparePanel = ({ product, onClose, data, loading, error }) => {
  const panelRef = useRef(null);
  const verdict = data ? VERDICT_STYLES[data.verdict] || VERDICT_STYLES.fair_price : null;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <>
      {/* Shimmer keyframes */}
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes slideUp { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
      `}</style>

      {/* Backdrop */}
      <div style={backdropStyle} />

      {/* Drawer */}
      <div ref={panelRef} style={drawerStyle}>

        {/* Header */}
        <div style={headerStyle}>
          <div>
            <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#9ca3af", marginBottom: 2 }}>AI Price Intelligence</p>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#111827" }}>
              🔍 Compare Prices
            </h2>
          </div>
          <button
            onClick={onClose}
            style={closeBtnStyle}
            onMouseEnter={e => e.currentTarget.style.background = "#f3f4f6"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            ✕
          </button>
        </div>

        {/* Product title */}
        {product && (
          <div style={{ padding: "0 24px 16px", borderBottom: "1px solid #f3f4f6" }}>
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>Comparing</p>
            <p style={{ margin: "2px 0 0", fontWeight: 700, fontSize: 15, color: "#1f2937" }}>
              {product.title}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: "#059669", fontWeight: 600 }}>
              Current Price: ₹{Number(product.price).toLocaleString("en-IN")}
            </p>
          </div>
        )}

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 32px" }}>

          {/* Error state */}
          {error && (
            <div style={{ background: "#fff1f2", border: "1px solid #fecaca", borderRadius: 12, padding: 16, marginBottom: 20, color: "#991b1b", fontSize: 14 }}>
              ⚠️ {error}
            </div>
          )}

          {/* AI Verdict Card */}
          {loading ? (
            <div style={{ background: "#f9fafb", borderRadius: 16, padding: 20, marginBottom: 24, border: "1px solid #e5e7eb" }}>
              <Skeleton w="40%" h={18} mb={10} />
              <Skeleton w="100%" h={14} mb={6} />
              <Skeleton w="90%" h={14} mb={6} />
              <Skeleton w="70%" h={14} mb={16} />
              <Skeleton w="60%" h={13} />
            </div>
          ) : data ? (
            <div style={{
              background: verdict.bg,
              border: `1.5px solid ${verdict.border}`,
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
              animation: "fadeIn 0.4s ease",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 26 }}>{verdict.icon}</span>
                <div>
                  <p style={{ margin: 0, fontSize: 11, color: verdict.color, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>AI Verdict</p>
                  <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: verdict.color }}>{data.verdictLabel}</p>
                </div>
              </div>
              <p style={{ margin: "0 0 12px", fontSize: 14, color: "#374151", lineHeight: 1.6 }}>
                {data.insight}
              </p>
              {data.savingsTip && (
                <div style={{ background: "rgba(255,255,255,0.6)", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
                  <p style={{ margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.5 }}>{data.savingsTip}</p>
                </div>
              )}
            </div>
          ) : null}

          {/* Sites Grid */}
          <p style={{ margin: "0 0 14px", fontWeight: 700, fontSize: 15, color: "#111827" }}>
            🛍️ Where to Buy
          </p>

          <div style={gridStyle}>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <SiteCard key={i} loading />)
              : (data?.sites || []).map(site => (
                  <SiteCard key={site.key} site={site} loading={false} />
                ))
            }
          </div>

        </div>
      </div>
    </>
  );
};

/* ─── Styles ──────────────────────────────────────────────────── */
const backdropStyle = {
  position: "fixed", inset: 0,
  background: "rgba(0,0,0,0.45)",
  backdropFilter: "blur(3px)",
  zIndex: 1200,
  animation: "fadeIn 0.25s ease",
};

const drawerStyle = {
  position: "fixed", bottom: 0, left: 0, right: 0,
  background: "#ffffff",
  borderRadius: "24px 24px 0 0",
  boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
  zIndex: 1201,
  display: "flex", flexDirection: "column",
  maxHeight: "90vh",
  animation: "slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)",
};

const headerStyle = {
  display: "flex", justifyContent: "space-between", alignItems: "flex-start",
  padding: "20px 24px 16px",
  borderBottom: "1px solid #f3f4f6",
  flexShrink: 0,
};

const closeBtnStyle = {
  width: 36, height: 36, border: "none", background: "transparent",
  cursor: "pointer", borderRadius: 8, fontSize: 16, color: "#6b7280",
  display: "flex", alignItems: "center", justifyContent: "center",
  transition: "background 0.2s",
  flexShrink: 0,
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
  gap: 14,
};

const cardStyle = (isBest, visible) => ({
  border: isBest ? "2px solid #6366f1" : "1.5px solid #e5e7eb",
  borderRadius: 16,
  padding: 16,
  display: "flex", flexDirection: "column", alignItems: "center",
  background: isBest ? "#eef2ff" : "#fafafa",
  position: "relative",
  overflow: "hidden",
  opacity: visible ? 1 : 0,
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  cursor: "default",
});

const bestBadgeStyle = {
  position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)",
  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  color: "#fff",
  fontSize: 10, fontWeight: 700,
  padding: "3px 10px", borderRadius: 999,
  whiteSpace: "nowrap",
};

const visitBtnStyle = (isBest) => ({
  display: "block", width: "100%", textAlign: "center",
  padding: "9px 12px",
  background: isBest
    ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
    : "linear-gradient(135deg, #111827, #374151)",
  color: "#fff",
  borderRadius: 10,
  fontWeight: 700, fontSize: 13,
  textDecoration: "none",
  transition: "opacity 0.2s, transform 0.2s",
  marginTop: "auto",
});

export default PriceComparePanel;
