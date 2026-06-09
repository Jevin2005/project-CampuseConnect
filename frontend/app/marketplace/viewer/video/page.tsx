"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ChevronLeft, CheckCircle, Lock, Bell, User, ShoppingCart, 
  Play, Pause, Volume2, ShieldAlert, Monitor, SkipForward, Maximize2, Settings 
} from "lucide-react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

/* ─── Course outline syllabus ────────────────────────────────────────── */
const SYLLABUS_LESSONS = [
  { id: 1, title: "Course Introduction & Setup",    duration: "12:15", topic: "intro" },
  { id: 2, title: "Mathematical Prefaces & Matrix",  duration: "25:40", topic: "math" },
  { id: 3, title: "Wave-Particle Duality & Theory", duration: "32:10", topic: "wave" },
  { id: 4, title: "The Schrödinger Equation",       duration: "45:55", topic: "schrodinger" },
  { id: 5, title: "Infinite Square Well Solutions", duration: "38:20", topic: "well" },
  { id: 6, title: "Tunneling & Barrier Penetration",duration: "41:15", topic: "tunnel" },
];

const WATERMARK_POSITIONS: React.CSSProperties[] = [
  { top: "12%", left: "5%" },
  { top: "12%", right: "5%" },
  { bottom: "16%", left: "5%" },
  { bottom: "16%", right: "5%" },
];

/* ─── Format seconds to MM:SS ─── */
function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

/* ─── Parse seconds from string MM:SS ─── */
function parseDuration(dStr: string) {
  const parts = dStr.split(":");
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

const isVideoUrl = (url: string) => {
  const cleanUrl = url.split("?")[0].toLowerCase();
  const ext = cleanUrl.substring(cleanUrl.lastIndexOf(".") + 1);
  return ["mp4", "webm", "ogg", "mkv", "mov", "avi"].includes(ext);
};

const getFileUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
  return `${baseUrl.replace(/\/$/, "")}${url}`;
};

/* ─── Video Paywall Overlay ────────────────────────────── */
function VideoPaywall({ productTitle, price, productId }: { productTitle: string; price: number; productId: string }) {
  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "rgba(10,14,26,0.92)",
      backdropFilter: "blur(12px)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 16, padding: 32, zIndex: 30,
      borderRadius: 12,
    }}>
      <div style={{
        width: 68, height: 68, borderRadius: "50%",
        background: "rgba(16,185,129,0.12)",
        border: "2px solid rgba(16,185,129,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 20px rgba(16,185,129,0.2)"
      }}>
        <Lock size={30} style={{ color: "#10B981" }} />
      </div>
      <h3 style={{
        fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800,
        color: "#F0F4FF", textAlign: "center",
      }}>
        Demo Playback Suspended
      </h3>
      <p style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#9CA3AF",
        textAlign: "center", maxWidth: 340, lineHeight: 1.7,
      }}>
        You&apos;ve watched the <strong style={{ color: "#10B981" }}>5-minute free preview</strong>. 
        Purchase the course to unlock all syllabus lectures, study downloads, and final certificates.
      </p>

      {/* Price Badge */}
      <div style={{
        background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
        borderRadius: 9999, padding: "8px 24px",
        fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: "#F0F4FF",
        marginTop: 4
      }}>₹{price}</div>

      {/* CTA Button */}
      <Link href={`/marketplace/digital/${productId}`} style={{ textDecoration: "none", width: "100%", maxWidth: 260 }}>
        <button style={{
          height: 46, width: "100%", borderRadius: 9999,
          background: "#10B981", border: "none", cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: "#fff",
          boxShadow: "0 4px 20px rgba(16,185,129,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          transition: "transform 0.15s"
        }} onMouseOver={e => e.currentTarget.style.transform = "scale(1.02)"} onMouseOut={e => e.currentTarget.style.transform = "scale(1.0)"}>
          <ShoppingCart size={15} /> Enroll in Course Pack
        </button>
      </Link>
      <Link href={`/marketplace/digital/${productId}`} style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6B7280", textDecoration: "none", marginTop: 8
      }}>
        ← Return to product detail
      </Link>
    </div>
  );
}

/* ═══ INNER VIEWER ═══════════════════════════════════════ */
function VideoViewerInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id") || "1";

  // Auth Store
  const user = useAuthStore(s => s.user);
  const authLoading = useAuthStore(s => s.isLoading);

  // Dynamic state
  const [product, setProduct] = useState<any>(null);
  const [purchased, setPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentLessonId, setCurrentLessonId] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds
  const [wmIndex, setWmIndex] = useState(0);
  const [expired, setExpired] = useState(false);

  // Custom player settings
  const [volume, setVolume] = useState(80);
  const [speed, setSpeed] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Security overlays trigger
  const [focusLost, setFocusLost] = useState(false);
  const [clipboardAttacked, setClipboardAttacked] = useState(false);

  // Canvas context reference for the simulation
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);

  // Hidden Video DRM playback refs & state
  const [videoDuration, setVideoDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const videoFiles = (product?.images || []).filter(isVideoUrl);
  const activeVideoFile = videoFiles[Math.min(currentLessonId - 1, Math.max(0, videoFiles.length - 1))];
  
  // Direct video elements to the backend proxy stream URL for range-compatible secure delivery
  const isPreviewRequested = searchParams.get("preview") === "true";
  const isSeller = product?.sellerId === user?.id;
  const isPreview = isPreviewRequested || (!purchased && !isSeller);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
  const realVideoUrl = activeVideoFile
    ? `${baseUrl.replace(/\/$/, "")}/api/marketplace/products/${productId}/file${isPreview ? "?preview=true" : ""}`
    : "";

  // Fetch product data & orders status
  useEffect(() => {
    if (!productId) return;
    setLoading(true);

    const loadData = async () => {
      try {
        const prodRes = await api.get(`/api/marketplace/products/${productId}`);
        setProduct(prodRes.data);

        const ordersRes = await api.get("/api/marketplace/orders");
        const orders = ordersRes.data || [];
        
        const hasOrder = orders.some(
          (o: any) => o.productId === productId && o.status === "COMPLETED"
        );
        const isSeller = prodRes.data.sellerId === user?.id;

        if (hasOrder || isSeller) {
          setPurchased(true);
        }
      } catch (err: any) {
        console.error("Failed to load video product/orders:", err);
        setError("This secure video stream could not be validated or is unavailable.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    } else if (!authLoading) {
      router.push(`/login?redirect=/marketplace/viewer/video?id=${productId}`);
    }
  }, [productId, user, authLoading, router]);



  const PREVIEW_LIMIT_SECS = 300; // 5 minutes
  const activeLesson = SYLLABUS_LESSONS.find(l => l.id === currentLessonId) || SYLLABUS_LESSONS[0];
  const baseDuration = realVideoUrl && videoDuration ? Math.floor(videoDuration) : parseDuration(activeLesson.duration);
  const totalLessonSecs = isPreview ? Math.min(PREVIEW_LIMIT_SECS, baseDuration) : baseDuration;

  // Ticking timeline clock (for fallback simulation mode only)
  useEffect(() => {
    if (realVideoUrl) return;
    let t: any;
    if (playing && !expired && !focusLost) {
      t = setInterval(() => {
        setElapsed(e => {
          const next = e + 1;
          if (isPreview && next >= PREVIEW_LIMIT_SECS) {
            setPlaying(false);
            setExpired(true);
            return PREVIEW_LIMIT_SECS;
          }
          if (next >= totalLessonSecs) {
            setPlaying(false);
            return totalLessonSecs;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(t);
  }, [playing, expired, isPreview, totalLessonSecs, focusLost, realVideoUrl, PREVIEW_LIMIT_SECS]);

  // Create / setup hidden video element
  useEffect(() => {
    if (typeof window === "undefined") return;
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.playsInline = true;
    videoRef.current = video;

    return () => {
      video.pause();
      video.src = "";
      video.load();
      videoRef.current = null;
    };
  }, []);

  // Synchronize source when realVideoUrl changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (realVideoUrl) {
      video.src = realVideoUrl;
      video.load();
      setElapsed(0);
      setExpired(false);
    } else {
      video.src = "";
    }
  }, [realVideoUrl]);

  // Update video duration state on load
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setVideoDuration(video.duration);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, []);

  // Sync volume, speed
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !realVideoUrl) return;
    video.volume = volume / 100;
  }, [volume, realVideoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !realVideoUrl) return;
    video.playbackRate = speed;
  }, [speed, realVideoUrl]);

  // Sync play/pause of hidden video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !realVideoUrl) return;

    if (playing && !expired && !focusLost) {
      video.play().catch(err => {
        console.error("Error playing video:", err);
      });
    } else {
      video.pause();
    }
  }, [playing, expired, focusLost, realVideoUrl]);

  // Sync elapsed with real video currentTime via timeupdate
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !realVideoUrl) return;

    const handleTimeUpdate = () => {
      const current = Math.floor(video.currentTime);
      setElapsed(current);

      // Check preview limit
      if (isPreview && current >= PREVIEW_LIMIT_SECS) {
        setPlaying(false);
        setExpired(true);
        video.pause();
      }
      
      // Check normal end
      if (current >= totalLessonSecs) {
        setPlaying(false);
        video.pause();
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [realVideoUrl, isPreview, totalLessonSecs, PREVIEW_LIMIT_SECS]);

  // Shifting Mobile Watermark overlay coordinates every 10 seconds
  useEffect(() => {
    const t = setInterval(() => {
      setWmIndex(i => (i + 1) % WATERMARK_POSITIONS.length);
    }, 10000);
    return () => clearInterval(t);
  }, []);

  // 🛡️ DRM Event Listeners: Focus Loss & Keyboard PrintScreen
  useEffect(() => {
    const handleBlur = () => {
      setFocusLost(true);
      setPlaying(false); // Pause video on focus loss!
    };
    const handleFocus = () => setFocusLost(false);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        e.preventDefault();
        setClipboardAttacked(true);
        setPlaying(false);
        navigator.clipboard?.writeText("🔒").catch(() => {});
        setTimeout(() => setClipboardAttacked(false), 2200);
      }

      if ((e.ctrlKey || e.metaKey) && ["c", "p", "s", "x"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  // Fullscreen controller
  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {});
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {});
    }
  };

  // 60FPS Quantum Physics Canvas Simulator Lecture Player
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = 854);
    let height = (canvas.height = 480);
    let waveOffset = 0;

    const render = () => {
      const video = videoRef.current;
      if (realVideoUrl && video && video.readyState >= 2) {
        ctx.drawImage(video, 0, 0, width, height);
      } else {
        ctx.clearRect(0, 0, width, height);

        // Deep dark cosmic space background
        const grad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width / 1.3);
        grad.addColorStop(0, "#0e1329");
        grad.addColorStop(1, "#020308");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Render cosmic background stars
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        for (let i = 0; i < 30; i++) {
          const x = (i * 143) % width;
          const y = (i * 97) % height;
          const radius = i % 4 === 0 ? 1.5 : 0.8;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw lecture topic metadata text on canvas (watermarking the frame itself)
        ctx.font = "bold 13px 'JetBrains Mono', monospace";
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        ctx.fillText(`TOPIC: ${activeLesson.title.toUpperCase()}`, 30, 42);
        ctx.fillText(`STATUS: PLATFORM SECURED`, 30, 62);
        ctx.fillText(`TIME: ${formatTime(elapsed)} / ${activeLesson.duration}`, 30, 82);

        // Animated physics wavepackets (only animate when playing)
        if (playing) {
          waveOffset += 0.05 * speed;
        }

        // Schrödinger wavefunction calculations
        const points: { x: number; y: number }[] = [];
        const waveType = activeLesson.topic;

        for (let x = 0; x < width; x++) {
          let y = height / 2;

          if (waveType === "intro" || waveType === "math") {
            // Simple superposed sinewaves
            y += Math.sin(x * 0.015 - waveOffset) * 45;
            y += Math.cos(x * 0.035 + waveOffset * 0.5) * 15;
          } else if (waveType === "wave") {
            // Dynamic amplitude modulated wavepacket
            const envelope = Math.exp(-Math.pow((x - width / 2) / 140, 2));
            y += envelope * Math.sin(x * 0.09 - waveOffset * 1.5) * 80;
          } else if (waveType === "schrodinger" || waveType === "well") {
            // Quantized standing wave solution
            const envelope = Math.sin((x / width) * Math.PI);
            y += Math.pow(envelope, 2) * Math.sin(x * 0.06 - waveOffset * 1.2) * 90;
          } else {
            // Tunneling quantum barrier penetration simulation
            const barrierX = width / 2;
            if (x < barrierX) {
              // Incoming wave
              y += Math.sin(x * 0.035 - waveOffset * 1.4) * 55;
            } else if (x >= barrierX && x < barrierX + 60) {
              // Decaying wave inside potential barrier
              const decay = Math.exp(-(x - barrierX) * 0.04);
              y += decay * Math.sin(x * 0.015 - waveOffset * 0.4) * 55;
            } else {
              // Transmitted lower-amplitude wave
              const scale = Math.exp(-60 * 0.04);
              y += scale * Math.sin(x * 0.035 - waveOffset * 1.4) * 55;
            }
          }
          points.push({ x, y });
        }

        // Draw mathematical potential barrier if tunneling
        if (waveType === "tunnel") {
          ctx.fillStyle = "rgba(239, 68, 68, 0.15)";
          ctx.strokeStyle = "rgba(239, 68, 68, 0.5)";
          ctx.lineWidth = 2;
          ctx.fillRect(width / 2, height / 2 - 100, 60, 200);
          ctx.strokeRect(width / 2, height / 2 - 100, 60, 200);
          ctx.fillStyle = "#EF4444";
          ctx.font = "9px 'JetBrains Mono', monospace";
          ctx.fillText("POTENTIAL BARRIER V(x)", width / 2 - 40, height / 2 - 110);
        }

        // Render the primary wavefunction trace curve
        ctx.beginPath();
        ctx.strokeStyle = waveType === "tunnel" ? "#10B981" : "#4F8EF7";
        ctx.lineWidth = 3;
        ctx.lineJoin = "round";

        if (points.length > 0) {
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
          }
        }
        ctx.stroke();

        // Render probability distribution fill underneath
        if (points.length > 0) {
          ctx.beginPath();
          ctx.moveTo(points[0].x, height / 2);
          for (let i = 0; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
          }
          ctx.lineTo(points[points.length - 1].x, height / 2);
          ctx.closePath();
          const fillGrad = ctx.createLinearGradient(0, height / 2 - 80, 0, height / 2 + 80);
          fillGrad.addColorStop(0, "rgba(79, 142, 247, 0.12)");
          fillGrad.addColorStop(1, "rgba(79, 142, 247, 0.0)");
          ctx.fillStyle = fillGrad;
          ctx.fill();
        }

        // Draw base horizontal axis
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        // Render mathematical formula equation visual on board
        ctx.fillStyle = "rgba(79, 142, 247, 0.85)";
        ctx.font = "italic 16px 'Sora', sans-serif";
        let boardEquation = "iℏ ∂Ψ/∂t = ĤΨ";
        if (waveType === "wave") boardEquation = "Ψ(x,t) = Ae^(i(kx-ωt))";
        if (waveType === "schrodinger") boardEquation = "Ĥ = -ℏ²/(2m) ∇² + V";
        ctx.fillText(boardEquation, width - 200, 50);
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [activeLesson, playing, speed, realVideoUrl]);

  // Handle outline lesson switching (Check purchase rules)
  const handleLessonClick = (id: number) => {
    const isLockedInPreview = isPreview && id > 1;
    if (isLockedInPreview) {
      setPlaying(false);
      setExpired(true); // Fire up the paywall overlay
      return;
    }
    setCurrentLessonId(id);
    setElapsed(0);
    setExpired(false);
  };

  // Seek timeline click handler
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (expired) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const targetTime = Math.floor(pos * totalLessonSecs);
    setElapsed(targetTime);
    if (videoRef.current && realVideoUrl) {
      videoRef.current.currentTime = targetTime;
    }
  };

  // Loading indicator
  if (authLoading || loading) {
    return (
      <div style={{ background: "#0A0E1A", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{ width: 44, height: 44, border: "3px solid #1f2937", borderTopColor: "#10B981", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#9CA3AF" }}>Checking access credentials...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // Error block
  if (error || !product) {
    return (
      <div style={{ background: "#0A0E1A", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
        <div style={{ fontSize: 48 }}>🛡️</div>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: "#fff" }}>Resource Denied</h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#9CA3AF", textAlign: "center", maxWidth: 400, marginTop: -8 }}>
          {error || "Verify product authorization criteria. Purchases are secured under university guidelines."}
        </p>
        <Link href="/marketplace" style={{ textDecoration: "none" }}>
          <button style={{ height: 38, padding: "0 20px", borderRadius: 8, background: "#10B981", border: "none", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
            Back to Marketplace
          </button>
        </Link>
      </div>
    );
  }

  const watermarkUser = user?.name || " rahul.sharma";
  const watermarkEmail = user?.email || "student@campusconnect.in";
  const progressPercent = Math.min((elapsed / totalLessonSecs) * 100, 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#060913", overflow: "hidden", position: "relative" }}>
      <style>{`
        .video-watermark-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          color: #ffffff;
        }
        .drm-long-text {
          display: inline;
        }
        .drm-short-text {
          display: none;
        }

        @media (max-width: 900px) {
          .video-workspace-grid {
            grid-template-columns: 100% !important;
            display: flex !important;
            flex-direction: column !important;
          }
          .video-sidebar {
            border-left: none !important;
            border-top: 1px solid #1b233a !important;
            height: auto !important;
            max-height: 450px !important;
            flex-shrink: 0 !important;
          }
          .video-player-pane {
            padding: 12px 12px 16px !important;
          }
        }

        @media (max-width: 768px) {
          .video-header {
            height: auto !important;
            flex-direction: column !important;
            padding: 12px 16px !important;
            gap: 10px !important;
            align-items: stretch !important;
          }
          .video-header-left {
            justify-content: space-between !important;
            width: 100% !important;
            display: flex !important;
            align-items: center !important;
          }
          .video-header-center {
            text-align: left !important;
            width: 100% !important;
          }
          .video-header-right {
            display: none !important;
          }
          .video-trace-bar {
            flex-direction: row !important;
            height: 46px !important;
            padding: 0 16px !important;
            justify-content: center !important;
            align-items: center !important;
          }
          .video-badge-container {
            display: none !important;
          }
          .drm-long-text {
            display: none !important;
          }
          .drm-short-text {
            display: inline !important;
            font-size: 11px !important;
            white-space: nowrap !important;
          }
        }

        @media (max-width: 480px) {
          .video-volume-slider {
            display: none !important;
          }
        }
      `}</style>

      {/* ─── DRM BLUR BLACKOUT OVERLAY (FOCUS LOST) ─── */}
      {focusLost && (
        <div style={{
          position: "fixed", inset: 0, background: "#060913", zIndex: 9999,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          color: "#fff", gap: 16, textAlign: "center", padding: 24
        }}>
          <ShieldAlert size={56} style={{ color: "#EF4444" }} />
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: "#EF4444" }}>
            🔒 DRM PLAYBACK SUSPENDED
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#9CA3AF", fontSize: 13, maxWidth: 440, lineHeight: 1.7 }}>
            External screen recorder, screenshot software, or screen sharing active.
            CampusConnect security rules prohibit recording or copying this academic content. 
            <br />
            <strong style={{ color: "#10B981", marginTop: 8, display: "block" }}>
              Click back inside this tab to resume video lecture.
            </strong>
          </p>
        </div>
      )}

      {/* ─── CLIPBOARD / PRINTSCREEN BLACKOUT OVERLAY ─── */}
      {clipboardAttacked && (
        <div style={{
          position: "fixed", inset: 0, background: "#000000", zIndex: 10000,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          color: "#fff", gap: 12
        }}>
          <ShieldAlert size={64} style={{ color: "#EF4444", animation: "pulse 1s infinite" }} />
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, color: "#EF4444" }}>
            SCREENSHOT ACTION NEUTRALIZED
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#9CA3AF", fontSize: 14 }}>
            System screenshot utilities have been blocked. Clipboard contents wiped.
          </p>
        </div>
      )}

      {/* ─── NAVBAR ─── */}
      <header className="video-header" style={{
        height: 60, background: "#0a0d1a", borderBottom: "1.5px solid #1b233a",
        display: "flex", alignItems: "center", padding: "0 24px", gap: 20, flexShrink: 0, zIndex: 100
      }}>
        <div className="video-header-left" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Back Link */}
          <Link href={`/marketplace/digital/${productId}`} style={{
            display: "flex", alignItems: "center", gap: 6,
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#9CA3AF",
            textDecoration: "none",
          }}>
            <ChevronLeft size={16} />
            {isPreview ? "Exit Preview" : "Exit Course"}
          </Link>

          {/* Status Badges */}
          {isPreview ? (
            <div style={{
              background: "rgba(245,158,11,0.12)", border: "1.5px solid rgba(245,158,11,0.3)",
              borderRadius: 9999, padding: "4px 14px",
              fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#F59E0B",
              display: "flex", alignItems: "center", gap: 6
            }}>
              <Lock size={12} /> DEMO PREVIEW MODE
            </div>
          ) : (
            <div style={{
              background: "rgba(16,185,129,0.12)", border: "1.5px solid rgba(16,185,129,0.3)",
              borderRadius: 9999, padding: "4px 14px",
              fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#10B981",
              display: "flex", alignItems: "center", gap: 6
            }}>
              🛡️ SECURED CLASSROOM
            </div>
          )}
        </div>

        {/* Center Details */}
        <div style={{ flex: 1, textAlign: "center" }} className="video-header-center">
          <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "#F0F4FF" }} className="video-header-title">
            {product.title}
          </p>
        </div>

        {/* Security / User profile */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }} className="video-header-right">
          <Bell size={17} style={{ color: "#6B7280", cursor: "pointer" }} />
          <div style={{
            width: 32, height: 32, borderRadius: "50%", background: "#10B981",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <User size={15} style={{ color: "#fff" }} />
          </div>
        </div>
      </header>

      {/* Preview remaining time track progress bar */}
      {isPreview && (
        <div style={{ height: 4, background: "#1b233a", flexShrink: 0, position: "relative" }}>
          <div style={{
            height: "100%",
            width: `${((PREVIEW_LIMIT_SECS - Math.max(0, PREVIEW_LIMIT_SECS - elapsed)) / PREVIEW_LIMIT_SECS) * 100}%`,
            background: expired
              ? "#EF4444"
              : `linear-gradient(90deg, #10B981 ${100 - (Math.max(0, PREVIEW_LIMIT_SECS - elapsed) / PREVIEW_LIMIT_SECS) * 100}%, #F59E0B)`,
            transition: "width 1s linear",
          }} />
        </div>
      )}

      {/* ─── MAIN WORKSPACE GRID (75/25 Layout) ─── */}
      <div className="video-workspace-grid" style={{ display: "grid", gridTemplateColumns: "1fr 310px", flex: 1, minHeight: 0 }}>

        {/* LEFT WORKSPACE — Video player & Active details */}
        <div className="video-player-pane" style={{ display: "flex", flexDirection: "column", padding: "24px 24px 16px", overflowY: "auto" }}>

          {/* HTML5 SECURE CUSTOM PLAYER FRAME */}
          <div
            ref={playerContainerRef}
            style={{
              position: "relative", width: "100%", aspectRatio: "16/9",
              borderRadius: 12, overflow: "hidden", background: "#000",
              boxShadow: "0 12px 48px rgba(0,0,0,0.7)", marginBottom: 16, flexShrink: 0,
            }}
          >
            {/* The Simulation Screen */}
            <canvas
              ref={canvasRef}
              style={{
                width: "100%", height: "100%", display: "block"
              }}
            />

            {/* DYNAMIC SHIFTING WATERMARK OVERLAY */}
            <div style={{
              position: "absolute",
              ...WATERMARK_POSITIONS[wmIndex],
              pointerEvents: "none", userSelect: "none",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10, color: "rgba(255, 255, 255, 0.45)",
              background: "rgba(0, 0, 0, 0.5)", borderRadius: 6,
              border: "1px solid rgba(255, 255, 255, 0.08)",
              padding: "5px 10px",
              transition: "all 0.5s ease-in-out",
              zIndex: 25,
              whiteSpace: "nowrap"
            }}>
              🔑 {watermarkEmail} ({watermarkUser}) • CampusConnect DRM
            </div>

            {/* Countdown Badge in Preview Mode */}
            {isPreview && !expired && (
              <div style={{
                position: "absolute", top: 16, right: 16,
                background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
                borderRadius: 8, padding: "6px 14px",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
                color: (PREVIEW_LIMIT_SECS - elapsed) < 60 ? "#EF4444" : "#F59E0B",
                fontWeight: 700,
                border: `1.5px solid ${(PREVIEW_LIMIT_SECS - elapsed) < 60 ? "rgba(239,68,68,0.4)" : "rgba(245,158,11,0.4)"}`,
                transition: "all 0.3s",
                zIndex: 25
              }}>
                ⏱ Preview remaining: {formatTime(Math.max(0, PREVIEW_LIMIT_SECS - elapsed))}
              </div>
            )}

            {/* Paywall Overlay inside player container when preview expired */}
            {expired && (
              <VideoPaywall 
                productTitle={product.title} 
                price={product.price} 
                productId={productId} 
              />
            )}

            {/* CUSTOM INTERACTIVE CONTROL BAR */}
            {!expired && (
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                height: 70,
                background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)",
                display: "flex", flexDirection: "column", justifyContent: "flex-end",
                padding: "0 18px 12px", zIndex: 28,
              }}>
                {/* Seek Timeline Track */}
                <div 
                  onClick={handleSeek}
                  style={{
                    height: 5, background: "rgba(255,255,255,0.2)",
                    borderRadius: 9999, marginBottom: 12, position: "relative", cursor: "pointer"
                  }}
                >
                  <div style={{
                    height: "100%", width: `${progressPercent}%`,
                    background: isPreview ? "#F59E0B" : "#10B981",
                    borderRadius: 9999
                  }} />
                  <div style={{
                    position: "absolute", left: `${progressPercent}%`, top: -3,
                    width: 11, height: 11, borderRadius: "50%",
                    background: isPreview ? "#F59E0B" : "#10B981",
                    transform: "translateX(-50%)",
                    boxShadow: "0 0 8px rgba(0,0,0,0.5)"
                  }} />
                </div>

                {/* Control Action Buttons */}
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  {/* Play/Pause */}
                  <button
                    onClick={() => setPlaying(p => !p)}
                    style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center" }}
                  >
                    {playing ? <Pause size={18} /> : <Play size={18} />}
                  </button>

                  {/* Volume Slider */}
                  <div className="video-volume-slider" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Volume2 size={16} style={{ color: "#d1d5db" }} />
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={volume}
                      onChange={e => setVolume(parseInt(e.target.value))}
                      style={{ width: 60, accentColor: "#10B981", cursor: "pointer", height: 3 }} 
                    />
                  </div>

                  {/* Clock readout */}
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#d1d5db" }}>
                    {formatTime(elapsed)} / {formatTime(totalLessonSecs)}
                  </span>

                  <div style={{ flex: 1 }} />

                  {/* Speed Selector */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "2px 8px" }}>
                    <Settings size={12} style={{ color: "#8E9AA8" }} />
                    <select
                      value={speed}
                      onChange={e => setSpeed(parseFloat(e.target.value))}
                      style={{ background: "none", border: "none", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 11, cursor: "pointer", outline: "none" }}
                    >
                      <option value="0.75" style={{ background: "#0a0d1a" }}>0.75x</option>
                      <option value="1.0" style={{ background: "#0a0d1a" }}>1.0x (Normal)</option>
                      <option value="1.25" style={{ background: "#0a0d1a" }}>1.25x</option>
                      <option value="1.5" style={{ background: "#0a0d1a" }}>1.5x</option>
                      <option value="2.0" style={{ background: "#0a0d1a" }}>2.0x</option>
                    </select>
                  </div>

                  {/* Maximize Frame */}
                  <button
                    onClick={toggleFullscreen}
                    style={{ background: "none", border: "none", color: "#d1d5db", cursor: "pointer" }}
                    title="Fullscreen"
                  >
                    <Maximize2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Lesson description details panel */}
          <div style={{
            background: "#0d1120", border: "1.5px solid #1b233a",
            borderRadius: 12, padding: "20px 24px", marginBottom: 16,
          }}>
            <span style={{
              background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
              color: "#10B981", borderRadius: 6, padding: "2px 8px", 
              fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.5px"
            }}>
              Now Streaming: Lesson {currentLessonId}
            </span>

            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: "#F0F4FF", margin: "10px 0 6px" }}>
              {activeLesson.title}
            </h2>
            
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#9CA3AF",
              lineHeight: 1.7, marginBottom: 14, textAlign: "justify"
            }}>
              {isPreview
                ? "You are playing in free preview mode. Get complete course access to download standard slide notes, mathematical homework sheets, source simulators, and interactive lessons."
                : "This masterclass session models quantum structures directly on your browser canvas. Analyze how parameters inside the Schrödinger Equation interact with finite potentials and tunneling barriers in the graphical lecture above."}
            </p>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["SECURED HTML5 STREAM", "SCHRÖDINGER SIM", "INTERACTIVE LAB"].map(t => (
                <span key={t} style={{
                  background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)",
                  borderRadius: 6, padding: "3px 10px",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, color: "#8E9AA8",
                  letterSpacing: "0.5px",
                }}>{t}</span>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT OUTLINE DRAWER — Course Syllabus Lessons */}
        <div className="video-sidebar" style={{
          background: "#0a0d1a", borderLeft: "1px solid #1b233a",
          display: "flex", flexDirection: "column", overflowY: "auto",
        }}>
          {/* Header title */}
          <div style={{ padding: "20px 20px 14px", borderBottom: "1px solid #1b233a" }}>
            <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 800, color: "#F0F4FF", letterSpacing: "0.5px" }}>
              COURSE SYLLABUS
            </p>
            {isPreview && (
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#F59E0B", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                <Lock size={9} /> Clicks on lessons 2+ are locked
              </p>
            )}
          </div>

          {/* Clicks list */}
          <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
            {SYLLABUS_LESSONS.map(l => {
              const lockedInPreview = isPreview && l.id > 1;
              const isCurrent = l.id === currentLessonId;

              return (
                <div
                  key={l.id}
                  onClick={() => handleLessonClick(l.id)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 8,
                    background: isCurrent && !lockedInPreview 
                      ? "rgba(16,185,129,0.08)" 
                      : "rgba(255,255,255,0.02)",
                    border: `1.5px solid ${isCurrent && !lockedInPreview ? "rgba(16,185,129,0.25)" : "transparent"}`,
                    cursor: lockedInPreview ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    opacity: lockedInPreview ? 0.45 : 1,
                    transition: "all 0.15s ease",
                  }}
                >
                  {/* YouTube style Video Thumbnail */}
                  <div style={{
                    width: 90,
                    height: 52,
                    borderRadius: 6,
                    background: "#0d0f1a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    flexShrink: 0,
                    overflow: "hidden",
                    border: "1.5px solid rgba(255, 255, 255, 0.08)",
                  }}>
                    {/* Lesson Index Tag */}
                    <span style={{
                      position: "absolute",
                      top: 4,
                      left: 4,
                      background: "rgba(0,0,0,0.6)",
                      padding: "1px 4px",
                      borderRadius: 3,
                      fontSize: 8,
                      color: "#fff",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 700,
                    }}>L{l.id}</span>
                    
                    {lockedInPreview ? (
                      <Lock size={14} style={{ color: "#9CA3AF" }} />
                    ) : isCurrent ? (
                      <Play size={14} style={{ color: "#10B981" }} />
                    ) : (
                      <CheckCircle size={14} style={{ color: "#3B82F6" }} />
                    )}

                    {/* Time duration badge */}
                    <span style={{
                      position: "absolute",
                      bottom: 4,
                      right: 4,
                      background: "rgba(0,0,0,0.75)",
                      padding: "1px 4px",
                      borderRadius: 3,
                      fontSize: 8,
                      color: "#fff",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 700,
                    }}>{l.duration}</span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 12,
                      fontWeight: isCurrent && !lockedInPreview ? 700 : 500,
                      color: isCurrent && !lockedInPreview ? "#F0F4FF" : "#9CA3AF",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                      {l.title}
                    </p>
                    <p style={{ fontSize: 10, color: "#4B5563", marginTop: 2 }}>
                      {lockedInPreview ? "Premium Lecture" : "Ready to play"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Secure Purchase bottom lock wall */}
          {isPreview && (
            <div style={{ padding: "16px 12px", borderTop: "1px solid #1b233a" }}>
              <Link href={`/marketplace/digital/${productId}`} style={{ textDecoration: "none" }}>
                <button style={{
                  width: "100%", height: 42, borderRadius: 8,
                  background: "rgba(16,185,129,0.1)", border: "1.5px solid rgba(16,185,129,0.3)",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: "#10B981",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  boxShadow: "0 2px 10px rgba(16,185,129,0.05)"
                }}>
                  🔓 Buy & Unlock Course Pack
                </button>
              </Link>
            </div>
          )}

          {/* Secure Course Attachments */}
          <div style={{ padding: "16px 20px", borderTop: "1px solid #1b233a" }}>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 800,
              letterSpacing: "1px", color: "#8E9AA8", marginBottom: 10,
            }}>COURSE DOWNLOADS</p>
            {[
              { icon: "📄", label: "Lecture Slides Notes", locked: isPreview },
              { icon: "🧪", label: "Interactive Simulation Lab", locked: isPreview },
            ].map((r, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 0",
                borderBottom: "1px solid #1b233a",
                opacity: r.locked ? 0.35 : 1,
              }}>
                <span style={{ fontSize: 14 }}>{r.locked ? "🔒" : r.icon}</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#9CA3AF" }}>{r.label}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ─── BOTTOM TRACEABLE META SECURITY BAR ─── */}
      {!isPreview && (
        <div className="video-trace-bar" style={{
          flexShrink: 0, padding: "12px 28px",
          background: "#10B981",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          zIndex: 90
        }}>
          <p className="video-watermark-text" style={{ margin: 0, letterSpacing: "0.2px" }}>
            <span className="drm-long-text">
              🛡️ <strong>Traceable DRM Active:</strong> Unauthorized video streams recording is strictly traceable to: <strong>{watermarkEmail} ({watermarkUser})</strong>.
            </span>
            <span className="drm-short-text">
              🛡️ Traceable DRM: <strong>{watermarkEmail} ({watermarkUser})</strong>
            </span>
          </p>
          <div className="video-badge-container" style={{ display: "flex", gap: 20 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>
              VERIFIED ENROLLMENT ACCESS
            </span>
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
      <div style={{ background: "#0A0E1A", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#9CA3AF" }}>Decrypting server stream...</p>
      </div>
    }>
      <VideoViewerInner />
    </Suspense>
  );
}
