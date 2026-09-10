"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Lock,
  ShoppingCart, ShieldAlert, Eye, FileText, Download, CheckCircle,
  Loader2, RefreshCw, AlertCircle, FileX
} from "lucide-react";
import api, { getApiBaseUrl } from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

/* ─── Realistic Document Skeleton Loader Component ────────────────────────── */
function PdfDocumentSkeleton({
  pageNum,
  zoom,
  isFirstPage = false,
  statusMessage = "Loading document pages...",
}: {
  pageNum: number;
  zoom: number;
  isFirstPage?: boolean;
  statusMessage?: string;
}) {
  return (
    <div
      className="pdf-document-card pdf-skeleton-card"
      style={{
        background: "#ffffff",
        width: `min(100%, ${(640 * zoom) / 100}px)`,
        maxWidth: "100%",
        boxSizing: "border-box",
        borderRadius: 8,
        boxShadow: "0 12px 60px rgba(0, 0, 0, 0.8)",
        position: "relative",
        overflow: "hidden",
        minHeight: `${Math.max(680, (820 * zoom) / 100)}px`,
        marginBottom: 20,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "44px 50px",
        userSelect: "none",
      }}
    >
      <div>
        {/* Document Header Skeleton */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            borderBottom: "1.5px solid #f1f5f9",
            paddingBottom: 12,
          }}
        >
          <div className="doc-shimmer" style={{ width: 140, height: 12, borderRadius: 4 }} />
          <div className="doc-shimmer" style={{ width: 80, height: 12, borderRadius: 4 }} />
        </div>

        {/* Title Bar Skeleton */}
        <div style={{ marginBottom: 24 }}>
          <div className="doc-shimmer" style={{ width: "72%", height: 22, borderRadius: 6, marginBottom: 10 }} />
          <div className="doc-shimmer" style={{ width: "45%", height: 14, borderRadius: 4 }} />
        </div>

        {/* Paragraph 1 Skeleton */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          <div className="doc-shimmer" style={{ width: "100%", height: 11, borderRadius: 3 }} />
          <div className="doc-shimmer" style={{ width: "97%", height: 11, borderRadius: 3 }} />
          <div className="doc-shimmer" style={{ width: "92%", height: 11, borderRadius: 3 }} />
          <div className="doc-shimmer" style={{ width: "76%", height: 11, borderRadius: 3 }} />
        </div>

        {/* Diagram / Box / Equation Placeholder */}
        <div
          style={{
            background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
            border: "1.5px dashed #cbd5e1",
            borderRadius: 12,
            padding: "26px 20px",
            marginBottom: 28,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <div className="doc-shimmer" style={{ width: 42, height: 42, borderRadius: 8 }} />
          <div className="doc-shimmer" style={{ width: "55%", height: 12, borderRadius: 4 }} />
        </div>

        {/* Paragraph 2 Skeleton */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          <div className="doc-shimmer" style={{ width: "98%", height: 11, borderRadius: 3 }} />
          <div className="doc-shimmer" style={{ width: "94%", height: 11, borderRadius: 3 }} />
          <div className="doc-shimmer" style={{ width: "88%", height: 11, borderRadius: 3 }} />
          <div className="doc-shimmer" style={{ width: "62%", height: 11, borderRadius: 3 }} />
        </div>
      </div>

      {/* Document Footer Skeleton */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1.5px solid #f1f5f9",
          paddingTop: 16,
          marginTop: 20,
        }}
      >
        <div className="doc-shimmer" style={{ width: 130, height: 10, borderRadius: 3 }} />
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#94a3b8", fontWeight: 700 }}>
          PAGE {pageNum}
        </div>
      </div>

      {/* Floating Centerpiece Indicator on the Primary Loading Page */}
      {isFirstPage && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(10, 14, 26, 0.92)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(139, 92, 246, 0.4)",
            borderRadius: 16,
            padding: "26px 36px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
            zIndex: 30,
            maxWidth: "88%",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "rgba(139, 92, 246, 0.15)",
              border: "1.5px solid rgba(139, 92, 246, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px rgba(139,92,246,0.25)",
            }}
          >
            <Loader2 size={24} className="animate-spin" style={{ color: "#A78BFA" }} />
          </div>
          <h4
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: 16,
              fontWeight: 700,
              color: "#F0F4FF",
              margin: 0,
            }}
          >
            Loading Document...
          </h4>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              color: "#94A3B8",
              margin: 0,
            }}
          >
            {statusMessage}
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── PDF Error State Card ────────────────────────────────────────────────── */
function PdfErrorCard({
  message,
  onRetry,
  productId,
}: {
  message: string;
  onRetry: () => void;
  productId: string;
}) {
  return (
    <div
      style={{
        background: "rgba(15, 23, 42, 0.92)",
        border: "1px solid rgba(239, 68, 68, 0.35)",
        borderRadius: 16,
        padding: "36px 32px",
        maxWidth: 480,
        width: "92%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 16,
        boxShadow: "0 16px 50px rgba(0, 0, 0, 0.6)",
        marginTop: 40,
        userSelect: "none",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "rgba(239, 68, 68, 0.15)",
          border: "2px solid rgba(239, 68, 68, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AlertCircle size={28} style={{ color: "#EF4444" }} />
      </div>

      <h3
        style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 18,
          fontWeight: 700,
          color: "#F87171",
          margin: 0,
        }}
      >
        Unable to Load Document
      </h3>

      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: "#94A3B8",
          lineHeight: 1.6,
          margin: 0,
          maxWidth: 380,
        }}
      >
        {message || "We could not retrieve or decrypt the document file. Please check your network connection or try again."}
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={onRetry}
          style={{
            height: 38,
            padding: "0 18px",
            borderRadius: 8,
            background: "#8B5CF6",
            border: "none",
            color: "#ffffff",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "0 4px 14px rgba(139, 92, 246, 0.35)",
          }}
        >
          <RefreshCw size={14} /> Retry Loading
        </button>

        <Link href={`/marketplace/digital/${productId}`} style={{ textDecoration: "none" }}>
          <button
            style={{
              height: 38,
              padding: "0 18px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#E2E8F0",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Product Details
          </button>
        </Link>
      </div>
    </div>
  );
}

/* ─── Paywall overlay ──────────────────────────────────── */
function PaywallOverlay({ productTitle, price, productId }: { productTitle: string; price: number; productId: string }) {
  return (
    <div style={{
      position: "absolute", inset: 0,
      backdropFilter: "blur(12px)",
      background: "rgba(10,14,26,0.85)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 16, padding: 32, zIndex: 20,
      borderRadius: 4,
    }}>
      {/* lock icon */}
      <div style={{
        width: 68, height: 68, borderRadius: "50%",
        background: "rgba(139,92,246,0.15)",
        border: "2px solid rgba(139,92,246,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 20px rgba(139,92,246,0.2)"
      }}>
        <Lock size={30} style={{ color: "#A78BFA" }} />
      </div>
      <h3 style={{
        fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800,
        color: "#F0F4FF", textAlign: "center",
      }}>
        Free Preview Ended
      </h3>
      <p style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#9CA3AF",
        textAlign: "center", maxWidth: 360, lineHeight: 1.7,
      }}>
        You are viewing a <strong style={{ color: "#A78BFA" }}>free demo access</strong>.
        Purchase this digital pack to unlock all pages, high-resolution downloads, and supplementary notes.
      </p>

      {/* price badge */}
      <div style={{
        background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)",
        borderRadius: 9999, padding: "8px 24px",
        fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: "#F0F4FF",
        marginTop: 4
      }}>₹{price}</div>

      {/* CTA */}
      <Link href={`/marketplace/digital/${productId}`} style={{ textDecoration: "none", width: "100%", maxWidth: 260 }}>
        <button style={{
          height: 46, width: "100%", borderRadius: 9999,
          background: "#8B5CF6", border: "none", cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: "#fff",
          boxShadow: "0 4px 20px rgba(139,92,246,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          transition: "transform 0.15s"
        }} onMouseOver={e => e.currentTarget.style.transform = "scale(1.02)"} onMouseOut={e => e.currentTarget.style.transform = "scale(1.0)"}>
          <ShoppingCart size={15} /> Purchase Document Pack
        </button>
      </Link>

      <Link href={`/marketplace/digital/${productId}`} style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6B7280",
        textDecoration: "none", marginTop: 8
      }}>
        ← Return to product details
      </Link>
    </div>
  );
}

const isDocumentUrl = (url: string) => {
  if (!url) return false;
  const cleanUrl = url.split("?")[0].toLowerCase();
  const ext = cleanUrl.substring(cleanUrl.lastIndexOf(".") + 1);
  return ["pdf", "doc", "docx", "ppt", "pptx", "txt"].includes(ext) || cleanUrl.includes("pdf") || cleanUrl.includes("document") || cleanUrl.includes("notes");
};

const getFileUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const baseUrl = getApiBaseUrl();
  return `${baseUrl.replace(/\/$/, "")}${url}`;
};

function getOriginalFileName(url: string, fallbackTitle?: string, defaultPrefix = "Document"): string {
  if (!url) return fallbackTitle || defaultPrefix;
  try {
    const cleanUrl = url.split("?")[0];
    const rawFileName = cleanUrl.substring(cleanUrl.lastIndexOf("/") + 1);
    if (!rawFileName) return fallbackTitle || defaultPrefix;

    let displayName = decodeURIComponent(rawFileName);

    // Strip upload field prefixes & timestamps
    displayName = displayName.replace(/^(documents|videos|images|media|file|thumbnail|thumbnails)[-_]/i, "");
    displayName = displayName.replace(/^(\d+[-_]|file[-\d]+[-_])/, "");

    // Check if filename is a raw UUID (e.g. d7f9f850-763e-45dc-b401-f7ofb1bf3b1c.pdf)
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

/* ─── PDF page renderer canvas component ─── */
function PdfPageCanvas({ pdfDocument, pageNum, zoom, watermarkUser, watermarkEmail }: {
  pdfDocument: any;
  pageNum: number;
  zoom: number;
  watermarkUser: string;
  watermarkEmail: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState(false);
  const [pageRendering, setPageRendering] = useState(true);
  const renderTaskRef = useRef<any>(null);

  useEffect(() => {
    if (!pdfDocument || !canvasRef.current) return;
    let active = true;
    setPageRendering(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Cancel any active render task on this canvas before starting a new one
    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch (err) {
        console.error("Cancel failed", err);
      }
      renderTaskRef.current = null;
    }

    pdfDocument.getPage(pageNum).then((pdfPage: any) => {
      if (!active) return;
      const isMobile = typeof window !== "undefined" && (window.innerWidth <= 768 || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
      const scaleMultiplier = isMobile ? 1.3 : 1.5;
      const viewport = pdfPage.getViewport({ scale: (zoom / 100) * scaleMultiplier });
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
      };

      const renderTask = pdfPage.render(renderContext);
      renderTaskRef.current = renderTask;

      renderTask.promise.then(() => {
        if (active) {
          renderTaskRef.current = null;
          setPageRendering(false);
        }
      }).catch((err: any) => {
        if (err.name !== "RenderingCancelledException" && err.message !== "Rendering cancelled, page change") {
          console.error("Render failed for page " + pageNum, err);
        }
        if (active) setPageRendering(false);
      });
    }).catch((err: any) => {
      console.error("Error loading page " + pageNum, err);
      if (active) {
        setError(true);
        setPageRendering(false);
      }
    });

    return () => {
      active = false;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (err) {}
      }
    };
  }, [pdfDocument, pageNum, zoom]);

  if (error) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center", background: "#fef2f2", color: "#991b1b" }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>Failed to render page {pageNum}</p>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", background: "#ffffff", minHeight: pageRendering ? 380 : "auto" }}>
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "auto", opacity: pageRendering ? 0.35 : 1, transition: "opacity 0.2s" }} />

      {pageRendering && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(10, 14, 26, 0.82)", padding: "6px 14px", borderRadius: 9999, color: "#fff", fontSize: 11, fontFamily: "'DM Sans', sans-serif" }}>
            <Loader2 size={12} className="animate-spin" style={{ color: "#A78BFA" }} />
            <span>Rendering Page {pageNum}...</span>
          </div>
        </div>
      )}

      {/* WATERMARK BACKGROUND (DYNAMIC OVERLAY) ON CANVAS */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", userSelect: "none", overflow: "hidden", zIndex: 10 }}>
        {Array.from({ length: 15 }).map((_, index) => {
          const row = Math.floor(index / 3);
          const col = index % 3;
          return (
            <div key={index} style={{
              position: "absolute",
              top: `${row * 22 + 6}%`,
              left: `${col * 35 - 5}%`,
              transform: "rotate(-25deg)",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: "rgba(79, 70, 229, 0.07)",
              fontWeight: 700,
              whiteSpace: "nowrap",
              letterSpacing: "0.5px"
            }}>
              {watermarkUser} ({watermarkEmail}) • CampusConnect SECURED • DO NOT REPRODUCE
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══ INNER VIEWER ═══════════════════════════════════════ */
function PdfViewerInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id") || "1";
  const initialDocIdx = parseInt(searchParams.get("docIndex") || "0", 10);

  // Auth User Context
  const user = useAuthStore(s => s.user);
  const authLoading = useAuthStore(s => s.isLoading);

  // States
  const [product, setProduct] = useState<any>(null);
  const [purchased, setPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeDocIndex, setActiveDocIndex] = useState(initialDocIdx);

  const [zoom, setZoom] = useState(100);
  const [scrollPercent, setScrollPercent] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const totalHeight = target.scrollHeight - target.clientHeight;
    if (totalHeight > 0) {
      setScrollPercent((target.scrollTop / totalHeight) * 100);
    }
  };

  // Real PDF specific states
  const [pdfjsLoaded, setPdfjsLoaded] = useState(false);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // DRM overlays trigger
  const [focusLost, setFocusLost] = useState(false);
  const [clipboardAttacked, setClipboardAttacked] = useState(false);
  const [permanentlyLocked, setPermanentlyLocked] = useState(false);
  const permanentlyLockedRef = useRef(false);
  const [devToolsOpen, setDevToolsOpen] = useState(false);

  const triggerPermanentLock = () => {
    document.body.classList.add('focus-lost');
    setFocusLost(true);
    setPermanentlyLocked(true);
    permanentlyLockedRef.current = true;
  };

  // DevTools detection loop
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth <= 768;
    if (isMobile) return;

    const threshold = 160;
    const check = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      const isOpen = widthThreshold || heightThreshold;

      setDevToolsOpen(prev => {
        if (prev !== isOpen) {
          if (isOpen) {
            document.body.classList.add('focus-lost');
            setFocusLost(true);
          } else {
            if (!permanentlyLockedRef.current) {
              document.body.classList.remove('focus-lost');
              setFocusLost(false);
            }
          }
        }
        return isOpen;
      });
    };

    const interval = setInterval(check, 500);
    window.addEventListener("resize", check);
    check();

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", check);
    };
  }, []);

  // Dynamically load PDF.js library from CDN
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).pdfjsLib) {
      setPdfjsLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.async = true;
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      setPdfjsLoaded(true);
    };
    document.body.appendChild(script);
  }, []);

  // Fetch product data & orders status
  useEffect(() => {
    if (!productId) return;
    setLoading(true);

    const loadData = async () => {
      try {
        // 1. Fetch details
        const prodRes = await api.get(`/api/marketplace/products/${productId}`);
        setProduct(prodRes.data);

        // 2. Fetch purchases to see if student has purchased this
        if (user) {
          try {
            const ordersRes = await api.get("/api/marketplace/orders");
            const orders = ordersRes.data || [];

            const hasOrder = orders.some(
              (o: any) => o.productId === productId && o.status === "COMPLETED"
            );
            const isSeller = prodRes.data.sellerId === user?.id;

            if (hasOrder || isSeller) {
              setPurchased(true);
            }
          } catch (orderErr) {
            console.warn("Could not check orders:", orderErr);
          }
        }
      } catch (err: any) {
        console.error("Failed to load product/orders:", err);
        setError("This secure resource could not be validated or is unavailable.");
      } finally {
        setLoading(false);
      }
    };

    if (user || searchParams.get("preview") === "true") {
      loadData();
    } else if (!authLoading) {
      // Not logged in: force to login page
      router.push(`/login?redirect=/marketplace/viewer/pdf?id=${productId}`);
    }
  }, [productId, user, authLoading, router, searchParams]);

  // Load PDF file if uploaded
  useEffect(() => {
    if (!pdfjsLoaded || !product) return;

    if (devToolsOpen) {
      setPdfDocument(null);
      return;
    }

    let active = true;
    const pdfjsLib = (window as any).pdfjsLib;

    const fetchPdf = async () => {
      setPdfLoading(true);
      setPdfError(null);
      try {
        const isPreviewRequested = searchParams.get("preview") === "true";
        const isSeller = user && product?.sellerId === user?.id;
        const isPreview = isPreviewRequested || (!purchased && !isSeller);

        const response = await api.get(
          `/api/marketplace/products/${productId}/file?docIndex=${activeDocIndex}${isPreview ? '&preview=true' : ''}`,
          { responseType: "arraybuffer" }
        );

        if (!active) return;

        const uint8Data = new Uint8Array(response.data);
        const loadingTask = pdfjsLib.getDocument({ data: uint8Data });
        const pdf = await loadingTask.promise;
        if (!active) return;
        setPdfDocument(pdf);
        setNumPages(pdf.numPages);
        setPdfLoading(false);
      } catch (err: any) {
        if (!active) return;
        console.error("Secure PDF stream or parse error:", err);
        let errMsg = "Failed to load the document file. Please retry.";
        if (err?.response?.status === 403) {
          errMsg = "Access restricted: purchase required to view this document.";
        } else if (err?.response?.status === 404) {
          errMsg = "No document file was found for this listing.";
        } else if (err?.message) {
          errMsg = err.message;
        }
        setPdfError(errMsg);
        setPdfLoading(false);
      }
    };

    fetchPdf();

    return () => {
      active = false;
    };
  }, [pdfjsLoaded, product, purchased, productId, searchParams, user, devToolsOpen, activeDocIndex, retryCount]);

  // Determine DRM preview parameters
  const isPreviewRequested = searchParams.get("preview") === "true";
  const isSeller = user && product?.sellerId === user?.id;

  // Strict Preview Rules: Forced preview if NOT purchased AND NOT the seller
  const isPreview = isPreviewRequested || (!purchased && !isSeller);

  const PREVIEW_LIMIT = 2;
  const TOTAL_PAGES = pdfDocument ? numPages : (isPreview ? PREVIEW_LIMIT : 1);

  // 🛡️ DRM Event Listeners: Focus Loss & Keyboard PrintScreen Control
  useEffect(() => {
    const isMobile = typeof window !== "undefined" && (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth <= 768);

    // 1. Focus loss blur handler
    const handleBlur = () => {
      setTimeout(() => {
        if (!document.hasFocus() && !isMobile) {
          document.body.classList.add('focus-lost');
          setFocusLost(true);
        }
      }, 250);
    };
    const handleFocus = () => {
      if (permanentlyLockedRef.current) return;
      document.body.classList.remove('focus-lost');
      setFocusLost(false);
    };

    // 2. Visibility change (switching tabs or minimizing window)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.body.classList.add('focus-lost');
        setFocusLost(true);
      }
    };

    // 3. Mouse boundaries (ignore on mobile to avoid false positives on touch drag)
    const handleMouseLeave = () => {
      if (isMobile) return;
      document.body.classList.add('focus-lost');
      setFocusLost(true);
    };
    const handleMouseEnter = () => {
      if (permanentlyLockedRef.current) return;
      document.body.classList.remove('focus-lost');
      setFocusLost(false);
    };

    // 4. Keyboard screenshot prevent and copy blockers
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // Allow navigation keys, space, tab & page refresh
      if (
        key === "f5" ||
        key === "arrowup" || key === "arrowdown" || key === "arrowleft" || key === "arrowright" ||
        key === "pageup" || key === "pagedown" || key === "home" || key === "end" ||
        key === "space" || key === "tab" ||
        ((e.ctrlKey || e.metaKey) && key === "r")
      ) {
        return;
      }

      // Block screenshot, print, view-source, save, devtools, copy
      if (
        key === "printscreen" || e.keyCode === 44 ||
        ((e.ctrlKey || e.metaKey) && (key === "p" || key === "s" || key === "u" || key === "c" || key === "a")) ||
        (e.ctrlKey && e.shiftKey && key === "i") ||
        key === "f12"
      ) {
        e.preventDefault();
        if (key === "printscreen" || e.keyCode === 44) {
          document.body.classList.add('clipboard-attacked');
          setClipboardAttacked(true);
          navigator.clipboard?.writeText("🔒").catch(() => { });
          setTimeout(() => {
            document.body.classList.remove('clipboard-attacked');
            setClipboardAttacked(false);
          }, 2200);
        }
        triggerPermanentLock();
      }
    };

    // 5. Right-click contextmenu prevent
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);

      // Cleanup classes on component unmount
      document.body.classList.remove('focus-lost');
      document.body.classList.remove('clipboard-attacked');
    };
  }, []);

  // Show loading / checking state
  if (authLoading || loading) {
    return (
      <div style={{ background: "#0A0E1A", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{ width: 44, height: 44, border: "3px solid #1f2937", borderTopColor: "#8B5CF6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#9CA3AF" }}>Decrypting secure payload...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // Error loading page
  if (error || !product) {
    return (
      <div style={{ background: "#0A0E1A", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
        <div style={{ fontSize: 48 }}>🛡️</div>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: "#fff" }}>Access Prohibited</h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#9CA3AF", textAlign: "center", maxWidth: 400, marginTop: -8 }}>
          {error || "Verify product authorization criteria. Purchases are secured under university guidelines."}
        </p>
        <Link href="/marketplace" style={{ textDecoration: "none" }}>
          <button style={{ height: 38, padding: "0 20px", borderRadius: 8, background: "#8B5CF6", border: "none", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
            Back to Marketplace
          </button>
        </Link>
      </div>
    );
  }

  const watermarkUser = user?.name || "CampusConnect Reader";
  const watermarkEmail = user?.email || "preview.reader@campusconnect";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#060913", overflow: "hidden", position: "relative" }}>
      <style>{`
        @keyframes docShimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .doc-shimmer {
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%) !important;
          background-size: 200% 100% !important;
          animation: docShimmer 1.8s infinite linear !important;
        }

        .pdf-skeleton-card {
          animation: skeletonFadeIn 0.3s ease-out;
        }

        @keyframes skeletonFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media print {
          body, html, #__next, .pdf-workspace, .pdf-document-card, .pdf-page-container {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
          }
        }

        /* DRM Instant Blackout styles */
        body.focus-lost .pdf-workspace,
        body.focus-lost .pdf-header,
        body.focus-lost .pdf-bottom-bar,
        body.focus-lost .pdf-secured-bar {
          filter: blur(60px) !important;
          opacity: 0 !important;
          pointer-events: none !important;
          transition: none !important;
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
          box-sizing: border-box;
        }

        body.focus-lost .drm-blackout-overlay {
          display: flex !important;
        }

        body.clipboard-attacked .pdf-workspace,
        body.clipboard-attacked .pdf-header,
        body.clipboard-attacked .pdf-bottom-bar,
        body.clipboard-attacked .pdf-secured-bar {
          filter: blur(60px) !important;
          opacity: 0 !important;
          pointer-events: none !important;
          transition: none !important;
        }

        .drm-clipboard-overlay {
          position: fixed;
          inset: 0;
          background: #000000;
          z-index: 100000 !important;
          display: none;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #fff;
          gap: 12px;
          box-sizing: border-box;
          padding: 24px;
        }

        body.clipboard-attacked .drm-clipboard-overlay {
          display: flex !important;
        }

        .pdf-watermark-text {
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

        .pdf-mobile-page-pill {
          display: none;
        }

        @media (max-width: 768px) {
          .pdf-secured-bar {
            flex-direction: row !important;
            height: 32px !important;
            padding: 0 12px !important;
          }
          .drm-long-text {
            display: none !important;
          }
          .drm-short-text {
            display: inline !important;
            font-size: 10px !important;
            white-space: nowrap !important;
          }
          .pdf-header {
            height: 48px !important;
            flex-direction: row !important;
            padding: 0 10px !important;
            gap: 6px !important;
            align-items: center !important;
          }
          .pdf-header-left {
            justify-content: flex-start !important;
            width: auto !important;
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
          }
          .pdf-header-center {
            text-align: center !important;
            width: auto !important;
            align-items: center !important;
            margin: 0 !important;
            flex: 1 !important;
            padding: 0 4px !important;
          }
          .pdf-header-controls {
            width: auto !important;
            justify-content: flex-end !important;
            gap: 4px !important;
          }
          .pdf-workspace {
            padding: 12px 8px 50px !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            touch-action: pan-x pan-y !important;
          }
          .pdf-document-card {
            width: 100% !important;
            max-width: 100% !important;
            min-height: auto !important;
            height: auto !important;
            aspect-ratio: auto !important;
            border-radius: 8px !important;
            box-shadow: 0 4px 16px rgba(0,0,0,0.4) !important;
            margin-bottom: 14px !important;
          }
          .pdf-document-card.zoomed {
            width: auto !important;
            min-width: 100% !important;
            max-width: none !important;
          }
          .pdf-page-container {
            padding: 20px 16px !important;
          }
          .pdf-page-title {
            font-size: 18px !important;
            line-height: 1.35 !important;
          }
          .pdf-mobile-page-pill {
            display: flex !important;
          }
          .pdf-bottom-bar {
            flex-direction: row !important;
            height: 40px !important;
            padding: 0 12px !important;
            gap: 8px !important;
            align-items: center !important;
            justify-content: space-between !important;
          }
          .pdf-bottom-bar p {
            font-size: 11px !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            margin: 0 !important;
          }
          .pdf-bottom-bar button {
            width: auto !important;
            height: 28px !important;
            padding: 0 12px !important;
            font-size: 11px !important;
          }
        }

        @media (max-width: 500px) {
          .pdf-zoom-btn {
            display: flex !important;
            width: 28px !important;
            height: 28px !important;
          }
          .pdf-zoom-text {
            font-size: 9px !important;
            min-width: 24px !important;
          }
          .pdf-doc-title-text {
            max-width: 110px !important;
            font-size: 11px !important;
          }
        }
      `}</style>

      {/* ─── DRM BLUR BLACKOUT OVERLAY (FOCUS LOST) ─── */}
      <div className="drm-blackout-overlay">
        <ShieldAlert size={56} style={{ color: "#EF4444" }} />
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: "#EF4444", margin: 0 }}>
          🔒 DRM CONTENT PROTECTED
        </h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#9CA3AF", fontSize: 13, maxWidth: 440, lineHeight: 1.7, margin: 0 }}>
          External tool capture, screenshot software, or screen sharing active.
          CampusConnect security rules prohibit recording or copying this academic content.
          <br />
          <strong style={{ color: "#8B5CF6", marginTop: 8, display: "block" }}>
            Click back inside this window tab to resume reading.
          </strong>
        </p>
      </div>

      {/* ─── CLIPBOARD / PRINTSCREEN BLACKOUT OVERLAY ─── */}
      <div className="drm-clipboard-overlay">
        <ShieldAlert size={64} style={{ color: "#EF4444", animation: "pulse 1s infinite" }} />
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, color: "#EF4444", margin: 0 }}>
          SCREENSHOT ATTEMPT BLOCKED
        </h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#9CA3AF", fontSize: 14, margin: 0 }}>
          System screenshot utilities have been neutralized. Clipboard wiped.
        </p>
        <style>{`@keyframes pulse{0%{transform:scale(1)}50%{transform:scale(1.05)}100%{transform:scale(1)}}`}</style>
      </div>

      {/* ─── VIEWER NAVBAR (COMPACT SLEEK) ─── */}
      <header className="pdf-header" style={{
        height: 44, background: "#0a0d1a", borderBottom: "1px solid #1b233a",
        display: "flex", alignItems: "center", padding: "0 18px", flexShrink: 0, zIndex: 100
      }}>
        <div className="pdf-header-left" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href={`/marketplace/digital/${productId}`} style={{
            display: "flex", alignItems: "center", gap: 4,
            fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: "#9CA3AF",
            textDecoration: "none"
          }}>
            <ChevronLeft size={16} />
            <span>Exit</span>
          </Link>

          {isPreview && (
            <span style={{
              background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: 9999, padding: "2px 8px",
              fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, color: "#F59E0B",
              display: "flex", alignItems: "center", gap: 4
            }}>
              <Lock size={10} /> PREVIEW
            </span>
          )}
        </div>

        {/* Center Details */}
        <div className="pdf-header-center" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, minWidth: 0, padding: "0 8px" }}>
          {(() => {
            const availableDocFiles = (product?.images || []).filter(isDocumentUrl);
            const currentDocUrl = availableDocFiles[activeDocIndex] || availableDocFiles[0] || "";
            const currentDocTitle = getOriginalFileName(currentDocUrl, product?.title, "Academic Document");

            return (
              <>
                <span className="pdf-doc-title-text" style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 700, color: "#F0F4FF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>
                  {currentDocTitle}
                </span>

                {availableDocFiles.length > 1 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 6, padding: "2px 8px" }}>
                    <FileText size={11} style={{ color: "#A78BFA" }} />
                    <select
                      value={activeDocIndex}
                      onChange={e => setActiveDocIndex(Number(e.target.value))}
                      style={{ background: "transparent", border: "none", color: "#A78BFA", fontSize: 11, fontWeight: 700, cursor: "pointer", outline: "none", fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {availableDocFiles.map((docUrl: string, i: number) => (
                        <option key={i} value={i} style={{ background: "#0D111E", color: "#fff" }}>
                          {getOriginalFileName(docUrl, `Document ${i + 1}`, `Doc ${i + 1}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            );
          })()}

          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#8E9AA8", flexShrink: 0, background: "rgba(255,255,255,0.05)", padding: "1px 6px", borderRadius: 4 }}>
            {pdfLoading ? "Loading..." : isPreview ? `${Math.min(numPages || PREVIEW_LIMIT, PREVIEW_LIMIT)} Pgs (Preview)` : `${TOTAL_PAGES} Pgs`}
          </span>
        </div>

        {/* Navigation & Zoom controls */}
        <div className="pdf-header-controls" style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <button onClick={() => setZoom(z => Math.max(70, z - 10))} style={ctrlBtnStyle} title="Zoom Out" className="pdf-zoom-btn">
            <ZoomOut size={13} />
          </button>

          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#9CA3AF", minWidth: 32, textAlign: "center" }} className="pdf-zoom-text">
            {zoom}%
          </span>

          <button onClick={() => setZoom(z => Math.min(160, z + 10))} style={ctrlBtnStyle} title="Zoom In" className="pdf-zoom-btn">
            <ZoomIn size={13} />
          </button>
        </div>
      </header>

      {/* ─── SCROLL PROGRESS BAR ─── */}
      <div style={{ height: 2, background: "#1b233a", flexShrink: 0, position: "relative" }}>
        <div style={{
          height: "100%",
          width: `${scrollPercent}%`,
          background: isPreview ? "linear-gradient(90deg, #A78BFA, #8B5CF6)" : "linear-gradient(90deg, #4f46e5, #7c3aed)",
          transition: "width 0.1s ease-out",
        }} />
      </div>

      {/* ─── SECURE VIEWER WORKSPACE AREA ─── */}
      <div
        className="pdf-workspace"
        onScroll={handleScroll}
        onContextMenu={e => e.preventDefault()}
        style={{
          flex: 1, background: "#080b13",
          display: "flex", flexDirection: "column", alignItems: "center",
          overflowY: "auto", padding: "32px 24px",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        {/* Mobile floating quick page indicator pill */}
        {!pdfLoading && !pdfError && pdfDocument && (
          <div className="pdf-mobile-page-pill" style={{
            position: "fixed",
            bottom: isPreview ? 48 : 40,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 80,
            background: "rgba(10, 14, 26, 0.92)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(139, 92, 246, 0.35)",
            borderRadius: 9999,
            padding: "5px 14px",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
            pointerEvents: "none"
          }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#E0E7FF", fontWeight: 700 }}>
              Page {Math.min(TOTAL_PAGES, Math.max(1, Math.round((scrollPercent / 100) * TOTAL_PAGES) || 1))} of {TOTAL_PAGES}
            </span>
          </div>
        )}

        {/* ─── DOCUMENT WORKSPACE VIEW ─── */}
        {pdfLoading ? (
          /* Realistic Document Page Skeletons while fetching / parsing */
          Array.from({ length: isPreview ? PREVIEW_LIMIT : 2 }).map((_, index) => (
            <PdfDocumentSkeleton
              key={`skeleton-${index}`}
              pageNum={index + 1}
              zoom={zoom}
              isFirstPage={index === 0}
              statusMessage="Fetching and decrypting document pages..."
            />
          ))
        ) : pdfError ? (
          /* Proper Error State Card with Retry */
          <PdfErrorCard
            message={pdfError}
            onRetry={() => setRetryCount(c => c + 1)}
            productId={productId}
          />
        ) : pdfDocument ? (
          /* Real PDF Document Pages via PDF.js Canvas */
          Array.from({ length: TOTAL_PAGES }).map((_, index) => {
            const pageNum = index + 1;
            const isPageLocked = isPreview && pageNum > PREVIEW_LIMIT;

            return (
              <div
                key={pageNum}
                className={`pdf-document-card ${zoom > 100 ? 'zoomed' : ''}`}
                style={{
                  background: "#fff",
                  width: `min(100%, ${640 * zoom / 100}px)`,
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  borderRadius: 8,
                  boxShadow: "0 12px 60px rgba(0, 0, 0, 0.8)",
                  position: "relative",
                  overflow: "hidden",
                  fontSize: `${zoom / 100}em`,
                  transition: "width 0.15s ease-out",
                  marginBottom: 20,
                  flexShrink: 0,
                }}
              >
                <div style={{ filter: isPageLocked ? "blur(8px)" : "none", transition: "filter 0.3s", height: "100%" }}>
                  <PdfPageCanvas
                    pdfDocument={pdfDocument}
                    pageNum={pageNum}
                    zoom={zoom}
                    watermarkUser={watermarkUser}
                    watermarkEmail={watermarkEmail}
                  />
                </div>

                {/* Paywall Blocker Overlay */}
                {isPageLocked && pageNum === PREVIEW_LIMIT + 1 && (
                  <PaywallOverlay
                    productTitle={product.title}
                    price={product.price}
                    productId={productId}
                  />
                )}
              </div>
            );
          })
        ) : (
          <PdfDocumentSkeleton
            pageNum={1}
            zoom={zoom}
            isFirstPage={true}
            statusMessage="Initializing secure viewer..."
          />
        )}
      </div>

      {/* ─── BOTTOM SECURITY META BAR (COMPACT SLEEK) ─── */}
      {isPreview ? (
        /* Preview Bottom CTA Bar */
        <div className="pdf-bottom-bar" style={{
          flexShrink: 0, height: 40,
          background: "#0a0d1a", borderTop: "1px solid #1b233a",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 16px", zIndex: 90
        }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#8E9AA8", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            🔒 Demo Preview Mode (Locked)
          </p>
          <Link href={`/marketplace/digital/${productId}`} style={{ textDecoration: "none", flexShrink: 0 }}>
            <button style={{
              height: 28, padding: "0 14px", borderRadius: 9999,
              background: "#8B5CF6", border: "none", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#fff",
              display: "flex", alignItems: "center", gap: 5,
              boxShadow: "0 2px 10px rgba(139,92,246,0.3)"
            }}>
              <ShoppingCart size={11} /> Unlock Guide — ₹{product.price}
            </button>
          </Link>
        </div>
      ) : (
        /* Full Secured Mode Information Bar */
        <div className="pdf-secured-bar" style={{
          flexShrink: 0, height: 32,
          background: "linear-gradient(90deg, #4f46e5, #7c3aed)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "0 16px", zIndex: 90
        }}>
          <p className="pdf-watermark-text" style={{ margin: 0, fontSize: 10, letterSpacing: "0.2px", textAlign: "center", width: "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            <span className="drm-long-text">
              🛡️ <strong>Platform Protection Active:</strong> Watermarked under license to <strong>{watermarkEmail} ({watermarkUser})</strong>.
            </span>
            <span className="drm-short-text">
              🛡️ Licensed to: <strong>{watermarkEmail}</strong>
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

/* ═══ PAGE EXPORT WRAPPER ═════════════════════════════════ */
export default function PdfViewerPage() {
  return (
    <Suspense fallback={
      <div style={{ background: "#0A0E1A", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#9CA3AF" }}>Preparing sandbox...</p>
      </div>
    }>
      <PdfViewerInner />
    </Suspense>
  );
}

const ctrlBtnStyle: React.CSSProperties = {
  width: 34, height: 34, borderRadius: 8,
  background: "#13182b", border: "1.5px solid #1b233a",
  display: "flex", alignItems: "center", justifyContent: "center",
  color: "#9CA3AF", cursor: "pointer", transition: "all 0.15s ease",
};
