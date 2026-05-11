import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

/* ── Skeleton shimmer ──────────────────────────────────────── */
const BannerSkeleton = () => (
  <div style={{
    borderRadius: 20,
    overflow: "hidden",
    height: 220,
    background: "linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)",
    backgroundSize: "200% 100%",
    animation: "bannerShimmer 1.5s infinite linear",
    marginBottom: 24,
  }} />
);

/* ── Dot indicator ─────────────────────────────────────────── */
const Dot = ({ active, color, onClick }) => (
  <button
    onClick={onClick}
    style={{
      width: active ? 24 : 8,
      height: 8,
      borderRadius: 99,
      background: active ? color : "rgba(255,255,255,0.45)",
      border: "none",
      cursor: "pointer",
      padding: 0,
      transition: "width 0.35s ease, background 0.35s ease",
    }}
  />
);

/* ── Main HeroBanner ───────────────────────────────────────── */
const HeroBanner = ({ products = [] }) => {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  /* ── Fetch AI banners ── */
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        // Extract unique categories from products
        const cats = [...new Set(
          products.map(p => p.category).filter(Boolean)
        )].slice(0, 5);

        // Send top product titles as hints
        const topTitles = products
          .slice(0, 6)
          .map(p => p.title)
          .join("|");

        const params = new URLSearchParams();
        if (cats.length) params.set("categories", cats.join(","));
        if (topTitles)   params.set("products", topTitles);

        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/ai/ad-banner?${params.toString()}`
        );

        if (data?.banners?.length) {
          setBanners(data.banners);
        }
      } catch (err) {
        console.error("Banner fetch failed:", err);
        // Set default fallback banner
        setBanners([{
          id: 1,
          headline: "Shop Smart, Save Big!",
          subtext: "Discover amazing deals on thousands of products",
          cta: "Shop Now",
          badge: "Up to 50% Off",
          emoji: "🛍️",
          gradientFrom: "#1e3a5f",
          gradientTo: "#7c3aed",
          textColor: "#ffffff",
          accentColor: "#f59e0b",
          imageUrl: null,
        }]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [products.length]);

  /* ── Auto-advance slides every 5 seconds ── */
  const goTo = useCallback((index) => {
    if (transitioning || index === current) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(index);
      setTransitioning(false);
    }, 300);
  }, [current, transitioning]);

  const next = useCallback(() => {
    goTo((current + 1) % banners.length);
  }, [current, banners.length, goTo]);

  useEffect(() => {
    if (banners.length < 2) return;
    intervalRef.current = setInterval(next, 5000);
    return () => clearInterval(intervalRef.current);
  }, [next, banners.length]);

  const pauseAutoplay = () => clearInterval(intervalRef.current);
  const resumeAutoplay = () => {
    intervalRef.current = setInterval(next, 5000);
  };

  if (loading) return <BannerSkeleton />;
  if (!banners.length) return null;

  const b = banners[current];

  return (
    <>
      <style>{`
        @keyframes bannerShimmer {
          0%   { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }
        @keyframes bannerFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes badgePop {
          0%   { transform: scale(0.8); opacity: 0; }
          60%  { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes floatImg {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
      `}</style>

      <div
        style={{
          position: "relative",
          borderRadius: 20,
          overflow: "hidden",
          marginBottom: 24,
          minHeight: 200,
          background: `linear-gradient(135deg, ${b.gradientFrom} 0%, ${b.gradientTo} 100%)`,
          transition: "background 0.6s ease",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          cursor: "pointer",
        }}
        onMouseEnter={pauseAutoplay}
        onMouseLeave={resumeAutoplay}
        onClick={() => navigate(`/search?category=${encodeURIComponent(b.category || "")}`)}
      >
        {/* Decorative blobs */}
        <div style={{
          position: "absolute", top: -40, right: -40,
          width: 180, height: 180, borderRadius: "50%",
          background: "rgba(255,255,255,0.07)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -30, left: "30%",
          width: 120, height: 120, borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          pointerEvents: "none",
        }} />

        {/* Content wrapper */}
        <div style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "28px 32px",
          gap: 20,
          opacity: transitioning ? 0 : 1,
          transition: "opacity 0.3s ease",
        }}>

          {/* LEFT: Text content */}
          <div style={{
            flex: 1,
            animation: transitioning ? "none" : "bannerFadeIn 0.5s ease",
          }}>
            {/* Badge */}
            {b.badge && (
              <div style={{
                display: "inline-block",
                background: b.accentColor || "#f59e0b",
                color: "#111",
                fontWeight: 800,
                fontSize: 11,
                padding: "4px 12px",
                borderRadius: 99,
                marginBottom: 10,
                letterSpacing: 0.5,
                textTransform: "uppercase",
                animation: "badgePop 0.4s ease",
                boxShadow: `0 2px 8px ${b.accentColor}66`,
              }}>
                {b.badge}
              </div>
            )}

            {/* Headline */}
            <h2 style={{
              margin: "0 0 8px",
              fontSize: "clamp(1.2rem, 2.5vw, 1.8rem)",
              fontWeight: 900,
              color: b.textColor || "#fff",
              lineHeight: 1.2,
              textShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}>
              {b.emoji && <span style={{ marginRight: 8 }}>{b.emoji}</span>}
              {b.headline}
            </h2>

            {/* Subtext */}
            <p style={{
              margin: "0 0 20px",
              fontSize: "clamp(0.8rem, 1.5vw, 1rem)",
              color: b.textColor ? `${b.textColor}cc` : "rgba(255,255,255,0.8)",
              lineHeight: 1.5,
              maxWidth: 360,
            }}>
              {b.subtext}
            </p>

            {/* CTA Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/search?category=${encodeURIComponent(b.category || "")}`);
              }}
              style={{
                background: b.accentColor || "#f59e0b",
                color: "#111",
                border: "none",
                borderRadius: 10,
                padding: "10px 24px",
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
                transition: "transform 0.18s ease, box-shadow 0.18s ease",
                boxShadow: `0 4px 14px ${b.accentColor}55`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-2px) scale(1.03)";
                e.currentTarget.style.boxShadow = `0 6px 20px ${b.accentColor}88`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = `0 4px 14px ${b.accentColor}55`;
              }}
            >
              {b.cta || "Shop Now"} →
            </button>
          </div>

          {/* RIGHT: Image */}
          {b.imageUrl && (
            <div style={{
              flexShrink: 0,
              width: "clamp(100px, 20vw, 200px)",
              height: "clamp(90px, 16vw, 160px)",
              overflow: "hidden",
              borderRadius: 14,
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
              animation: "floatImg 4s ease-in-out infinite",
            }}>
              <img
                src={b.imageUrl}
                alt={b.headline}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "opacity 0.4s ease",
                }}
                onError={e => { e.target.style.display = "none"; }}
              />
            </div>
          )}
        </div>

        {/* ── Navigation arrows ── */}
        {banners.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goTo((current - 1 + banners.length) % banners.length); }}
              style={arrowStyle("left")}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.4)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.25)"}
            >‹</button>
            <button
              onClick={(e) => { e.stopPropagation(); goTo((current + 1) % banners.length); }}
              style={arrowStyle("right")}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.4)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.25)"}
            >›</button>
          </>
        )}

        {/* ── Dot indicators ── */}
        {banners.length > 1 && (
          <div style={{
            position: "absolute", bottom: 14, left: "50%",
            transform: "translateX(-50%)",
            display: "flex", gap: 6, alignItems: "center",
          }}>
            {banners.map((_, i) => (
              <Dot
                key={i}
                active={i === current}
                color={b.accentColor || "#f59e0b"}
                onClick={(e) => { e.stopPropagation(); goTo(i); }}
              />
            ))}
          </div>
        )}

        {/* AI label */}
        <div style={{
          position: "absolute", top: 12, right: 14,
          background: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(4px)",
          borderRadius: 99,
          padding: "3px 10px",
          fontSize: 10,
          color: "rgba(255,255,255,0.75)",
          fontWeight: 600,
          letterSpacing: 0.5,
          pointerEvents: "none",
        }}>
          ✨ AI Ad
        </div>
      </div>
    </>
  );
};

/* ── Arrow button style ────────────────────────────────────── */
const arrowStyle = (side) => ({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  [side]: 12,
  background: "rgba(0,0,0,0.25)",
  backdropFilter: "blur(4px)",
  border: "none",
  color: "#fff",
  fontSize: 22,
  fontWeight: 700,
  width: 36,
  height: 36,
  borderRadius: "50%",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background 0.2s ease",
  lineHeight: 1,
  zIndex: 2,
});

export default HeroBanner;
