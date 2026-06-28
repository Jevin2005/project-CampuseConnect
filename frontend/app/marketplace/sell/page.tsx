"use client";

import { useState, useRef, useEffect } from "react";
import {
  CheckCircle, Upload, FileText, Video, Package, Layers, X,
  Plus, Trash2, ShieldCheck, HelpCircle, ArrowLeft, ArrowRight,
  File, AlertCircle, ShoppingBag
} from "lucide-react";
import { StudentLayout } from "@/components/StudentLayout";
import api from "@/lib/axios";
import { openRazorpayCheckout } from "@/lib/razorpay";
import { useAuthStore } from "@/store/authStore";

type ProdType = "physical" | "digital" | null;
type DigSub = "notes" | "video" | "both" | "bundle" | null;

interface BundleItem {
  id: string;
  title: string;
  type: "notes" | "video" | "other";
  description: string;
  file: File | null;
}

export default function SellProductPage() {
  const [step, setStep] = useState(1);
  const [prodType, setProdType] = useState<ProdType>(null);
  const [digSub, setDigSub] = useState<DigSub>(null);

  // General Fields
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [condition, setCondition] = useState("Brand New");
  const [origPrice, setOrigPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");

  // Subtype-Specific Fields
  // 1. Notes / PDF
  const [notesSubject, setNotesSubject] = useState("");
  const [notesCourseCode, setNotesCourseCode] = useState("");
  const [notesUniv, setNotesUniv] = useState("");
  const [notesPages, setNotesPages] = useState("");

  // 2. Video Course
  const [vidInstructor, setVidInstructor] = useState("");
  const [vidLecturesCount, setVidLecturesCount] = useState("");
  const [vidDuration, setVidDuration] = useState("");
  const [vidAudience, setVidAudience] = useState("");
  const [vidPrereqs, setVidPrereqs] = useState("");

  // 3. Dynamic Bundle State
  const [bundleItems, setBundleItems] = useState<BundleItem[]>([
    { id: "item-1", title: "", type: "notes", description: "", file: null }
  ]);

  // File lists based on context
  const [physicalImages, setPhysicalImages] = useState<File[]>([]);
  const [notesDocs, setNotesDocs] = useState<File[]>([]);
  const [courseVideos, setCourseVideos] = useState<File[]>([]);
  const [bothDocs, setBothDocs] = useState<File[]>([]);
  const [bothVideos, setBothVideos] = useState<File[]>([]);

  // Platform Fee Settings (Live from master admin)
  const [digitalListingFee, setDigitalListingFee] = useState(20);
  const [digitalBuyerFeePercent, setDigitalBuyerFeePercent] = useState(15);
  const [digitalSellerCutPercent, setDigitalSellerCutPercent] = useState(15);
  const [digitalPayoutDays, setDigitalPayoutDays] = useState(7);
  const [physicalTiers, setPhysicalTiers] = useState<any[]>([
    { min: 0, max: 500, percent: 5 },
    { min: 501, max: 1000, percent: 4 },
    { min: 1001, max: 2000, percent: 3 },
  ]);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [payModal, setPayModal] = useState(false);
  const [payError, setPayError] = useState("");
  const [errorToast, setErrorToast] = useState("");

  const user = useAuthStore(s => s.user);

  const physicalImgRef = useRef<HTMLInputElement>(null);
  const notesDocRef = useRef<HTMLInputElement>(null);
  const courseVideoRef = useRef<HTMLInputElement>(null);
  const bothDocRef = useRef<HTMLInputElement>(null);
  const bothVideoRef = useRef<HTMLInputElement>(null);

  // Fetch fees & settings
  useEffect(() => {
    api.get("/api/marketplace/settings")
      .then(res => {
        const d = res.data;
        if (d) {
          setDigitalListingFee(d.digitalListingFee ?? 20);
          setDigitalBuyerFeePercent(d.digitalBuyerFeePercent ?? 15);
          setDigitalSellerCutPercent(d.digitalSellerCutPercent ?? 15);
          setDigitalPayoutDays(d.digitalPayoutDays ?? 7);
          if (d.physicalTiers && Array.isArray(d.physicalTiers)) {
            setPhysicalTiers(d.physicalTiers);
          }
        }
      })
      .catch(() => { });
  }, []);

  const STEPS = ["Select Category", "Complete Form", "Verify & Publish"];

  const DIG_SUBS = [
    { key: "notes" as DigSub, icon: <FileText size={26} />, label: "Notes / PDF", desc: "Lecture notes, study guides, exam solutions.", color: "#8B5CF6", glow: "rgba(139,92,246,0.15)", fileDesc: "PDF, Word, or text documents only." },
    { key: "video" as DigSub, icon: <Video size={26} />, label: "Video Course", desc: "Concept explainer videos, tutorials, screen recordings.", color: "#10B981", glow: "rgba(16,185,129,0.15)", fileDesc: "MP4, WebM, or MKV videos only." },
    { key: "both" as DigSub, icon: <Layers size={26} />, label: "Notes + Video Pack", desc: "Dual bundles of reference slides alongside explainer videos.", color: "#F59E0B", glow: "rgba(245,158,11,0.15)", fileDesc: "Structured PDF notes AND video course lectures." },
    { key: "bundle" as DigSub, icon: <Package size={26} />, label: "Custom Semester Bundle", desc: "Multi-subject resource kit complete with customizable item list.", color: "#3B82F6", glow: "rgba(59,130,246,0.15)", fileDesc: "Upload structured assets dynamically per item." },
  ];

  const activeColor = prodType === "physical" ? "#3B82F6" : (DIG_SUBS.find(d => d.key === digSub)?.color || "#8B5CF6");
  const activeGlow = prodType === "physical" ? "rgba(59,130,246,0.15)" : (DIG_SUBS.find(d => d.key === digSub)?.glow || "rgba(139,92,246,0.15)");

  function showNotification(msg: string) {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(""), 4000);
  }

  // File Handlers & Validations
  function validateAndAddFiles(
    uploadedFiles: FileList | null,
    allowedExtensions: string[],
    setList: React.Dispatch<React.SetStateAction<File[]>>,
    typeDescription: string
  ) {
    if (!uploadedFiles) return;
    const validated: File[] = [];
    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (!allowedExtensions.includes(ext) && allowedExtensions.length > 0) {
        showNotification(`Invalid format: ${file.name}. Only ${typeDescription} allowed here.`);
        continue;
      }
      if (file.size > 200 * 1024 * 1024) { // 200MB limit
        showNotification(`File too large: ${file.name}. Maximum file size is 200MB.`);
        continue;
      }
      validated.push(file);
    }
    setList(prev => [...prev, ...validated]);
  }

  // Subtype dynamic file handlers
  const handlePhysicalImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndAddFiles(e.target.files, [".jpg", ".jpeg", ".png", ".webp"], setPhysicalImages, "images (JPG, PNG, WEBP)");
  };
  const handleNotesDocs = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndAddFiles(e.target.files, [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".txt"], setNotesDocs, "documents (PDF, DOC, DOCX, PPT, PPTX)");
  };
  const handleCourseVideos = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndAddFiles(e.target.files, [".mp4", ".webm", ".mkv", ".mov"], setCourseVideos, "videos (MP4, WEBM, MKV)");
  };
  const handleBothDocs = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndAddFiles(e.target.files, [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".txt"], setBothDocs, "documents");
  };
  const handleBothVideos = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndAddFiles(e.target.files, [".mp4", ".webm", ".mkv", ".mov"], setBothVideos, "videos");
  };

  // Bundle dynamic builders
  function addBundleItem() {
    setBundleItems(prev => [
      ...prev,
      { id: `item-${Date.now()}`, title: "", type: "notes", description: "", file: null }
    ]);
  }
  function removeBundleItem(id: string) {
    if (bundleItems.length <= 1) {
      showNotification("A bundle must contain at least 1 item.");
      return;
    }
    setBundleItems(prev => prev.filter(item => item.id !== id));
  }
  function updateBundleItem(id: string, key: keyof BundleItem, val: any) {
    setBundleItems(prev => prev.map(item => {
      if (item.id === id) {
        // If type changes, clear the attached file since validation changes
        if (key === "type") {
          return { ...item, type: val, file: null };
        }
        return { ...item, [key]: val };
      }
      return item;
    }));
  }
  function handleBundleFileChange(id: string, fileList: FileList | null, type: "notes" | "video" | "other") {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

    let allowed: string[] = [];
    let label = "";
    if (type === "notes") {
      allowed = [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".txt"];
      label = "documents (PDF, DOCX, PPTX)";
    } else if (type === "video") {
      allowed = [".mp4", ".webm", ".mkv", ".mov"];
      label = "videos (MP4, WEBM)";
    }

    if (allowed.length > 0 && !allowed.includes(ext)) {
      showNotification(`Invalid format: ${file.name}. Only ${label} are allowed for ${type} items.`);
      return;
    }
    if (file.size > 200 * 1024 * 1024) {
      showNotification(`File too large. Maximum size is 200MB.`);
      return;
    }

    updateBundleItem(id, "file", file);
  }

  // Live Calculations
  const calculatedSellPrice = parseFloat(sellPrice.replace(/,/g, "")) || 0;
  const calculatedOrigPrice = parseFloat(origPrice.replace(/,/g, "")) || 0;

  function getPhysicalFee(price: number, tiers: any[]): number {
    if (!Array.isArray(tiers) || tiers.length === 0) return 0;
    for (const t of tiers) {
      if (price >= t.min && price <= t.max) {
        const type = t.type || 'percent';
        const val = typeof t.value === 'number' ? t.value : (t.percent || 0);
        return type === 'fixed' ? val : parseFloat(((val / 100) * price).toFixed(2));
      }
    }
    const last = tiers[tiers.length - 1];
    const type = last.type || 'percent';
    const val = typeof last.value === 'number' ? last.value : (last.percent || 0);
    return type === 'fixed' ? val : parseFloat(((val / 100) * price).toFixed(2));
  }

  const listFee = prodType === "digital"
    ? digitalListingFee
    : getPhysicalFee(calculatedSellPrice, physicalTiers);

  // GST & Gateway/Transaction charges on the Listing Fee
  const listFeeGst = listFee > 0 ? parseFloat((listFee * 0.18).toFixed(2)) : 0;
  const listFeeGateway = listFee > 0 ? parseFloat((listFee * 0.02).toFixed(2)) : 0;
  const listFeeTotal = listFee > 0 ? parseFloat((listFee + listFeeGst + listFeeGateway).toFixed(2)) : 0;

  // Buyer Platform Fee removed as requested
  const buyerFee = 0;
  const buyerTotal = calculatedSellPrice;

  const sellerCut = prodType === "digital"
    ? parseFloat(((calculatedSellPrice * digitalSellerCutPercent) / 100).toFixed(2))
    : 0;

  const sellerEarnings = prodType === "digital"
    ? calculatedSellPrice - sellerCut
    : calculatedSellPrice;

  const discountPercent = calculatedOrigPrice > calculatedSellPrice
    ? Math.round(((calculatedOrigPrice - calculatedSellPrice) / calculatedOrigPrice) * 100)
    : 0;

  // Validation before step transition
  function validateStep2() {
    if (!title.trim()) { showNotification("Product title is required."); return false; }
    if (title.length < 5) { showNotification("Product title should be at least 5 characters."); return false; }
    if (!desc.trim()) { showNotification("Product description is required."); return false; }
    if (desc.length < 15) { showNotification("Description must be at least 15 characters to explain details properly."); return false; }
    if (!sellPrice || calculatedSellPrice <= 0) { showNotification("A valid selling price is required."); return false; }

    if (prodType === "physical") {
      if (calculatedOrigPrice > 0 && calculatedSellPrice > calculatedOrigPrice) {
        showNotification("Selling price cannot be greater than the original retail price.");
        return false;
      }
      if (physicalImages.length === 0) {
        showNotification("Please upload at least 1 product image so buyers can see its condition.");
        return false;
      }
    }

    if (prodType === "digital") {
      if (digSub === "notes") {
        if (!notesSubject.trim()) { showNotification("Subject or exam name is required."); return false; }
        if (notesDocs.length === 0) { showNotification("Please upload the PDF notes / study files."); return false; }
      }
      if (digSub === "video") {
        if (!vidInstructor.trim()) { showNotification("Instructor or course creator is required."); return false; }
        if (!vidLecturesCount.trim()) { showNotification("Please specify the number of video lectures."); return false; }
        if (courseVideos.length === 0) { showNotification("Please upload at least 1 course lecture video."); return false; }
      }
      if (digSub === "both") {
        if (!notesSubject.trim()) { showNotification("Subject details are required."); return false; }
        if (!vidInstructor.trim()) { showNotification("Instructor or course creator is required."); return false; }
        if (bothDocs.length === 0) { showNotification("Please upload reference documents/PDFs."); return false; }
        if (bothVideos.length === 0) { showNotification("Please upload lecture videos."); return false; }
      }
      if (digSub === "bundle") {
        for (let i = 0; i < bundleItems.length; i++) {
          const item = bundleItems[i];
          if (!item.title.trim()) { showNotification(`Bundle Item #${i + 1} needs a title.`); return false; }
          if (!item.file) { showNotification(`Please upload the file for bundle item "${item.title || `#${i + 1}`}".`); return false; }
        }
      }
    }

    return true;
  }

  // POST Submission — called AFTER Razorpay payment is verified
  async function submitToAPI(razorpayOrderId?: string, razorpayPaymentId?: string) {
    setSubmitting(true);
    const fd = new FormData();
    fd.append("title", title.trim());
    fd.append("price", calculatedSellPrice.toString());
    fd.append("originalPrice", calculatedOrigPrice.toString());
    fd.append("category", prodType === "physical" ? category : "Digital Resource");
    fd.append("condition", prodType === "physical" ? condition : "Digital");
    fd.append("productType", prodType || "physical");
    if (digSub) fd.append("digitalSubType", digSub);

    // Build enriched description reflecting structured details
    let fullDesc = desc.trim();
    const detailsList: string[] = [];

    if (prodType === "digital") {
      if (digSub === "notes") {
        detailsList.push(`Subject: ${notesSubject.trim()}`);
        if (notesCourseCode) detailsList.push(`Course Code: ${notesCourseCode.trim()}`);
        if (notesUniv) detailsList.push(`College/University: ${notesUniv.trim()}`);
        if (notesPages) detailsList.push(`Total Pages: ${notesPages.trim()}`);
      } else if (digSub === "video") {
        detailsList.push(`Instructor: ${vidInstructor.trim()}`);
        detailsList.push(`Total Videos: ${vidLecturesCount.trim()}`);
        if (vidDuration) detailsList.push(`Duration: ${vidDuration.trim()}`);
        if (vidAudience) detailsList.push(`Target Audience: ${vidAudience.trim()}`);
        if (vidPrereqs) detailsList.push(`Prerequisites: ${vidPrereqs.trim()}`);
      } else if (digSub === "both") {
        detailsList.push(`Subject: ${notesSubject.trim()}`);
        detailsList.push(`Instructor: ${vidInstructor.trim()}`);
        if (notesPages) detailsList.push(`Notes Pages: ${notesPages.trim()}`);
        if (vidLecturesCount) detailsList.push(`Lectures: ${vidLecturesCount.trim()}`);
      } else if (digSub === "bundle") {
        detailsList.push(`Bundle Pack Items:`);
        bundleItems.forEach((item, index) => {
          detailsList.push(`  [Item ${index + 1}] ${item.title} (${item.type.toUpperCase()}) - ${item.description || "No description"}`);
        });
      }
    }

    if (detailsList.length > 0) {
      fullDesc = `${fullDesc}\n\n📝 STRUCTURED SPECIFICATIONS:\n${detailsList.join("\n")}`;
    }
    fd.append("description", fullDesc);

    // Append files based on sections
    if (prodType === "physical") {
      physicalImages.forEach(img => fd.append("images", img));
    } else {
      if (digSub === "notes") {
        notesDocs.forEach(doc => fd.append("documents", doc));
      } else if (digSub === "video") {
        courseVideos.forEach(vid => fd.append("videos", vid));
      } else if (digSub === "both") {
        bothDocs.forEach(doc => fd.append("documents", doc));
        bothVideos.forEach(vid => fd.append("videos", vid));
      } else if (digSub === "bundle") {
        bundleItems.forEach(item => {
          if (item.file) {
            if (item.type === "video") {
              fd.append("videos", item.file);
            } else if (item.type === "notes") {
              fd.append("documents", item.file);
            } else {
              fd.append("images", item.file);
            }
          }
        });
      }
    }

    try {
      await api.post("/api/marketplace/products", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setPayModal(false);
      setSubmitted(true);
    } catch (err) {
      console.error("Submitting listing failed:", err);
      showNotification("Network or system failure while submitting product. Please try again.");
      setPayModal(false);
    } finally {
      setSubmitting(false);
    }
  }

  // Opens Razorpay checkout for the listing fee, then submits the product on success
  async function handleListingFeePayment() {
    setPayError("");
    setSubmitting(true);
    try {
      // Step 1: Create Razorpay order for listing fee
      const orderRes = await api.post("/api/payments/create-order", {
        type:        "listing_fee",
        productType: prodType,
        price:       calculatedSellPrice,
      });
      const { razorpayOrderId, amount, currency } = orderRes.data;

      setPayModal(false); // close our modal before Razorpay opens

      // Step 2: Open Razorpay Checkout
      await openRazorpayCheckout({
        orderId:     razorpayOrderId,
        amount,
        currency,
        name:        "CampusConnect Marketplace",
        description: `Listing Fee — ${prodType === "digital" ? "Digital" : "Physical"} Product`,
        prefill: {
          name:  user?.name  ?? "",
          email: user?.email ?? "",
        },
        themeColor: "#3B82F6",
        onSuccess: async (response) => {
          setSubmitting(true);
          setPayModal(true);
          try {
            // Step 3: Verify HMAC signature
            await api.post("/api/payments/verify", {
              type:               "listing_fee",
              razorpayOrderId:    response.razorpay_order_id,
              razorpayPaymentId:  response.razorpay_payment_id,
              razorpaySignature:  response.razorpay_signature,
            });
            // Step 4: Create the product listing
            await submitToAPI(response.razorpay_order_id, response.razorpay_payment_id);
          } catch (err: any) {
            setPayError(err?.response?.data?.message || "Payment verification failed. Please contact support.");
            setPayModal(true);
          } finally {
            setSubmitting(false);
          }
        },
        onDismiss: () => {
          setSubmitting(false);
          showNotification("Payment cancelled. Your form data is saved — try again when ready.");
        },
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Could not initiate payment. Try again.";
      setPayError(msg);
      setPayModal(true);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    setStep(1);
    setProdType(null);
    setDigSub(null);
    setTitle("");
    setDesc("");
    setSellPrice("");
    setOrigPrice("");
    setNotesSubject("");
    setNotesCourseCode("");
    setNotesUniv("");
    setNotesPages("");
    setVidInstructor("");
    setVidLecturesCount("");
    setVidDuration("");
    setVidAudience("");
    setVidPrereqs("");
    setBundleItems([{ id: "item-1", title: "", type: "notes", description: "", file: null }]);
    setPhysicalImages([]);
    setNotesDocs([]);
    setCourseVideos([]);
    setBothDocs([]);
    setBothVideos([]);
  }

  return (
    <StudentLayout>
      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .sell-page-container {
            padding: 16px 14px 80px !important;
          }
          .sell-main-title {
            font-size: 22px !important;
          }
          .sell-steps-header {
            padding: 12px 14px !important;
            margin-bottom: 24px !important;
            justify-content: space-between !important;
            gap: 6px !important;
          }
          .sell-steps-header > div {
            flex: 1 !important;
          }
          .sell-step-label {
            display: none !important;
          }
          .sell-step-line {
            margin-left: 8px !important;
            margin-right: 8px !important;
          }
          .sell-type-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .sell-type-grid > div {
            padding: 20px 16px !important;
          }
          .sell-subtype-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .sell-subtype-grid > div {
            padding: 16px 14px !important;
          }
          .sell-form-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .sell-form-panel {
            padding: 16px !important;
          }
          .sell-bundle-row {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .sell-preview-card {
            padding: 16px !important;
          }
          .sell-submit-panel {
            padding: 16px 18px !important;
          }
          .sell-sidebar-container {
            position: static !important;
          }
          .sell-form-row, .sell-specs-grid, .sell-summary-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .sell-specs-grid > div {
            grid-column: span 1 !important;
          }
          .sell-preview-flex {
            flex-direction: column !important;
            align-items: center !important;
            gap: 16px !important;
            text-align: center !important;
          }
          .sell-preview-flex > div {
            width: 100% !important;
            align-items: center !important;
            display: flex !important;
            flex-direction: column !important;
          }
          .sell-preview-flex h3 {
            text-align: center !important;
          }
          .sell-preview-flex div[style*="justify-content: space-between"] {
            flex-direction: column !important;
            align-items: center !important;
            gap: 8px !important;
          }
          .sell-preview-flex div[style*="display: flex; gap: 8px"] {
            justify-content: center !important;
          }
        }
      `}</style>
      <div className="sell-page-container" style={{ padding: "36px 40px", maxWidth: 1040, margin: "0 auto", minHeight: "85vh", color: "#F0F4FF" }}>

        {/* Error/Warning Notification Toast */}
        {errorToast && (
          <div style={{
            position: "fixed", top: 24, right: 24, zIndex: 1100,
            background: "#EF4444", color: "#fff", borderRadius: 12,
            padding: "14px 22px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700,
            boxShadow: "0 10px 30px rgba(239, 68, 68, 0.4)",
            display: "flex", alignItems: "center", gap: 10,
            animation: "slideInRight 0.25s ease-out"
          }}>
            <AlertCircle size={18} />
            <span>{errorToast}</span>
          </div>
        )}

        {/* Dynamic Payment Modal */}
        {payModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(3, 7, 18, 0.88)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{
              background: "#0F172A", border: "1.5px solid #1E293B", borderRadius: 24,
              padding: "36px", maxWidth: 440, width: "90%",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              animation: "scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
            }}>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ display: "inline-flex", padding: 14, background: "rgba(59, 130, 246, 0.1)", borderRadius: 16, color: "#3B82F6", marginBottom: 12 }}>
                  <ShieldCheck size={36} />
                </div>
                <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Pay Listing Fee</h2>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#94A3B8", lineHeight: 1.5 }}>
                  One-time fee to review and activate your listed items inside the campus network.
                </p>
              </div>

              <div style={{ background: "rgba(30, 41, 59, 0.5)", border: "1px solid #334155", borderRadius: 16, padding: "18px", marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#94A3B8" }}>
                    Category: <strong style={{ color: "#F1F5F9" }}>{prodType === "digital" ? "Digital Product" : "Physical Product"}</strong>
                  </span>
                  <span style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10B981", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>Active</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, fontSize: 12 }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", color: "#94A3B8" }}>Base Listing Fee:</span>
                  <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, color: "#F1F5F9" }}>₹{listFee}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, fontSize: 12 }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", color: "#94A3B8" }}>GST (18%):</span>
                  <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, color: "#94A3B8" }}>+₹{listFeeGst}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, fontSize: 12 }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", color: "#94A3B8" }}>Gateway Charge (2%):</span>
                  <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, color: "#94A3B8" }}>+₹{listFeeGateway}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: "1.5px solid #334155", paddingTop: 10 }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#fff", fontWeight: 600 }}>Grand Total to Pay:</span>
                  <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, color: "#3B82F6" }}>₹{listFeeTotal}</span>
                </div>
              </div>

              {/* Error Message */}
              {payError && (
                <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
                  <AlertCircle size={14} style={{ color: "#EF4444", flexShrink: 0 }} />
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#EF4444" }}>{payError}</span>
                </div>
              )}

              {/* Razorpay Pay Button */}
              <button
                onClick={handleListingFeePayment}
                disabled={submitting}
                style={{
                  width: "100%", height: 50, borderRadius: 14,
                  background: submitting ? "rgba(59,130,246,0.4)" : "linear-gradient(90deg,#3B82F6,#2563EB)",
                  border: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                  fontWeight: 700, color: "#fff", cursor: submitting ? "not-allowed" : "pointer",
                  marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: submitting ? "none" : "0 4px 20px rgba(59,130,246,0.35)",
                  transition: "all 0.2s"
                }}
              >
                {submitting ? (
                  <><span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> Processing...</>
                ) : (
                  <>💳 Pay ₹{listFeeTotal} with Razorpay</>
                )}
              </button>

              <button
                onClick={() => { setPayModal(false); setPayError(""); }}
                style={{
                  width: "100%", height: 40, borderRadius: 10,
                  background: "transparent", border: "1.5px solid #334155",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#94A3B8",
                  cursor: "pointer", fontWeight: 600, transition: "colors 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.color = "#F1F5F9"}
                onMouseLeave={e => e.currentTarget.style.color = "#94A3B8"}
              >
                Cancel
              </button>

              {/* Trust badge */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14 }}>
                <ShieldCheck size={11} style={{ color: "#475569" }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#475569" }}>Secured by Razorpay · UPI · Cards · Netbanking</span>
              </div>
            </div>
          </div>
        )}



        {/* Success / Finished Screen */}
        {submitted ? (

          <div style={{
            maxWidth: 640, margin: "60px auto", textAlign: "center",
            background: "rgba(15, 23, 42, 0.4)", border: "1.5px solid #1E293B",
            borderRadius: 32, padding: "50px 40px", backdropFilter: "blur(12px)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
          }}>
            <div style={{ fontSize: 80, marginBottom: 20 }}>🚀</div>
            <h1 className="sell-main-title" style={{ fontFamily: "'Sora', sans-serif", fontSize: 32, fontWeight: 800, color: "#fff", marginBottom: 12 }}>Product Listing Published!</h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#94A3B8", lineHeight: 1.6, maxWidth: 480, margin: "0 auto 30px" }}>
              Your item is now live on the campus marketplace! Students can search and send buy requests for it immediately.
            </p>

            <div style={{
              display: "inline-flex", flexDirection: "column", gap: 10,
              background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.2)",
              borderRadius: 16, padding: "20px 30px", marginBottom: 36, textAlign: "left"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#F1F5F9", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
                <CheckCircle size={16} style={{ color: "#10B981" }} />
                <span>Product listed directly to the campus feed</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#F1F5F9", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
                <CheckCircle size={16} style={{ color: "#10B981" }} />
                <span>Encrypted attachments saved securely</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#F1F5F9", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
                <CheckCircle size={16} style={{ color: "#10B981" }} />
                <span>Zero convenience fees or transaction surcharges for buyers</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
              <a href="/marketplace/listings" style={{
                height: 48, padding: "0 28px", borderRadius: 9999,
                background: "linear-gradient(90deg, #10B981, #059669)", border: "none",
                fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: "#fff",
                cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none",
                boxShadow: "0 4px 20px rgba(16, 185, 129, 0.3)"
              }}>
                <ShoppingBag size={18} /> Manage My Listings
              </a>

              <button onClick={() => { setSubmitted(false); handleCancel(); }} style={{
                height: 48, padding: "0 28px", borderRadius: 9999,
                background: "transparent", border: "1.5px solid #334155",
                fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#94A3B8",
                cursor: "pointer", fontWeight: 700, transition: "all 0.2s"
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "#F1F5F9";
                  e.currentTarget.style.color = "#F1F5F9";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "#334155";
                  e.currentTarget.style.color = "#94A3B8";
                }}>
                List Another Product
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Steps Visual Header */}
            <div className="sell-steps-header" style={{ display: "flex", alignItems: "center", marginBottom: 44, background: "rgba(15, 23, 42, 0.3)", border: "1px solid #1E293B", borderRadius: 20, padding: "20px 24px", backdropFilter: "blur(6px)" }}>
              {STEPS.map((s, i) => {
                const n = i + 1;
                const done = n < step;
                const curr = n === step;
                return (
                  <div key={s} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: done ? "#10B981" : curr ? "#3B82F6" : "#1E293B",
                        border: `1.5px solid ${done ? "#10B981" : curr ? "#3B82F6" : "#334155"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: curr ? "0 0 15px rgba(59, 130, 246, 0.4)" : "none",
                        transition: "all 0.3s"
                      }}>
                        {done ? <CheckCircle size={16} style={{ color: "#fff" }} /> : (
                          <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 12, fontWeight: 800, color: curr ? "#fff" : "#64748B" }}>{n}</span>
                        )}
                      </div>
                      <span className="sell-step-label" style={{
                        fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                        fontWeight: curr ? 700 : 500,
                        color: curr ? "#fff" : done ? "#10B981" : "#64748B",
                        whiteSpace: "nowrap"
                      }}>{s}</span>
                    </div>
                    {i < 2 && (
                      <div className="sell-step-line" style={{
                        flex: 1, height: 2, marginLeft: 16, marginRight: 16,
                        background: done ? "#10B981" : "#1E293B",
                        transition: "background 0.4s"
                      }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* STEP 1: Select Type & Category */}
            {step === 1 && (
              <div style={{ maxWidth: 840, margin: "0 auto", animation: "fadeIn 0.3s ease" }}>
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                  <h1 className="sell-main-title" style={{ fontFamily: "'Sora', sans-serif", fontSize: 32, fontWeight: 800, color: "#fff", marginBottom: 8, letterSpacing: "-0.5px" }}>Choose Product Medium</h1>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#94A3B8", maxWidth: 500, margin: "0 auto" }}>
                    Select how you want to list your study aids, hardware, or campus assets.
                  </p>
                </div>

                {/* Primary Physical / Digital choice cards */}
                <div className="sell-type-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: prodType === "digital" ? 40 : 0 }}>
                  {[
                    {
                      key: "physical" as ProdType,
                      icon: "📚",
                      label: "Physical Assets",
                      desc: "Textbooks, lab kits, drawing equipment, calculators, electronics, or dorm gear.",
                      color: "#3B82F6",
                      glow: "rgba(59,130,246,0.15)",
                      bullets: ["Cash in-person transaction", "Instant on-campus meetup", "Upload detailed pictures"]
                    },
                    {
                      key: "digital" as ProdType,
                      icon: "⚡",
                      label: "Digital Publications",
                      desc: "Handwritten notes, complete courses, test series, or comprehensive exam bundles.",
                      color: "#8B5CF6",
                      glow: "rgba(139,92,246,0.15)",
                      bullets: ["Hosted secure downloads", "Immediate access for buyers", "Automated distribution system"]
                    },
                  ].map(t => (
                    <div
                      key={t.key!}
                      onClick={() => {
                        setProdType(t.key);
                        setDigSub(null);
                        if (t.key === "physical") setStep(2);
                      }}
                      style={{
                        background: "#0F172A",
                        border: `1.5px solid ${prodType === t.key ? t.color : "#1E293B"}`,
                        borderRadius: 24, padding: "32px 28px",
                        cursor: "pointer", transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                        boxShadow: prodType === t.key ? `0 10px 30px ${t.glow}` : "none",
                        position: "relative",
                        overflow: "hidden"
                      }}
                      onMouseEnter={e => {
                        if (prodType !== t.key) {
                          e.currentTarget.style.borderColor = "#334155";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }
                      }}
                      onMouseLeave={e => {
                        if (prodType !== t.key) {
                          e.currentTarget.style.borderColor = "#1E293B";
                          e.currentTarget.style.transform = "translateY(0)";
                        }
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                        <span style={{ fontSize: 36 }}>{t.icon}</span>
                        <span style={{
                          background: "rgba(16, 185, 129, 0.1)", color: "#10B981",
                          borderRadius: 8, padding: "4px 12px",
                          fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700
                        }}>
                          Free to list
                        </span>
                      </div>

                      <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 8 }}>{t.label}</h3>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#94A3B8", lineHeight: 1.6, marginBottom: 20 }}>{t.desc}</p>

                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {t.bullets.map(b => (
                          <div key={b} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#64748B" }}>
                            <CheckCircle size={12} style={{ color: t.color }} />
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Step 1.2: Digital subtype choice */}
                {prodType === "digital" && (
                  <div style={{ marginTop: 40, animation: "slideUp 0.3s ease-out" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                      <div style={{ background: "rgba(139, 92, 246, 0.1)", borderRadius: 8, padding: 6, color: "#8B5CF6" }}>
                        <Package size={16} />
                      </div>
                      <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700, color: "#fff" }}>Select Content Format</h3>
                    </div>

                    <div className="sell-subtype-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 32 }}>
                      {DIG_SUBS.map(d => (
                        <div
                          key={d.key!}
                          onClick={() => setDigSub(d.key)}
                          style={{
                            background: "#0F172A",
                            border: `1.5px solid ${digSub === d.key ? d.color : "#1E293B"}`,
                            borderRadius: 20, padding: "22px 20px",
                            cursor: "pointer", transition: "all 0.2s ease",
                            boxShadow: digSub === d.key ? `0 8px 24px ${d.glow}` : "none",
                            display: "flex", gap: 16, alignItems: "flex-start"
                          }}
                          onMouseEnter={e => {
                            if (digSub !== d.key) e.currentTarget.style.borderColor = "#334155";
                          }}
                          onMouseLeave={e => {
                            if (digSub !== d.key) e.currentTarget.style.borderColor = "#1E293B";
                          }}
                        >
                          <div style={{
                            color: digSub === d.key ? d.color : "#64748B",
                            background: "rgba(30, 41, 59, 0.5)", borderRadius: 12,
                            padding: 10, flexShrink: 0
                          }}>{d.icon}</div>
                          <div>
                            <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: digSub === d.key ? d.color : "#fff", marginBottom: 4 }}>{d.label}</p>
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#94A3B8", lineHeight: 1.5, marginBottom: 8 }}>{d.desc}</p>
                            <span style={{ fontSize: 10, color: "#475569", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
                              📁 {d.fileDesc}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      disabled={!digSub}
                      onClick={() => setStep(2)}
                      style={{
                        width: "100%", height: 50, borderRadius: 14,
                        background: digSub ? `linear-gradient(90deg, ${activeColor}, ${activeColor}dd)` : "#1E293B",
                        border: "none", cursor: digSub ? "pointer" : "not-allowed",
                        fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700,
                        color: digSub ? "#fff" : "#475569",
                        boxShadow: digSub ? `0 10px 20px ${activeGlow}` : "none",
                        transition: "all 0.25s"
                      }}
                    >
                      {digSub ? `Configure Product Fields →` : "Select Sub-type format to proceed"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Structured Form & Calculator Grid */}
            {step === 2 && (
              <div className="sell-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 32, alignItems: "start", animation: "fadeIn 0.3s ease" }}>

                {/* Left Side: Structured Form Panels */}
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                  {/* General Header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(15, 23, 42, 0.4)", border: "1px solid #1E293B", padding: "16px 20px", borderRadius: 16 }}>
                    <div>
                      <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 2 }}>Define Specifications</h2>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#64748B" }}>Input correct academic metadata for visibility.</p>
                    </div>
                    <span style={{
                      background: `${activeColor}15`, color: activeColor,
                      borderRadius: 8, padding: "4px 12px",
                      fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700
                    }}>
                      {prodType === "physical" ? "🔧 Physical" : `⚡ ${DIG_SUBS.find(d => d.key === digSub)?.label}`}
                    </span>
                  </div>

                  {/* Panel A: Basic Product Identity */}
                  <div className="sell-form-panel" style={{ background: "#0F172A", border: "1px solid #1E293B", borderRadius: 20, padding: 24 }}>
                    <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 16, borderLeft: `3px solid ${activeColor}`, paddingLeft: 10 }}>Product Identity</h3>

                    <div style={{ marginBottom: 18 }}>
                      <label style={{ display: "block", marginBottom: 6, fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#94A3B8" }}>
                        Product Title <span style={{ color: "#EF4444" }}>*</span>
                      </label>
                      <input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        maxLength={60}
                        placeholder={
                          prodType === "physical"
                            ? "e.g., Apple iPad Pro (11-inch, M2 Chip, 128GB) — Space Grey"
                            : digSub === "notes"
                              ? "e.g., Digital Signal Processing Exam Cheat-sheets & Formula Guide"
                              : digSub === "video"
                                ? "e.g., Master Data Structures and Algorithms in C++ Lectures"
                                : "e.g., Semester 4 Complete Electrical Engineering Bundle"
                        }
                        style={{
                          width: "100%", height: 44, padding: "0 16px",
                          background: "#1E293B", border: "1.5px solid #334155",
                          borderRadius: 10, outline: "none",
                          fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#F1F5F9",
                          boxSizing: "border-box"
                        }}
                      />
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#64748B" }}>
                        <span>Clear and concise title without promotional words.</span>
                        <span>{title.length}/60</span>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", marginBottom: 6, fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#94A3B8" }}>
                        Product Description <span style={{ color: "#EF4444" }}>*</span>
                      </label>
                      <textarea
                        value={desc}
                        onChange={e => setDesc(e.target.value)}
                        rows={5}
                        placeholder={
                          prodType === "physical"
                            ? "State detailed usage history, battery health, scratches, structural issues, included accessories..."
                            : "Detail what specific chapters are fully covered, reference books used, topics breakdown, total duration, resources, and benefits..."
                        }
                        style={{
                          width: "100%", padding: "12px 16px",
                          background: "#1E293B", border: "1.5px solid #334155",
                          borderRadius: 10, outline: "none",
                          fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#F1F5F9",
                          lineHeight: 1.5, boxSizing: "border-box", resize: "vertical"
                        }}
                      />
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#64748B" }}>
                        <span>Minimum 15 characters describing key attributes.</span>
                        <span style={{ color: desc.length >= 15 ? "#10B981" : "#EF4444" }}>{desc.length} chars</span>
                      </div>
                    </div>
                  </div>

                  {/* Panel B: Physical Classification & Condition */}
                  {prodType === "physical" && (
                    <div className="sell-form-panel" style={{ background: "#0F172A", border: "1px solid #1E293B", borderRadius: 20, padding: 24 }}>
                      <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 16, borderLeft: `3px solid ${activeColor}`, paddingLeft: 10 }}>Classification</h3>

                      <div className="sell-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                        <div>
                          <label style={{ display: "block", marginBottom: 6, fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#94A3B8" }}>Category</label>
                          <select
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            style={{
                              width: "100%", height: 44, padding: "0 12px",
                              background: "#1E293B", border: "1.5px solid #334155",
                              borderRadius: 10, outline: "none",
                              fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#F1F5F9"
                            }}
                          >
                            {["Electronics", "Books", "Clothing", "Stationery", "Lab Equipment", "Dorm Decor", "Others"].map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: "block", marginBottom: 6, fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#94A3B8" }}>Condition Grade</label>
                          <select
                            value={condition}
                            onChange={e => setCondition(e.target.value)}
                            style={{
                              width: "100%", height: 44, padding: "0 12px",
                              background: "#1E293B", border: "1.5px solid #334155",
                              borderRadius: 10, outline: "none",
                              fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#F1F5F9"
                            }}
                          >
                            {["Brand New", "Like New (Perfect)", "Slightly Used (Good)", "Heavily Used (Fair)"].map(cond => (
                              <option key={cond} value={cond}>{cond}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Panel C: Digital Structured Specifications Panel */}
                  {prodType === "digital" && (
                    <div className="sell-form-panel" style={{ background: "#0F172A", border: "1px solid #1E293B", borderRadius: 20, padding: 24 }}>
                      <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 16, borderLeft: `3px solid ${activeColor}`, paddingLeft: 10 }}>
                        {digSub === "notes" ? "PDF & Document Specs" : digSub === "video" ? "Course Lectures Specs" : digSub === "both" ? "Lectures & Material Specs" : "Custom Bundle Configuration"}
                      </h3>

                      {/* 1. Notes Subtype Fields */}
                      {digSub === "notes" && (
                        <div className="sell-specs-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                          <div>
                            <label style={{ display: "block", marginBottom: 6, fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#94A3B8" }}>Subject / Topic Name <span style={{ color: "#EF4444" }}>*</span></label>
                            <input value={notesSubject} onChange={e => setNotesSubject(e.target.value)} placeholder="e.g., Computer Networks" style={{ width: "100%", height: 44, padding: "0 14px", background: "#1E293B", border: "1.5px solid #334155", borderRadius: 10, outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#F1F5F9" }} />
                          </div>
                          <div>
                            <label style={{ display: "block", marginBottom: 6, fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#94A3B8" }}>Course Code</label>
                            <input value={notesCourseCode} onChange={e => setNotesCourseCode(e.target.value)} placeholder="e.g., CS-402" style={{ width: "100%", height: 44, padding: "0 14px", background: "#1E293B", border: "1.5px solid #334155", borderRadius: 10, outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#F1F5F9" }} />
                          </div>
                          <div style={{ gridColumn: "span 2" }}>
                            <label style={{ display: "block", marginBottom: 6, fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#94A3B8" }}>College / Institution Name</label>
                            <input value={notesUniv} onChange={e => setNotesUniv(e.target.value)} placeholder="e.g., IIT Bombay, NIT Trichy" style={{ width: "100%", height: 44, padding: "0 14px", background: "#1E293B", border: "1.5px solid #334155", borderRadius: 10, outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#F1F5F9" }} />
                          </div>
                          <div style={{ gridColumn: "span 2" }}>
                            <label style={{ display: "block", marginBottom: 6, fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#94A3B8" }}>Approx Pages Count</label>
                            <input value={notesPages} onChange={e => setNotesPages(e.target.value)} placeholder="e.g., 148 pages" style={{ width: "100%", height: 44, padding: "0 14px", background: "#1E293B", border: "1.5px solid #334155", borderRadius: 10, outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#F1F5F9" }} />
                          </div>
                        </div>
                      )}

                      {/* 2. Video Subtype Fields */}
                      {digSub === "video" && (
                        <div className="sell-specs-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                          <div>
                            <label style={{ display: "block", marginBottom: 6, fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#94A3B8" }}>Course Instructor / Author <span style={{ color: "#EF4444" }}>*</span></label>
                            <input value={vidInstructor} onChange={e => setVidInstructor(e.target.value)} placeholder="e.g., Prof. Harish Sen" style={{ width: "100%", height: 44, padding: "0 14px", background: "#1E293B", border: "1.5px solid #334155", borderRadius: 10, outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#F1F5F9" }} />
                          </div>
                          <div>
                            <label style={{ display: "block", marginBottom: 6, fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#94A3B8" }}>Total Lectures / Videos <span style={{ color: "#EF4444" }}>*</span></label>
                            <input value={vidLecturesCount} onChange={e => setVidLecturesCount(e.target.value)} placeholder="e.g., 18 recorded lectures" style={{ width: "100%", height: 44, padding: "0 14px", background: "#1E293B", border: "1.5px solid #334155", borderRadius: 10, outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#F1F5F9" }} />
                          </div>
                          <div>
                            <label style={{ display: "block", marginBottom: 6, fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#94A3B8" }}>Total Dynamic Duration</label>
                            <input value={vidDuration} onChange={e => setVidDuration(e.target.value)} placeholder="e.g., ~6 hours" style={{ width: "100%", height: 44, padding: "0 14px", background: "#1E293B", border: "1.5px solid #334155", borderRadius: 10, outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#F1F5F9" }} />
                          </div>
                          <div>
                            <label style={{ display: "block", marginBottom: 6, fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#94A3B8" }}>Target Audience</label>
                            <input value={vidAudience} onChange={e => setVidAudience(e.target.value)} placeholder="e.g., Semester 3, GATE Aspirants" style={{ width: "100%", height: 44, padding: "0 14px", background: "#1E293B", border: "1.5px solid #334155", borderRadius: 10, outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#F1F5F9" }} />
                          </div>
                          <div style={{ gridColumn: "span 2" }}>
                            <label style={{ display: "block", marginBottom: 6, fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#94A3B8" }}>Pre-requisites</label>
                            <input value={vidPrereqs} onChange={e => setVidPrereqs(e.target.value)} placeholder="e.g., Basic knowledge of discrete structures" style={{ width: "100%", height: 44, padding: "0 14px", background: "#1E293B", border: "1.5px solid #334155", borderRadius: 10, outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#F1F5F9" }} />
                          </div>
                        </div>
                      )}

                      {/* 3. Notes + Video Subtype Fields */}
                      {digSub === "both" && (
                        <div className="sell-specs-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                          <div>
                            <label style={{ display: "block", marginBottom: 6, fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#94A3B8" }}>Subject Name <span style={{ color: "#EF4444" }}>*</span></label>
                            <input value={notesSubject} onChange={e => setNotesSubject(e.target.value)} placeholder="e.g., Signals and Systems" style={{ width: "100%", height: 44, padding: "0 14px", background: "#1E293B", border: "1.5px solid #334155", borderRadius: 10, outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#F1F5F9" }} />
                          </div>
                          <div>
                            <label style={{ display: "block", marginBottom: 6, fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#94A3B8" }}>Instructor Name <span style={{ color: "#EF4444" }}>*</span></label>
                            <input value={vidInstructor} onChange={e => setVidInstructor(e.target.value)} placeholder="e.g., Prof. Harish Sen" style={{ width: "100%", height: 44, padding: "0 14px", background: "#1E293B", border: "1.5px solid #334155", borderRadius: 10, outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#F1F5F9" }} />
                          </div>
                          <div>
                            <label style={{ display: "block", marginBottom: 6, fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#94A3B8" }}>Total Pages Count</label>
                            <input value={notesPages} onChange={e => setNotesPages(e.target.value)} placeholder="e.g., 90 pages PDF" style={{ width: "100%", height: 44, padding: "0 14px", background: "#1E293B", border: "1.5px solid #334155", borderRadius: 10, outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#F1F5F9" }} />
                          </div>
                          <div>
                            <label style={{ display: "block", marginBottom: 6, fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#94A3B8" }}>Total Video Lectures</label>
                            <input value={vidLecturesCount} onChange={e => setVidLecturesCount(e.target.value)} placeholder="e.g., 10 modules" style={{ width: "100%", height: 44, padding: "0 14px", background: "#1E293B", border: "1.5px solid #334155", borderRadius: 10, outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#F1F5F9" }} />
                          </div>
                        </div>
                      )}

                      {/* 4. Bundle Dynamic Items Builder */}
                      {digSub === "bundle" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#94A3B8", marginTop: -6 }}>
                            Bundles combine multiple documents, cheat sheets, or videos. Map out each resource below.
                          </p>

                          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {bundleItems.map((item, idx) => (
                              <div
                                key={item.id}
                                style={{
                                  background: "rgba(30, 41, 59, 0.4)", border: "1px solid #1E293B",
                                  borderRadius: 16, padding: 18, position: "relative"
                                }}
                              >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                  <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 12, fontWeight: 700, color: "#3B82F6" }}>
                                    📦 Bundle Resource #{idx + 1}
                                  </span>

                                  {bundleItems.length > 1 && (
                                    <button
                                      onClick={() => removeBundleItem(item.id)}
                                      style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center" }}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </div>

                                <div className="sell-bundle-row" style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 12, marginBottom: 12 }}>
                                  <input
                                    value={item.title}
                                    onChange={e => updateBundleItem(item.id, "title", e.target.value)}
                                    placeholder="Resource Name (e.g. Unit 1 Revision Slide)"
                                    style={{ height: 38, padding: "0 12px", background: "#1E293B", border: "1.5px solid #334155", borderRadius: 8, outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#F1F5F9" }}
                                  />
                                  <select
                                    value={item.type}
                                    onChange={e => updateBundleItem(item.id, "type", e.target.value)}
                                    style={{ height: 38, padding: "0 6px", background: "#1E293B", border: "1.5px solid #334155", borderRadius: 8, outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#F1F5F9" }}
                                  >
                                    <option value="notes">📄 Doc/PDF</option>
                                    <option value="video">🎥 Video</option>
                                    <option value="other">📂 Misc Asset</option>
                                  </select>
                                </div>

                                <div style={{ marginBottom: 12 }}>
                                  <input
                                    value={item.description}
                                    onChange={e => updateBundleItem(item.id, "description", e.target.value)}
                                    placeholder="Short description of covered topics (optional)"
                                    style={{ width: "100%", height: 36, padding: "0 12px", background: "#1E293B", border: "1.5px solid #334155", borderRadius: 8, outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#F1F5F9", boxSizing: "border-box" }}
                                  />
                                </div>

                                {/* Bundle Item File Attachment */}
                                <div style={{
                                  border: "1.5px dashed #334155", borderRadius: 10,
                                  padding: 10, display: "flex", alignItems: "center", gap: 10,
                                  background: "#0F172A", cursor: "pointer", position: "relative"
                                }}>
                                  <input
                                    type="file"
                                    accept={
                                      item.type === "notes" ? ".pdf,.doc,.docx,.ppt,.pptx,.txt" :
                                        item.type === "video" ? "video/*" : "*"
                                    }
                                    onChange={e => handleBundleFileChange(item.id, e.target.files, item.type)}
                                    style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
                                  />
                                  <Upload size={14} style={{ color: "#64748B" }} />
                                  <div style={{ flex: 1, overflow: "hidden" }}>
                                    {item.file ? (
                                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#10B981", fontWeight: 700, margin: 0, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                        ✓ {item.file.name} ({(item.file.size / (1024 * 1024)).toFixed(2)} MB)
                                      </p>
                                    ) : (
                                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#64748B", margin: 0 }}>
                                        Attach {item.type === "notes" ? "PDF/Word Document" : item.type === "video" ? "Video (MP4)" : "Any Asset File"}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={addBundleItem}
                            style={{
                              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                              height: 38, borderRadius: 10, background: "transparent", border: "1.5px dashed #334155",
                              color: "#3B82F6", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
                              cursor: "pointer", transition: "all 0.2s"
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = "#3B82F6";
                              e.currentTarget.style.background = "rgba(59,130,246,0.02)";
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = "#334155";
                              e.currentTarget.style.background = "transparent";
                            }}
                          >
                            <Plus size={14} /> Add Bundle Resource Item
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Panel D: Pricing Setup */}
                  <div className="sell-form-panel" style={{ background: "#0F172A", border: "1px solid #1E293B", borderRadius: 20, padding: 24 }}>
                    <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 16, borderLeft: `3px solid ${activeColor}`, paddingLeft: 10 }}>Pricing Strategy</h3>

                    <div className="sell-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                      {prodType === "physical" && (
                        <div>
                          <label style={{ display: "block", marginBottom: 6, fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#94A3B8" }}>Original Price (Retail ₹)</label>
                          <input
                            value={origPrice}
                            onChange={e => setOrigPrice(e.target.value.replace(/\D/g, ""))}
                            placeholder="e.g., 25000"
                            style={{ width: "100%", height: 44, padding: "0 14px", background: "#1E293B", border: "1.5px solid #334155", borderRadius: 10, outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#F1F5F9" }}
                          />
                        </div>
                      )}

                      <div style={prodType === "digital" ? { gridColumn: "span 2" } : {}}>
                        <label style={{ display: "block", marginBottom: 6, fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#94A3B8" }}>Selling Price (₹) <span style={{ color: "#EF4444" }}>*</span></label>
                        <input
                          value={sellPrice}
                          onChange={e => setSellPrice(e.target.value.replace(/\D/g, ""))}
                          placeholder={prodType === "digital" ? "e.g., 199" : "e.g., 14999"}
                          style={{
                            width: "100%", height: 44, padding: "0 14px",
                            background: "#1E293B",
                            border: `1.5px solid ${sellPrice ? activeColor : "#334155"}`,
                            borderRadius: 10, outline: "none",
                            fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#F1F5F9",
                            boxShadow: sellPrice ? `0 0 10px ${activeGlow}` : "none"
                          }}
                        />
                      </div>
                    </div>

                    {discountPercent > 0 && prodType === "physical" && (
                      <div style={{ marginTop: 14, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: 10, display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 14 }}>💡</span>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#10B981", margin: 0, fontWeight: 700 }}>
                          Attractive Pricing! You are offering a massive {discountPercent}% discount off original retail price.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Panel E: File Vault / Dropzone (Except for Bundle) */}
                  {digSub !== "bundle" && (
                    <div className="sell-form-panel" style={{ background: "#0F172A", border: "1px solid #1E293B", borderRadius: 20, padding: 24 }}>
                      <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 16, borderLeft: `3px solid ${activeColor}`, paddingLeft: 10 }}>
                        {prodType === "physical" ? "Asset Gallery Photos" : "Secure Publication Uploads"}
                      </h3>

                      {/* 1. Physical Images Upload */}
                      {prodType === "physical" && (
                        <div>
                          <input ref={physicalImgRef} type="file" multiple accept="image/*" onChange={handlePhysicalImages} style={{ display: "none" }} />
                          <div
                            onClick={() => physicalImgRef.current?.click()}
                            style={{ border: "2px dashed #334155", borderRadius: 16, minHeight: 140, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "rgba(30, 41, 59, 0.2)", padding: 20, transition: "all 0.2s" }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = activeColor}
                            onMouseLeave={e => e.currentTarget.style.borderColor = "#334155"}
                          >
                            <Upload size={28} style={{ color: "#64748B", marginBottom: 10 }} />
                            <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 700, color: "#F1F5F9", margin: "0 0 4px 0" }}>Click to upload product photos</p>
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#64748B", margin: 0 }}>Supports PNG, JPG, or WEBP (Max 200MB each)</p>
                          </div>

                          {physicalImages.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
                              {physicalImages.map((img, idx) => (
                                <div key={idx} style={{ position: "relative", width: 72, height: 72, borderRadius: 10, overflow: "hidden", border: "1.5px solid #334155" }}>
                                  <img src={URL.createObjectURL(img)} alt="upload preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                  <button
                                    onClick={() => setPhysicalImages(prev => prev.filter((_, i) => i !== idx))}
                                    style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: "50%", background: "rgba(239,68,68,0.9)", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 2. Digital Notes Upload (PDF/Docs only) */}
                      {prodType === "digital" && digSub === "notes" && (
                        <div>
                          <input ref={notesDocRef} type="file" multiple accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" onChange={handleNotesDocs} style={{ display: "none" }} />
                          <div
                            onClick={() => notesDocRef.current?.click()}
                            style={{ border: "2px dashed #334155", borderRadius: 16, minHeight: 140, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "rgba(30, 41, 59, 0.2)", padding: 20, transition: "all 0.2s" }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = activeColor}
                            onMouseLeave={e => e.currentTarget.style.borderColor = "#334155"}
                          >
                            <FileText size={28} style={{ color: activeColor, marginBottom: 10 }} />
                            <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 700, color: "#F1F5F9", margin: "0 0 4px 0" }}>Upload Lecture notes / PDF</p>
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#64748B", margin: 0 }}>Accepts PDF, Word, PowerPoint, or Text only (Max 200MB)</p>
                          </div>

                          {notesDocs.length > 0 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
                              {notesDocs.map((doc, idx) => (
                                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(30, 41, 59, 0.3)", border: "1px solid #1E293B", borderRadius: 10, padding: "8px 12px" }}>
                                  <File size={16} style={{ color: activeColor }} />
                                  <span style={{ flex: 1, fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#F1F5F9", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{doc.name}</span>
                                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#64748B" }}>({(doc.size / (1024 * 1024)).toFixed(2)} MB)</span>
                                  <button onClick={() => setNotesDocs(prev => prev.filter((_, i) => i !== idx))} style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer" }}><X size={14} /></button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 3. Digital Video Course Upload (Videos only) */}
                      {prodType === "digital" && digSub === "video" && (
                        <div>
                          <input ref={courseVideoRef} type="file" multiple accept="video/*" onChange={handleCourseVideos} style={{ display: "none" }} />
                          <div
                            onClick={() => courseVideoRef.current?.click()}
                            style={{ border: "2px dashed #334155", borderRadius: 16, minHeight: 140, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "rgba(30, 41, 59, 0.2)", padding: 20, transition: "all 0.2s" }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = activeColor}
                            onMouseLeave={e => e.currentTarget.style.borderColor = "#334155"}
                          >
                            <Video size={28} style={{ color: activeColor, marginBottom: 10 }} />
                            <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 700, color: "#F1F5F9", margin: "0 0 4px 0" }}>Upload Lecture Videos</p>
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#64748B", margin: 0 }}>Accepts MP4, WEBM, MKV (Max 200MB per file)</p>
                          </div>

                          {courseVideos.length > 0 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
                              {courseVideos.map((vid, idx) => (
                                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(30, 41, 59, 0.3)", border: "1px solid #1E293B", borderRadius: 10, padding: "8px 12px" }}>
                                  <Video size={16} style={{ color: activeColor }} />
                                  <span style={{ flex: 1, fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#F1F5F9", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{vid.name}</span>
                                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#64748B" }}>({(vid.size / (1024 * 1024)).toFixed(2)} MB)</span>
                                  <button onClick={() => setCourseVideos(prev => prev.filter((_, i) => i !== idx))} style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer" }}><X size={14} /></button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 4. Digital Notes + Video Dual Dropzones */}
                      {prodType === "digital" && digSub === "both" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                          {/* Part 1: Documents */}
                          <div>
                            <label style={{ display: "block", marginBottom: 6, fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#94A3B8" }}>Academic Materials (PDFs/Slides)</label>
                            <input ref={bothDocRef} type="file" multiple accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" onChange={handleBothDocs} style={{ display: "none" }} />
                            <div
                              onClick={() => bothDocRef.current?.click()}
                              style={{ border: "1.5px dashed #334155", borderRadius: 12, padding: "16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", background: "rgba(30, 41, 59, 0.15)" }}
                            >
                              <FileText size={20} style={{ color: "#8B5CF6" }} />
                              <div style={{ textAlign: "left" }}>
                                <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 12, fontWeight: 700, color: "#F1F5F9", margin: 0 }}>Attach Notes &amp; PDF guides</p>
                                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#64748B", margin: 0 }}>Only PDFs, Word, or presentations</p>
                              </div>
                            </div>

                            {bothDocs.length > 0 && (
                              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                                {bothDocs.map((doc, idx) => (
                                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(30,41,59,0.2)", padding: "6px 10px", borderRadius: 8, border: "1px solid #1E293B" }}>
                                    <File size={12} style={{ color: "#8B5CF6" }} />
                                    <span style={{ flex: 1, fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#F1F5F9", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{doc.name}</span>
                                    <button onClick={() => setBothDocs(prev => prev.filter((_, i) => i !== idx))} style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer" }}><X size={12} /></button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Part 2: Videos */}
                          <div>
                            <label style={{ display: "block", marginBottom: 6, fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#94A3B8" }}>Video Explainer Lectures</label>
                            <input ref={bothVideoRef} type="file" multiple accept="video/*" onChange={handleBothVideos} style={{ display: "none" }} />
                            <div
                              onClick={() => bothVideoRef.current?.click()}
                              style={{ border: "1.5px dashed #334155", borderRadius: 12, padding: "16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", background: "rgba(30, 41, 59, 0.15)" }}
                            >
                              <Video size={20} style={{ color: "#10B981" }} />
                              <div style={{ textAlign: "left" }}>
                                <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 12, fontWeight: 700, color: "#F1F5F9", margin: 0 }}>Attach MP4/WEBM Course Lectures</p>
                                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#64748B", margin: 0 }}>Videos only (Max 200MB each)</p>
                              </div>
                            </div>

                            {bothVideos.length > 0 && (
                              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                                {bothVideos.map((vid, idx) => (
                                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(30,41,59,0.2)", padding: "6px 10px", borderRadius: 8, border: "1px solid #1E293B" }}>
                                    <Video size={12} style={{ color: "#10B981" }} />
                                    <span style={{ flex: 1, fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#F1F5F9", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{vid.name}</span>
                                    <button onClick={() => setBothVideos(prev => prev.filter((_, i) => i !== idx))} style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer" }}><X size={12} /></button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Side: Sticky live calculations panel */}
                <div className="sell-sidebar-container" style={{ position: "sticky", top: 24, display: "flex", flexDirection: "column", gap: 20 }}>

                  {/* Fee Calculator Card */}
                  <div style={{
                    background: "#0F172A", border: "1.5px solid #1E293B", borderRadius: 24,
                    padding: "22px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
                    backgroundImage: "linear-gradient(180deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%)"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                      <span style={{ fontSize: 18 }}>📊</span>
                      <h4 style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 800, color: "#fff", margin: 0 }}>Fee Calculator Breakdown</h4>
                    </div>

                    {prodType === "digital" ? (
                      <>
                        {/* Digital Breakdown */}
                        <div style={{ marginBottom: 14 }}>
                          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "1px", color: "#8B5CF6", textTransform: "uppercase", marginBottom: 8 }}>Upfront Listing Fee</p>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#94A3B8" }}>Activation Fee:</span>
                            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 700, color: "#F1F5F9" }}>₹{digitalListingFee}</span>
                          </div>
                          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, color: "#64748B", margin: 0, lineHeight: 1.4 }}>
                            One-time flat fee to verify and publish your digital listing inside the college network.
                          </p>
                        </div>

                        <div style={{ height: 1, background: "#1E293B", margin: "12px 0" }} />

                        <div style={{ marginBottom: 14 }}>
                          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "1px", color: "#10B981", textTransform: "uppercase", marginBottom: 8 }}>Transaction Payout</p>

                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#94A3B8" }}>Your Selling Price:</span>
                            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 700, color: "#F1F5F9" }}>₹{calculatedSellPrice}</span>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#94A3B8" }}>Seller Rev Cut (-{digitalSellerCutPercent}%):</span>
                            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 700, color: "#EF4444" }}>-₹{sellerCut}</span>
                          </div>

                          <div style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.15)", borderRadius: 12, padding: "10px 12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#fff", fontWeight: 600 }}>Your Net Payout:</span>
                              <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 800, color: "#10B981" }}>₹{sellerEarnings}</span>
                            </div>
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, color: "#64748B", margin: "4px 0 0 0", lineHeight: 1.3 }}>
                              🔒 Disbursed after a security hold of {digitalPayoutDays} days.
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Physical Breakdown */}
                        <div style={{ marginBottom: 14 }}>
                          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "1px", color: "#3B82F6", textTransform: "uppercase", marginBottom: 8 }}>Upfront Listing Fee</p>

                          {(() => {
                            const lastT = physicalTiers[physicalTiers.length - 1];
                            const matchedTier = physicalTiers.find(t => calculatedSellPrice >= t.min && calculatedSellPrice <= t.max) || lastT;
                            const isBeyond = lastT && calculatedSellPrice > lastT.max;

                            let activeTierText = "No tier matched";
                            if (matchedTier) {
                              const type = matchedTier.type || 'percent';
                              const val = typeof matchedTier.value === 'number' ? matchedTier.value : (matchedTier.percent || 0);
                              const rateText = type === 'fixed' ? `₹${val} Flat` : `${val}%`;

                              activeTierText = isBeyond
                                ? `Above ₹${lastT.max} (${rateText})`
                                : `₹${matchedTier.min}–₹${matchedTier.max} (${rateText})`;
                            }
                            return (
                              <>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#94A3B8" }}>Pricing Category:</span>
                                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#94A3B8" }}>{activeTierText}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#94A3B8" }}>Activation Fee:</span>
                                  <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 700, color: "#3B82F6" }}>₹{listFee}</span>
                                </div>
                              </>
                            );
                          })()}
                          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, color: "#64748B", marginTop: 4, marginBottom: 0, lineHeight: 1.4 }}>
                            One-time tiered listing fee paid upfront. No commission will be taken when your product sells.
                          </p>
                        </div>

                        <div style={{ height: 1, background: "#1E293B", margin: "12px 0" }} />

                        <div style={{ marginBottom: 14 }}>
                          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "1px", color: "#10B981", textTransform: "uppercase", marginBottom: 8 }}>Transaction Details</p>

                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#94A3B8" }}>Buyer Cost (Total):</span>
                            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 700, color: "#F1F5F9" }}>₹{calculatedSellPrice}</span>
                          </div>

                          <div style={{ background: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.15)", borderRadius: 12, padding: "10px 12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#fff", fontWeight: 600 }}>Seller Net Earnings:</span>
                              <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 800, color: "#3B82F6" }}>₹{sellerEarnings}</span>
                            </div>
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, color: "#64748B", margin: "4px 0 0 0", lineHeight: 1.3 }}>
                              ⚡ Payout directly collected from the student buyer in-person upon meetup.
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Actions buttons */}
                  <button
                    onClick={() => {
                      if (validateStep2()) {
                        setStep(3);
                      }
                    }}
                    style={{
                      width: "100%", height: 48, borderRadius: 14,
                      background: `linear-gradient(90deg, ${activeColor}, ${activeColor}dd)`,
                      border: "none", cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700,
                      color: "#fff", boxShadow: `0 10px 20px ${activeGlow}`,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      transition: "all 0.2s"
                    }}
                  >
                    Proceed to Verification <ArrowRight size={16} />
                  </button>

                  <button
                    onClick={() => setStep(1)}
                    style={{
                      width: "100%", height: 40, borderRadius: 12,
                      background: "transparent", border: "1.5px solid #1E293B",
                      fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#94A3B8",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                    }}
                  >
                    <ArrowLeft size={14} /> Back to medium select
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Live Card Mock & Final Confirmation */}
            {step === 3 && (
              <div style={{ maxWidth: 720, margin: "0 auto", animation: "fadeIn 0.3s ease" }}>
                <div style={{ textAlign: "center", marginBottom: 36 }}>
                  <h2 className="sell-main-title" style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Review Publication Card</h2>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#94A3B8" }}>
                    This is how your listed publication card will present itself to buyers in feeds.
                  </p>
                </div>

                {/* Mock Card Preview Container */}
                <div className="sell-preview-card" style={{
                  background: "#0F172A", border: "2px solid #1E293B", borderRadius: 28,
                  padding: 24, marginBottom: 28, boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
                }}>
                  <div className="sell-preview-flex" style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>

                    {/* Visual Media Placeholder/Thumb */}
                    <div style={{
                      width: 110, height: 110, borderRadius: 16, background: "rgba(30, 41, 59, 0.6)",
                      border: "1.5px solid #334155", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 36, flexShrink: 0, overflow: "hidden"
                    }}>
                      {prodType === "physical" && physicalImages.length > 0 ? (
                        <img src={URL.createObjectURL(physicalImages[0])} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : digSub === "notes" && notesDocs.length > 0 ? (
                        <span style={{ color: activeColor }}>📄</span>
                      ) : digSub === "video" && courseVideos.length > 0 ? (
                        <span style={{ color: activeColor }}>🎥</span>
                      ) : digSub === "both" && bothDocs.length > 0 ? (
                        <span style={{ color: activeColor }}>📦</span>
                      ) : (
                        <span>🗂️</span>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: "#fff", margin: "0 0 6px 0" }}>{title}</h3>
                        <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: "#10B981" }}>₹{calculatedSellPrice.toLocaleString("en-IN")}</span>
                      </div>

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                        <span style={{
                          background: "rgba(30, 41, 59, 0.6)", border: "1px solid #1E293B",
                          color: "#94A3B8", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontFamily: "'DM Sans', sans-serif"
                        }}>
                          {prodType === "physical" ? category : `${DIG_SUBS.find(d => d.key === digSub)?.label}`}
                        </span>
                        {prodType === "physical" && (
                          <span style={{
                            background: "rgba(30, 41, 59, 0.6)", border: "1px solid #1E293B",
                            color: "#94A3B8", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontFamily: "'DM Sans', sans-serif"
                          }}>
                            {condition}
                          </span>
                        )}
                        {prodType === "digital" && digSub === "bundle" && (
                          <span style={{
                            background: "rgba(59, 130, 246, 0.1)", color: "#3B82F6",
                            borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 700
                          }}>
                            {bundleItems.length} Bundled Items
                          </span>
                        )}
                      </div>

                      <p style={{
                        fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#64748B",
                        lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical", overflow: "hidden", margin: 0
                      }}>
                        {desc}
                      </p>

                      {/* Display tags/metadata visually */}
                      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                        {prodType === "digital" && notesSubject && (
                          <span style={{ background: "rgba(139, 92, 246, 0.08)", color: "#8B5CF6", border: "1px solid rgba(139, 92, 246, 0.2)", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontFamily: "'DM Sans', sans-serif" }}>
                            📚 {notesSubject}
                          </span>
                        )}
                        {prodType === "digital" && vidInstructor && (
                          <span style={{ background: "rgba(16, 185, 129, 0.08)", color: "#10B981", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontFamily: "'DM Sans', sans-serif" }}>
                            👨‍🏫 {vidInstructor}
                          </span>
                        )}
                        {prodType === "physical" && physicalImages.length > 0 && (
                          <span style={{ background: "rgba(59, 130, 246, 0.08)", color: "#3B82F6", border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontFamily: "'DM Sans', sans-serif" }}>
                            📸 {physicalImages.length} Image{physicalImages.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ height: 1, background: "#1E293B", margin: "20px 0" }} />

                  {/* Pricing Breakdown Summary */}
                  <div className="sell-summary-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, padding: "18px 22px", background: "rgba(30, 41, 59, 0.2)", border: "1px solid #1E293B", borderRadius: 20 }}>
                    <div>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.5px" }}>Upfront Listing Cost</p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, fontSize: 12, color: "#94A3B8" }}>
                        <span>Base Listing Fee:</span>
                        <span>₹{listFee}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, fontSize: 12, color: "#94A3B8" }}>
                        <span>GST (18%):</span>
                        <span>+₹{listFeeGst}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, fontSize: 12, color: "#94A3B8" }}>
                        <span>Gateway Charge (2%):</span>
                        <span>+₹{listFeeGateway}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #334155", paddingTop: 6 }}>
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#fff", fontWeight: 600 }}>Total Listing Cost:</span>
                        <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: listFeeTotal > 0 ? "#3B82F6" : "#10B981" }}>
                          {listFeeTotal > 0 ? `₹${listFeeTotal}` : "Free"}
                        </span>
                      </div>
                    </div>

                    <div style={{ borderLeft: "1.5px solid #1E293B", paddingLeft: 24 }}>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.5px" }}>Buyer Pricing (No Fee)</p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, fontSize: 12, color: "#94A3B8" }}>
                        <span>Base Product Price:</span>
                        <span>₹{calculatedSellPrice.toLocaleString("en-IN")}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, fontSize: 12, color: "#94A3B8" }}>
                        <span>Buyer Platform Fee:</span>
                        <span>₹0</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #334155", paddingTop: 6 }}>
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#fff", fontWeight: 600 }}>Buyer Total Cost:</span>
                        <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "#10B981" }}>
                          ₹{buyerTotal.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Panel */}
                <div className="sell-submit-panel" style={{
                  background: "#0F172A", border: "1px solid #1E293B", borderRadius: 24,
                  padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 800, color: "#fff", margin: "0 0 2px 0" }}>Final Listing Submission</h4>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#64748B", margin: 0 }}>Review all attachments and prices before confirming.</p>
                    </div>

                    <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: listFeeTotal > 0 ? "#3B82F6" : "#10B981" }}>
                      {listFeeTotal > 0 ? `₹${listFeeTotal}` : "Free"}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (listFeeTotal > 0) {
                        setPayModal(true);
                      } else {
                        submitToAPI();
                      }
                    }}
                    disabled={submitting}
                    style={{
                      width: "100%", height: 50, borderRadius: 14,
                      background: submitting ? "#1E293B" : "linear-gradient(90deg, #10B981, #059669)", border: "none",
                      cursor: submitting ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                      boxShadow: submitting ? "none" : "0 10px 20px rgba(16, 185, 129, 0.3)",
                      transition: "all 0.25s"
                    }}
                  >
                    {submitting ? (
                      <>
                        <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                        <span>Publishing Listing...</span>
                      </>
                    ) : (
                      <>
                        <span>🚀 Publish Product Listing</span>
                      </>
                    )}
                  </button>
                </div>

                <button
                  onClick={() => setStep(2)}
                  style={{
                    marginTop: 20, background: "transparent", border: "1.5px solid #1E293B",
                    height: 40, width: "100%", borderRadius: 12, fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12, color: "#94A3B8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                  }}
                >
                  <ArrowLeft size={14} /> Back to Details Form
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </StudentLayout>
  );
}
