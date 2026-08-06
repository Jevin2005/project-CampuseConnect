"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft, CheckCircle, Lock, User, ShoppingCart,
  Play, Pause, Volume2, VolumeX, ShieldAlert, Maximize2, Minimize2, Settings,
  FileText, ShieldCheck, Sparkles, RefreshCw, AlertTriangle,
  RotateCcw, RotateCw, BookOpen, Info, HelpCircle, Download,
  PanelRightClose, PanelRightOpen, Monitor, Award, Layers, X, Search, ExternalLink
} from "lucide-react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

/* ─── Format seconds to MM:SS ─── */
function formatTime(s: number) {
  if (isNaN(s) || s < 0) return "00:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

const isVideoUrl = (url: string) => {
  const cleanUrl = url.split("?")[0].toLowerCase();
  const ext = cleanUrl.substring(cleanUrl.lastIndexOf(".") + 1);
  return ["mp4", "webm", "ogg", "mkv", "mov", "avi"].includes(ext);
};

const isDocumentUrl = (url: string) => {
  const cleanUrl = url.split("?")[0].toLowerCase();
  const ext = cleanUrl.substring(cleanUrl.lastIndexOf(".") + 1);
  return ["pdf", "doc", "docx", "ppt", "pptx", "txt"].includes(ext);
};

function getOriginalFileName(url: string, fallbackTitle?: string, defaultPrefix = "Asset"): string {
  if (!url) return fallbackTitle || defaultPrefix;
  try {
    const cleanUrl = url.split("?")[0];
    const rawFileName = cleanUrl.substring(cleanUrl.lastIndexOf("/") + 1);
    if (!rawFileName) return fallbackTitle || defaultPrefix;

    let displayName = decodeURIComponent(rawFileName);

    // Strip upload field prefixes & timestamps
    displayName = displayName.replace(/^(documents|videos|images|media|file|thumbnail|thumbnails)[-_]/i, "");
    displayName = displayName.replace(/^(\d+[-_]|file[-\d]+[-_])/, "");

    // Check if filename is a raw UUID (e.g. d7f9f850-763e-45dc-b401-f7ofb1bf3b1c.mp4)
    const baseWithoutExt = displayName.substring(0, displayName.lastIndexOf(".")) || displayName;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(baseWithoutExt);

    if (isUuid) {
      return fallbackTitle || defaultPrefix;
    }

    // Replace underscores with spaces for clean display
    displayName = displayName.replace(/_/g, " ").trim();

    if (displayName && displayName.length > 0) {
      return displayName;
    }
  } catch (e) {}

  return fallbackTitle || defaultPrefix;
}

const WATERMARK_POSITIONS: React.CSSProperties[] = [
  { top: "18px", right: "24px" },
  { top: "18px", left: "200px" },
  { bottom: "75px", right: "24px" },
  { bottom: "75px", left: "24px" },
  { top: "40%", right: "30px" },
  { top: "25%", left: "30px" },
  { bottom: "35%", right: "40px" },
];

interface LessonItem {
  id: number;
  title: string;
  url: string;
}

/* ─── Video Paywall Overlay ────────────────────────────── */
function VideoPaywall({ price, productId }: { price: number; productId: string }) {
  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "rgba(5, 8, 18, 0.95)",
      backdropFilter: "blur(20px)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 18, padding: 32, zIndex: 35,
      animation: "fadePaywall 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0.05) 100%)",
        border: "1.5px solid rgba(16,185,129,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 30px rgba(16,185,129,0.25)"
      }}>
        <Lock size={32} style={{ color: "#10B981" }} />
      </div>

      <div style={{ textAlign: "center", maxWidth: 420 }}>
        <h3 style={{
          fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800,
          color: "#F0F4FF", marginBottom: 8, letterSpacing: "-0.5px"
        }}>
          Preview Limit Reached
        </h3>
        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#9CA3AF",
          lineHeight: 1.6, margin: 0
        }}>
          You&apos;ve completed the <span style={{ color: "#10B981", fontWeight: 700 }}>5-minute free preview</span>.
          Enroll in this course to get full lifetime access to all video lectures & study materials.
        </p>
      </div>

      {/* Price Pill */}
      <div style={{
        background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.35)",
        borderRadius: 9999, padding: "8px 28px",
        fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: "#10B981",
        letterSpacing: "-0.5px"
      }}>
        ₹{price.toLocaleString("en-IN")}
      </div>

      {/* CTA Button */}
      <Link href={`/marketplace/digital/${productId}`} style={{ textDecoration: "none", width: "100%", maxWidth: 300 }}>
        <button style={{
          height: 50, width: "100%", borderRadius: 14,
          background: "linear-gradient(135deg, #10B981, #059669)", border: "none", cursor: "pointer",
          fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "#fff",
          boxShadow: "0 6px 24px rgba(16,185,129,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          transition: "all 0.2s ease"
        }} onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}>
          <ShoppingCart size={18} /> Unlock Full Video Access
        </button>
      </Link>

      <Link href={`/marketplace/digital/${productId}`} style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6B7280", textDecoration: "none", marginTop: 4,
        display: "flex", alignItems: "center", gap: 4
      }}>
        ← Return to course overview page
      </Link>
    </div>
  );
}

/* ═══ INNER VIEWER ═══════════════════════════════════════ */
function VideoViewerInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id") || "";

  const user = useAuthStore(s => s.user);
  const authLoading = useAuthStore(s => s.isLoading);
  const accessToken = useAuthStore(s => s.accessToken);

  const [product, setProduct] = useState<any>(null);
  const [purchased, setPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [wmIndex, setWmIndex] = useState(0);
  const [expired, setExpired] = useState(false);
  const [muted, setMuted] = useState(false);

  const [volume, setVolume] = useState(80);
  const [speed, setSpeed] = useState(1.0);
  const [activeTab, setActiveTab] = useState<"resources" | "shortcuts">("resources");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);

  const [focusLost, setFocusLost] = useState(false);
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const [clipboardAttacked, setClipboardAttacked] = useState(false);

  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const videoFiles: string[] = (product?.images || []).filter(isVideoUrl);
  const documentFiles: string[] = (product?.images || []).filter(isDocumentUrl);

  const docItemsList = documentFiles.length > 0
    ? documentFiles.map((url: string, i: number) => ({
        id: i + 1,
        title: `Resource Document ${i + 1}: ${product?.title || "Study Material"}`,
        url: url,
      }))
    : [
        {
          id: 1,
          title: `Verified Lecture Slides & Course PDF — ${product?.title || "Study Notes"}`,
          url: `/marketplace/viewer/pdf?id=${productId}`,
        }
      ];

  const isPreviewRequested = searchParams.get("preview") === "true";
  const isSeller = product?.sellerId === user?.id;
  const isPreview = isPreviewRequested || (!purchased && !isSeller);

  const PREVIEW_LIMIT_SECS = 300; 

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
  const buildStreamUrl = (preview: boolean) => {
    if (!productId || !accessToken) return "";
    const params = new URLSearchParams();
    if (preview) params.set("preview", "true");
    params.set("token", accessToken);
    return `${baseUrl.replace(/\/$/, "")}/api/marketplace/products/${productId}/file?${params.toString()}`;
  };

  const getFileUrl = (url: string) => {
    if (!url) return "";
    let clean = url.replace(/\\/g, "/");
    if (clean.startsWith("http://") || clean.startsWith("https://")) {
      try {
        return encodeURI(decodeURI(clean));
      } catch (_) {
        return encodeURI(clean);
      }
    }
    if (!clean.startsWith("/")) clean = "/" + clean;
    if (!clean.startsWith("/uploads/") && !clean.startsWith("/api/")) {
      if (clean.startsWith("/videos/") || clean.startsWith("/images/") || clean.startsWith("/documents/")) {
        clean = "/uploads" + clean;
      } else {
        clean = "/uploads/videos" + clean;
      }
    }
    const fullUrl = `${baseUrl.replace(/\/$/, "")}${clean}`;
    try {
      return encodeURI(decodeURI(fullUrl));
    } catch (_) {
      return encodeURI(fullUrl);
    }
  };

  const [hlsMasterUrl, setHlsMasterUrl] = useState<string>("");
  const [hlsUrlCache, setHlsUrlCache] = useState<Record<number, string>>({});
  const [hlsSupported, setHlsSupported] = useState(false);
  const [productStatus, setProductStatus] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).Hls) {
      setHlsSupported(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
    script.async = true;
    script.onload = () => setHlsSupported(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);

    const loadData = async () => {
      try {
        let fetchedProductData: any = null;
        try {
          const prodRes = await api.get(`/api/marketplace/products/${productId}`);
          fetchedProductData = prodRes.data;
          setProduct(prodRes.data);
        } catch (prodErr) {
          console.log("Product metadata fetch notice:", prodErr);
        }

        if (user) {
          try {
            const ordersRes = await api.get("/api/marketplace/orders");
            const orders = ordersRes.data || [];
            const userOrder = orders.find(
              (o: any) => o.productId === productId && (o.status === "COMPLETED" || o.status === "PAID")
            );
            const sellerMatch = fetchedProductData?.sellerId === user?.id;

            if (userOrder || sellerMatch) {
              setPurchased(true);
            }
          } catch (orderErr) {
            console.log("Order verification skipped:", orderErr);
          }
        }

        try {
          const hlsRes = await api.get(`/api/student/content/product/${productId}?videoIndex=0${isPreviewRequested ? '&preview=true' : ''}`);
          if (hlsRes.data?.masterProxyUrl) {
            setProductStatus(hlsRes.data?.productStatus || 'active');
            setHlsMasterUrl(hlsRes.data.masterProxyUrl);
            setHlsUrlCache(prev => ({ ...prev, 0: hlsRes.data.masterProxyUrl }));
          } else if (hlsRes.data?.productStatus) {
            setProductStatus(hlsRes.data.productStatus);
          }
        } catch (hlsErr: any) {
          if (hlsErr?.response?.data?.productStatus) {
            setProductStatus(hlsErr.response.data.productStatus);
          }
          console.log('HLS playlist fallback:', hlsErr);
        }
      } catch (err: any) {
        console.error("Failed to load video product:", err);
        setError("This secure video stream could not be loaded or verified.");
      } finally {
        setLoading(false);
      }
    };

    if (user || isPreviewRequested) {
      loadData();
    } else if (!authLoading) {
      router.push(`/login?redirect=/marketplace/viewer/video?id=${productId}`);
    }
  }, [productId, user, authLoading, router, isPreviewRequested]);

  useEffect(() => {
    let checkInterval: any;
    const threshold = 160;

    const detectDevTools = () => {
      const isMobile = typeof window !== "undefined" && (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth <= 768);
      if (isMobile) {
        setDevToolsOpen(false);
        return;
      }
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;
      if (widthDiff || heightDiff) {
        setDevToolsOpen(true);
      } else {
        setDevToolsOpen(false);
      }
    };

    checkInterval = setInterval(detectDevTools, 1500);
    return () => clearInterval(checkInterval);
  }, []);

  useEffect(() => {
    const handleBlur = () => setFocusLost(true);
    const handleFocus = () => setFocusLost(false);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setFocusLost(true);
      } else {
        setFocusLost(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        e.preventDefault();
        document.body.classList.add('clipboard-attacked');
        setClipboardAttacked(true);
        navigator.clipboard?.writeText("🔒 Content Protected by CampusConnect DRM").catch(() => {});
        setTimeout(() => {
          document.body.classList.remove('clipboard-attacked');
          setClipboardAttacked(false);
        }, 2200);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "u" || e.key === "i" || e.key === "p" || e.key === "c")) {
        e.preventDefault();
        return;
      }
      if (e.key === "F12") {
        e.preventDefault();
        return;
      }

      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === "Space") {
        e.preventDefault();
        setPlaying(prev => !prev);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        skipTime(10);
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        skipTime(-10);
      } else if (e.code === "KeyF") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === "KeyM") {
        e.preventDefault();
        setMuted(prev => !prev);
      }
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setWmIndex(i => (i + 1) % WATERMARK_POSITIONS.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    const current = video.currentTime;
    setElapsed(current);

    if (isPreview && current >= PREVIEW_LIMIT_SECS) {
      video.pause();
      setPlaying(false);
      setExpired(true);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const [hlsLevels, setHlsLevels] = useState<{ id: number; name: string }[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number>(-1);
  const hlsRef = useRef<any>(null);

  // Fetch HLS master URL for any video index when the user switches lessons
  useEffect(() => {
    if (!productId || !accessToken) return;
    if (hlsUrlCache[currentLessonIdx]) return; // already cached

    let isSubscribed = true;
    setHlsLoading(true);

    const fetchHlsForIndex = async () => {
      try {
        const res = await api.get(
          `/api/student/content/product/${productId}?videoIndex=${currentLessonIdx}${isPreview ? '&preview=true' : ''}`
        );
        if (isSubscribed && res.data?.masterProxyUrl) {
          setHlsUrlCache(prev => ({ ...prev, [currentLessonIdx]: res.data.masterProxyUrl }));
        }
      } catch (err) {
        console.log(`[HLS] Could not fetch HLS URL for video ${currentLessonIdx}:`, err);
      } finally {
        if (isSubscribed) setHlsLoading(false);
      }
    };

    fetchHlsForIndex();
    return () => {
      isSubscribed = false;
    };
  }, [currentLessonIdx, productId, accessToken, isPreview]);

  // True while we're fetching the HLS URL for a non-zero video index
  const [hlsLoading, setHlsLoading] = useState(false);

  // Fallback to direct video file if available in product.images for current index
  const directVideoFallback = videoFiles[currentLessonIdx]
    ? getFileUrl(videoFiles[currentLessonIdx])
    : (videoFiles[0] ? getFileUrl(videoFiles[0]) : "");

  // Use cached HLS URL for current lesson, fall back to initial hlsMasterUrl for index 0, or direct video URL
  const activeVideoUrl: string = hlsUrlCache[currentLessonIdx]
    || (currentLessonIdx === 0 && hlsMasterUrl ? hlsMasterUrl : directVideoFallback);

  useEffect(() => {
    const video = videoRef.current;
    // Don't attempt to load HLS until we have a real URL
    if (!video || !activeVideoUrl) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      return;
    }

    const isHls = activeVideoUrl.includes(".m3u8") || activeVideoUrl.includes("/segment");
    const HlsClass = (window as any).Hls;

    if (isHls && HlsClass && HlsClass.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      const hlsInstance = new HlsClass({
        capLevelToPlayerSize: true,
        autoStartLoad: false,
        maxBufferLength: 1,
        maxMaxBufferLength: 4,
        maxBufferSize: 512 * 1024,
        backBufferLength: 0,
        maxBufferHole: 0.1,
        startLevel: -1,
        enableWorker: true,
        lowLatencyMode: false,
        xhrSetup: (xhr: XMLHttpRequest) => {
          xhr.withCredentials = false;
        },
      });

      hlsRef.current = hlsInstance;
      hlsInstance.loadSource(activeVideoUrl);
      hlsInstance.attachMedia(video);

      hlsInstance.on(HlsClass.Events.MANIFEST_PARSED, (_event: any, data: any) => {
        if (data.levels && data.levels.length > 0) {
          const parsed = data.levels.map((lvl: any, idx: number) => ({
            id: idx,
            name: lvl.height ? `${lvl.height}p` : `Level ${idx + 1}`,
          }));
          setHlsLevels([{ id: -1, name: "Auto (Adaptive)" }, ...parsed]);
        }
        if (playing) {
          hlsInstance.startLoad();
          video.play().catch(err => console.log("HLS play interrupted:", err));
        }
      });

      hlsInstance.on(HlsClass.Events.ERROR, (_event: any, data: any) => {
        if (data.fatal) {
          if (data.type === HlsClass.ErrorTypes.NETWORK_ERROR) {
            console.warn('[HLS.js] Network error — attempting recovery:', data.details);
            hlsInstance.startLoad();
          } else {
            console.error('[HLS.js] Fatal error:', data.type, data.details);
            hlsInstance.destroy();
            hlsRef.current = null;
          }
        }
      });

      return () => {
        hlsInstance.destroy();
        hlsRef.current = null;
      };
    } else {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.src = activeVideoUrl;
      video.load();
      if (playing) {
        video.play().catch(err => console.log("Direct play interrupted:", err));
      }
    }
  }, [activeVideoUrl]);

  const handleQualityChange = (levelId: number) => {
    setSelectedLevel(levelId);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelId;
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (playing && !expired && !devToolsOpen && !focusLost) {
      if (hlsRef.current) hlsRef.current.startLoad();
      video.play().catch(err => console.log("Play interrupted:", err));
    } else {
      video.pause();
      if (hlsRef.current) hlsRef.current.stopLoad();
    }
  }, [playing, expired, devToolsOpen, focusLost]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = muted ? 0 : volume / 100;
      videoRef.current.playbackRate = speed;
    }
  }, [volume, muted, speed]);

  const toggleFullscreen = () => {
    const isMobile = typeof window !== "undefined" && (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth <= 768);
    const video = videoRef.current;
    const container = playerContainerRef.current;

    if (isMobile && video && (video as any).webkitEnterFullscreen) {
      (video as any).webkitEnterFullscreen();
      return;
    }

    if (!container) return;
    if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(() => {});
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen();
      } else if (video && (video as any).webkitEnterFullscreen) {
        (video as any).webkitEnterFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  };

  const skipTime = (seconds: number) => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, duration || 99999));
    if (isPreview && newTime >= PREVIEW_LIMIT_SECS) {
      setExpired(true);
      setPlaying(false);
      return;
    }
    videoRef.current.currentTime = newTime;
    setElapsed(newTime);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (expired || !videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPos = (e.clientX - rect.left) / rect.width;
    const targetTime = clickPos * duration;

    if (isPreview && targetTime >= PREVIEW_LIMIT_SECS) {
      setExpired(true);
      setPlaying(false);
      return;
    }
    videoRef.current.currentTime = targetTime;
    setElapsed(targetTime);
  };

  if (authLoading || loading) {
    return (
      <div style={{ background: "#060913", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{ width: 48, height: 48, border: "3px solid rgba(16,185,129,0.15)", borderTopColor: "#10B981", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#9CA3AF", fontWeight: 500 }}>Validating DRM security & video stream...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ background: "#060913", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, padding: 24 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <AlertTriangle size={32} style={{ color: "#EF4444" }} />
        </div>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 700, color: "#fff", margin: 0 }}>Stream Unavailable</h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#9CA3AF", textAlign: "center", maxWidth: 420, margin: 0, lineHeight: 1.6 }}>
          {error || "This video resource is currently unavailable or processing."}
        </p>
        <Link href="/marketplace" style={{ textDecoration: "none", marginTop: 8 }}>
          <button style={{ height: 42, padding: "0 24px", borderRadius: 12, background: "linear-gradient(135deg, #10B981, #059669)", border: "none", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
            Back to Marketplace
          </button>
        </Link>
      </div>
    );
  }

  const watermarkUser = user?.name || "Student Access";
  const watermarkEmail = user?.email || "student@campusconnect.in";

  const allUploadedFiles: string[] = product?.images || [];
  const uploadedDocFiles = allUploadedFiles.filter(isDocumentUrl);

  let vCounter = 0;
  let dCounter = 0;

  interface UnifiedSyllabusAsset {
    id: number;
    type: "video" | "document";
    title: string;
    url: string;
    videoIdx?: number;
    docIdx?: number;
  }

  const unifiedSyllabus: UnifiedSyllabusAsset[] = [];

  if (allUploadedFiles.length > 0) {
    allUploadedFiles.forEach((fileUrl: string, idx: number) => {
      if (isVideoUrl(fileUrl)) {
        const currentVIdx = vCounter;
        vCounter++;
        const originalName = getOriginalFileName(fileUrl, product?.title, `Video Lecture ${currentVIdx + 1}`);
        unifiedSyllabus.push({
          id: idx + 1,
          type: "video",
          title: originalName,
          url: fileUrl,
          videoIdx: currentVIdx,
        });
      } else if (isDocumentUrl(fileUrl)) {
        const currentDIdx = dCounter;
        dCounter++;
        const originalName = getOriginalFileName(fileUrl, product?.title, `Study Document ${currentDIdx + 1}`);
        unifiedSyllabus.push({
          id: idx + 1,
          type: "document",
          title: originalName,
          url: fileUrl,
          docIdx: currentDIdx,
        });
      }
    });
  }

  if (unifiedSyllabus.length === 0) {
    const rawTitle = product?.title || "Video Lecture";
    unifiedSyllabus.push({
      id: 1,
      type: "video",
      title: rawTitle === "testing videos" ? "Complete Lecture Module" : rawTitle,
      url: "",
      videoIdx: 0,
    });
  }

  const lessonsList = videoFiles.length > 0
    ? videoFiles.map((v: string, i: number) => ({ id: i + 1, title: product?.title || "Video Course", url: v }))
    : [{ id: 1, title: product?.title || "Video Lecture", url: "" }];

  const totalSecs = isPreview ? Math.min(PREVIEW_LIMIT_SECS, duration || PREVIEW_LIMIT_SECS) : (duration || 0);
  const progressPercent = totalSecs > 0 ? Math.min((elapsed / totalSecs) * 100, 100) : 0;

  const rawDesc = product?.description || "Comprehensive academic video lecture course with DRM protection.\nMulti-bitrate adaptive HLS streaming (720p / 480p / 360p).\nBundled PDF study resources and verified student enrollment access.";
  const descLines = rawDesc.includes("\n")
    ? rawDesc.split("\n").filter((l: string) => l.trim().length > 0)
    : rawDesc.split(". ").filter((l: string) => l.trim().length > 0).map((l: string) => l.endsWith(".") ? l : `${l}.`);

  return (
    <div className="main-viewport-container" style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#060913", color: "#F0F4FF", overflow: "hidden", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

        @media print {
          body, html, #__next, .video-workspace-grid, .video-player-pane, .video-sidebar {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
          }
        }

        @keyframes fadePaywall { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }

        body.focus-lost .workspace-container,
        body.focus-lost header,
        body.focus-lost footer {
          filter: blur(50px) !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }

        .drm-blackout-overlay {
          position: fixed;
          inset: 0;
          background: #060913;
          z-index: 99999 !important;
          display: none;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #fff;
          gap: 16px;
          text-align: center;
          padding: 24px;
        }

        body.focus-lost .drm-blackout-overlay {
          display: flex !important;
        }

        .drm-clipboard-overlay {
          position: fixed;
          inset: 0;
          background: #000;
          z-index: 100000 !important;
          display: none;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #fff;
          gap: 12px;
          text-align: center;
          padding: 24px;
        }

        body.clipboard-attacked .drm-clipboard-overlay {
          display: flex !important;
        }

        .top-navbar {
          background: rgba(10, 14, 26, 0.9);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }

        .ctrl-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #D1D5DB;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 12px;
          border-radius: 10px;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        .ctrl-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.14);
          border-color: rgba(255, 255, 255, 0.25);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
        }
        .ctrl-btn:active {
          transform: translateY(0) scale(0.96);
        }

        .play-main-btn {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #10B981, #059669);
          border: none;
          color: #ffffff;
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .play-main-btn:hover {
          transform: scale(1.06);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6);
        }
        .play-main-btn:active {
          transform: scale(0.95);
        }

        .tab-btn {
          padding: 10px 20px;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .tab-btn.active {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(16, 185, 129, 0.08));
          color: #10B981;
          border: 1px solid rgba(16, 185, 129, 0.4);
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.15);
        }
        .tab-btn.inactive {
          background: rgba(255, 255, 255, 0.03);
          color: #9CA3AF;
          border: 1px solid rgba(255, 255, 255, 0.07);
        }
        .tab-btn.inactive:hover {
          color: #F0F4FF;
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.18);
          transform: translateY(-1px);
        }

        .cta-btn-primary {
          height: 46px;
          width: 100%;
          border-radius: 12px;
          background: linear-gradient(135deg, #10B981, #059669);
          border: none;
          color: #ffffff;
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.35);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cta-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.5);
        }
        .cta-btn-primary:active {
          transform: translateY(0);
        }

        .lesson-card {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .lesson-card:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: rgba(255, 255, 255, 0.15) !important;
          transform: translateX(2px);
        }

        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.12);
          border-radius: 99px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.4);
        }

        .profile-btn-hover {
          transition: all 0.2s ease;
        }
        .profile-btn-hover:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-1px);
        }

        /* ── RESPONSIVE DESIGN RULES ── */
        .main-viewport-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
        }

        .video-sidebar-pane.desktop-closed {
          display: none;
        }
        .video-sidebar-pane.desktop-open {
          display: flex;
        }

        @media (max-width: 1024px) {
          .main-viewport-container {
            height: auto !important;
            min-height: 100vh !important;
            overflow-y: auto !important;
          }
          .workspace-container {
            grid-template-columns: 1fr !important;
            height: auto !important;
            overflow: visible !important;
          }
          .left-pane-container {
            overflow-y: visible !important;
          }
          .video-sidebar-pane.desktop-closed,
          .video-sidebar-pane.desktop-open {
            display: flex !important;
            border-left: none !important;
            border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
            height: auto !important;
            max-height: none !important;
            overflow-y: visible !important;
          }
        }

        @media (max-width: 768px) {
          .top-navbar {
            height: 48px !important;
            padding: 0 12px !important;
          }
          .header-title-container {
            display: block !important;
            max-width: 180px !important;
          }
          .user-badge-text {
            display: none !important;
          }
          .left-pane-container {
            padding: 12px !important;
            gap: 12px !important;
          }
        }

        @media (max-width: 640px) {
          .volume-slider-group {
            display: none !important;
          }
          .tab-navigation-bar {
            overflow-x: auto !important;
            white-space: nowrap !important;
            padding-bottom: 8px !important;
          }
          .tab-btn {
            padding: 8px 14px !important;
            font-size: 12px !important;
            flex-shrink: 0 !important;
          }
          .ctrl-btn {
            padding: 6px 8px !important;
            border-radius: 8px !important;
          }
          .play-main-btn {
            width: 36px !important;
            height: 36px !important;
          }
          .overview-card-container {
            padding: 16px !important;
            gap: 14px !important;
            border-radius: 12px !important;
          }
          .meta-grid-container {
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
          }
          .meta-grid-card {
            padding: 10px 12px !important;
            border-radius: 10px !important;
          }
          .meta-grid-title {
            font-size: 10px !important;
          }
          .meta-grid-value {
            font-size: 11px !important;
          }
          .left-pane-container {
            padding: 12px !important;
            gap: 14px !important;
          }
        }

        @media (max-width: 500px) {
          .hide-on-mobile {
            display: none !important;
          }
        }
      `}</style>

      <div className="drm-blackout-overlay">
        <ShieldAlert size={60} style={{ color: "#EF4444" }} />
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, color: "#EF4444", margin: 0 }}>
          🔒 DRM PLAYBACK SUSPENDED
        </h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#9CA3AF", fontSize: 14, maxWidth: 460, lineHeight: 1.6, margin: 0 }}>
          Screen recording, window blur, or screen sharing detected.
          CampusConnect DRM rules prohibit capturing or recording video lectures.
        </p>
        <span style={{ color: "#10B981", fontWeight: 700, fontSize: 13, marginTop: 4 }}>
          Click inside this browser tab to resume playback.
        </span>
      </div>

      <div className="drm-clipboard-overlay">
        <ShieldAlert size={64} style={{ color: "#EF4444" }} />
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, color: "#EF4444", margin: 0 }}>
          SCREENSHOT BLOCKED
        </h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#9CA3AF", fontSize: 14, margin: 0 }}>
          System screenshot utility neutralized. Clipboard contents cleared.
        </p>
      </div>

      <header className="top-navbar" style={{ height: 48, padding: "0 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, zIndex: 50, background: "rgba(10, 14, 26, 0.95)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href={`/marketplace/digital/${productId}`} style={{
            display: "flex", alignItems: "center", gap: 6, color: "#9CA3AF", textDecoration: "none",
            fontSize: 12, fontWeight: 600, transition: "color 0.2s"
          }} className="ctrl-btn">
            <ChevronLeft size={16} />
            <span>Exit</span>
          </Link>

          {isPreview && (
            <span style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", color: "#F59E0B", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
              <Lock size={10} /> <span>PREVIEW</span>
            </span>
          )}
        </div>

        <div className="header-title-container" style={{ textAlign: "center", maxWidth: "45%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "#F0F4FF", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {product?.title || "Video Course"}
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            className="ctrl-btn"
            style={{
              gap: 5, padding: "4px 10px", borderRadius: 8,
              background: sidebarOpen ? "rgba(255,255,255,0.06)" : "rgba(16,185,129,0.12)",
              color: sidebarOpen ? "#9CA3AF" : "#10B981",
              border: sidebarOpen ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(16,185,129,0.3)",
              fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center"
            }}
            title={sidebarOpen ? "Hide Course Syllabus" : "Show Course Syllabus"}
          >
            {sidebarOpen ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
            <span className="hide-on-mobile">Syllabus</span>
          </button>

          <Link href="/marketplace/profile" style={{ textDecoration: "none" }} title="View Profile">
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "2px 6px", borderRadius: 9999,
              transition: "all 0.2s ease",
              cursor: "pointer"
            }} className="profile-btn-hover">
              <div className="user-badge-text" style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#F0F4FF" }}>{watermarkUser}</div>
              </div>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #10B981, #059669)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, color: "#fff", boxShadow: "0 0 10px rgba(16,185,129,0.3)" }}>
                {(watermarkUser[0] || "U").toUpperCase()}
              </div>
            </div>
          </Link>
        </div>
      </header>

      {isPreview && (
        <div style={{ height: 4, background: "rgba(255,255,255,0.05)", width: "100%", flexShrink: 0 }}>
          <div style={{
            height: "100%",
            width: `${Math.min((elapsed / PREVIEW_LIMIT_SECS) * 100, 100)}%`,
            background: expired ? "#EF4444" : "#F59E0B",
            transition: "width 0.5s ease"
          }} />
        </div>
      )}

      <div style={{
        position: "relative",
        flex: 1, minHeight: 0, overflow: "hidden", background: "#000"
      }} className="workspace-container">

        {/* Video Screen Container - Occupies 100% of Window Stage */}
        <div
          ref={playerContainerRef}
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            background: "#000",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {productStatus === 'PROCESSING' ? (
            <div style={{ textAlign: "center", padding: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ width: 52, height: 52, border: "3px solid rgba(16,185,129,0.15)", borderTopColor: "#10B981", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, color: "#10B981", fontWeight: 700 }}>Transcoding Video to 4-Second HLS Chunks...</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#9CA3AF", maxWidth: 380, lineHeight: 1.5 }}>
                FFmpeg is generating adaptive streaming segments. This takes ~30-60 seconds.
              </div>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : hlsLoading && !activeVideoUrl ? (
            <div style={{ textAlign: "center", padding: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ width: 44, height: 44, border: "3px solid rgba(59,130,246,0.15)", borderTopColor: "#3B82F6", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, color: "#60A5FA", fontWeight: 600 }}>Loading video stream...</div>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : activeVideoUrl ? (
            <video
              ref={videoRef}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setPlaying(false)}
              onClick={() => setPlaying(p => !p)}
              playsInline
              style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", cursor: "pointer" }}
            />
          ) : (
            <div style={{ textAlign: "center", padding: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <div style={{ width: 60, height: 60, borderRadius: 20, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                🎥
              </div>
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 700, color: "#F0F4FF" }}>Video Lecture Stream Ready</h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#9CA3AF", maxWidth: 380, lineHeight: 1.6, margin: 0 }}>
                This video course is connected to secure server streaming. Click play to start playback.
              </p>
            </div>
          )}

          {/* Floating Watermark */}
          {!expired && (
            <div style={{
              position: "absolute",
              ...WATERMARK_POSITIONS[wmIndex],
              pointerEvents: "none",
              userSelect: "none",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              fontWeight: 500,
              color: "rgba(255, 255, 255, 0.25)",
              zIndex: 22,
              transition: "all 1s ease-in-out",
              whiteSpace: "nowrap",
              letterSpacing: "0.4px"
            }}>
              {watermarkEmail}
            </div>
          )}

          {isPreview && !expired && (
            <div style={{
              position: "absolute", top: 16, right: 16,
              background: "rgba(10, 14, 26, 0.85)", backdropFilter: "blur(12px)",
              borderRadius: 10, padding: "6px 14px",
              fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
              color: (PREVIEW_LIMIT_SECS - elapsed) < 60 ? "#EF4444" : "#F59E0B",
              fontWeight: 700,
              border: `1px solid ${(PREVIEW_LIMIT_SECS - elapsed) < 60 ? "rgba(239,68,68,0.4)" : "rgba(245,158,11,0.4)"}`,
              zIndex: 25, boxShadow: "0 4px 12px rgba(0,0,0,0.4)"
            }}>
              ⏱ Preview remaining: {formatTime(Math.max(0, PREVIEW_LIMIT_SECS - elapsed))}
            </div>
          )}

          {expired && <VideoPaywall price={product?.price || 0} productId={productId} />}

          {!expired && (
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: "linear-gradient(to top, rgba(5,8,19,0.96) 0%, rgba(5,8,19,0.6) 70%, transparent 100%)",
              padding: "20px 22px 14px",
              display: "flex", flexDirection: "column", gap: 12,
              zIndex: 30
            }}>
              <div
                onClick={handleSeek}
                style={{
                  width: "100%", height: 6, background: "rgba(255,255,255,0.18)",
                  borderRadius: 9999, cursor: "pointer", position: "relative",
                  transition: "height 0.2s"
                }}
                onMouseOver={e => e.currentTarget.style.height = "8px"}
                onMouseOut={e => e.currentTarget.style.height = "6px"}
              >
                <div style={{
                  height: "100%", width: `${progressPercent}%`,
                  background: isPreview ? "linear-gradient(90deg, #F59E0B, #FBBF24)" : "linear-gradient(90deg, #10B981, #34D399)",
                  borderRadius: 9999, transition: "width 0.1s linear",
                  boxShadow: "0 0 10px rgba(16,185,129,0.5)"
                }} />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button className="play-main-btn" onClick={() => setPlaying(p => !p)} title={playing ? "Pause (Space)" : "Play (Space)"}>
                    {playing ? <Pause size={20} style={{ color: "#fff" }} /> : <Play size={20} style={{ color: "#fff", marginLeft: 2 }} />}
                  </button>

                  <button className="ctrl-btn hide-on-mobile" onClick={() => skipTime(-10)} title="Rewind 10s (Left Arrow)">
                    <RotateCcw size={16} />
                  </button>

                  <button className="ctrl-btn hide-on-mobile" onClick={() => skipTime(10)} title="Forward 10s (Right Arrow)">
                    <RotateCw size={16} />
                  </button>

                  <div className="volume-slider-group" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button className="ctrl-btn" onClick={() => setMuted(m => !m)} title={muted ? "Unmute (M)" : "Mute (M)"}>
                      {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={muted ? 0 : volume}
                      onChange={e => { setVolume(Number(e.target.value)); setMuted(false); }}
                      style={{ width: 70, accentColor: "#10B981", cursor: "pointer", height: 4 }}
                    />
                  </div>

                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#9CA3AF", marginLeft: 4 }}>
                    {formatTime(elapsed)} / {formatTime(totalSecs)}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {hlsLevels.length > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 8, padding: "3px 10px" }}>
                      <Sparkles size={12} style={{ color: "#10B981" }} />
                      <select
                        value={selectedLevel}
                        onChange={e => handleQualityChange(Number(e.target.value))}
                        style={{ background: "transparent", border: "none", color: "#10B981", fontSize: 11, fontWeight: 700, cursor: "pointer", outline: "none", fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {hlsLevels.map(lvl => (
                          <option key={lvl.id} value={lvl.id} style={{ background: "#0D111E", color: "#fff" }}>
                            {lvl.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="hide-on-mobile" style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "3px 10px" }}>
                    <Settings size={13} style={{ color: "#9CA3AF" }} />
                    <select
                      value={speed}
                      onChange={e => setSpeed(Number(e.target.value))}
                      style={{ background: "transparent", border: "none", color: "#F0F4FF", fontSize: 11, fontWeight: 600, cursor: "pointer", outline: "none", fontFamily: "'DM Sans', sans-serif" }}
                    >
                      <option value={0.75} style={{ background: "#0D111E" }}>0.75x</option>
                      <option value={1.0} style={{ background: "#0D111E" }}>1.0x (Normal)</option>
                      <option value={1.25} style={{ background: "#0D111E" }}>1.25x</option>
                      <option value={1.5} style={{ background: "#0D111E" }}>1.5x</option>
                      <option value={2.0} style={{ background: "#0D111E" }}>2.0x</option>
                    </select>
                  </div>

                  <button className="ctrl-btn" onClick={toggleFullscreen} title="Toggle Fullscreen (F)">
                    <Maximize2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Backdrop for closing Syllabus Drawer when clicking outside */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed", top: 48, left: 0, right: 380, bottom: 0,
              zIndex: 85, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)"
            }}
          />
        )}

        {/* Slide-over Syllabus Drawer */}
        <div style={{
          position: "fixed",
          top: 48,
          right: 0,
          bottom: 0,
          width: 380,
          zIndex: 90,
          background: "rgba(8, 12, 22, 0.96)",
          backdropFilter: "blur(20px)",
          borderLeft: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "-12px 0 40px rgba(0,0,0,0.85)",
          display: "flex",
          flexDirection: "column",
          transform: sidebarOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
        }}>
          <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700, color: "#F0F4FF", margin: "0 0 4px" }}>
                Video Course Syllabus
              </h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#9CA3AF", margin: 0 }}>
                {unifiedSyllabus.filter(a => a.type === "video").length} Video Lectures
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#10B981", background: "rgba(16,185,129,0.1)", padding: "3px 8px", borderRadius: 6, fontWeight: 700 }}>
                {Math.round(progressPercent)}% DONE
              </span>

              <button
                onClick={() => setSidebarOpen(false)}
                className="ctrl-btn"
                style={{ width: 32, height: 32, borderRadius: 8, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                title="Close Syllabus"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10, flex: 1, overflowY: "auto" }}>
            {unifiedSyllabus.filter(asset => asset.type === "video").map((asset, idx) => {
              const vIndex = asset.videoIdx ?? 0;
              const isSelected = vIndex === currentLessonIdx;
              const isLocked = isPreview && vIndex > 0;

              return (
                <div
                  key={`unified-${asset.id}-${idx}`}
                  className="lesson-card"
                  onClick={() => {
                    if (isLocked) {
                      setExpired(true);
                      setPlaying(false);
                      return;
                    }
                    setCurrentLessonIdx(vIndex);
                    setElapsed(0);
                    setExpired(false);
                    setPlaying(true);
                  }}
                  style={{
                    padding: "14px 16px",
                    borderRadius: 12,
                    background: isSelected ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${isSelected ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.05)"}`,
                    cursor: isLocked ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", gap: 12,
                    opacity: isLocked ? 0.55 : 1,
                  }}
                >
                  <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: isSelected ? "linear-gradient(135deg, #10B981, #059669)" : "rgba(255,255,255,0.05)",
                    color: isSelected ? "#fff" : "#9CA3AF",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 12, flexShrink: 0
                  }}>
                    {isSelected ? (
                      playing ? <Pause size={14} style={{ color: "#fff" }} /> : <Play size={14} style={{ color: "#fff", marginLeft: 1 }} />
                    ) : isLocked ? (
                      <Lock size={12} style={{ color: "#EF4444" }} />
                    ) : (
                      <span>{String(idx + 1).padStart(2, "0")}</span>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700,
                      color: isSelected ? "#10B981" : "#F0F4FF",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                    }}>
                      {asset.title}
                    </div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: isSelected ? "#10B981" : "#9CA3AF", marginTop: 2, opacity: 0.8 }}>
                      {isLocked ? "🔒 Locked Preview" : "🎥 Video Lecture Stream"}
                    </div>
                  </div>
                </div>
              );
            })}

            {isPreview && (
              <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(245,158,11,0.04)", marginTop: 12 }}>
                <Link href={`/marketplace/digital/${productId}`} style={{ textDecoration: "none" }}>
                  <button className="cta-btn-primary">
                    🔓 Unlock Full Video Course
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>



      {/* Inline PDF Viewer Overlay Modal */}
      {selectedPdfUrl && (
        <div onClick={() => setSelectedPdfUrl(null)} style={{ position: "fixed", inset: 0, zIndex: 99995, background: "rgba(5,8,19,0.95)", backdropFilter: "blur(20px)", display: "flex", flexDirection: "column" }}>
          <div onClick={e => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
            <div style={{ height: 52, padding: "0 24px", background: "rgba(10,14,26,0.98)", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <FileText size={20} style={{ color: "#A78BFA" }} />
                <div>
                  <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "#F0F4FF", margin: 0 }}>
                    CampusConnect Secure DRM PDF Reader
                  </h3>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#9CA3AF" }}>{product?.title}</span>
                </div>
              </div>

              <button onClick={() => setSelectedPdfUrl(null)} className="ctrl-btn" style={{ padding: "6px 12px", borderRadius: 8, gap: 6, cursor: "pointer" }}>
                <X size={16} /> Close Reader
              </button>
            </div>

            <iframe
              src={selectedPdfUrl.startsWith("/") ? selectedPdfUrl : `/marketplace/viewer/pdf?id=${productId}${isPreview ? "&preview=true" : ""}`}
              style={{ flex: 1, width: "100%", height: "calc(100vh - 52px)", border: "none" }}
              title="Secure PDF Viewer"
            />
          </div>
        </div>
      )}

    </div>
  );
}

/* ═══ PAGE EXPORT WRAPPER ═════════════════════════════════ */
export default function VideoViewerPage() {
  return (
    <Suspense fallback={
      <div style={{ background: "#050811", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 36, height: 36, border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#10B981", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <VideoViewerInner />
    </Suspense>
  );
}
