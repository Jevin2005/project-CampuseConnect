'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import {
  Megaphone, Plus, X, Upload, Globe, Building2, Clock, Calendar,
  Eye, MousePointer, Percent, Sparkles, AlertCircle, ChevronRight, BarChart3, ExternalLink, ArrowLeft
} from 'lucide-react';

/* ─── Types ────────────────────────────────────────────────────────── */
interface Ad {
  id: string;
  title: string;
  description: string;
  bannerUrl: string | null;
  scope: 'own' | 'cross';
  format: string;
  status: 'active' | 'expired' | 'deactivated';
  duration: number;
  views: number;
  clicks: number;
  startsAt: string;
  expiresAt: string;
  createdAt: string;
}

const DURATION_OPTS = [
  { val: '7', label: '7 days' },
  { val: '14', label: '14 days' },
  { val: '30', label: '30 days' },
];

function daysLeft(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return diff <= 0 ? 0 : Math.ceil(diff / 86400000);
}

function fmtDate(dt: string) {
  return new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function AdvertisementManagerPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [collegeName, setCollegeName] = useState('Your College');

  // Creation state variables
  const [showForm, setShowForm] = useState(false);
  const [scope, setScope] = useState<'own' | 'cross'>('own');
  const [duration, setDuration] = useState('7');
  const [form, setForm] = useState({ title: '', desc: '' });
  const [ctaLink, setCtaLink] = useState('');
  const [ctaLabel, setCtaLabel] = useState('Learn More');
  const [ctaContact, setCtaContact] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [formError, setFormError] = useState('');

  // Multi-poster upload states
  interface PosterItem {
    id: string;
    file: File;
    previewUrl: string;
  }
  type FormatType = 'banner' | 'square' | 'strip' | 'portrait' | 'card';

  const [postersByFormat, setPostersByFormat] = useState<Record<FormatType, PosterItem[]>>({
    banner: [],
    square: [],
    strip: [],
    portrait: [],
    card: []
  });
  const [activePosterIdxByFormat, setActivePosterIdxByFormat] = useState<Record<FormatType, number>>({
    banner: -1,
    square: -1,
    strip: -1,
    portrait: -1,
    card: -1
  });
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Ad Campaign Format state
  const [selectedFormats, setSelectedFormats] = useState<FormatType[]>(['banner']);
  const [editingFormat, setEditingFormat] = useState<FormatType>('banner');

  // Preview interactive modal state
  interface PreviewData {
    title: string;
    description: string;
    bannerUrl: string | null;
    scope: 'own' | 'cross';
    duration: number;
    format: 'banner' | 'square' | 'strip' | 'portrait' | 'card';
    status?: 'active' | 'expired' | 'deactivated';
    views?: number;
    clicks?: number;
    startsAt?: string;
    expiresAt?: string;
    isDraft: boolean;
  }
  const [activePreview, setActivePreview] = useState<PreviewData | null>(null);

  // Management modals & filters
  const [endModal, setEndModal] = useState<string | null>(null);
  const [ending, setEnding] = useState(false);
  const [tab, setTab] = useState<'active' | 'ended'>('active');

  const fetchAds = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/ads');
      setAds(res.data.ads || []);
      setCollegeName(res.data.college?.name || 'Your College');
    } catch { /* silently fall back */ } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  // Banner Pickers
  const handleBannerPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newPoster: PosterItem = {
      id: Math.random().toString(36).substring(7),
      file,
      previewUrl: URL.createObjectURL(file)
    };
    
    // Use functional updater for both so we get the latest prev state
    setPostersByFormat(prev => {
      const nextList = [...(prev[editingFormat] || []), newPoster];
      // Also update active index to point to the new item
      setActivePosterIdxByFormat(idxPrev => ({
        ...idxPrev,
        [editingFormat]: nextList.length - 1
      }));
      return { ...prev, [editingFormat]: nextList };
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files || []);
    const imgFiles = files.filter(f => f.type.startsWith("image/"));
    if (imgFiles.length === 0) return;
    
    const newItems: PosterItem[] = imgFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      previewUrl: URL.createObjectURL(file)
    }));
    
    // Use functional updater to avoid stale closure on active index
    setPostersByFormat(prev => {
      const nextList = [...(prev[editingFormat] || []), ...newItems];
      setActivePosterIdxByFormat(idxPrev => ({
        ...idxPrev,
        [editingFormat]: nextList.length - 1
      }));
      return { ...prev, [editingFormat]: nextList };
    });
  };

  const removePoster = (idxToRemove: number) => {
    const targetUrl = postersByFormat[editingFormat]?.[idxToRemove]?.previewUrl;
    if (targetUrl) {
      try { URL.revokeObjectURL(targetUrl); } catch {}
    }
    
    setPostersByFormat(prev => {
      const currentList = prev[editingFormat] || [];
      const nextList = currentList.filter((_, idx) => idx !== idxToRemove);
      return {
        ...prev,
        [editingFormat]: nextList
      };
    });
    
    setActivePosterIdxByFormat(prev => {
      const activeIdx = prev[editingFormat];
      const currentListLength = (postersByFormat[editingFormat] || []).length;
      let nextActiveIdx = activeIdx;
      
      if (currentListLength <= 1) {
        nextActiveIdx = -1;
      } else if (activeIdx >= currentListLength - 1) {
        nextActiveIdx = currentListLength - 2;
      } else if (activeIdx === idxToRemove) {
        nextActiveIdx = Math.max(0, idxToRemove - 1);
      } else if (activeIdx > idxToRemove) {
        nextActiveIdx = activeIdx - 1;
      }
      
      return {
        ...prev,
        [editingFormat]: nextActiveIdx
      };
    });
  };

  // Submit Ad Creation
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.title.trim() || !form.desc.trim()) {
      setFormError('Title and description are required.');
      return;
    }
    if (selectedFormats.length === 0) {
      setFormError('Please select at least one campaign format.');
      return;
    }

    // Validate that each selected format has an asset configured
    for (const fmt of selectedFormats) {
      const list = postersByFormat[fmt] || [];
      const idx = activePosterIdxByFormat[fmt];
      if (list.length === 0 || idx < 0 || !list[idx]) {
        setFormError(`Please upload and select a poster asset for the ${fmt} format.`);
        setEditingFormat(fmt); // Switch sub-tab to guide them
        return;
      }
    }

    try {
      setPublishing(true);

      // Loop through all selected formats and publish them sequentially
      for (let i = 0; i < selectedFormats.length; i++) {
        const fmt = selectedFormats[i];
        const activePoster = postersByFormat[fmt][activePosterIdxByFormat[fmt]];
        
        setUploading(true);
        // Upload the file first
        const fd = new FormData();
        fd.append('banner', activePoster.file);
        
        const up = await api.post('/api/admin/ads/upload', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const bannerUrl = up.data.url;
        setUploading(false);

        const packedDescription = form.desc.trim() + 
          (ctaLink.trim() ? `\n\n📢 CAMPAIGN_METADATA:\nCTA_LINK: ${ctaLink.trim()}\nCTA_LABEL: ${ctaLabel.trim()}\nCTA_CONTACT: ${ctaContact.trim()}` : "");

        // Create the ad campaign
        await api.post('/api/admin/ads', {
          title: form.title.trim(),
          description: packedDescription,
          scope,
          format: fmt,
          duration: parseInt(duration, 10),
          bannerUrl
        });
      }

      // Reset state
      setForm({ title: '', desc: '' });
      setCtaLink('');
      setCtaLabel('Learn More');
      setCtaContact('');
      Object.values(postersByFormat).flat().forEach(p => {
        try { URL.revokeObjectURL(p.previewUrl); } catch {}
      });
      setPostersByFormat({
        banner: [],
        square: [],
        strip: [],
        portrait: [],
        card: []
      });
      setActivePosterIdxByFormat({
        banner: -1,
        square: -1,
        strip: -1,
        portrait: -1,
        card: -1
      });
      setSelectedFormats(['banner']);
      setEditingFormat('banner');
      setShowForm(false);
      await fetchAds();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Failed to create ads. Try again.');
    } finally {
      setPublishing(false);
      setUploading(false);
    }
  };

  // End Ad Deactivation
  const handleEndAd = async () => {
    if (!endModal) return;
    try {
      setEnding(true);
      await api.patch(`/api/admin/ads/${endModal}/end`);
      setEndModal(null);
      await fetchAds();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to end ad');
    } finally {
      setEnding(false);
    }
  };

  const activeAds = ads.filter(a => a.status === 'active');
  const endedAds = ads.filter(a => a.status !== 'active');
  const displayAds = tab === 'active' ? activeAds : endedAds;

  const activePosterUrl = activePosterIdxByFormat[editingFormat] >= 0 && postersByFormat[editingFormat]?.[activePosterIdxByFormat[editingFormat]]
    ? postersByFormat[editingFormat][activePosterIdxByFormat[editingFormat]].previewUrl
    : null;

  // Live Preview Theme Computations
  const isOwnTheme = scope === 'own';
  const themeAccentColor = isOwnTheme ? 'var(--emerald)' : 'var(--amber)';
  const themeGlowColor = isOwnTheme ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)';
  const themeGradient = isOwnTheme
    ? 'linear-gradient(135deg, #061e14, #0b2f1e, #05160e)'
    : 'linear-gradient(135deg, #1f1400, #332200, #170f00)';
  const startsAtDate = new Date();
  const expiresAtDate = new Date(startsAtDate.getTime() + parseInt(duration, 10) * 24 * 60 * 60 * 1000);
  const formattedExpiry = expiresAtDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const costPerFormat = scope === 'cross' ? 500 : 0;
  const totalCostVal = costPerFormat * selectedFormats.length;

  return (
    <>
      <style>{`
        :root {
          --bg-main: #0A0E1A;
          --bg-card: #111827;
          --bg-card-hover: #162035;
          --bg-input: #1a2235;
          --border-color: #1e2d45;
          --text-primary: #F0F4FF;
          --text-muted: #6B7280;
          --text-soft: #9CA3AF;
          
          --blue: #4F8EF7;
          --emerald: #10B981;
          --amber: #F59E0B;
          --rose: #EF4444;
          --violet: #8B5CF6;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'DM Sans', sans-serif;
          background: var(--bg-main);
          color: var(--text-primary);
        }

        .ad-container {
          background: var(--bg-main);
          min-height: 100vh;
          padding: 36px 40px;
          animation: fadeUp .35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes lpulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .4; transform: scale(0.85); }
        }

        /* Dash Stats */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
          overflow: hidden;
          transition: all 0.25s ease;
        }
        
        .stat-card::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0; height: 3px;
          background: transparent;
          transition: background 0.25s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.1);
        }
        
        .stat-card.blue:hover::after { background: var(--blue); }
        .stat-card.emerald:hover::after { background: var(--emerald); }
        .stat-card.amber:hover::after { background: var(--amber); }
        .stat-card.rose:hover::after { background: var(--rose); }

        .stat-icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .stat-card.blue .stat-icon-wrap { background: rgba(79, 142, 247, 0.1); color: var(--blue); }
        .stat-card.emerald .stat-icon-wrap { background: rgba(16, 185, 129, 0.1); color: var(--emerald); }
        .stat-card.amber .stat-icon-wrap { background: rgba(245, 158, 11, 0.1); color: var(--amber); }
        .stat-card.rose .stat-icon-wrap { background: rgba(239, 68, 68, 0.1); color: var(--rose); }

        .stat-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .stat-val {
          font-family: 'Sora', sans-serif;
          font-size: 24px;
          font-weight: 800;
        }

        .stat-label {
          font-size: 12px;
          color: var(--text-soft);
          font-weight: 500;
        }

        /* Navigation Header */
        .dash-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .dash-title-block h1 {
          font-family: 'Sora', sans-serif;
          font-size: 26px;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .dash-title-block p {
          font-size: 13px;
          color: var(--text-muted);
        }

        .launch-btn {
          background: linear-gradient(90deg, var(--emerald), #059669);
          border: none;
          color: #003822;
          font-weight: 700;
          font-size: 13px;
          height: 40px;
          padding: 0 20px;
          border-radius: 9999px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
          transition: all 0.2s ease;
        }

        .launch-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
        }

        /* ─── Two-Column Creation Layout ───────────────────────────── */
        .create-layout {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 32px;
          align-items: start;
        }

        .form-panel {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
        }

        .form-section-title {
          font-family: 'Sora', sans-serif;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-primary);
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          color: var(--text-muted);
          margin-bottom: 8px;
        }

        .text-input {
          width: 100%;
          background: var(--bg-input);
          border: 1.5px solid var(--border-color);
          border-radius: 12px;
          color: var(--text-primary);
          padding: 12px 16px;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: all 0.2s ease;
        }

        .text-input::placeholder {
          color: var(--text-muted);
        }

        .text-input:focus {
          border-color: var(--blue);
          box-shadow: 0 0 0 3px rgba(79, 142, 247, 0.15);
        }

        textarea.text-input {
          resize: vertical;
          min-height: 100px;
        }

        .char-counter {
          font-size: 11px;
          color: var(--text-muted);
          text-align: right;
          margin-top: 4px;
        }

        /* Scope Selector Cards */
        .scope-card-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .scope-select-card {
          background: var(--bg-input);
          border: 1.5px solid var(--border-color);
          border-radius: 16px;
          padding: 18px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          display: flex;
          flex-direction: column;
          min-height: 160px;
        }

        .scope-select-card:hover {
          border-color: rgba(255, 255, 255, 0.1);
          transform: translateY(-1px);
        }

        .scope-select-card.selected.own {
          border-color: var(--emerald);
          background: rgba(16, 185, 129, 0.04);
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.08);
        }

        .scope-select-card.selected.cross {
          border-color: var(--amber);
          background: rgba(245, 158, 11, 0.04);
          box-shadow: 0 8px 24px rgba(245, 158, 11, 0.08);
        }

        .scope-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .scope-card-title {
          font-size: 14px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .scope-select-card.selected.own .scope-card-title { color: var(--emerald); }
        .scope-select-card.selected.cross .scope-card-title { color: var(--amber); }

        .scope-radio {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 1.5px solid var(--text-soft);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .scope-select-card.selected .scope-radio {
          border-color: currentColor;
        }

        .scope-radio::after {
          content: '';
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: currentColor;
          transform: scale(0);
          transition: transform 0.2s;
        }

        .scope-select-card.selected .scope-radio::after {
          transform: scale(1);
        }

        .scope-card-desc {
          font-size: 11px;
          color: var(--text-soft);
          line-height: 1.5;
          margin-bottom: 12px;
          flex: 1;
        }

        .scope-card-cost {
          font-family: 'Sora', sans-serif;
          font-size: 16px;
          font-weight: 800;
        }

        .scope-select-card.own .scope-card-cost { color: var(--emerald); }
        .scope-select-card.cross .scope-card-cost { color: var(--amber); }

        /* Duration Segmented Control */
        .duration-pill-row {
          display: flex;
          background: var(--bg-input);
          border: 1.5px solid var(--border-color);
          border-radius: 12px;
          padding: 4px;
          gap: 4px;
        }

        .duration-pill {
          flex: 1;
          background: none;
          border: none;
          color: var(--text-soft);
          padding: 10px;
          font-size: 13px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.18s;
        }

        .duration-pill:hover:not(:disabled) {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.03);
        }

        .duration-pill.selected {
          background: var(--bg-card);
          color: var(--text-primary);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
          border: 1px solid var(--border-color);
        }

        .duration-pill:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Format multi-select pill — distinct from duration pills */
        .format-pill-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 12px;
        }

        .format-pill {
          background: var(--bg-input);
          border: 1.5px solid var(--border-color);
          color: var(--text-soft);
          padding: 10px 6px;
          font-size: 11px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          border-radius: 10px;
          transition: all 0.18s;
          text-align: center;
          position: relative;
        }

        .format-pill:hover {
          color: var(--text-primary);
          border-color: rgba(79, 142, 247, 0.4);
        }

        .format-pill.selected {
          background: rgba(79, 142, 247, 0.1);
          border-color: var(--blue);
          color: var(--blue);
          box-shadow: 0 0 12px rgba(79, 142, 247, 0.15);
        }

        .format-pill-check {
          position: absolute;
          top: 4px;
          right: 5px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--blue);
          color: #0A0E1A;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 900;
          line-height: 1;
        }

        /* Image Upload Area */
        .upload-zone {
          border: 2px dashed var(--border-color);
          background: var(--bg-input);
          border-radius: 16px;
          padding: 32px 24px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          min-height: 160px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .upload-zone:hover, .upload-zone.drag-active {
          border-color: var(--blue);
          background: rgba(79, 142, 247, 0.03);
        }

        .upload-icon-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-soft);
          transition: all 0.2s;
        }

        .upload-zone:hover .upload-icon-circle {
          color: var(--blue);
          border-color: rgba(79, 142, 247, 0.3);
          transform: translateY(-2px);
        }

        .upload-hint {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .upload-hint span {
          color: var(--blue);
          text-decoration: underline;
        }

        .upload-desc {
          font-size: 11px;
          color: var(--text-muted);
          max-width: 290px;
          line-height: 1.5;
        }

        .upload-preview-container {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 10;
        }

        .upload-preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .upload-preview-overlay {
          position: absolute;
          inset: 0;
          background: rgba(10, 14, 26, 0.65);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .upload-preview-container:hover .upload-preview-overlay {
          opacity: 1;
        }

        .upload-overlay-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #fff;
          font-size: 12px;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 9999px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.18s;
        }

        .upload-overlay-btn:hover {
          background: #fff;
          color: var(--bg-main);
        }

        .upload-overlay-btn.remove {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.3);
          color: var(--rose);
        }

        .upload-overlay-btn.remove:hover {
          background: var(--rose);
          color: #fff;
        }

        /* Action Buttons Row */
        .form-actions-row {
          display: flex;
          gap: 16px;
          margin-top: 12px;
        }

        .cancel-btn {
          background: none;
          border: 1px solid var(--border-color);
          color: var(--text-soft);
          border-radius: 9999px;
          height: 46px;
          padding: 0 24px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .cancel-btn:hover {
          color: var(--text-primary);
          border-color: var(--text-soft);
          background: rgba(255, 255, 255, 0.02);
        }

        .submit-btn {
          flex: 1;
          border: none;
          border-radius: 9999px;
          height: 46px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .submit-btn.own {
          background: var(--emerald);
          color: #003822;
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.25);
        }

        .submit-btn.own:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
        }

        .submit-btn.cross {
          background: var(--amber);
          color: #3d2600;
          box-shadow: 0 4px 16px rgba(245, 158, 11, 0.25);
        }

        .submit-btn.cross:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(245, 158, 11, 0.35);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .err-msg {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: var(--rose);
          font-size: 13px;
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* ─── Marketplace Live Preview ────────────────────────────── */
        .preview-sticky {
          position: sticky;
          top: 36px;
        }

        .preview-panel-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 14px;
        }

        .preview-panel-header span {
          display: flex;
          color: var(--blue);
        }

        .mock-marketplace-feed {
          background: #0D1322;
          border: 1px solid var(--border-color);
          border-radius: 24px;
          padding: 24px;
          position: relative;
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
        }
        
        /* mock header inside feed */
        .mock-feed-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
          font-size: 11px;
          color: var(--text-muted);
          font-family: inherit;
        }
        
        .mock-feed-dot {
          width: 8px; height: 8px; border-radius: 50%; background: #334155;
        }

        /* Mock Advertisement Banner Card - matches AdBannerHorizontal layout */
        .mock-ad-banner {
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          border: 1.5px solid transparent;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          aspect-ratio: 3/1;
          min-height: 135px; /* Prevent description/button overlap in column layout */
          cursor: pointer;
        }

        .mock-ad-banner:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 36px rgba(0,0,0,0.4), 0 0 20px rgba(79, 142, 247, 0.1);
        }

        .mock-ad-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .mock-ad-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .mock-ad-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(10, 14, 26, 0.95) 45%, rgba(10, 14, 26, 0.65) 75%, transparent);
          z-index: 2;
        }

        .mock-ad-content {
          position: relative;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          height: 100%;
          gap: 16px;
        }

        .mock-ad-info {
          flex: 1;
          min-width: 0;
        }

        .mock-ad-badge-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 6px;
        }

        .mock-ad-badge {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1px;
          padding: 2px 7px;
          border-radius: 4px;
          border: 1px solid transparent;
        }

        .mock-ad-sponsor-label {
          font-size: 9px;
          color: var(--text-muted);
          font-weight: 700;
          letter-spacing: 0.8px;
        }

        .mock-ad-title {
          font-family: 'Sora', sans-serif;
          font-size: 17px;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .mock-ad-desc {
          font-size: 11px;
          color: var(--text-soft);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          max-width: 320px;
        }

        .mock-ad-cta {
          flex-shrink: 0;
          height: 34px;
          padding: 0 16px;
          border-radius: 9999px;
          border: none;
          font-size: 11px;
          font-weight: 700;
          color: #0A0E1A;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
        }

        /* ─── Campaigns History & list view ───────────────────────── */
        .list-section {
          animation: fadeUp .3s ease;
        }

        .section-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
          border-bottom: 1.5px solid var(--border-color);
          padding-bottom: 12px;
        }

        .section-bar-title {
          font-family: 'Sora', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-tabs {
          display: flex;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          padding: 3px;
          border-radius: 9999px;
        }

        .filter-tab {
          border: none;
          background: none;
          color: var(--text-muted);
          font-size: 12px;
          font-weight: 600;
          padding: 6px 16px;
          border-radius: 9999px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        }

        .filter-tab.selected {
          background: var(--bg-input);
          color: var(--text-primary);
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }

        .campaigns-stack {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .campaign-item {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          display: flex;
          overflow: hidden;
          transition: all 0.25s ease;
        }

        .campaign-item:hover {
          transform: translateY(-2px);
          border-color: rgba(79, 142, 247, 0.2);
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        }

        .campaign-banner-thumbnail {
          width: 200px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          min-height: 120px;
        }

        .campaign-banner-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          position: absolute;
          inset: 0;
        }

        .campaign-body {
          flex: 1;
          padding: 20px 28px;
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .campaign-details {
          flex: 1;
          min-width: 0;
        }

        .campaign-meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 6px;
        }

        .status-pill {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.5px;
          padding: 2.5px 8px;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .status-pill.live {
          color: var(--emerald);
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .status-pill.live .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--emerald);
          animation: lpulse 1.4s infinite;
        }

        .status-pill.ended {
          color: var(--rose);
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .status-pill.expired {
          color: var(--text-soft);
          background: rgba(156, 163, 175, 0.08);
          border: 1px solid rgba(156, 163, 175, 0.2);
        }

        .scope-badge {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.5px;
          padding: 2.5px 8px;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .scope-badge.own {
          color: var(--emerald);
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.15);
        }

        .scope-badge.cross {
          color: var(--amber);
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.15);
        }

        .campaign-title {
          font-family: 'Sora', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .campaign-desc {
          font-size: 12px;
          color: var(--text-soft);
          line-height: 1.5;
          margin-bottom: 10px;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .campaign-metrics-row {
          display: flex;
          align-items: center;
          gap: 20px;
          font-size: 12px;
          color: var(--text-soft);
          flex-wrap: wrap;
        }

        .metric-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .metric-item strong {
          color: var(--text-primary);
        }

        .campaign-actions {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }

        .deactivate-btn {
          background: transparent;
          border: 1.5px solid rgba(239, 68, 68, 0.35);
          color: var(--rose);
          font-weight: 700;
          font-size: 12px;
          padding: 8px 16px;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .deactivate-btn:hover {
          background: rgba(239, 68, 68, 0.08);
          border-color: var(--rose);
        }

        .date-limit-text {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 500;
          text-align: right;
        }

        .empty-history-card {
          text-align: center;
          padding: 60px 40px;
          border: 1px dashed var(--border-color);
          border-radius: 20px;
          color: var(--text-soft);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .empty-history-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          font-size: 20px;
        }

        /* ─── Skeleton Loading ─── */
        .skel-card {
          background: linear-gradient(90deg, var(--bg-card) 25%, var(--border-color) 50%, var(--bg-card) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ─── Modal Glassmorphism ─── */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(3, 7, 18, 0.8);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-card {
          background: var(--bg-card);
          border: 1.5px solid var(--border-color);
          border-radius: 24px;
          padding: 32px;
          max-width: 400px;
          width: 90%;
          animation: scaleIn 0.2s ease-out;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .modal-title {
          font-family: 'Sora', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .modal-desc {
          font-size: 13px;
          color: var(--text-soft);
          line-height: 1.5;
          margin-bottom: 24px;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .modal-btn {
          border: none;
          border-radius: 9999px;
          font-weight: 600;
          font-size: 13px;
          padding: 10px 20px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }

        .modal-btn.cancel {
          background: none;
          border: 1px solid var(--border-color);
          color: var(--text-soft);
        }

        .modal-btn.cancel:hover {
          color: var(--text-primary);
          border-color: var(--text-soft);
        }

        .modal-btn.confirm {
          background: var(--rose);
          color: #fff;
          font-weight: 700;
        }

        .modal-btn.confirm:hover {
          background: #db3737;
        }

        .modal-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinning-loader {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin .7s linear infinite;
          display: inline-block;
        }
        
        .select-wrapper {
          position: relative;
          width: 100%;
        }
        
        .select-wrapper select {
          width: 100%;
          background: var(--bg-input);
          border: 1.5px solid var(--border-color);
          border-radius: 12px;
          color: var(--text-primary);
          padding: 12px 16px;
          padding-right: 40px;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: all 0.2s ease;
          appearance: none;
          cursor: pointer;
        }
        
        .select-wrapper::after {
          content: '▼';
          font-size: 9px;
          color: var(--text-soft);
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
        }
        
        .promotion-badge {
          background: rgba(245, 158, 11, 0.08);
          border: 1.5px solid rgba(245, 158, 11, 0.25);
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 12px;
          color: var(--amber);
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 10px;
          animation: fadeUp 0.2s ease;
        }
        
        /* Interactive Detail Preview Modal */
        .preview-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(3, 7, 18, 0.85);
          backdrop-filter: blur(12px);
          z-index: 100000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeUp 0.2s ease-out;
        }

        .preview-modal-card {
          background: #0d131f;
          border: 1.5px solid #1e2d45;
          border-radius: 24px;
          width: 100%;
          max-width: 580px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          position: relative;
          animation: scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .preview-modal-hero {
          height: 220px;
          width: 100%;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }

        .preview-modal-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .preview-modal-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, #0d131f 0%, transparent 60%);
        }

        .preview-modal-badge {
          position: absolute;
          bottom: 16px;
          left: 20px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
          padding: 4px 12px;
          border-radius: 6px;
          border: 1px solid transparent;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .preview-modal-body {
          padding: 24px 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .preview-modal-divider {
          height: 1px;
          background: #1e2d45;
        }

        .preview-modal-title {
          font-family: 'Sora', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #F0F4FF;
          margin-bottom: 4px;
          line-height: 1.25;
        }

        .preview-modal-subtitle {
          font-size: 14px;
          font-weight: 500;
        }

        .preview-modal-section-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          color: #6B7280;
          margin-bottom: 8px;
        }

        .preview-modal-desc {
          font-size: 14px;
          color: #C4CFDF;
          line-height: 1.6;
          white-space: pre-line;
        }

        .preview-modal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .preview-modal-chip {
          background: #111827;
          border: 1px solid #1e2d45;
          border-radius: 10px;
          padding: 10px 14px;
        }

        .preview-modal-chip-title {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #6B7280;
          margin-bottom: 4px;
        }

        .preview-modal-chip-val {
          font-size: 13px;
          font-weight: 600;
          color: #F0F4FF;
        }

        /* ─── Multi-poster & format layout variations ─── */
        .poster-thumbs-container {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 10px;
        }
        
        .poster-thumb-wrapper {
          position: relative;
          width: 84px;
          height: 84px;
          border-radius: 12px;
          border: 2px solid var(--border-color);
          cursor: pointer;
          overflow: hidden;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .poster-thumb-wrapper:hover {
          transform: translateY(-1px);
          border-color: rgba(255,255,255,0.15);
        }
        
        .poster-thumb-wrapper.active {
          border-color: var(--blue);
          box-shadow: 0 0 10px rgba(79, 142, 247, 0.35);
        }
        
        .poster-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .poster-thumb-remove {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.9);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          font-size: 10px;
          transition: all 0.15s;
          z-index: 5;
        }
        
        .poster-thumb-remove:hover {
          background: var(--rose);
          transform: scale(1.1);
        }
        
        .poster-thumb-add {
          width: 84px;
          height: 84px;
          border-radius: 12px;
          border: 2px dashed var(--border-color);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--text-soft);
          cursor: pointer;
          transition: all 0.2s;
          gap: 4px;
          font-size: 10px;
          font-weight: 600;
        }
        
        .poster-thumb-add:hover {
          border-color: var(--blue);
          color: var(--blue);
          background: rgba(79, 142, 247, 0.03);
        }

        /* Format aspect ratios & layout variations for mock previews */
        .mock-ad-banner.format-banner {
          aspect-ratio: 3/1;
          min-height: 135px;
          flex-direction: row;
        }
        
        .mock-ad-banner.format-square {
          aspect-ratio: 1/1;
          min-height: 320px;
          flex-direction: column;
        }
        .mock-ad-banner.format-square .mock-ad-bg {
          position: relative;
          height: 55%;
          width: 100%;
        }
        .mock-ad-banner.format-square .mock-ad-gradient {
          background: linear-gradient(to top, rgba(10, 14, 26, 0.95), transparent);
          inset: auto bottom 0 left 0 right 0;
          height: 40px;
        }
        .mock-ad-banner.format-square .mock-ad-content {
          padding: 16px 20px;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-end;
          gap: 12px;
          height: 45%;
        }
        .mock-ad-banner.format-square .mock-ad-cta {
          align-self: stretch;
          justify-content: center;
        }

        .mock-ad-banner.format-strip {
          aspect-ratio: 6/1;
          min-height: 60px;
          flex-direction: row;
        }
        .mock-ad-banner.format-strip .mock-ad-content {
          padding: 10px 18px;
          align-items: center;
          justify-content: space-between;
        }
        .mock-ad-banner.format-strip .mock-ad-title {
          font-size: 14px;
          margin-bottom: 0px;
        }
        .mock-ad-banner.format-strip .mock-ad-desc {
          -webkit-line-clamp: 1;
          margin-bottom: 0px;
        }
        .mock-ad-banner.format-strip .mock-ad-cta {
          height: 28px;
          padding: 0 12px;
          font-size: 10px;
        }
        .mock-ad-banner.format-strip .mock-ad-badge-row {
          margin-bottom: 0px;
        }

        .mock-ad-banner.format-portrait {
          aspect-ratio: 2/3;
          min-height: 380px;
          flex-direction: column;
        }
        .mock-ad-banner.format-portrait .mock-ad-bg {
          inset: 0;
        }
        .mock-ad-banner.format-portrait .mock-ad-gradient {
          background: linear-gradient(to top, rgba(10, 14, 26, 0.98) 60%, rgba(10, 14, 26, 0.4) 100%);
        }
        .mock-ad-banner.format-portrait .mock-ad-content {
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          padding: 24px;
          gap: 16px;
          text-align: center;
          height: 100%;
        }
        .mock-ad-banner.format-portrait .mock-ad-info {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .mock-ad-banner.format-portrait .mock-ad-badge-row {
          justify-content: center;
        }
        .mock-ad-banner.format-portrait .mock-ad-desc {
          max-width: 100%;
          -webkit-line-clamp: 4;
        }
        .mock-ad-banner.format-portrait .mock-ad-cta {
          align-self: stretch;
          justify-content: center;
        }

        .mock-ad-banner.format-card {
          aspect-ratio: 1.5/1;
          min-height: 220px;
          flex-direction: column;
        }
        .mock-ad-banner.format-card .mock-ad-bg {
          position: relative;
          height: 50%;
        }
        .mock-ad-banner.format-card .mock-ad-gradient {
          background: linear-gradient(to top, rgba(10, 14, 26, 0.9) 10%, transparent);
          height: 30px;
          inset: auto bottom 0 left 0 right 0;
        }
        .mock-ad-banner.format-card .mock-ad-content {
          padding: 16px;
          flex-direction: row;
          align-items: center;
          height: 50%;
        }
        .mock-ad-banner.format-card .mock-ad-cta {
          height: 32px;
          font-size: 10px;
        }

        .campaign-summary-card {
          background: rgba(79, 142, 247, 0.04);
          border: 1.5px solid var(--border-color);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        
        .campaign-summary-title {
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .campaign-summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .campaign-summary-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .campaign-summary-label {
          font-size: 10px;
          color: var(--text-muted);
          font-weight: 500;
          text-transform: uppercase;
        }

        .campaign-summary-val {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .campaign-summary-total {
          border-top: 1px solid var(--border-color);
          padding-top: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .campaign-summary-total-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .campaign-summary-total-val {
          font-family: 'Sora', sans-serif;
          font-size: 18px;
          font-weight: 800;
          color: var(--emerald);
        }
      `}</style>

      <div className="ad-container">
        {/* HEADER BLOCK */}
        <div className="dash-header">
          <div className="dash-title-block">
            <h1>📢 Campaign Manager</h1>
            <p>Publish banners and monitor click-through rates across {collegeName}</p>
          </div>
          {!showForm && (
            <button className="launch-btn" onClick={() => setShowForm(true)}>
              <Plus size={16} /> Launch Campaign
            </button>
          )}
        </div>

        {/* STATS STRIP */}
        {!loading && ads.length > 0 && !showForm && (
          <div className="stats-grid">
            {/* Active Ads */}
            <div className="stat-card emerald">
              <div className="stat-icon-wrap">
                <Megaphone size={20} />
              </div>
              <div className="stat-info">
                <div className="stat-val">{activeAds.length}</div>
                <div className="stat-label">Active Banners</div>
              </div>
            </div>

            {/* Total Views */}
            <div className="stat-card blue">
              <div className="stat-icon-wrap">
                <Eye size={20} />
              </div>
              <div className="stat-info">
                <div className="stat-val">
                  {ads.reduce((s, a) => s + a.views, 0).toLocaleString()}
                </div>
                <div className="stat-label">Total Views</div>
              </div>
            </div>

            {/* Total Clicks */}
            <div className="stat-card amber">
              <div className="stat-icon-wrap">
                <MousePointer size={20} />
              </div>
              <div className="stat-info">
                <div className="stat-val">
                  {ads.reduce((s, a) => s + a.clicks, 0).toLocaleString()}
                </div>
                <div className="stat-label">Total Clicks</div>
              </div>
            </div>

            {/* Average CTR */}
            <div className="stat-card rose">
              <div className="stat-icon-wrap">
                <Percent size={20} />
              </div>
              <div className="stat-info">
                <div className="stat-val">
                  {(() => {
                    const tv = ads.reduce((s, a) => s + a.views, 0);
                    const tc = ads.reduce((s, a) => s + a.clicks, 0);
                    return tv > 0 ? `${((tc / tv) * 100).toFixed(1)}%` : '0.0%';
                  })()}
                </div>
                <div className="stat-label">Click-Through Rate</div>
              </div>
            </div>
          </div>
        )}

        {/* ── CREATE FORM VIEW ─────────────────────────────────────── */}
        {showForm ? (
          <div className="create-layout">

            {/* Form Column */}
            <div className="form-panel">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div className="form-section-title" style={{ margin: 0 }}>
                  <Megaphone size={20} style={{ color: 'var(--blue)' }} />
                  <span>Launch New Campaign</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormError('');
                    setForm({ title: '', desc: '' });
                    setCtaLink('');
                    setCtaLabel('Learn More');
                    setCtaContact('');
                    Object.values(postersByFormat).flat().forEach(p => {
                      try { URL.revokeObjectURL(p.previewUrl); } catch {}
                    });
                    setPostersByFormat({
                      banner: [],
                      square: [],
                      strip: [],
                      portrait: [],
                      card: []
                    });
                    setActivePosterIdxByFormat({
                      banner: -1,
                      square: -1,
                      strip: -1,
                      portrait: -1,
                      card: -1
                    });
                    setSelectedFormats(['banner']);
                    setEditingFormat('banner');
                  }}
                  style={{
                    background: 'none', border: 'none', color: 'var(--text-soft)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: '13px', fontWeight: 600, padding: '4px 8px', borderRadius: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'var(--text-soft)';
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  <ArrowLeft size={14} /> Back
                </button>
              </div>

              <form onSubmit={handlePublish}>
                {formError && (
                  <div className="err-msg">
                    <AlertCircle size={18} />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Scope Selection */}
                <div className="form-group">
                  <label className="form-label">1. Targeting Audience</label>
                  <div className="scope-card-row">
                    {/* Campus Only */}
                    <div
                      className={`scope-select-card own ${scope === 'own' ? 'selected' : ''}`}
                      onClick={() => { setScope('own'); setDuration('7'); }}
                    >
                      <div className="scope-card-header">
                        <span className="scope-card-title">
                          <Building2 size={16} /> Campus Reach
                        </span>
                        <div className="scope-radio" />
                      </div>
                      <p className="scope-card-desc">Visible exclusively to students within {collegeName}. Perfect for localized promotions.</p>
                      <div className="scope-card-cost">Free Tier</div>
                    </div>

                    {/* Cross College */}
                    <div
                      className={`scope-select-card cross ${scope === 'cross' ? 'selected' : ''}`}
                      onClick={() => { setScope('cross'); setDuration('7'); }}
                    >
                      <div className="scope-card-header">
                        <span className="scope-card-title">
                          <Globe size={16} /> Global Network
                        </span>
                        <div className="scope-radio" />
                      </div>
                      <p className="scope-card-desc">Visible to all student users across every college on CampusConnect. Maximum visibility.</p>
                      <div className="scope-card-cost">₹500 <span style={{ fontSize: '10px', color: 'var(--text-soft)', fontWeight: 500 }}>/ 7 days</span></div>
                    </div>
                  </div>
                </div>

                {/* Campaign Format Selection */}
                <div className="form-group">
                  <label className="form-label">
                    2. Campaign Format
                    <span style={{ marginLeft: 8, fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>
                      Select one or more
                    </span>
                  </label>
                  <div className="format-pill-row">
                    {[
                      { val: 'banner', label: 'Wide Banner', ratio: '3:1', icon: '▬' },
                      { val: 'square', label: 'Square Card', ratio: '1:1', icon: '■' },
                      { val: 'strip', label: 'Thin Strip', ratio: '6:1', icon: '━' },
                      { val: 'portrait', label: 'Vertical Story', ratio: '2:3', icon: '▮' },
                      { val: 'card', label: 'Grid Card', ratio: '1.5:1', icon: '▬' },
                    ].map(opt => {
                      const isSel = selectedFormats.includes(opt.val as any);
                      return (
                        <button
                          key={opt.val}
                          type="button"
                          className={`format-pill ${isSel ? 'selected' : ''}`}
                          onClick={() => {
                            let next: FormatType[];
                            if (isSel) {
                              if (selectedFormats.length <= 1) return; // keep at least 1
                              next = selectedFormats.filter(f => f !== opt.val);
                            } else {
                              next = [...selectedFormats, opt.val as FormatType];
                            }
                            setSelectedFormats(next);
                            if (!next.includes(editingFormat)) {
                              setEditingFormat(next[0]);
                            }
                          }}
                        >
                          {isSel && <span className="format-pill-check">✓</span>}
                          <div style={{ fontSize: '15px', marginBottom: 2 }}>{opt.icon}</div>
                          <div style={{ fontWeight: 700 }}>{opt.label}</div>
                          <div style={{ fontSize: '9px', opacity: 0.7, marginTop: 1 }}>{opt.ratio}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Ad Title */}
                <div className="form-group">
                  <label className="form-label">3. Campaign Heading</label>
                  <input
                    className="text-input"
                    placeholder="E.g., Zenith Annual Tech Fest 2026..."
                    maxLength={60}
                    required
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  />
                  <div className="char-counter">{form.title.length}/60</div>
                </div>

                {/* Ad Description */}
                <div className="form-group">
                  <label className="form-label">4. Description / Message</label>
                  <textarea
                    className="text-input"
                    placeholder="Detail the event highlights, key dates, registration procedures, or campaign value proposition..."
                    maxLength={250}
                    required
                    value={form.desc}
                    onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
                  />
                  <div className="char-counter">{form.desc.length}/250</div>
                </div>

                {/* Campaign Action Link */}
                <div className="form-group">
                  <label className="form-label">Action Link (Optional)</label>
                  <input
                    className="text-input"
                    type="url"
                    placeholder="https://example.com/register-or-apply"
                    value={ctaLink}
                    onChange={e => setCtaLink(e.target.value)}
                  />
                  <div className="char-counter" style={{ textAlign: 'left', marginTop: 4 }}>
                    Provide a destination link (e.g. registration form, external website).
                  </div>
                </div>

                {/* Campaign Action Label */}
                <div className="form-group">
                  <label className="form-label">Action Button Label (Optional)</label>
                  <input
                    className="text-input"
                    placeholder="E.g., Register Now, Learn More, Apply Here..."
                    value={ctaLabel}
                    onChange={e => setCtaLabel(e.target.value)}
                    maxLength={30}
                  />
                  <div className="char-counter">{ctaLabel.length}/30</div>
                </div>

                {/* Campaign Contact Info */}
                <div className="form-group">
                  <label className="form-label">Contact Information (Optional)</label>
                  <input
                    className="text-input"
                    placeholder="E.g., Email or Phone (e.g., fest@college.edu or 9876543210)..."
                    value={ctaContact}
                    onChange={e => setCtaContact(e.target.value)}
                    maxLength={100}
                  />
                  <div className="char-counter">{ctaContact.length}/100</div>
                </div>

                {/* Banner File Upload (Placeholder for one or more posters) */}
                <div className="form-group">
                  <label className="form-label" style={{ textTransform: 'capitalize' }}>
                    5. Poster Assets (Upload for {editingFormat} format)
                  </label>

                  {/* If multiple formats are selected, render sub-tabs to switch between them */}
                  {selectedFormats.length > 1 && (
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                      {selectedFormats.map(fmt => {
                        const hasAsset = (postersByFormat[fmt] || []).length > 0 && activePosterIdxByFormat[fmt] >= 0;
                        return (
                          <button
                            key={fmt}
                            type="button"
                            className={`duration-pill ${editingFormat === fmt ? 'selected' : ''}`}
                            onClick={() => setEditingFormat(fmt)}
                            style={{
                              padding: '6px 12px',
                              fontSize: '11px',
                              textTransform: 'capitalize',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              border: editingFormat === fmt ? '1px solid var(--border-color)' : '1px solid transparent'
                            }}
                          >
                            <span>
                              {fmt === 'banner' && 'Wide Banner'}
                              {fmt === 'square' && 'Square Card'}
                              {fmt === 'strip' && 'Thin Strip'}
                              {fmt === 'portrait' && 'Vertical Story'}
                              {fmt === 'card' && 'Grid Card'}
                            </span>
                            {hasAsset ? (
                              <span style={{ color: 'var(--emerald)', fontSize: '10px' }}>●</span>
                            ) : (
                              <span style={{ color: 'var(--rose)', fontSize: '10px' }}>○</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {(postersByFormat[editingFormat] || []).length === 0 ? (
                    <div
                      className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                    >
                      <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', cursor: 'pointer', padding: '32px 24px', gap: '12px' }}>
                        <div className="upload-icon-circle">
                          <Upload size={20} />
                        </div>
                        <div className="upload-hint">
                          <span>Click to upload custom poster</span> or drag and drop
                        </div>
                        <div className="upload-desc">
                          PNG, JPG, or WEBP. Max size 5MB.<br />
                          {editingFormat === 'banner' && 'Recommended Wide Banner dimensions: 3:1 aspect ratio (e.g. 1200x400px)'}
                          {editingFormat === 'square' && 'Recommended Square Card dimensions: 1:1 aspect ratio (e.g. 800x800px)'}
                          {editingFormat === 'strip' && 'Recommended Leaderboard Strip dimensions: 6:1 aspect ratio (e.g. 1200x200px)'}
                          {editingFormat === 'portrait' && 'Recommended Vertical Story dimensions: 2:3 aspect ratio (e.g. 600x900px)'}
                          {editingFormat === 'card' && 'Recommended Grid Card dimensions: 1.5:1 aspect ratio (e.g. 900x600px)'}
                        </div>
                        <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleBannerPick} />
                      </label>
                    </div>
                  ) : (
                    <div className="poster-thumbs-container">
                      {(postersByFormat[editingFormat] || []).map((poster, index) => (
                        <div
                          key={poster.id}
                          className={`poster-thumb-wrapper ${index === activePosterIdxByFormat[editingFormat] ? 'active' : ''}`}
                          onClick={() => setActivePosterIdxByFormat(prev => ({ ...prev, [editingFormat]: index }))}
                        >
                          <img src={poster.previewUrl} className="poster-thumb-img" alt="Poster thumbnail" />
                          <button
                            type="button"
                            className="poster-thumb-remove"
                            onClick={(e) => {
                              e.stopPropagation();
                              removePoster(index);
                            }}
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                      
                      {/* Plus Box to upload more */}
                      <label className="poster-thumb-add">
                        <Plus size={20} />
                        <span>Add Poster</span>
                        <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleBannerPick} />
                      </label>
                    </div>
                  )}
                </div>

                {/* Campaign Duration */}
                <div className="form-group" style={{ marginBottom: 28 }}>
                  <label className="form-label">6. Duration</label>
                  {scope === 'cross' ? (
                    <div className="duration-pill-row">
                      <button type="button" className="duration-pill selected" disabled>
                        7 Days (Fixed for Global)
                      </button>
                    </div>
                  ) : (
                    <div className="duration-pill-row">
                      {DURATION_OPTS.map(opt => (
                        <button
                          key={opt.val}
                          type="button"
                          className={`duration-pill ${duration === opt.val ? 'selected' : ''}`}
                          onClick={() => setDuration(opt.val)}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Campaign Summary & Cost Estimate Card */}
                <div className="campaign-summary-card">
                  <div className="campaign-summary-title">
                    <Sparkles size={14} style={{ color: 'var(--amber)' }} />
                    <span>Campaign & Cost Estimate Summary</span>
                  </div>
                  <div className="campaign-summary-grid">
                    <div className="campaign-summary-item">
                      <span className="campaign-summary-label">Target Scope</span>
                      <span className="campaign-summary-val" style={{ color: scope === 'own' ? 'var(--emerald)' : 'var(--amber)' }}>
                        {scope === 'own' ? 'Campus Only' : 'Global Network'}
                      </span>
                    </div>
                    <div className="campaign-summary-item">
                      <span className="campaign-summary-label">Selected Formats</span>
                      <span className="campaign-summary-val" style={{ textTransform: 'capitalize' }}>
                        {selectedFormats.join(', ')} ({selectedFormats.length})
                      </span>
                    </div>
                    <div className="campaign-summary-item">
                      <span className="campaign-summary-label">Starts On</span>
                      <span className="campaign-summary-val">
                        {startsAtDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="campaign-summary-item">
                      <span className="campaign-summary-label">Expires On</span>
                      <span className="campaign-summary-val">{formattedExpiry}</span>
                    </div>
                  </div>
                  <div className="campaign-summary-total">
                    <span className="campaign-summary-total-label">Total Campaign Budget</span>
                    <span className="campaign-summary-total-val" style={{ color: totalCostVal === 0 ? 'var(--emerald)' : 'var(--amber)' }}>
                      {totalCostVal === 0 ? 'Free Tier' : `₹${totalCostVal}`}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="form-actions-row">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => {
                      setShowForm(false);
                      setFormError('');
                      setForm({ title: '', desc: '' });
                      setCtaLink('');
                      setCtaLabel('Learn More');
                      setCtaContact('');
                      Object.values(postersByFormat).flat().forEach(p => {
                        try { URL.revokeObjectURL(p.previewUrl); } catch {}
                      });
                      setPostersByFormat({
                        banner: [],
                        square: [],
                        strip: [],
                        portrait: [],
                        card: []
                      });
                      setActivePosterIdxByFormat({
                        banner: -1,
                        square: -1,
                        strip: -1,
                        portrait: -1,
                        card: -1
                      });
                      setSelectedFormats(['banner']);
                      setEditingFormat('banner');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`submit-btn ${scope}`}
                    disabled={publishing || uploading}
                  >
                    {publishing ? (
                      <>
                        <span className="spinning-loader" />
                        <span>{uploading ? 'Uploading poster...' : `Publishing ${selectedFormats.length > 1 ? 'campaigns' : 'campaign'}...`}</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {scope === 'cross'
                            ? `Pay ₹${500 * selectedFormats.length} & Launch ${selectedFormats.length} Campaign${selectedFormats.length > 1 ? 's' : ''}`
                            : `Launch ${selectedFormats.length} Campaign${selectedFormats.length > 1 ? 's' : ''}`}
                        </span>
                        <ChevronRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Live Preview Column */}
            <div className="preview-sticky">
              <div className="preview-panel-header">
                <span><Sparkles size={13} /></span>
                <span>Live Marketplace Preview</span>
              </div>

              <div className="mock-marketplace-feed">
                {/* Mock Browser/Feed Header */}
                <div className="mock-feed-header">
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Megaphone size={12} style={{ color: 'var(--blue)' }} /> Campus Marketplace Feed Preview
                  </span>
                  <div className="mock-feed-dot" />
                </div>

                {/* Mock Banner components matching selected formats */}
                {selectedFormats.map(fmt => {
                  const fmtPosterUrl = activePosterIdxByFormat[fmt] >= 0 && postersByFormat[fmt]?.[activePosterIdxByFormat[fmt]]
                    ? postersByFormat[fmt][activePosterIdxByFormat[fmt]].previewUrl
                    : null;
                  
                  return (
                    <div
                      key={fmt}
                      className={`mock-ad-banner format-${fmt}`}
                      onClick={() => setActivePreview({
                        title: form.title || 'Your Catchy Campaign Title',
                        description: form.desc || 'Your advertisement or event details will appear in this section...',
                        bannerUrl: fmtPosterUrl,
                        scope: scope,
                        duration: parseInt(duration, 10),
                        format: fmt,
                        isDraft: true
                      })}
                      style={{
                        borderColor: themeAccentColor,
                        boxShadow: `0 8px 30px ${themeGlowColor}, 0 0 0 1px color-mix(in srgb, ${themeAccentColor} 40%, transparent)`,
                        background: fmtPosterUrl ? 'transparent' : themeGradient,
                        marginBottom: 16
                      }}
                    >
                      {/* Background Image / Gradient */}
                      {fmtPosterUrl ? (
                        <div className="mock-ad-bg">
                          <img src={fmtPosterUrl} className="mock-ad-img" alt={`${fmt} asset preview`} />
                          <div className="mock-ad-gradient" />
                        </div>
                      ) : (
                        <div className="mock-ad-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{
                            position: 'absolute', width: 100, height: 100, borderRadius: '50%',
                            background: `radial-gradient(circle, ${themeAccentColor}1a 0%, transparent 70%)`,
                            top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none'
                          }} />
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                            No Poster ({fmt})
                          </span>
                        </div>
                      )}

                      {/* Banner Content */}
                      <div className="mock-ad-content">
                        <div className="mock-ad-info">
                          <div className="mock-ad-badge-row">
                            <span
                              className="mock-ad-badge"
                              style={{
                                background: `color-mix(in srgb, ${themeAccentColor} 10%, transparent)`,
                                color: themeAccentColor,
                                borderColor: `color-mix(in srgb, ${themeAccentColor} 20%, transparent)`
                              }}
                            >
                              {scope === 'own' ? 'CAMPUS ONLY' : 'ALL CAMPUSES'}
                            </span>
                            <span className="mock-ad-sponsor-label">📢 SPONSORED</span>
                          </div>

                          <h3 className="mock-ad-title">
                            {form.title.trim() || 'Your Catchy Campaign Title'}
                          </h3>

                          <p className="mock-ad-desc">
                            {form.desc.trim() || 'Your advertisement or event details will appear in this section. Provide a concise pitch to capture students\' attention.'}
                          </p>
                        </div>

                        <button
                          type="button"
                          className="mock-ad-cta"
                          style={{
                            background: themeAccentColor,
                            boxShadow: `0 4px 12px ${themeGlowColor}`
                          }}
                        >
                          <span>Learn More</span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Format Recommendations & Instructions Helper */}
                <div style={{
                  marginTop: 16, background: '#111827', border: '1px solid var(--border-color)',
                  borderRadius: '16px', padding: '14px 18px', fontSize: '12px', color: 'var(--text-soft)',
                  display: 'flex', flexDirection: 'column', gap: 8
                }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    💡 Selected Formats Recommendations
                  </div>
                  {selectedFormats.map(fmt => (
                    <div key={fmt} style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingLeft: 4, borderLeft: '2px solid var(--blue)', marginBottom: 8 }}>
                      <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize', fontSize: '11px' }}>
                        {fmt === 'banner' && 'Wide Banner (3:1)'}
                        {fmt === 'square' && 'Square Card (1:1)'}
                        {fmt === 'strip' && 'Thin Strip (6:1)'}
                        {fmt === 'portrait' && 'Vertical Story (2:3)'}
                        {fmt === 'card' && 'Grid Card (1.5:1)'}
                      </strong>
                      {fmt === 'banner' && (
                        <span>Best for wide landscape event posters (1200x400px). Renders as the main marketplace banner header.</span>
                      )}
                      {fmt === 'square' && (
                        <span>Best for standard photos or grid flyers (800x800px). Renders inside listing grids.</span>
                      )}
                      {fmt === 'strip' && (
                        <span>Best for text announcements or tickers (1200x150px). Thin banner alert style.</span>
                      )}
                      {fmt === 'portrait' && (
                        <span>Best for vertical event flyers or story pages (600x900px). Sidebar story slot.</span>
                      )}
                      {fmt === 'card' && (
                        <span>Best for general promotional flyers (900x600px). Rectangle grid feed layout.</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Fake feed listing placeholders */}
                <div style={{ marginTop: 24, display: 'flex', gap: 14 }}>
                  <div style={{ flex: 1, height: 80, background: '#111827', borderRadius: 12, border: '1px solid #1e2d4530', padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ width: '40%', height: 10, background: '#1e2d45', borderRadius: 3 }} />
                    <div style={{ width: '80%', height: 12, background: '#1a2235', borderRadius: 4 }} />
                    <div style={{ width: '60%', height: 8, background: '#1e2d45', borderRadius: 3 }} />
                  </div>
                  <div style={{ flex: 1, height: 80, background: '#111827', borderRadius: 12, border: '1px solid #1e2d4530', padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ width: '40%', height: 10, background: '#1e2d45', borderRadius: 3 }} />
                    <div style={{ width: '80%', height: 12, background: '#1a2235', borderRadius: 4 }} />
                    <div style={{ width: '60%', height: 8, background: '#1e2d45', borderRadius: 3 }} />
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* ─── LIST VIEW ───────────────────────────────────────────── */
          <div className="list-section">
            <div className="section-bar">
              <div className="section-bar-title">
                <BarChart3 size={18} style={{ color: 'var(--blue)' }} />
                <span>Campaign History</span>
              </div>

              <div className="filter-tabs">
                <button
                  className={`filter-tab ${tab === 'active' ? 'selected' : ''}`}
                  onClick={() => setTab('active')}
                >
                  Active Banners {activeAds.length > 0 && `(${activeAds.length})`}
                </button>
                <button
                  className={`filter-tab ${tab === 'ended' ? 'selected' : ''}`}
                  onClick={() => setTab('ended')}
                >
                  Past Campaigns {endedAds.length > 0 && `(${endedAds.length})`}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="campaigns-stack">
                {[1, 2].map(i => (
                  <div key={i} className="campaign-item" style={{ height: 120 }}>
                    <div className="skel-card" style={{ width: 200, borderRadius: 0 }} />
                    <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div className="skel-card" style={{ height: 16, width: '40%' }} />
                      <div className="skel-card" style={{ height: 12, width: '70%' }} />
                      <div className="skel-card" style={{ height: 10, width: '30%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayAds.length === 0 ? (
              <div className="empty-history-card">
                <div className="empty-history-icon">
                  <Megaphone size={20} />
                </div>
                <h3>No campaigns found</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {tab === 'active' ? 'You don\'t have any active banners running. Launch a new one above!' : 'No ended campaigns in your record database.'}
                </p>
              </div>
            ) : (
              <div className="campaigns-stack">
                {displayAds.map(ad => {
                  const remaining = daysLeft(ad.expiresAt);
                  const isOwn = ad.scope === 'own';
                  const gradientBg = isOwn
                    ? 'linear-gradient(135deg, #0a1f15, #0d2d1e)'
                    : 'linear-gradient(135deg, #1f1400, #332200)';
                  const ctr = ad.views > 0 ? ((ad.clicks / ad.views) * 100).toFixed(1) : '0.0';

                  return (
                    <div
                      key={ad.id}
                      className="campaign-item"
                      onClick={() => setActivePreview({
                        title: ad.title,
                        description: ad.description,
                        bannerUrl: ad.bannerUrl,
                        scope: ad.scope,
                        duration: ad.duration,
                        format: ad.format as any,
                        status: ad.status,
                        views: ad.views,
                        clicks: ad.clicks,
                        startsAt: ad.startsAt,
                        expiresAt: ad.expiresAt,
                        isDraft: false
                      })}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="campaign-banner-thumbnail" style={{ background: gradientBg }}>
                        {ad.bannerUrl ? (
                          <img src={ad.bannerUrl.startsWith('http') ? ad.bannerUrl : `${API_URL}${ad.bannerUrl}`} alt={ad.title} />
                        ) : (
                          <span style={{ fontSize: 28 }}>{isOwn ? '🏫' : '🌐'}</span>
                        )}
                      </div>

                      <div className="campaign-body">
                        <div className="campaign-details">
                          <div className="campaign-meta-row">
                            {/* Scope status */}
                            <span className={`scope-badge ${ad.scope}`}>
                              {isOwn ? <Building2 size={10} /> : <Globe size={10} />}
                              {isOwn ? 'Campus reach' : 'Global Network'}
                            </span>

                            {/* Status label */}
                            {ad.status === 'active' && (
                              <span className="status-pill live">
                                <span className="live-dot" /> LIVE
                              </span>
                            )}
                            {ad.status === 'expired' && (
                              <span className="status-pill expired">EXPIRED</span>
                            )}
                            {ad.status === 'deactivated' && (
                              <span className="status-pill ended">DEACTIVATED</span>
                            )}
                          </div>

                          <h3 className="campaign-title">{ad.title}</h3>
                          <p className="campaign-desc">{ad.description}</p>

                          <div className="campaign-metrics-row">
                            <span className="metric-item">
                              <Eye size={12} /> Views: <strong>{ad.views.toLocaleString()}</strong>
                            </span>
                            <span className="metric-item">
                              <MousePointer size={12} /> Clicks: <strong>{ad.clicks.toLocaleString()}</strong>
                            </span>
                            <span className="metric-item">
                              <Percent size={12} /> CTR: <strong>{ctr}%</strong>
                            </span>
                            <span className="metric-item">
                              <Clock size={12} /> Duration: <strong>{ad.duration}d</strong>
                            </span>
                            <span className="metric-item" style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>
                              <Calendar size={11} />
                              {ad.status === 'active'
                                ? ` Expires ${fmtDate(ad.expiresAt)}`
                                : ` Ran ${fmtDate(ad.startsAt)} - ${fmtDate(ad.expiresAt)}`}
                            </span>
                          </div>
                        </div>

                        {ad.status === 'active' && (
                          <div className="campaign-actions">
                            <button
                              className="deactivate-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEndModal(ad.id);
                              }}
                            >
                              End Campaign
                            </button>
                            <span className="date-limit-text">
                              {remaining} day{remaining !== 1 ? 's' : ''} left
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* END DEACTIVATION MODAL */}
      {endModal && (
        <div className="modal-overlay" onClick={() => !ending && setEndModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-title">End Advertisement Campaign?</div>
            <p className="modal-desc">
              This banner will be removed from student marketplace dashboards immediately.
              The remaining campaign days cannot be refunded or resumed.
            </p>
            <div className="modal-actions">
              <button
                className="modal-btn cancel"
                onClick={() => setEndModal(null)}
                disabled={ending}
              >
                Go Back
              </button>
              <button
                className="modal-btn confirm"
                onClick={handleEndAd}
                disabled={ending}
              >
                {ending ? (
                  <>
                    <span className="spinning-loader" style={{ marginRight: 6 }} />
                    <span>Ending Campaign...</span>
                  </>
                ) : (
                  <span>Deactivate Banner</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE DETAIL PREVIEW MODAL */}
      {activePreview && (() => {
        const previewIsOwn = activePreview.scope === 'own';
        const previewAccentColor = previewIsOwn ? 'var(--emerald)' : 'var(--amber)';
        const previewGlowColor = previewIsOwn ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)';
        const previewGradient = previewIsOwn
          ? 'linear-gradient(135deg, #061e14, #0b2f1e, #05160e)'
          : 'linear-gradient(135deg, #1f1400, #332200, #170f00)';

        // Format direct asset image path or backend relative image path
        let finalBannerSrc = activePreview.bannerUrl;
        if (finalBannerSrc && !finalBannerSrc.startsWith('data:') && !finalBannerSrc.startsWith('blob:') && !finalBannerSrc.startsWith('http')) {
          finalBannerSrc = `${API_URL}${finalBannerSrc}`;
        }

        const previewCtr = (activePreview.views || 0) > 0 
          ? (((activePreview.clicks || 0) / (activePreview.views || 0)) * 100).toFixed(1)
          : '0.0';

        // Set dynamic aspect ratio inside modal
        let modalAspectRatio = '3/1';
        let modalMinHeight = '140px';
        if (activePreview.format === 'square') {
          modalAspectRatio = '1/1';
          modalMinHeight = '280px';
        } else if (activePreview.format === 'strip') {
          modalAspectRatio = '6/1';
          modalMinHeight = '70px';
        } else if (activePreview.format === 'portrait') {
          modalAspectRatio = '2/3';
          modalMinHeight = '350px';
        } else if (activePreview.format === 'card') {
          modalAspectRatio = '1.5/1';
          modalMinHeight = '220px';
        }

        return (
          <div className="preview-modal-overlay" onClick={() => setActivePreview(null)}>
            <div className="preview-modal-card" onClick={e => e.stopPropagation()}>
              
              {/* Close Button */}
              <button
                onClick={() => setActivePreview(null)}
                style={{
                  position: "absolute", top: "16px", right: "16px", zIndex: 10,
                  width: "32px", height: "32px", borderRadius: "50%",
                  background: "rgba(10, 14, 26, 0.75)", border: "1px solid #1e2d45",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "#9CA3AF", transition: "all 0.2s"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = "#F0F4FF";
                  e.currentTarget.style.borderColor = previewAccentColor;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = "#9CA3AF";
                  e.currentTarget.style.borderColor = "#1e2d45";
                }}
              >
                <X size={16} />
              </button>

              {/* Hero Banner or Gradient */}
              <div 
                className="preview-modal-hero"
                style={{
                  aspectRatio: modalAspectRatio,
                  height: 'auto',
                  minHeight: modalMinHeight,
                  width: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  flexShrink: 0
                }}
              >
                {finalBannerSrc ? (
                  <img src={finalBannerSrc} className="preview-modal-img" alt="Ad preview hero" />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: previewGradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "72px" }}>{previewIsOwn ? '🏫' : '🌐'}</span>
                  </div>
                )}
                <div className="preview-modal-gradient" />
                
                {/* Badge Overlay */}
                <span 
                  className="preview-modal-badge"
                  style={{
                    background: `color-mix(in srgb, ${previewAccentColor} 15%, transparent)`,
                    color: previewAccentColor,
                    borderColor: `color-mix(in srgb, ${previewAccentColor} 30%, transparent)`,
                    borderStyle: 'solid',
                    borderWidth: '1px'
                  }}
                >
                  {previewIsOwn ? <Building2 size={9} /> : <Globe size={9} />}
                  {previewIsOwn ? 'CAMPUS ONLY' : 'ALL CAMPUSES'}
                </span>
              </div>

              {/* Modal Info Details */}
              <div className="preview-modal-body">
                <div>
                  <h2 className="preview-modal-title">
                    {activePreview.title.trim()}
                  </h2>
                  <p 
                    className="preview-modal-subtitle"
                    style={{ color: previewAccentColor }}
                  >
                    {previewIsOwn ? `${collegeName} Ad Campaign` : 'Global Sponsored Ad Network'}
                  </p>
                </div>

                <div className="preview-modal-divider" />

                <div>
                  <h4 className="preview-modal-section-title">About This Advertisement</h4>
                  <p className="preview-modal-desc">
                    {activePreview.description.trim()}
                  </p>
                </div>

                <div className="preview-modal-divider" />

                {/* Grid Chips */}
                <div className="preview-modal-grid">
                  <div className="preview-modal-chip">
                    <div className="preview-modal-chip-title">📍 Delivery Reach</div>
                    <div className="preview-modal-chip-val">{previewIsOwn ? 'Single College' : 'Multi-Campus'}</div>
                  </div>
                  <div className="preview-modal-chip">
                    <div className="preview-modal-chip-title">🏫 Status</div>
                    <div className="preview-modal-chip-val" style={{ textTransform: 'capitalize' }}>
                      {activePreview.isDraft ? 'Draft Preview' : activePreview.status || 'Active'}
                    </div>
                  </div>
                  <div className="preview-modal-chip">
                    <div className="preview-modal-chip-title">📅 Campaign Duration</div>
                    <div className="preview-modal-chip-val">{activePreview.duration} days</div>
                  </div>
                  <div className="preview-modal-chip">
                    <div className="preview-modal-chip-title">💰 Campaign Cost</div>
                    <div className="preview-modal-chip-val" style={{ color: previewAccentColor }}>
                      {previewIsOwn ? 'Free' : '₹500'}
                    </div>
                  </div>
                </div>

                {/* Performance Metrics for existing campaigns */}
                {!activePreview.isDraft && (
                  <>
                    <div className="preview-modal-divider" />
                    <div>
                      <h4 className="preview-modal-section-title">Performance Metrics</h4>
                      <div className="preview-modal-grid" style={{ marginTop: 8 }}>
                        <div className="preview-modal-chip" style={{ background: '#131c30' }}>
                          <div className="preview-modal-chip-title">Views</div>
                          <div className="preview-modal-chip-val" style={{ fontSize: '15px' }}>
                            {(activePreview.views || 0).toLocaleString()}
                          </div>
                        </div>
                        <div className="preview-modal-chip" style={{ background: '#131c30' }}>
                          <div className="preview-modal-chip-title">Clicks</div>
                          <div className="preview-modal-chip-val" style={{ fontSize: '15px' }}>
                            {(activePreview.clicks || 0).toLocaleString()}
                          </div>
                        </div>
                        <div className="preview-modal-chip" style={{ background: '#131c30' }}>
                          <div className="preview-modal-chip-title">CTR (Click-Through Rate)</div>
                          <div className="preview-modal-chip-val" style={{ color: 'var(--blue)', fontSize: '15px' }}>
                            {previewCtr}%
                          </div>
                        </div>
                        <div className="preview-modal-chip" style={{ background: '#131c30' }}>
                          <div className="preview-modal-chip-title">Timeframe</div>
                          <div className="preview-modal-chip-val" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
                            {activePreview.startsAt && activePreview.expiresAt
                              ? `${fmtDate(activePreview.startsAt)} - ${fmtDate(activePreview.expiresAt)}`
                              : 'N/A'
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* CTA Action Row */}
                <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setActivePreview(null)}
                    style={{
                      flex: 1, height: "44px", borderRadius: "9999px",
                      border: "1.5px solid #1e2d45", background: "transparent",
                      color: "#9CA3AF", fontSize: "13px", fontWeight: 700,
                      cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s"
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = "#F0F4FF";
                      e.currentTarget.style.borderColor = "#9CA3AF";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = "#9CA3AF";
                      e.currentTarget.style.borderColor = "#1e2d45";
                    }}
                  >
                    Close Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePreview(null)}
                    style={{
                      flex: 2, height: "44px", borderRadius: "9999px", border: "none",
                      background: `linear-gradient(90deg, ${previewAccentColor}, color-mix(in srgb, ${previewAccentColor} 80%, transparent))`,
                      color: "#0A0E1A", fontSize: "13px", fontWeight: 700,
                      cursor: "pointer", fontFamily: "inherit", display: "flex",
                      alignItems: "center", justifyContent: "center", gap: "6px",
                      boxShadow: `0 4px 20px ${previewGlowColor}`
                    }}
                  >
                    <span>{activePreview.isDraft ? 'Mock Action Complete' : 'Close Details'}</span> 
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}
    </>
  );
}
