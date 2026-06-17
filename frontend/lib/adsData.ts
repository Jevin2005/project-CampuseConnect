import type { AdData } from "@/components/AdBanner";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Map a DB Advertisement record to the AdData shape used by AdBanner components.
 */
function mapDbAdToAdData(ad: any): AdData {
  const isOwn = ad.scope === "own";
  const collegeName = ad.college?.name || "";
  const bannerUrl = ad.bannerUrl
    ? (ad.bannerUrl.startsWith("http") ? ad.bannerUrl : `${API}${ad.bannerUrl}`)
    : undefined;

  return {
    id:          ad.id,
    type:        isOwn ? "college_event" : "cross_college",
    format:      ad.format || "banner",
    title:       ad.title,
    subtitle:    collegeName
      ? `${collegeName}${isOwn ? "" : " · Cross-Campus"}`
      : (isOwn ? "Your College Ad" : "Cross-College Advertisement"),
    description: ad.description,
    tag:         isOwn
      ? (collegeName.split(" ")[0]?.toUpperCase() || "OWN COLLEGE")
      : "ALL COLLEGES",
    tagColor:    isOwn ? "#10B981" : "#F7C948",
    bgGradient:  isOwn
      ? "linear-gradient(135deg,#0a1f15,#0d2d1e,#091a12)"
      : "linear-gradient(135deg,#1a1500,#2a2000,#1f1800)",
    accentColor: isOwn ? "#10B981" : "#F7C948",
    glowColor:   isOwn ? "rgba(16,185,129,0.2)" : "rgba(247,201,72,0.2)",
    ctaLabel:    "Learn More",
    ctaLink:     undefined,
    icon:        isOwn ? "🏫" : "🌐",
    dismissible: true,
    // Extra fields used by the live ads system
    bannerUrl,
    adId:        ad.id,
    college:     collegeName,
  } as AdData & { bannerUrl?: string; adId?: string; college?: string };
}

/**
 * Fetch live ads from the backend.
 * Falls back to an empty array on any error (static fallbacks will be used).
 */
export async function fetchLiveAds(collegeId?: string): Promise<AdData[]> {
  try {
    const url = collegeId
      ? `${API}/api/marketplace/ads?collegeId=${encodeURIComponent(collegeId)}`
      : `${API}/api/marketplace/ads`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.ads || []).map(mapDbAdToAdData);
  } catch {
    return [];
  }
}



/* ════════════════════════════════════════════════
   HOSTEL & PG ADVERTISEMENTS
════════════════════════════════════════════════ */
export const HOSTEL_ADS: AdData[] = [
  {
    id: "h001",
    type: "hostel",
    title: "Green Valley Boys Hostel",
    subtitle: "Premium AC rooms near MIT campus",
    description: "Fully furnished AC rooms with WiFi, mess facility, 24/7 security, and laundry. Walking distance from MIT campus gate. Monthly rent starts ₹6,500.",
    tag: "HOSTEL",
    tagColor: "#4F8EF7",
    bgGradient: "linear-gradient(135deg,#0d1829,#0a1f3d,#0d2040)",
    accentColor: "#4F8EF7",
    glowColor: "rgba(79,142,247,0.25)",
    ctaLabel: "Contact Now",
    icon: "🏠",
    location: "Kothrud, 500m from MIT Gate",
    contact: "+91 98765 43210",
    rating: 4.6,
    stats: [{ label: "rooms available", value: "12" }, { label: "rent/month", value: "₹6,500" }],
    dismissible: true,
  },
  {
    id: "h002",
    type: "hostel",
    title: "Sunrise Girls Hostel",
    subtitle: "Safe & affordable for female students",
    description: "Secure girls-only hostel with biometric entry, CCTV, home-cooked food, and study rooms. Only 2 mins from MIT main gate.",
    tag: "GIRLS HOSTEL",
    tagColor: "#EC4899",
    bgGradient: "linear-gradient(135deg,#1a0d1a,#2d1135,#1f0d28)",
    accentColor: "#EC4899",
    glowColor: "rgba(236,72,153,0.2)",
    ctaLabel: "Enquire Now",
    icon: "🏡",
    location: "Paud Road, 200m from MIT",
    contact: "+91 91234 56789",
    rating: 4.8,
    stats: [{ label: "seats left", value: "5" }, { label: "per month", value: "₹7,200" }],
    dismissible: true,
  },
  {
    id: "h003",
    type: "pg",
    title: "CampusNest PG Rooms",
    subtitle: "Double & single sharing available",
    description: "Modern PG with high-speed WiFi 100 Mbps, power backup, AC/non-AC options, Netflix-ready TVs, and bike parking. Open to students from any college.",
    tag: "PG",
    tagColor: "#10B981",
    bgGradient: "linear-gradient(135deg,#0a1f15,#0d2d1e,#0a1f15)",
    accentColor: "#10B981",
    glowColor: "rgba(16,185,129,0.2)",
    ctaLabel: "Book a Tour",
    icon: "🛏️",
    location: "Bavdhan, 1.2 km from MIT",
    contact: "+91 80099 11223",
    rating: 4.5,
    stats: [{ label: "starting rent", value: "₹5,500" }, { label: "WiFi speed", value: "100 Mbps" }],
    dismissible: true,
  },
  {
    id: "h004",
    type: "pg",
    title: "TechStay PG — Premium",
    subtitle: "Co-ed PG with rooftop & gym",
    description: "Premium co-ed PG with gymnasium, rooftop terrace, high-speed internet, 3-times meals, RO water, and 24-hour helpdesk. Best for working students & interns.",
    tag: "PREMIUM PG",
    tagColor: "#F7C948",
    bgGradient: "linear-gradient(135deg,#1a1500,#2a2000,#1f1800)",
    accentColor: "#F7C948",
    glowColor: "rgba(247,201,72,0.2)",
    ctaLabel: "View Rooms",
    icon: "🏢",
    location: "Hinjewadi Phase 1",
    contact: "+91 70011 22334",
    rating: 4.7,
    stats: [{ label: "from", value: "₹9,000" }, { label: "amenities", value: "15+" }],
    dismissible: true,
  },
];

/* ════════════════════════════════════════════════
   OWN COLLEGE (MIT) EVENT ADS
════════════════════════════════════════════════ */
export const OWN_COLLEGE_ADS: AdData[] = [
  {
    id: "c001",
    type: "college_event",
    title: "Zenith Tech Fest 2024",
    subtitle: "MIT's Annual Technical Festival",
    description: "MIT College of Engineering's flagship tech festival with hackathons, robotics wars, AI challenges, and ₹5 Lakh prize pool. Register before Dec 20!",
    tag: "MIT EVENT",
    tagColor: "#4F8EF7",
    bgGradient: "linear-gradient(135deg,#0d1829,#141e35,#0a1729)",
    accentColor: "#4F8EF7",
    glowColor: "rgba(79,142,247,0.25)",
    ctaLabel: "Register Free",
    icon: "⚡",
    college: "MIT College of Engineering",
    stats: [{ label: "prize pool", value: "₹5L" }, { label: "events", value: "30+" }, { label: "days", value: "3" }],
    dismissible: false,
    badge: "🔥 HOT",
  },
  {
    id: "c002",
    type: "college_event",
    title: "AURORA Cultural Fest",
    subtitle: "Celebrate Art, Music & Dance",
    description: "MIT's cultural extravaganza with live concerts, solo singing, group dance battles, art exhibition, fashion show, and celebrity performances. Open for all students!",
    tag: "CULTURAL",
    tagColor: "#A78BFA",
    bgGradient: "linear-gradient(135deg,#1a0d30,#2d1b4e,#1a0d2e)",
    accentColor: "#A78BFA",
    glowColor: "rgba(167,139,250,0.25)",
    ctaLabel: "Get Passes",
    icon: "🎭",
    college: "MIT College of Engineering",
    stats: [{ label: "events", value: "20+" }, { label: "days", value: "2" }],
    dismissible: false,
  },
  {
    id: "c003",
    type: "college_event",
    title: "Campus Placement Drive",
    subtitle: "On-Campus Hiring — 50+ Companies",
    description: "MIT Placement Cell invites applications for the December Mega Drive. Google, TCS, Infosys, Capgemini, and 47 more companies are visiting. CGPA ≥ 6.0 eligible.",
    tag: "PLACEMENT",
    tagColor: "#10B981",
    bgGradient: "linear-gradient(135deg,#0a1f15,#0d2d1e,#091a12)",
    accentColor: "#10B981",
    glowColor: "rgba(16,185,129,0.2)",
    ctaLabel: "Apply Now",
    icon: "💼",
    college: "MIT College of Engineering",
    stats: [{ label: "companies", value: "50+" }, { label: "packages", value: "up to 18 LPA" }],
    dismissible: false,
  },
];

/* ════════════════════════════════════════════════
   CROSS-COLLEGE / OTHER COLLEGE ADS
════════════════════════════════════════════════ */
export const CROSS_COLLEGE_ADS: AdData[] = [
  {
    id: "x001",
    type: "cross_college",
    title: "InterCollegiate Hackathon",
    subtitle: "VIT Pune × MIT × PCCOE",
    description: "Pan-Pune inter-college 36-hour hackathon on AI & Sustainability. Teams of 2-4. Cash prizes worth ₹2 Lakhs. Students from ALL Pune colleges welcome!",
    tag: "INTER-COLLEGE",
    tagColor: "#F59E0B",
    bgGradient: "linear-gradient(135deg,#1a1000,#2a1d00,#1a1200)",
    accentColor: "#F59E0B",
    glowColor: "rgba(245,158,11,0.2)",
    ctaLabel: "Register Team",
    icon: "🤝",
    stats: [{ label: "prize pool", value: "₹2L" }, { label: "colleges", value: "8+" }],
    dismissible: true,
  },
  {
    id: "x002",
    type: "cross_college",
    title: "TechFest @ COEP 2024",
    subtitle: "India's Oldest Tech Festival",
    description: "COEP Techniche invites students across all colleges for India's premier engineering festival. Robotics, paper presentations, hackathons, and workshops. Jan 15-18.",
    tag: "EXTERNAL EVENT",
    tagColor: "#EF4444",
    bgGradient: "linear-gradient(135deg,#1a0d0d,#2d1212,#1a0d0d)",
    accentColor: "#EF4444",
    glowColor: "rgba(239,68,68,0.2)",
    ctaLabel: "Know More",
    icon: "🎪",
    stats: [{ label: "edition", value: "127th" }, { label: "participants", value: "10k+" }],
    dismissible: true,
  },
  {
    id: "x003",
    type: "cross_college",
    title: "PCCOE CodeStorm",
    subtitle: "National Level Coding Competition",
    description: "PCCOE presents CodeStorm, a national-level competitive programming contest. Individual participation. Categories: Beginner, Intermediate, Advanced. Certificates for all!",
    tag: "CODING CONTEST",
    tagColor: "#06B6D4",
    bgGradient: "linear-gradient(135deg,#061a1f,#0a2b33,#061a1f)",
    accentColor: "#06B6D4",
    glowColor: "rgba(6,182,212,0.2)",
    ctaLabel: "Participate",
    icon: "💻",
    stats: [{ label: "prize", value: "₹50K" }, { label: "open to", value: "All Colleges" }],
    dismissible: true,
  },
];

/* ════════════════════════════════════════════════
   ALL ADS COMBINED
════════════════════════════════════════════════ */
export const ALL_ADS: AdData[] = [
  ...HOSTEL_ADS,
  ...OWN_COLLEGE_ADS,
  ...CROSS_COLLEGE_ADS,
];

/* ─── Inline ads injected into product grid ─── */
export const INLINE_ADS: AdData[] = [
  HOSTEL_ADS[0],   // Green Valley Hostel
  OWN_COLLEGE_ADS[0], // Zenith Tech Fest
  CROSS_COLLEGE_ADS[0], // InterCollegiate Hackathon
  HOSTEL_ADS[2],   // CampusNest PG
];
