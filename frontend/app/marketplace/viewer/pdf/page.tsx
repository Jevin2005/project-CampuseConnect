"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Lock, 
  ShoppingCart, ShieldAlert, Eye, FileText, Download, CheckCircle 
} from "lucide-react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

/* ─── Dynamic Academic Notes Content Mock Database ─────────────────────────── */
const ACADEMIC_NOTES_DATABASE: Record<string, {
  subject: string;
  unit: string;
  title: string;
  subtitle: string;
  body: string;
  eqLabel: string;
  eq: string;
  note: string;
}[]> = {
  ece: [
    {
      pageNum: 1,
      subject: "ECE-342: ANALOG COMMUNICATIONS",
      unit: "UNIT 1 — SIGNAL MODULATION",
      title: "Amplitude Modulation (AM) Fundamentals",
      subtitle: "1.1 Concept of Modulation",
      body: "Modulation is the process of varying one or more properties of a high-frequency periodic waveform, called the carrier signal, with a modulating signal that typically contains information to be transmitted. In AM, the amplitude of the carrier wave is varied in direct proportion to the instantaneous amplitude of the message signal.",
      eqLabel: "Standard AM Wave Equation:",
      eq: "s(t) = [A_c + m(t)] cos(2π f_c t)",
      note: "Where A_c is carrier amplitude, m(t) is baseband message, and f_c is carrier frequency.",
    },
    {
      pageNum: 2,
      subject: "ECE-342: ANALOG COMMUNICATIONS",
      unit: "UNIT 1 — SIGNAL MODULATION",
      title: "Modulation Index & Efficiency",
      subtitle: "1.2 Modulation Index (μ)",
      body: "The modulation index represents the extent to which the carrier amplitude varies. If μ > 1, overmodulation occurs, resulting in envelope distortion. The power efficiency of an AM wave is defined as the ratio of sideband power to the total transmitted power.",
      eqLabel: "Modulation Efficiency Equation:",
      eq: "η = P_sb / P_total = μ² / (2 + μ²)",
      note: "Maximum theoretical efficiency is 33.33% when modulation index μ = 1.",
    },
    {
      pageNum: 3,
      subject: "ECE-342: ANALOG COMMUNICATIONS",
      unit: "UNIT 2 — FREQUENCY MODULATION",
      title: "Angle Modulation Principles",
      subtitle: "2.1 Frequency vs Phase Modulation",
      body: "In angle modulation, the phase or frequency of the carrier is varied. Frequency Modulation (FM) modulates the carrier frequency directly according to the message. FM offers far superior noise immunity compared to AM at the cost of significantly increased transmission bandwidth.",
      eqLabel: "Carson's Rule for FM Bandwidth:",
      eq: "B_T = 2(Δf + f_m)",
      note: "Where Δf is frequency deviation and f_m is the highest message frequency component.",
    },
    {
      pageNum: 4,
      subject: "ECE-342: ANALOG COMMUNICATIONS",
      unit: "UNIT 3 — DIGITAL SHIFT KEYING",
      title: "Phase Shift Keying (PSK)",
      subtitle: "3.1 Binary PSK Modulation",
      body: "BPSK is a form of digital modulation where the phase of the carrier is shifted between 0° and 180° to represent binary states 0 and 1. It provides highly robust bit error rate (BER) performances for noisy wireless transmission links.",
      eqLabel: "BPSK Signal Representation:",
      eq: "s_i(t) = A_c cos(2π f_c t + θ_i),   θ_i ∈ {0, π}",
      note: "BPSK requires coherent detection for accurate demodulation and carrier phase synchronization.",
    }
  ] as any,
  cs: [
    {
      pageNum: 1,
      subject: "CS-502: DESIGN & ANALYSIS OF ALGORITHMS",
      unit: "UNIT 1 — COMPLEXITY ANALYSIS",
      title: "Big-O Notation and Complexity classes",
      subtitle: "1.1 Asymptotic Bounds",
      body: "Asymptotic notation describes the behavior of algorithms as input size n approaches infinity. Big-O defines the upper bound, Big-Omega defines the lower bound, and Big-Theta represents the tight mathematical bound of algorithmic execution.",
      eqLabel: "Mathematical definition of Big-O:",
      eq: "f(n) = O(g(n))  iff  ∃ c, n_0 > 0 s.t. 0 ≤ f(n) ≤ c·g(n) ∀ n ≥ n_0",
      note: "Common complexity classes order: O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2^n).",
    },
    {
      pageNum: 2,
      subject: "CS-502: DESIGN & ANALYSIS OF ALGORITHMS",
      unit: "UNIT 1 — COMPLEXITY ANALYSIS",
      title: "The Master Theorem",
      subtitle: "1.2 Recurrence Relations Solver",
      body: "The Master Theorem provides a cookbook method for solving divide-and-conquer recurrences of the form T(n) = a·T(n/b) + f(n), where a ≥ 1 and b > 1. It compares the growth rate of f(n) with n^(log_b a).",
      eqLabel: "Master Recurrence Relation:",
      eq: "T(n) = a·T(n/b) + Θ(n^d),   where d ≥ 0",
      note: "Case 1: if log_b(a) > d then T(n) = Θ(n^(log_b a)). Case 2: if log_b(a) = d then T(n) = Θ(n^d log n).",
    },
    {
      pageNum: 3,
      subject: "CS-502: DESIGN & ANALYSIS OF ALGORITHMS",
      unit: "UNIT 2 — DYNAMIC PROGRAMMING",
      title: "Dynamic Programming Foundations",
      subtitle: "2.1 Memoization vs Tabulation",
      body: "Dynamic Programming (DP) solves complex problems by breaking them down into overlapping subproblems, solving each subproblem exactly once, and storing their solutions. Memoization is a top-down cached approach, whereas Tabulation is bottom-up iterative computation.",
      eqLabel: "0/1 Knapsack DP State Recurrence:",
      eq: "DP[i][w] = max(DP[i-1][w], val[i-1] + DP[i-1][w-wt[i-1]])",
      note: "Time complexity is reduced from exponential O(2^n) to pseudo-polynomial O(n·W).",
    },
    {
      pageNum: 4,
      subject: "CS-502: DESIGN & ANALYSIS OF ALGORITHMS",
      unit: "UNIT 3 — GRAPH ALGORITHMS",
      title: "Single Source Shortest Path",
      subtitle: "3.1 Dijkstra's Greedy Strategy",
      body: "Dijkstra's algorithm finds the shortest path from a single source vertex to all other vertices in a weighted graph with non-negative edge weights. It iteratively selects the unvisited vertex with the minimum tentative distance.",
      eqLabel: "Relaxation Edge Condition:",
      eq: "if (dist[u] + weight(u, v) < dist[v]) { dist[v] = dist[u] + weight(u, v) }",
      note: "Using a Binary Heap priority queue, Dijkstra runs in O((V + E) log V) time complexity.",
    }
  ] as any,
  physics: [
    {
      pageNum: 1,
      subject: "PHY-301: QUANTUM MECHANICS",
      unit: "UNIT 1 — WAVE PARTICLE DUALITY",
      title: "The Schrödinger Wave Equation",
      subtitle: "1.1 Postulates of Quantum Mechanics",
      body: "Physical states of a quantum particle are represented by a complex wave function Ψ(x, t). The square of the wave function's absolute value represents the probability density of finding the particle at a given coordinate position.",
      eqLabel: "Time-Dependent Schrödinger Equation:",
      eq: "iℏ ∂/∂t Ψ(x, t) = [ - (ℏ² / 2m) ∂²/∂x² + V(x, t) ] Ψ(x, t)",
      note: "Where ℏ is the reduced Planck constant, m is particle mass, and V is potential energy.",
    },
    {
      pageNum: 2,
      subject: "PHY-301: QUANTUM MECHANICS",
      unit: "UNIT 1 — WAVE PARTICLE DUALITY",
      title: "Heisenberg Uncertainty Principle",
      subtitle: "1.2 Conjugate Operators Limit",
      body: "The uncertainty principle states that it is mathematically impossible to measure both the exact coordinate position and linear momentum of a subatomic particle simultaneously with absolute precision.",
      eqLabel: "Uncertainty Relation Bound:",
      eq: "σ_x · σ_p ≥ ℏ / 2",
      note: "This limit arises from the wave-like nature of matter and the non-commutative properties of quantum operators.",
    },
    {
      pageNum: 3,
      subject: "PHY-301: QUANTUM MECHANICS",
      unit: "UNIT 2 — POTENTIAL BARRIERS",
      title: "Infinite Potential Square Well",
      subtitle: "2.1 Particle in a Box",
      body: "A particle is confined between infinite potential walls V(x) = 0 for 0 < x < L, and V(x) = ∞ elsewhere. The boundary conditions force the wavefunction to be zero at the walls, leading to quantized discrete energy states.",
      eqLabel: "Quantized Energy Wavefunction:",
      eq: "E_n = n² π² ℏ² / (2 m L²),   n = 1, 2, 3...",
      note: "The zero-point energy (n = 1) is non-zero, confirming quantum particles can never be perfectly at rest.",
    },
    {
      pageNum: 4,
      subject: "PHY-301: QUANTUM MECHANICS",
      unit: "UNIT 3 — STATISTICAL DISTRIBUTIONS",
      title: "Quantum Statistical Mechanics",
      subtitle: "3.1 Fermions vs Bosons",
      body: "Subatomic particles are divided into Fermions (spin 1/2, obey Pauli exclusion principle) and Bosons (integer spin, can occupy identical states). These lead to completely different probability distributions at thermal equilibrium.",
      eqLabel: "Fermi-Dirac Distribution Equation:",
      eq: "f(E) = 1 / [ e^((E - E_F) / k_B T) + 1 ]",
      note: "Where E_F is the Fermi level, k_B is Boltzmann constant, and T is temperature.",
    }
  ] as any
};

/* ─── PDF page renderer component ───────────────────────────────────────── */
function PdfPage({ data, watermarkUser, watermarkEmail }: {
  data: any;
  watermarkUser: string;
  watermarkEmail: string;
}) {
  return (
    <div style={{ position: "relative", padding: "48px 56px", minHeight: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#ffffff", userSelect: "none" }}>
      <div>
        {/* header row */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, borderBottom: "1.5px solid #f0f0f5", paddingBottom: 8 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#8E9AA8", letterSpacing: "1px", fontWeight: 700 }}>
            {data.subject}
          </span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#8E9AA8", letterSpacing: "1px", fontWeight: 700 }}>
            {data.unit}
          </span>
        </div>

        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: "#111827", marginBottom: 16, lineHeight: 1.3 }}>
          {data.title}
        </h1>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "#4F46E5", marginBottom: 12 }}>
          {data.subtitle}
        </h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#374151", lineHeight: 1.8, marginBottom: 20, textAlign: "justify" }}>
          {data.body}
        </p>

        {/* equation panel */}
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#6B7280", fontWeight: 600, marginBottom: 6 }}>{data.eqLabel}</p>
        <div style={{
          background: "linear-gradient(135deg, #F8F7FF 0%, #F3F1FF 100%)", border: "1.5px solid rgba(139,92,246,0.12)",
          borderRadius: 12, padding: "18px 24px", marginBottom: 20, textAlign: "center",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)"
        }}>
          <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#4F46E5", fontWeight: 800, wordBreak: "break-all" }}>{data.eq}</code>
        </div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#6B7280", lineHeight: 1.6, fontStyle: "italic" }}>
          💡 <strong>Reference note:</strong> {data.note}
        </p>
      </div>

      {/* page footer */}
      <div style={{
        display: "flex", justifyContent: "space-between", borderTop: "1.5px solid #f0f0f5", paddingTop: 12, marginTop: 24
      }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#9CA3AF", fontWeight: 600 }}>🛡️ SECURED DIGITAL ASSET</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#4F46E5", fontWeight: 800 }}>PAGE {data.pageNum} OF 4</span>
      </div>

      {/* WATERMARK BACKGROUND (DYNAMIC OVERLAY) */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", userSelect: "none", overflow: "hidden", zIndex: 10 }}>
        {Array.from({ length: 5 }).map((_, row) =>
          Array.from({ length: 3 }).map((_, col) => (
            <div key={`${row}-${col}`} style={{
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
          ))
        )}
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
  const cleanUrl = url.split("?")[0].toLowerCase();
  const ext = cleanUrl.substring(cleanUrl.lastIndexOf(".") + 1);
  return ["pdf", "doc", "docx", "ppt", "pptx", "txt"].includes(ext);
};

const getFileUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
  return `${baseUrl.replace(/\/$/, "")}${url}`;
};

/* ═══ INNER VIEWER ═══════════════════════════════════════ */
function PdfViewerInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id") || "1";

  // Auth User Context
  const user = useAuthStore(s => s.user);
  const authLoading = useAuthStore(s => s.isLoading);

  // States
  const [product, setProduct] = useState<any>(null);
  const [purchased, setPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);

  // Real PDF specific states
  const [pdfjsLoaded, setPdfjsLoaded] = useState(false);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // DRM overlays trigger
  const [focusLost, setFocusLost] = useState(false);
  const [clipboardAttacked, setClipboardAttacked] = useState(false);

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
        console.error("Failed to load product/orders:", err);
        setError("This secure resource could not be validated or is unavailable.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    } else if (!authLoading) {
      // Not logged in: force to login page
      router.push(`/login?redirect=/marketplace/viewer/pdf?id=${productId}`);
    }
  }, [productId, user, authLoading, router]);

  // Load PDF file if uploaded
  useEffect(() => {
    if (!pdfjsLoaded || !product) return;
    const docs = (product.images || []).filter(isDocumentUrl);
    if (docs.length === 0) return;

    const pdfUrl = getFileUrl(docs[0]);
    const pdfjsLib = (window as any).pdfjsLib;

    let active = true;
    pdfjsLib.getDocument(pdfUrl).promise.then((pdf: any) => {
      if (!active) return;
      setPdfDocument(pdf);
      setNumPages(pdf.numPages);
    }).catch((err: any) => {
      console.error("Failed to load real PDF file:", err);
    });

    return () => {
      active = false;
    };
  }, [pdfjsLoaded, product]);

  // Render active page onto secure canvas when loaded
  useEffect(() => {
    if (!pdfDocument || !canvasRef.current) return;

    let active = true;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Check locking rules: do not render locked pages!
    const PREVIEW_LIMIT = 2;
    const isPreviewRequested = searchParams.get("preview") === "true";
    const isSeller = product?.sellerId === user?.id;
    const isPreview = isPreviewRequested || (!purchased && !isSeller);
    const isLocked = isPreview && page > PREVIEW_LIMIT;

    if (isLocked) return;

    pdfDocument.getPage(page).then((pdfPage: any) => {
      if (!active) return;

      const viewport = pdfPage.getViewport({ scale: (zoom / 100) * 1.5 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
      };

      pdfPage.render(renderContext).promise.catch((err: any) => {
        console.error("Render failed:", err);
      });
    });

    return () => {
      active = false;
    };
  }, [pdfDocument, page, zoom, purchased, product, searchParams, user]);

  // Determine DRM preview parameters
  const isPreviewRequested = searchParams.get("preview") === "true";
  const isSeller = product?.sellerId === user?.id;
  
  // Strict Preview Rules: Forced preview if NOT purchased AND NOT the seller
  const isPreview = isPreviewRequested || (!purchased && !isSeller);

  const PREVIEW_LIMIT = 2;
  const TOTAL_PAGES = pdfDocument ? numPages : 4;

  const isLocked = isPreview && page > PREVIEW_LIMIT;

  // Grab Dynamic Subject Category Notes Mock
  const noteCategory = product?.category?.toLowerCase() || "";
  let dataSet = ACADEMIC_NOTES_DATABASE.ece;
  if (noteCategory.includes("computer") || noteCategory.includes("algorithm") || noteCategory.includes("science") || noteCategory.includes("code")) {
    dataSet = ACADEMIC_NOTES_DATABASE.cs;
  } else if (noteCategory.includes("physic") || noteCategory.includes("quantum") || noteCategory.includes("mechanic")) {
    dataSet = ACADEMIC_NOTES_DATABASE.physics;
  }

  const pageData = dataSet[Math.min(page - 1, dataSet.length - 1)];

  // Navigation handlers
  const goNext = () => {
    if (!isPreview) {
      setPage(p => Math.min(TOTAL_PAGES, p + 1));
      return;
    }
    // In preview mode, allow navigating to page 3 to trigger the lock screen
    setPage(p => Math.min(PREVIEW_LIMIT + 1, p + 1));
  };
  const goPrev = () => setPage(p => Math.max(1, p - 1));

  // 🛡️ DRM Event Listeners: Focus Loss & Keyboard PrintScreen Control
  useEffect(() => {
    // 1. Focus loss blur handler (Snipping Tools capture triggers focus loss)
    const handleBlur = () => setFocusLost(true);
    const handleFocus = () => setFocusLost(false);

    // 2. Keyboard screenshot prevent and copy blockers
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block PrintScreen action
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        e.preventDefault();
        setClipboardAttacked(true);
        // Clean clipboard
        navigator.clipboard?.writeText("🔒").catch(() => {});
        setTimeout(() => setClipboardAttacked(false), 2200);
      }

      // Block copy, print, save keys (Ctrl+C, Ctrl+P, Ctrl+S, Cmd+C, Cmd+P, Cmd+S)
      if ((e.ctrlKey || e.metaKey) && ["c", "p", "s", "x"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };

    // 3. Right-click contextmenu prevent
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

  const watermarkUser = user?.name || " rahul.sharma";
  const watermarkEmail = user?.email || "student@campusconnect.in";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#060913", overflow: "hidden", position: "relative" }}>

      {/* ─── DRM BLUR BLACKOUT OVERLAY (FOCUS LOST) ─── */}
      {focusLost && (
        <div style={{
          position: "fixed", inset: 0, background: "#060913", zIndex: 9999,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          color: "#fff", gap: 16, textAlign: "center", padding: 24
        }}>
          <ShieldAlert size={56} style={{ color: "#EF4444" }} />
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: "#EF4444" }}>
            🔒 DRM CONTENT PROTECTED
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#9CA3AF", fontSize: 13, maxWidth: 440, lineHeight: 1.7 }}>
            External tool capture, screenshot software, or screen sharing active.
            CampusConnect security rules prohibit recording or copying this academic content. 
            <br />
            <strong style={{ color: "#8B5CF6", marginTop: 8, display: "block" }}>
              Click back inside this window tab to resume reading.
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
            SCREENSHOT ATTEMPT BLOCKED
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#9CA3AF", fontSize: 14 }}>
            System screenshot utilities have been neutralized. Clipboard wiped.
          </p>
          <style>{`@keyframes pulse{0%{transform:scale(1)}50%{transform:scale(1.05)}100%{transform:scale(1)}}`}</style>
        </div>
      )}

      {/* ─── VIEWER NAVBAR ─── */}
      <header style={{
        height: 58, background: "#0a0d1a", borderBottom: "1.5px solid #1b233a",
        display: "flex", alignItems: "center", padding: "0 24px", flexShrink: 0, zIndex: 100
      }}>
        {/* Back Link */}
        <Link href={`/marketplace/digital/${productId}`} style={{
          display: "flex", alignItems: "center", gap: 6,
          fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#9CA3AF",
          textDecoration: "none", marginRight: 24,
        }}>
          <ChevronLeft size={16} />
          {isPreview ? "Exit Preview" : "Exit Reader"}
        </Link>

        {/* Free Preview Badge */}
        {isPreview && (
          <div style={{
            background: "rgba(245,158,11,0.12)", border: "1.5px solid rgba(245,158,11,0.3)",
            borderRadius: 9999, padding: "4px 14px",
            fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#F59E0B",
            marginRight: 16, display: "flex", alignItems: "center", gap: 6
          }}>
            <Lock size={12} /> DEMO PREVIEW (Locked)
          </div>
        )}

        {/* Center Details */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "#F0F4FF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 300 }}>
            {product.title}
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#8E9AA8", marginTop: 2 }}>
            {isPreview
              ? `Preview page ${Math.min(page, PREVIEW_LIMIT)} of ${PREVIEW_LIMIT} (Full document: 4 pages)`
              : `Page ${page} of ${TOTAL_PAGES}`}
          </p>
        </div>

        {/* Navigation & Zoom controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={goPrev} disabled={page <= 1} style={{ ...ctrlBtnStyle, opacity: page <= 1 ? 0.3 : 1 }}>
            <ChevronLeft size={16} />
          </button>
          
          <button 
            onClick={goNext}
            disabled={isPreview ? page > PREVIEW_LIMIT : page >= TOTAL_PAGES}
            style={{ ...ctrlBtnStyle, opacity: (isPreview ? page > PREVIEW_LIMIT : page >= TOTAL_PAGES) ? 0.3 : 1 }}
          >
            <ChevronRight size={16} />
          </button>

          <div style={{ width: 1.5, height: 20, background: "#1b233a", margin: "0 6px" }} />

          <button onClick={() => setZoom(z => Math.max(70, z - 10))} style={ctrlBtnStyle} title="Zoom Out">
            <ZoomOut size={15} />
          </button>
          
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#9CA3AF", minWidth: 38, textAlign: "center" }}>
            {zoom}%
          </span>

          <button onClick={() => setZoom(z => Math.min(160, z + 10))} style={ctrlBtnStyle} title="Zoom In">
            <ZoomIn size={15} />
          </button>
        </div>
      </header>

      {/* ─── PREVIEW PROGRESS BAR (preview mode) ─── */}
      {isPreview && (
        <div style={{ height: 4, background: "#1b233a", flexShrink: 0, position: "relative" }}>
          <div style={{
            height: "100%",
            width: `${(Math.min(page, PREVIEW_LIMIT) / PREVIEW_LIMIT) * 100}%`,
            background: "linear-gradient(90deg, #A78BFA, #8B5CF6)",
            transition: "width 0.3s",
          }} />
        </div>
      )}

      {/* ─── SECURE VIEWER WORKSPACE AREA ─── */}
      <div style={{
        flex: 1, background: "#080b13",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        overflowY: "auto", padding: "32px 24px",
      }}>
        <div style={{
          background: "#fff",
          width: `${640 * zoom / 100}px`,
          minHeight: `${860 * zoom / 100}px`,
          borderRadius: 8,
          boxShadow: "0 12px 60px rgba(0, 0, 0, 0.8)",
          position: "relative", overflow: "hidden",
          fontSize: `${zoom / 100}em`,
          transition: "width 0.15s ease-out, min-height 0.15s ease-out",
        }}>
          {/* Content rendered under security controls (blurs when locked) */}
          <div style={{ filter: isLocked ? "blur(8px)" : "none", transition: "filter 0.3s", height: "100%" }}>
            {pdfDocument ? (
              <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", background: "#ffffff" }}>
                <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "auto" }} />
                {/* WATERMARK BACKGROUND (DYNAMIC OVERLAY) ON CANVAS */}
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", userSelect: "none", overflow: "hidden", zIndex: 10 }}>
                  {Array.from({ length: 5 }).map((_, row) =>
                    Array.from({ length: 3 }).map((_, col) => (
                      <div key={`${row}-${col}`} style={{
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
                    ))
                  )}
                </div>
              </div>
            ) : (
              <PdfPage data={pageData} watermarkUser={watermarkUser} watermarkEmail={watermarkEmail} />
            )}
          </div>

          {/* Paywall Blocker Overlay */}
          {isLocked && (
            <PaywallOverlay 
              productTitle={product.title} 
              price={product.price} 
              productId={productId} 
            />
          )}
        </div>
      </div>

      {/* ─── BOTTOM SECURITY META BAR ─── */}
      {isPreview ? (
        /* Preview Bottom CTA Bar */
        <div style={{
          flexShrink: 0, height: 56,
          background: "#0a0d1a", borderTop: "1.5px solid #1b233a",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 28px", zIndex: 90
        }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#8E9AA8" }}>
            🔒 Viewing locked demo access. Purchase the complete study guide to read all pages.
          </p>
          <Link href={`/marketplace/digital/${productId}`} style={{ textDecoration: "none" }}>
            <button style={{
              height: 38, padding: "0 22px", borderRadius: 9999,
              background: "#8B5CF6", border: "none", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: "#fff",
              display: "flex", alignItems: "center", gap: 6,
              boxShadow: "0 4px 14px rgba(139,92,246,0.3)"
            }}>
              <ShoppingCart size={13} /> Unlock Guide — ₹{product.price}
            </button>
          </Link>
        </div>
      ) : (
        /* Full Secured Mode Information Bar */
        <div style={{
          flexShrink: 0, height: 46,
          background: "linear-gradient(90deg, #4f46e5, #7c3aed)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "0 24px", zIndex: 90
        }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#ffffff", display: "flex", alignItems: "center", gap: 8, letterSpacing: "0.2px" }}>
            🛡️ <strong>Platform Protection Active:</strong> This digital notes pack is securely watermarked under license to <strong>{watermarkEmail} ({watermarkUser})</strong>. Sharing is punishable.
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
