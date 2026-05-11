import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const RecentlyViewedBar = () => {
  const [items, setItems] = useState([]);
  const [visible, setVisible] = useState(true);
  const scrollRef = useRef(null);

  const { user, checkingAuth } = useSelector((state) => state.user);
  const navigate = useNavigate();

  /* ── Fetch recently viewed ── */
  useEffect(() => {
    if (checkingAuth || !user) return;

    fetch(`${import.meta.env.VITE_API_URL}/api/recentlyViewed`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setItems(Array.isArray(data) ? data.slice(0, 12) : []))
      .catch(() => setItems([]));
  }, [user, checkingAuth]);

  /* ── Drag-to-scroll (desktop) ── */
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0 });

  const onMouseDown = (e) => {
    drag.current = { active: true, startX: e.pageX - scrollRef.current.offsetLeft, scrollLeft: scrollRef.current.scrollLeft };
    scrollRef.current.style.cursor = "grabbing";
  };
  const onMouseUp = () => {
    drag.current.active = false;
    if (scrollRef.current) scrollRef.current.style.cursor = "grab";
  };
  const onMouseMove = (e) => {
    if (!drag.current.active) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - drag.current.startX) * 1.2;
    scrollRef.current.scrollLeft = drag.current.scrollLeft - walk;
  };

  /* ── Don't render for guests or empty list ── */
  if (!user || items.length === 0) return null;
  if (!visible) return null;

  return (
    <div style={containerStyle}>
      {/* Label + Dismiss */}
      <div style={labelRowStyle}>
        <span style={labelStyle}>🕐 Recently Viewed</span>
        <button
          onClick={() => setVisible(false)}
          style={dismissStyle}
          title="Hide"
        >
          ✕
        </button>
      </div>

      {/* Scrollable track */}
      <div
        ref={scrollRef}
        style={trackStyle}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onMouseMove={onMouseMove}
      >
        {items.map((view) => {
          const p = view.product;
          if (!p) return null;

          return (
            <div
              key={view._id}
              style={cardStyle}
              onClick={() => navigate(`/product/${p._id}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.12)";
                e.currentTarget.style.borderColor = "#f59e0b";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
                e.currentTarget.style.borderColor = "#e5e7eb";
              }}
            >
              {/* Product image */}
              <div style={imgWrapStyle}>
                <img
                  src={p.images?.[0]?.url || "/placeholder.png"}
                  alt={p.title}
                  style={imgStyle}
                  draggable={false}
                />
              </div>

              {/* Info */}
              <div style={infoStyle}>
                <p style={titleStyle} title={p.title}>
                  {p.title.length > 28 ? p.title.slice(0, 27) + "…" : p.title}
                </p>
                <p style={priceStyle}>₹{Number(p.price).toLocaleString("en-IN")}</p>
              </div>
            </div>
          );
        })}

        {/* "View all" card */}
        <div
          style={{ ...cardStyle, justifyContent: "center", alignItems: "center", minWidth: 90, background: "#f9fafb" }}
          onClick={() => navigate("/recentlyViewed")}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#f59e0b"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; }}
        >
          <span style={{ fontSize: 22 }}>→</span>
          <p style={{ fontSize: 11, color: "#6b7280", marginTop: 4, textAlign: "center" }}>View All</p>
        </div>
      </div>
    </div>
  );
};

/* ── Styles ─────────────────────────────────── */
const containerStyle = {
  background: "#ffffff",
  borderBottom: "1px solid #e5e7eb",
  padding: "8px 16px 10px",
  position: "relative",
  zIndex: 10,
};

const labelRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 6,
};

const labelStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: "#374151",
  letterSpacing: 0.3,
  textTransform: "uppercase",
};

const dismissStyle = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: 12,
  color: "#9ca3af",
  lineHeight: 1,
  padding: "2px 4px",
  borderRadius: 4,
};

const trackStyle = {
  display: "flex",
  gap: 10,
  overflowX: "auto",
  paddingBottom: 4,
  cursor: "grab",
  scrollbarWidth: "none",        // Firefox
  msOverflowStyle: "none",       // IE
  WebkitOverflowScrolling: "touch",
};

const cardStyle = {
  display: "flex",
  flexDirection: "column",
  minWidth: 110,
  maxWidth: 110,
  background: "#fff",
  border: "1.5px solid #e5e7eb",
  borderRadius: 12,
  padding: "8px 8px 6px",
  cursor: "pointer",
  transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  userSelect: "none",
  flexShrink: 0,
};

const imgWrapStyle = {
  width: "100%",
  height: 72,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  borderRadius: 8,
  background: "#f9fafb",
  marginBottom: 6,
};

const imgStyle = {
  maxHeight: 68,
  maxWidth: "100%",
  objectFit: "contain",
};

const infoStyle = {
  flex: 1,
};

const titleStyle = {
  fontSize: 11,
  color: "#111827",
  fontWeight: 600,
  lineHeight: 1.3,
  margin: 0,
};

const priceStyle = {
  fontSize: 12,
  color: "#059669",
  fontWeight: 700,
  margin: "3px 0 0",
};

export default RecentlyViewedBar;
