"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { StudentLayout } from "@/components/StudentLayout";
import api from "@/lib/axios";
import {
  TrendingUp,
  Wallet,
  Percent,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Search,
  Info,
  RefreshCw,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

interface Stats {
  totalDigitalSales: string;
  totalDigitalSalesRaw: number;
  totalCuts: string;
  totalCutsRaw: number;
  totalEarnings: string;
  totalEarningsRaw: number;
  releasedEarnings: string;
  releasedEarningsRaw: number;
  pendingEarnings: string;
  pendingEarningsRaw: number;
  overdueCount: number;
}

interface ChartItem {
  day: string;
  earnings: number;
  sales: number;
}

interface PayoutItem {
  id: string;
  orderId: string;
  productTitle: string;
  grossAmount: string;
  platformCut: string;
  netAmount: string;
  status: "pending" | "released" | "overdue";
  isOverdue: boolean;
  releaseAfter: string;
  releasedAt: string | null;
  date: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerEnrollment?: string;
}

interface EarningsData {
  stats: Stats;
  chartData: ChartItem[];
  timeline: PayoutItem[];
}

function initials(name: string) {
  return (name || "?").split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

export default function StudentEarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartMode, setChartMode] = useState<"earnings" | "sales">("earnings");
  const [tooltip, setTooltip] = useState<{ day: string; value: number } | null>(null);
  
  // Search and status filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "released" | "overdue">("all");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchEarnings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/marketplace/earnings");
      if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to load earnings dashboard data", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  // Filters
  const filteredTimeline = useMemo(() => {
    if (!data) return [];
    return data.timeline.filter(item => {
      const matchesSearch = item.productTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "pending" && item.status === "pending" && !item.isOverdue) ||
        (statusFilter === "released" && item.status === "released") ||
        (statusFilter === "overdue" && item.isOverdue);

      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, statusFilter]);

  // Export CSV
  const handleExportCSV = () => {
    if (!data) return;
    const headers = ["Order ID", "Product", "Buyer Name", "Buyer Email", "Buyer Enrollment", "Gross Sale", "Platform Cut", "Net Earnings", "Status", "Release Date", "Settle Date"];
    const rows = filteredTimeline.map(item => [
      item.orderId,
      item.productTitle,
      item.buyerName || "Unknown Student",
      item.buyerEmail || "N/A",
      item.buyerEnrollment || "N/A",
      item.grossAmount,
      item.platformCut,
      item.netAmount,
      item.status,
      item.releaseAfter,
      item.releasedAt || "N/A"
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `My_Seller_Earnings_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV report downloaded successfully!");
  };

  // Chart plotting helpers
  const chartData = data?.chartData ?? [];
  const chartValues = chartData.map(d => (chartMode === "earnings" ? d.earnings : d.sales));
  const MAX_V = Math.max(...chartValues, 1);
  const H = 150, W_PAD = 40;

  const pts = chartData.map((d, i) => {
    const val = chartMode === "earnings" ? d.earnings : d.sales;
    return {
      x: W_PAD + i * ((560 - W_PAD * 2) / Math.max(chartData.length - 1, 1)),
      y: H - (val / MAX_V) * H,
      day: d.day,
      value: val,
    };
  });

  const linePath = pts.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(" ");
  const fillPath = pts.length > 0 ? `${linePath} L${pts[pts.length - 1].x},${H} L${pts[0].x},${H} Z` : "";

  return (
    <StudentLayout>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .earn-container {
          font-family: 'DM Sans', sans-serif;
          color: #F0F4FF;
          padding: 32px 40px;
          max-width: 1120px;
          margin: 0 auto;
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .glass-block {
          background: rgba(13, 20, 38, 0.45);
          border: 1px solid rgba(30, 45, 74, 0.7);
          border-radius: 20px;
          backdrop-filter: blur(16px);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          position: relative;
          overflow: hidden;
        }

        .glass-block::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
          pointer-events: none;
        }

        .glass-block:hover {
          border-color: rgba(79, 142, 247, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(79, 142, 247, 0.05);
        }

        .metric-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
          box-sizing: border-box;
        }

        .metric-icon-wrapper {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .metric-card:hover .metric-icon-wrapper {
          transform: scale(1.1);
        }

        /* Metric colors */
        .color-net { color: #10B981; }
        .color-settled { color: #3B82F6; }
        .color-escrow { color: #F59E0B; }
        .color-platform { color: #EC4899; }

        .bg-net-wrapper { background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.2); }
        .bg-settled-wrapper { background: rgba(59, 130, 246, 0.1); border-color: rgba(59, 130, 246, 0.2); }
        .bg-escrow-wrapper { background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.2); }
        .bg-platform-wrapper { background: rgba(236, 72, 153, 0.1); border-color: rgba(236, 72, 153, 0.2); }

        .highlight-card {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(13, 20, 38, 0.45) 80%);
          border-color: rgba(16, 185, 129, 0.35);
        }
        .highlight-card:hover {
          border-color: rgba(16, 185, 129, 0.6);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.1);
        }

        /* Segmented Filter Control */
        .filter-tabs-wrapper {
          display: flex;
          background: rgba(10, 15, 30, 0.7);
          padding: 4px;
          border-radius: 12px;
          border: 1px solid rgba(30, 45, 74, 0.8);
          gap: 2px;
        }

        .filter-tab-btn {
          border: none;
          background: transparent;
          color: #8C9CBF;
          font-size: 11px;
          font-weight: 700;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .filter-tab-btn:hover {
          color: #FFF;
          background: rgba(255, 255, 255, 0.03);
        }

        .filter-tab-btn.active {
          background: rgba(30, 45, 74, 0.9);
          color: #FFF;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        /* Chart switches */
        .chart-toggle-btn {
          border: none;
          background: transparent;
          color: #8C9CBF;
          font-size: 11px;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .chart-toggle-btn.active {
          background: rgba(59, 130, 246, 0.15);
          color: #60A5FA;
          border: 1px solid rgba(59, 130, 246, 0.25);
        }

        /* Settlement Table */
        .settle-table-container {
          overflow-x: auto;
          border-radius: 18px;
        }

        .settle-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .settle-th {
          background: rgba(17, 27, 48, 0.7);
          color: #8C9CBF;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(30, 45, 74, 0.8);
          white-space: nowrap;
        }

        .settle-tr {
          transition: background-color 0.2s ease;
        }

        .settle-td {
          padding: 16px 20px;
          font-size: 13px;
          border-bottom: 1px solid rgba(30, 45, 74, 0.35);
          color: #E2E8F0;
          vertical-align: middle;
          white-space: nowrap;
        }

        .settle-tr:hover {
          background: rgba(79, 142, 247, 0.03);
        }

        .settle-tr:last-child .settle-td {
          border-bottom: none;
        }

        /* Badges */
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 9999px;
          font-size: 10px;
          font-weight: 700;
          border: 1px solid transparent;
          letter-spacing: 0.3px;
        }

        .badge-success {
          background: rgba(16, 185, 129, 0.08);
          color: #10B981;
          border-color: rgba(16, 185, 129, 0.2);
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.03);
        }
        
        .badge-pending {
          background: rgba(245, 158, 11, 0.08);
          color: #F59E0B;
          border-color: rgba(245, 158, 11, 0.2);
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.03);
        }
        
        .badge-error {
          background: rgba(239, 68, 68, 0.08);
          color: #EF4444;
          border-color: rgba(239, 68, 68, 0.2);
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.03);
        }

        /* Buyer Avatar */
        .buyer-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1E2D4A, #111B30);
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 11px;
          color: #F0F4FF;
          flex-shrink: 0;
          font-family: 'Sora', sans-serif;
        }

        /* Toast notifications */
        .toast-box {
          position: fixed;
          bottom: 32px;
          right: 32px;
          padding: 16px 24px;
          border-radius: 14px;
          color: #fff;
          z-index: 1000;
          font-weight: 600;
          font-size: 13px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          gap: 10px;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
        }

        /* Ratio Bar */
        .ratio-bar-container {
          width: 100%;
          height: 6px;
          background: rgba(30, 45, 74, 0.6);
          border-radius: 9999px;
          overflow: hidden;
          display: flex;
          margin: 12px 0;
        }

        .ratio-fill-net {
          height: 100%;
          background: linear-gradient(90deg, #10B981, #059669);
          border-radius: 9999px 0 0 9999px;
        }

        .ratio-fill-cut {
          height: 100%;
          background: linear-gradient(90deg, #EC4899, #DB2777);
          border-radius: 0 9999px 9999px 0;
        }

        @media (max-width: 1024px) {
          .chart-split-student {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 768px) {
          .earn-container { padding: 20px 16px 80px !important; }
          .metrics-grid-student { grid-template-columns: 1fr 1fr !important; gap: 12px !important; }
          .payouts-controls-student { flex-direction: column !important; align-items: stretch !important; gap: 16px !important; }
          .payouts-controls-right { width: 100% !important; justify-content: space-between !important; }
          .search-input-wrapper { flex: 1 !important; }
        }
      `}</style>

      {toast && (
        <div className="toast-box" style={{ background: toast.type === "success" ? "rgba(16, 185, 129, 0.9)" : "rgba(239, 68, 68, 0.9)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {toast.type === "success" ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
            {toast.message}
          </span>
        </div>
      )}

      <div className="earn-container">
        {/* Header Title */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#6B7280", fontSize: 13, marginBottom: 6 }}>
              <Link href="/marketplace/profile" style={{ display: "flex", alignItems: "center", gap: 4, color: "#4F8EF7", textDecoration: "none", fontWeight: 500 }}>
                <ArrowLeft size={14} /> My Profile
              </Link>
              <span style={{ opacity: 0.5 }}>/</span>
              <span style={{ color: "#8C9CBF" }}>Seller Revenues</span>
            </div>
            <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, margin: 0, color: "#FFF", letterSpacing: "-0.5px" }}>
              My Seller Payouts
            </h1>
          </div>
          <button
            onClick={fetchEarnings}
            style={{
              background: "rgba(30, 45, 74, 0.4)",
              border: "1px solid rgba(30, 45, 74, 0.8)",
              color: "#8C9CBF",
              padding: 10,
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = "#FFF";
              e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.4)";
              e.currentTarget.style.background = "rgba(30, 45, 74, 0.8)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = "#8C9CBF";
              e.currentTarget.style.borderColor = "rgba(30, 45, 74, 0.8)";
              e.currentTarget.style.background = "rgba(30, 45, 74, 0.4)";
            }}
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {/* METRIC BOXES */}
        <div className="metrics-grid-student" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 28 }}>
          {loading ? (
            Array(4).fill(0).map((_, idx) => (
              <div key={idx} className="glass-block metric-card" style={{ height: 120 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ width: 80, height: 12, background: "#1E2D4A", borderRadius: 4 }} />
                  <div style={{ width: 24, height: 24, background: "#1E2D4A", borderRadius: "50%" }} />
                </div>
                <div>
                  <div style={{ width: 120, height: 24, background: "#1E2D4A", borderRadius: 6, marginBottom: 8 }} />
                  <div style={{ width: 150, height: 10, background: "#1E2D4A", borderRadius: 4 }} />
                </div>
              </div>
            ))
          ) : (
            <>
              {/* Card 1: Net Earnings */}
              <div className="glass-block metric-card highlight-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "1.2px", textTransform: "uppercase", color: "#8C9CBF" }}>Net Earnings</span>
                  <div className="metric-icon-wrapper bg-net-wrapper color-net">
                    <Wallet size={16} />
                  </div>
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 800, margin: "6px 0 2px 0", color: "#FFF", letterSpacing: "-0.5px" }}>
                    {data?.stats.totalEarnings}
                  </h3>
                  <span style={{ fontSize: 10, color: "#8C9CBF" }}>Platform commission deducted net payout</span>
                </div>
              </div>

              {/* Card 2: Released Settlement */}
              <div className="glass-block metric-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "1.2px", textTransform: "uppercase", color: "#8C9CBF" }}>Settled to Bank</span>
                  <div className="metric-icon-wrapper bg-settled-wrapper color-settled">
                    <CheckCircle size={16} />
                  </div>
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 800, margin: "6px 0 2px 0", color: "#FFF", letterSpacing: "-0.5px" }}>
                    {data?.stats.releasedEarnings}
                  </h3>
                  <span style={{ fontSize: 10, color: "#8C9CBF" }}>Transferred to your bank account</span>
                </div>
              </div>

              {/* Card 3: Pending Holds */}
              <div className="glass-block metric-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "1.2px", textTransform: "uppercase", color: "#8C9CBF" }}>Escrow Hold</span>
                  <div className={`metric-icon-wrapper ${data?.stats.overdueCount ? "bg-platform-wrapper" : "bg-escrow-wrapper"} ${data?.stats.overdueCount ? "color-platform" : "color-escrow"}`}>
                    {data?.stats.overdueCount ? <AlertTriangle size={16} /> : <Clock size={16} />}
                  </div>
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 800, margin: "6px 0 2px 0", color: "#FFF", letterSpacing: "-0.5px" }}>
                    {data?.stats.pendingEarnings}
                  </h3>
                  <span style={{ fontSize: 10, color: data?.stats.overdueCount ? "#EF4444" : "#8C9CBF", fontWeight: data?.stats.overdueCount ? 600 : 400 }}>
                    {data?.stats.overdueCount ? `${data.stats.overdueCount} payout release overdue` : "Awaiting hold release delay"}
                  </span>
                </div>
              </div>

              {/* Card 4: Platform Cuts */}
              <div className="glass-block metric-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "1.2px", textTransform: "uppercase", color: "#8C9CBF" }}>Commissions Paid</span>
                  <div className="metric-icon-wrapper bg-platform-wrapper color-platform">
                    <Percent size={16} />
                  </div>
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 800, margin: "6px 0 2px 0", color: "#FFF", letterSpacing: "-0.5px" }}>
                    {data?.stats.totalCuts}
                  </h3>
                  <span style={{ fontSize: 10, color: "#8C9CBF" }}>Total transaction rev cut deducted</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* CHART & DETAILS SEGMENT */}
        <div className="chart-split-student" style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20, marginBottom: 28 }}>
          {/* SVG line chart */}
          <div className="glass-block" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14, color: "#F0F4FF" }}>Earnings Timeline (7 Days)</span>
              <div style={{ display: "flex", gap: 4, background: "rgba(10, 15, 30, 0.6)", padding: 3, borderRadius: 8, border: "1px solid rgba(30, 45, 74, 0.8)" }}>
                <button className={`chart-toggle-btn ${chartMode === "earnings" ? "active" : ""}`} onClick={() => setChartMode("earnings")}>Net Profit</button>
                <button className={`chart-toggle-btn ${chartMode === "sales" ? "active" : ""}`} onClick={() => setChartMode("sales")}>Sales GMV</button>
              </div>
            </div>

            <div style={{ position: "relative", width: "100%" }}>
              {loading ? (
                <div style={{ height: 160, width: "100%", background: "rgba(17, 27, 48, 0.4)", borderRadius: 12 }} />
              ) : pts.length > 0 ? (
                <svg viewBox="0 0 560 170" style={{ height: 150, width: "100%", overflow: "visible" }}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartMode === "earnings" ? "#10B981" : "#3B82F6"} stopOpacity="0.25" />
                      <stop offset="100%" stopColor={chartMode === "earnings" ? "#10B981" : "#3B82F6"} stopOpacity="0.01" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Guideline cuts */}
                  {[0.3, 0.6, 1].map(f => (
                    <line key={f} x1={W_PAD} y1={H - f * H} x2={560 - W_PAD} y2={H - f * H} stroke="rgba(30, 45, 74, 0.4)" strokeWidth="0.8" strokeDasharray="3,3" />
                  ))}
                  {[0.3, 0.6, 1].map(f => (
                    <text key={f} x={W_PAD - 8} y={H - f * H + 3} textAnchor="end" fontSize="9" fill="#8C9CBF" fontFamily="JetBrains Mono" fontWeight="600">
                      ₹{(MAX_V * f).toFixed(0)}
                    </text>
                  ))}

                  {/* Vertical Guideline cuts */}
                  {pts.map(p => (
                    <line key={`v-${p.day}`} x1={p.x} y1={0} x2={p.x} y2={H} stroke="rgba(30, 45, 74, 0.25)" strokeWidth="0.8" strokeDasharray="3,3" />
                  ))}

                  {/* Fill path */}
                  <path d={fillPath} fill="url(#chartGradient)" />
                  
                  {/* Thick glowing background path */}
                  <path d={linePath} fill="none" stroke={chartMode === "earnings" ? "#10B981" : "#3B82F6"} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity="0.15" />
                  
                  {/* Primary sharp stroke path */}
                  <path d={linePath} fill="none" stroke={chartMode === "earnings" ? "#10B981" : "#3B82F6"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                  {pts.map(p => (
                    <g key={p.day}>
                      <text x={p.x} y={H + 16} textAnchor="middle" fontSize="9" fill="#8C9CBF" fontWeight="600">{p.day}</text>
                      
                      {tooltip?.day === p.day && (
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={8}
                          fill={chartMode === "earnings" ? "#10B981" : "#3B82F6"}
                          opacity="0.25"
                          style={{ pointerEvents: "none" }}
                        />
                      )}
                      
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={tooltip?.day === p.day ? 5.5 : 4}
                        fill={chartMode === "earnings" ? "#10B981" : "#3B82F6"}
                        stroke="#0D1426"
                        strokeWidth="2"
                        style={{ cursor: "pointer", transition: "all 0.15s ease" }}
                        onMouseEnter={() => setTooltip({ day: p.day, value: p.value })}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    </g>
                  ))}
                </svg>
              ) : (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#8C9CBF", fontSize: 13 }}>No sales records found on this timeline.</div>
              )}

              {tooltip && (() => {
                const pt = pts.find(p => p.day === tooltip.day);
                if (!pt) return null;
                return (
                  <div
                    className="glass-block"
                    style={{
                      position: "absolute",
                      left: `${(pt.x / 560) * 100}%`,
                      top: `${(pt.y / 170) * 100}%`,
                      transform: "translate(-50%, -125%)",
                      background: "rgba(13, 20, 38, 0.95)",
                      border: "1px solid rgba(79, 142, 247, 0.4)",
                      padding: "6px 12px",
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      pointerEvents: "none",
                      whiteSpace: "nowrap",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
                    }}
                  >
                    <span style={{ color: "#8C9CBF" }}>{pt.day}: </span>
                    <span style={{ color: chartMode === "earnings" ? "#10B981" : "#3B82F6", fontFamily: "JetBrains Mono" }}>₹{tooltip.value.toLocaleString("en-IN")}</span>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Escrow payout overview */}
          <div className="glass-block" style={{ padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14, display: "block", marginBottom: 8, color: "#F0F4FF" }}>
                Escrow Agreement Split
              </span>
              <p style={{ fontSize: 11.5, color: "#8C9CBF", margin: "0 0 14px 0", lineHeight: 1.6 }}>
                Digital assets remain in buyer protection escrow. The visualization below represents how gross platform collections are split.
              </p>
            </div>

            {(() => {
              const grossRaw = data?.stats.totalDigitalSalesRaw || 0;
              const cutsRaw = data?.stats.totalCutsRaw || 0;
              const earningsRaw = data?.stats.totalEarningsRaw || 0;
              const netPercent = grossRaw > 0 ? (earningsRaw / grossRaw) * 100 : 100;
              const cutPercent = grossRaw > 0 ? (cutsRaw / grossRaw) * 100 : 0;
              
              return (
                <div style={{ margin: "4px 0 14px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 700, color: "#8C9CBF", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    <span>Profit ({netPercent.toFixed(0)}%)</span>
                    <span>Cuts ({cutPercent.toFixed(0)}%)</span>
                  </div>
                  <div className="ratio-bar-container">
                    <div className="ratio-fill-net" style={{ width: `${netPercent}%` }} />
                    <div className="ratio-fill-cut" style={{ width: `${cutPercent}%` }} />
                  </div>
                </div>
              );
            })()}

            <div style={{ background: "rgba(10, 15, 30, 0.4)", borderRadius: 14, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 11, border: "1px solid rgba(30, 45, 74, 0.5)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#3B82F6" }} />
                <span style={{ color: "#8C9CBF" }}>Gross Sales:</span>
                <span style={{ fontFamily: "JetBrains Mono", fontWeight: 700, marginLeft: "auto", color: "#F0F4FF" }}>{data?.stats.totalDigitalSales}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#EC4899" }} />
                <span style={{ color: "#8C9CBF" }}>Commissions Deducted:</span>
                <span style={{ fontFamily: "JetBrains Mono", color: "#EC4899", fontWeight: 700, marginLeft: "auto" }}>-{data?.stats.totalCuts}</span>
              </div>
              <div style={{ borderTop: "1px solid rgba(30, 45, 74, 0.8)", padding: "10px 0 0 0", display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
                <span style={{ color: "#FFF", fontWeight: 600 }}>Your Net Profit:</span>
                <span style={{ fontFamily: "JetBrains Mono", color: "#10B981", fontWeight: 700, marginLeft: "auto" }}>{data?.stats.totalEarnings}</span>
              </div>
            </div>

            <div style={{ borderTop: "1px solid rgba(30, 45, 74, 0.8)", paddingTop: 12, marginTop: 16, fontSize: 10, color: "#8C9CBF", display: "flex", alignItems: "center", gap: 8 }}>
              <Info size={14} style={{ color: "#3B82F6", flexShrink: 0 }} />
              <span>Digital payouts clear automatically after college-configured release delays.</span>
            </div>
          </div>
        </div>

        {/* PAYOUT TIMELINE TABLE */}
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }} className="payouts-controls-student">
          <div className="filter-tabs-wrapper">
            {[
              { key: "all", label: "All Settlements" },
              { key: "pending", label: "Escrows Hold" },
              { key: "released", label: "Paid to Bank" },
              { key: "overdue", label: "Overdue release" }
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key as any)}
                className={`filter-tab-btn ${statusFilter === f.key ? "active" : ""}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }} className="payouts-controls-right">
            {/* Search */}
            <div style={{ position: "relative", width: 190 }} className="search-input-wrapper">
              <input
                type="text"
                placeholder="Search Product…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  height: 36,
                  padding: "0 12px 0 34px",
                  background: "rgba(10, 15, 30, 0.6)",
                  border: "1px solid rgba(30, 45, 74, 0.8)",
                  borderRadius: "10px",
                  fontSize: 12,
                  outline: "none",
                  color: "#FFF",
                  boxSizing: "border-box",
                  transition: "all 0.2s"
                }}
                onFocus={e => e.currentTarget.style.borderColor = "#3B82F6"}
                onBlur={e => e.currentTarget.style.borderColor = "rgba(30, 45, 74, 0.8)"}
              />
              <Search size={13} style={{ position: "absolute", left: 11, top: 11, color: "#8C9CBF" }} />
            </div>

            {/* Export */}
            <button
              onClick={handleExportCSV}
              style={{
                background: "rgba(30, 45, 74, 0.4)",
                border: "1px solid rgba(30, 45, 74, 0.8)",
                color: "#FFF",
                borderRadius: "10px",
                height: 36,
                padding: "0 14px",
                fontSize: 12,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(30, 45, 74, 0.8)";
                e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.3)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(30, 45, 74, 0.4)";
                e.currentTarget.style.borderColor = "rgba(30, 45, 74, 0.8)";
              }}
            >
              <Download size={13} /> Export
            </button>
          </div>
        </div>

        <div className="glass-block settle-table-container">
          <table className="settle-table">
            <thead>
              <tr>
                <th className="settle-th" style={{ width: "11%" }}>Date</th>
                <th className="settle-th" style={{ width: "16%" }}>Product</th>
                <th className="settle-th" style={{ width: "22%" }}>Buyer</th>
                <th className="settle-th" style={{ width: "11%" }}>Order ID</th>
                <th className="settle-th" style={{ width: "9%", textAlign: "right" }}>Gross Sale</th>
                <th className="settle-th" style={{ width: "10%", textAlign: "right" }}>Platform Cut</th>
                <th className="settle-th" style={{ width: "10%", textAlign: "right" }}>Net Payout</th>
                <th className="settle-th" style={{ width: "11%" }}>Release Date</th>
                <th className="settle-th" style={{ width: "10%", textAlign: "right" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <tr key={i} className="settle-tr">
                    {Array(9).fill(0).map((_, j) => {
                      const isRightAlign = [4, 5, 6, 8].includes(j);
                      return (
                        <td key={j} className="settle-td" style={{ textAlign: isRightAlign ? "right" : "left" }}>
                          <div style={{
                            height: 16,
                            background: "rgba(30, 45, 74, 0.3)",
                            borderRadius: 4,
                            width: j === 1 ? "90%" : j === 2 ? "80%" : "60%",
                            marginLeft: isRightAlign ? "auto" : "0"
                          }} />
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : filteredTimeline.length === 0 ? (
                <tr>
                  <td colSpan={9} className="settle-td" style={{ textAlign: "center", padding: 48, color: "#8C9CBF", fontSize: 13 }}>
                    No payout logs match this status filter.
                  </td>
                </tr>
              ) : (
                filteredTimeline.map(item => (
                  <tr key={item.id} className="settle-tr">
                    <td className="settle-td" style={{ fontFamily: "JetBrains Mono", fontSize: 12, color: "#8C9CBF" }}>{item.date}</td>
                    <td className="settle-td" style={{ fontWeight: 700, color: "#FFF", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "160px" }} title={item.productTitle}>{item.productTitle}</td>
                    <td className="settle-td">
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="buyer-avatar">
                          {initials(item.buyerName || "Unknown Student")}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }} title={item.buyerEmail || undefined}>
                          <span style={{ fontWeight: 600, color: "#FFF", fontSize: "13px" }}>{item.buyerName || "Unknown Student"}</span>
                          {item.buyerEnrollment && (
                            <span style={{ fontSize: "10px", color: "#8C9CBF", background: "rgba(255, 255, 255, 0.05)", padding: "1px 5px", borderRadius: 4, fontWeight: 500 }}>
                              {item.buyerEnrollment}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="settle-td" style={{ fontFamily: "JetBrains Mono", fontSize: 12, color: "#3B82F6", opacity: 0.85 }}>{item.orderId.substring(0, 10)}...</td>
                    <td className="settle-td" style={{ fontFamily: "JetBrains Mono", fontWeight: 600, textAlign: "right" }}>{item.grossAmount}</td>
                    <td className="settle-td" style={{ fontFamily: "JetBrains Mono", color: "#EC4899", fontWeight: 600, textAlign: "right" }}>-{item.platformCut}</td>
                    <td className="settle-td" style={{ fontFamily: "JetBrains Mono", color: "#10B981", fontWeight: 700, textAlign: "right" }}>{item.netAmount}</td>
                    <td className="settle-td" style={{ fontFamily: "JetBrains Mono", fontSize: 12, color: "#F0F4FF" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span>{item.releaseAfter}</span>
                        {item.status === "pending" && (
                          <span style={{
                            fontSize: 9.5,
                            color: item.isOverdue ? "#EF4444" : "#8C9CBF",
                            background: item.isOverdue ? "rgba(239, 68, 68, 0.08)" : "rgba(245, 158, 11, 0.08)",
                            padding: "1px 5px",
                            borderRadius: 4,
                            border: item.isOverdue ? "1px solid rgba(239, 68, 68, 0.2)" : "1px solid rgba(245, 158, 11, 0.2)",
                            fontWeight: 600,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3
                          }}>
                            <span style={{ display: "inline-block", width: 4, height: 4, borderRadius: "50%", background: item.isOverdue ? "#EF4444" : "#F59E0B" }} />
                            {item.isOverdue ? "Overdue" : "Hold"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="settle-td" style={{ textAlign: "right" }}>
                      <span className={`status-badge ${
                        item.status === "released"
                          ? "badge-success"
                          : item.isOverdue
                          ? "badge-error"
                          : "badge-pending"
                      }`}>
                        {item.status === "released" ? (
                          <>
                            <CheckCircle size={10} />
                            <span>Paid to Bank</span>
                          </>
                        ) : item.isOverdue ? (
                          <>
                            <AlertTriangle size={10} />
                            <span>Overdue</span>
                          </>
                        ) : (
                          <>
                            <Clock size={10} />
                            <span>Held in Escrow</span>
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </StudentLayout>
  );
}
