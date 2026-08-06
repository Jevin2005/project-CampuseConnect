"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, AlertTriangle, Video, Layers, Zap, Shield, Clock, Loader2, ArrowRight, FileText } from "lucide-react";
import api from "@/lib/axios";

type ProcessingStage = "uploading" | "queued" | "transcoding" | "uploading_chunks" | "done";

interface ProcessingItem {
  id: number;
  fileName: string;
  type: "video" | "document" | "media";
  url: string;
  status: "done" | "transcoding" | "queued";
}

interface StatusData {
  productId: string;
  title: string;
  status: string;
  hlsReady: boolean;
  items?: ProcessingItem[];
}

const STAGES: { key: ProcessingStage; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    key: "uploading",
    label: "Upload Complete",
    desc: "Raw media files stored securely on server",
    icon: <Video size={16} />,
  },
  {
    key: "queued",
    label: "Processing Queued",
    desc: "Added to multi-video encoding queue",
    icon: <Clock size={16} />,
  },
  {
    key: "transcoding",
    label: "HLS Transcoding",
    desc: "Segmenting video into 4-second adaptive stream chunks",
    icon: <Layers size={16} />,
  },
  {
    key: "uploading_chunks",
    label: "Optimizing Segments",
    desc: "Indexing HLS playlist streams for instant playback",
    icon: <Zap size={16} />,
  },
  {
    key: "done",
    label: "Stream Ready",
    desc: "All videos & documents published with active DRM protection",
    icon: <Shield size={16} />,
  },
];

function getStageIndex(status: string): number {
  if (status === "active") return 4;
  if (status === "PROCESSING") return 2;
  if (status === "QUEUED") return 1;
  return 1;
}

function VideoProcessingInner() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("id") ?? "";

  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [stageIndex, setStageIndex] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedRef = useRef<NodeJS.Timeout | null>(null);
  const isDone = statusData?.hlsReady === true;

  const poll = useCallback(async () => {
    if (!productId) return;
    try {
      const res = await api.get(`/api/student/content/product/${productId}/status`);
      const data: StatusData = res.data;
      setStatusData(data);
      const idx = getStageIndex(data.status);
      setStageIndex(idx);
    } catch (err: any) {
      console.error("[VideoProcessing] Status poll error:", err?.message);
    }
  }, [productId]);

  useEffect(() => {
    if (!productId) return;
    poll();
    pollingRef.current = setInterval(() => {
      poll();
    }, 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [poll, productId]);

  useEffect(() => {
    if (isDone && pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, [isDone]);

  useEffect(() => {
    elapsedRef.current = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
    return () => {
      if (elapsedRef.current) clearInterval(elapsedRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isDone) return;
    const countdown = setInterval(() => {
      setRedirectCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          window.location.href = `/marketplace/viewer/video?id=${productId}`;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, [isDone, productId]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDone) {
        e.preventDefault();
        e.returnValue = "Your content is still processing in the background.";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDone]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const progressPercent = isDone ? 100 : Math.min(((stageIndex + 1) / STAGES.length) * 100, 90);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0B0F17",
      color: "#F3F4F6",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      boxSizing: "border-box"
    }}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .proc-card {
          width: 100%;
          max-width: 620px;
          background: #141C2B;
          border: 1px solid #233044;
          border-radius: 16px;
          padding: 36px 32px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
          box-sizing: border-box;
        }
        .stage-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 10px;
          background: #1A2436;
          border: 1px solid #26354D;
          transition: all 0.2s ease;
        }
        .stage-item.completed {
          background: rgba(16, 185, 129, 0.06);
          border-color: rgba(16, 185, 129, 0.25);
        }
        .stage-item.active {
          background: rgba(59, 130, 246, 0.08);
          border-color: rgba(59, 130, 246, 0.35);
        }
        .stage-item.pending {
          opacity: 0.5;
        }
        .action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          height: 48px;
          border-radius: 10px;
          background: #10B981;
          color: #FFFFFF;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .action-btn:hover {
          background: #059669;
        }
        @media (max-width: 640px) {
          .proc-card {
            padding: 24px 18px;
            border-radius: 14px;
          }
          .title-text {
            font-size: 20px !important;
          }
          .timer-box {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 6px;
          }
        }
      `}</style>

      <div className="proc-card">
        {isDone ? (
          /* ── READY STATE ── */
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px", color: "#10B981"
            }}>
              <CheckCircle size={32} />
            </div>

            <h1 className="title-text" style={{ fontSize: 24, fontWeight: 700, color: "#F9FAFB", margin: "0 0 8px" }}>
              Content Processing Complete
            </h1>
            <p style={{ fontSize: 14, color: "#9CA3AF", margin: "0 0 24px", lineHeight: 1.5 }}>
              {statusData?.title ? (
                <>All files for <strong>"{statusData.title}"</strong> are now ready for secure DRM streaming.</>
              ) : (
                "Your course videos and study materials are ready for high-definition streaming."
              )}
            </p>

            {/* Line-by-line Content Items Section */}
            {statusData?.items && statusData.items.length > 0 && (
              <div style={{ textAlign: "left", marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.5px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>PUBLISHED CONTENT LIST ({statusData.items.length} FILES)</span>
                  <span style={{ color: "#10B981" }}>
                    ✓ All {statusData.items.length} Files Ready
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {statusData.items.map((item) => {
                    const isVid = item.type === "video";
                    return (
                      <div
                        key={item.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "12px 14px",
                          borderRadius: 10,
                          background: "rgba(16, 185, 129, 0.06)",
                          border: "1px solid rgba(16, 185, 129, 0.25)"
                        }}
                      >
                        <div style={{ color: isVid ? "#60A5FA" : "#A78BFA", display: "flex", alignItems: "center", flexShrink: 0 }}>
                          {isVid ? <Video size={18} /> : <FileText size={18} />}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#F3F4F6", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {item.fileName}
                          </div>
                          <div style={{ fontSize: 11, color: "#9CA3AF" }}>
                            {isVid ? "HLS Multi-Bitrate Video Stream" : "Secure DRM Academic Document"}
                          </div>
                        </div>

                        <span style={{ fontSize: 11, fontWeight: 600, color: "#10B981", background: "rgba(16,185,129,0.12)", padding: "3px 8px", borderRadius: 4, display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <CheckCircle size={10} /> Stream Ready
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <a href={`/marketplace/viewer/video?id=${productId}`} className="action-btn">
              <span>Open Course Player</span>
              <ArrowRight size={18} />
              <span style={{ fontSize: 12, opacity: 0.85, background: "rgba(0,0,0,0.2)", padding: "2px 6px", borderRadius: 4 }}>
                {redirectCountdown}s
              </span>
            </a>
            <p style={{ fontSize: 12, color: "#6B7280", marginTop: 12 }}>
              Redirecting automatically in {redirectCountdown} seconds…
            </p>
          </div>
        ) : (
          /* ── PROCESSING STATE ── */
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "rgba(59, 130, 246, 0.12)",
                border: "1px solid rgba(59, 130, 246, 0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#3B82F6", flexShrink: 0
              }}>
                <Loader2 size={22} style={{ animation: "spin 1.2s linear infinite" }} />
              </div>
              <div>
                <h1 className="title-text" style={{ fontSize: 20, fontWeight: 700, color: "#F9FAFB", margin: 0 }}>
                  Processing Course Content
                </h1>
                <p style={{ fontSize: 13, color: "#9CA3AF", margin: "2px 0 0" }}>
                  {statusData?.title ? statusData.title : "Converting uploaded videos & study materials"}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: "#9CA3AF", marginBottom: 8 }}>
                <span>ENCODING PROGRESS</span>
                <span style={{ color: "#3B82F6" }}>{Math.round(progressPercent)}%</span>
              </div>
              <div style={{ height: 8, background: "#1E293B", borderRadius: 4, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${progressPercent}%`,
                  background: "#3B82F6",
                  borderRadius: 4,
                  transition: "width 0.8s ease"
                }} />
              </div>
            </div>

            {/* Line-by-line Content Items Section */}
            {statusData?.items && statusData.items.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.5px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>CONTENT PROCESSING LIST ({statusData.items.length} FILES)</span>
                  <span style={{ color: "#3B82F6" }}>
                    {statusData.items.filter(i => i.status === "done").length} / {statusData.items.length} Ready
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {statusData.items.map((item) => {
                    const isVid = item.type === "video";
                    const isItemDone = item.status === "done";
                    const isTranscoding = item.status === "transcoding";

                    return (
                      <div
                        key={item.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "12px 14px",
                          borderRadius: 10,
                          background: isItemDone ? "rgba(16, 185, 129, 0.06)" : isTranscoding ? "rgba(59, 130, 246, 0.08)" : "#1A2436",
                          border: `1px solid ${isItemDone ? "rgba(16, 185, 129, 0.25)" : isTranscoding ? "rgba(59, 130, 246, 0.35)" : "#26354D"}`
                        }}
                      >
                        <div style={{ color: isVid ? "#60A5FA" : "#A78BFA", display: "flex", alignItems: "center", flexShrink: 0 }}>
                          {isVid ? <Video size={18} /> : <FileText size={18} />}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#F3F4F6", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {item.fileName}
                          </div>
                          <div style={{ fontSize: 11, color: "#9CA3AF" }}>
                            {isVid ? "HLS Multi-Bitrate Video Stream" : "Secure DRM Academic Document"}
                          </div>
                        </div>

                        <div>
                          {isItemDone ? (
                            <span style={{ fontSize: 11, fontWeight: 600, color: "#10B981", background: "rgba(16,185,129,0.12)", padding: "3px 8px", borderRadius: 4, display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <CheckCircle size={10} /> Ready
                            </span>
                          ) : isTranscoding ? (
                            <span style={{ fontSize: 11, fontWeight: 600, color: "#3B82F6", background: "rgba(59,130,246,0.15)", padding: "3px 8px", borderRadius: 4, display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <Loader2 size={10} style={{ animation: "spin 1.2s linear infinite" }} /> Transcoding HLS
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, color: "#9CA3AF", background: "rgba(255,255,255,0.05)", padding: "3px 8px", borderRadius: 4 }}>
                              Queued
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stages list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {STAGES.map((stage, idx) => {
                const isCompleted = idx < stageIndex;
                const isActive = idx === stageIndex;
                const statusClass = isCompleted ? "completed" : isActive ? "active" : "pending";

                return (
                  <div key={stage.key} className={`stage-item ${statusClass}`}>
                    <div style={{ color: isCompleted ? "#10B981" : isActive ? "#3B82F6" : "#6B7280", display: "flex", alignItems: "center" }}>
                      {stage.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: isCompleted ? "#F3F4F6" : isActive ? "#60A5FA" : "#9CA3AF" }}>
                        {stage.label}
                      </div>
                      <div style={{ fontSize: 11, color: "#6B7280" }}>
                        {stage.desc}
                      </div>
                    </div>
                    <div>
                      {isCompleted ? (
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#10B981", background: "rgba(16,185,129,0.12)", padding: "2px 8px", borderRadius: 4 }}>
                          ✓ Done
                        </span>
                      ) : isActive ? (
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#3B82F6", background: "rgba(59,130,246,0.15)", padding: "2px 8px", borderRadius: 4, display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <Loader2 size={10} style={{ animation: "spin 1.2s linear infinite" }} /> In Progress
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, color: "#4B5563" }}>Pending</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Timer box */}
            <div className="timer-box" style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 16px", background: "#1A2436", border: "1px solid #26354D",
              borderRadius: 10, marginBottom: 20
            }}>
              <span style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 500 }}>Time Elapsed</span>
              <span style={{ fontFamily: "monospace", fontSize: 15, fontWeight: 700, color: "#F59E0B" }}>
                {formatTime(elapsed)}
              </span>
            </div>

            {/* Professional Notice */}
            <div style={{
              display: "flex", gap: 10, padding: "12px 14px",
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.2)",
              borderRadius: 10
            }}>
              <AlertTriangle size={16} color="#F59E0B" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 12, color: "#D1D5DB", lineHeight: 1.4 }}>
                <strong>Please keep this page open.</strong> Your content is currently being processed. You will automatically be redirected once complete.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VideoProcessingPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#0B0F17", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>
        <Loader2 size={28} style={{ animation: "spin 1s linear infinite" }} />
      </div>
    }>
      <VideoProcessingInner />
    </Suspense>
  );
}
