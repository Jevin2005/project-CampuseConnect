'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';

interface PhysicalTier {
  min: number;
  max: number;
  type: 'percent' | 'fixed';
  value: number;
  percent?: number;
}

interface PricingSettings {
  id?: string;
  digitalListingFee: number;
  digitalBuyerFeePercent: number;
  digitalSellerCutPercent: number;
  digitalPayoutDays: number;
  physicalTiers: PhysicalTier[];
  updatedAt?: string;
  updatedBy?: string;
}

const DEFAULTS: PricingSettings = {
  digitalListingFee: 20,
  digitalBuyerFeePercent: 15,
  digitalSellerCutPercent: 15,
  digitalPayoutDays: 7,
  physicalTiers: [
    { min: 0,    max: 500,  type: 'percent', value: 5 },
    { min: 501,  max: 1000, type: 'percent', value: 4 },
    { min: 1001, max: 2000, type: 'percent', value: 3 },
  ],
};

function getPhysicalFee(price: number, tiers: PhysicalTier[]): number {
  for (const t of tiers) {
    if (price >= t.min && price <= t.max) {
      const type = t.type || 'percent';
      const val = typeof t.value === 'number' ? t.value : (t.percent || 0);
      return type === 'fixed' ? val : parseFloat(((val / 100) * price).toFixed(2));
    }
  }
  if (tiers.length > 0) {
    const last = tiers[tiers.length - 1];
    const type = last.type || 'percent';
    const val = typeof last.value === 'number' ? last.value : (last.percent || 0);
    return type === 'fixed' ? val : parseFloat(((val / 100) * price).toFixed(2));
  }
  return 0;
}

const S = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --bg: #070B14;
  --surface: #0D1321;
  --card: #111827;
  --card2: #141f35;
  --bd: #1E2D45;
  --bd2: #243352;
  --gold: #F7C948;
  --gold-dim: rgba(247,201,72,.15);
  --gold-glow: rgba(247,201,72,.08);
  --emerald: #10B981;
  --emerald-dim: rgba(16,185,129,.12);
  --red: #EF4444;
  --red-dim: rgba(239,68,68,.1);
  --blue: #3B82F6;
  --blue-dim: rgba(59,130,246,.1);
  --t1: #F0F4FF;
  --t2: #94A3B8;
  --t3: #4B5563;
  --font: 'DM Sans', sans-serif;
  --font-head: 'Sora', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

* { box-sizing: border-box; }

.ps-wrap { padding: 32px; min-height: 100vh; background: var(--bg); font-family: var(--font); }

/* Header */
.ps-header { margin-bottom: 28px; }
.ps-breadcrumb { font-size: 12px; color: var(--t3); margin-bottom: 8px; letter-spacing: .5px; }
.ps-breadcrumb span { color: var(--gold); }
.ps-title { font-family: var(--font-head); font-size: 28px; font-weight: 800; color: var(--t1); margin: 0 0 6px; }
.ps-sub { font-size: 13px; color: var(--t2); display: flex; align-items: center; gap: 8px; }
.ps-badge { background: var(--emerald-dim); color: var(--emerald); border: 1px solid rgba(16,185,129,.3); border-radius: 99px; padding: 2px 10px; font-size: 11px; font-weight: 600; }

/* Alert */
.ps-alert { background: rgba(245,158,11,.06); border: 1px solid rgba(245,158,11,.25); border-left: 3px solid #F59E0B; border-radius: 10px; padding: 14px 18px; font-size: 13px; color: #FBB93F; margin-bottom: 24px; display: flex; align-items: flex-start; gap: 10px; line-height: 1.5; }

/* Tabs */
.ps-tabs { display: flex; gap: 4px; background: var(--surface); border: 1px solid var(--bd); border-radius: 12px; padding: 5px; width: fit-content; margin-bottom: 24px; }
.ps-tab { padding: 9px 22px; border-radius: 8px; border: none; background: none; font-family: var(--font); font-size: 13px; font-weight: 600; color: var(--t2); cursor: pointer; transition: all .2s; display: flex; align-items: center; gap: 7px; }
.ps-tab.active { background: var(--card); color: var(--t1); box-shadow: 0 2px 8px rgba(0,0,0,.3); }
.ps-tab:hover:not(.active) { color: var(--t1); }

/* Layout */
.ps-layout { display: grid; grid-template-columns: 1fr 340px; gap: 20px; align-items: start; }

/* Cards */
.ps-card { background: var(--card); border: 1px solid var(--bd); border-radius: 14px; overflow: hidden; margin-bottom: 16px; }
.ps-card-head { padding: 18px 22px; border-bottom: 1px solid var(--bd); display: flex; align-items: center; gap: 10px; }
.ps-card-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 15px; }
.ps-card-icon.gold { background: var(--gold-dim); }
.ps-card-icon.emerald { background: var(--emerald-dim); }
.ps-card-icon.blue { background: var(--blue-dim); }
.ps-card-ttl { font-family: var(--font-head); font-size: 14px; font-weight: 700; color: var(--t1); }
.ps-card-desc { font-size: 12px; color: var(--t3); margin-top: 2px; }
.ps-card-body { padding: 22px; }

/* Field rows */
.field-row { margin-bottom: 22px; }
.field-row:last-child { margin-bottom: 0; }
.field-label { font-size: 12px; font-weight: 600; color: var(--t2); text-transform: uppercase; letter-spacing: .7px; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
.field-hint { font-size: 11px; color: var(--t3); font-weight: 400; text-transform: none; letter-spacing: 0; }

/* Number Stepper */
.stepper { display: flex; align-items: center; gap: 0; border: 1px solid var(--bd2); border-radius: 10px; overflow: hidden; width: fit-content; }
.stepper-btn { width: 40px; height: 44px; border: none; background: var(--card2); color: var(--t2); font-size: 18px; cursor: pointer; transition: all .15s; display: flex; align-items: center; justify-content: center; }
.stepper-btn:hover { background: var(--gold-dim); color: var(--gold); }
.stepper-val { min-width: 80px; height: 44px; background: var(--surface); color: var(--t1); font-family: var(--font-head); font-size: 18px; font-weight: 700; text-align: center; border: none; border-left: 1px solid var(--bd); border-right: 1px solid var(--bd); outline: none; }
.stepper-unit { font-family: var(--font); font-size: 13px; color: var(--t3); padding: 0 14px 0 8px; background: var(--surface); height: 44px; display: flex; align-items: center; border-left: 1px solid var(--bd); font-weight: 500; }

/* Slider */
.slider-wrap { display: flex; align-items: center; gap: 14px; }
.slider-track { flex: 1; height: 6px; border-radius: 3px; background: var(--bd2); cursor: pointer; -webkit-appearance: none; appearance: none; outline: none; }
.slider-track::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: var(--gold); border: 2px solid #070B14; box-shadow: 0 0 8px rgba(247,201,72,.4); cursor: pointer; }
.slider-track::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: var(--gold); border: 2px solid #070B14; cursor: pointer; }
.slider-val { font-family: var(--font-head); font-size: 20px; font-weight: 800; color: var(--gold); min-width: 58px; text-align: right; }
.slider-val span { font-size: 13px; color: var(--t3); font-family: var(--font); }

/* Tiers table */
.tiers-table { width: 100%; border-collapse: collapse; }
.tiers-table th { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--t3); padding: 8px 12px; text-align: left; border-bottom: 1px solid var(--bd); }
.tiers-table td { padding: 8px 8px; border-bottom: 1px solid rgba(30,45,69,.5); vertical-align: middle; }
.tiers-table tr:last-child td { border-bottom: none; }
.tier-input { background: var(--surface); border: 1px solid var(--bd2); border-radius: 7px; color: var(--t1); font-family: var(--font-mono); font-size: 13px; padding: 7px 10px; width: 90px; outline: none; transition: border-color .2s; }
.tier-input:focus { border-color: var(--gold); }
.tier-pct { background: var(--surface); border: 1px solid var(--bd2); border-radius: 7px; color: var(--gold); font-family: var(--font-mono); font-size: 13px; padding: 7px 10px; width: 70px; outline: none; transition: border-color .2s; }
.tier-pct:focus { border-color: var(--gold); }
.tier-del { width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--bd2); background: none; color: var(--t3); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .15s; }
.tier-del:hover { background: var(--red-dim); color: var(--red); border-color: rgba(239,68,68,.3); }
.add-tier-btn { display: flex; align-items: center; gap: 6px; padding: 10px 16px; background: none; border: 1px dashed var(--bd2); border-radius: 8px; color: var(--t2); font-size: 13px; font-weight: 600; cursor: pointer; width: 100%; margin-top: 12px; transition: all .2s; font-family: var(--font); }
.add-tier-btn:hover { border-color: var(--gold); color: var(--gold); background: var(--gold-glow); }

/* Calculator card */
.calc-card { background: linear-gradient(135deg, #0D1321, #111827); border: 1px solid var(--bd); border-radius: 14px; overflow: hidden; position: sticky; top: 20px; }
.calc-head { padding: 16px 20px; border-bottom: 1px solid var(--bd); display: flex; align-items: center; gap: 8px; }
.calc-ttl { font-family: var(--font-head); font-size: 14px; font-weight: 700; color: var(--t1); }
.calc-body { padding: 20px; }
.calc-label { font-size: 11px; font-weight: 700; color: var(--t3); text-transform: uppercase; letter-spacing: .7px; margin-bottom: 10px; }
.calc-price-input { display: flex; align-items: center; gap: 0; background: var(--surface); border: 1px solid var(--bd2); border-radius: 9px; overflow: hidden; margin-bottom: 18px; }
.calc-prefix { padding: 10px 14px; color: var(--t3); font-size: 16px; font-weight: 600; border-right: 1px solid var(--bd); font-family: var(--font-mono); }
.calc-input { flex: 1; background: none; border: none; color: var(--t1); font-family: var(--font-head); font-size: 18px; font-weight: 700; padding: 10px 14px; outline: none; }
.calc-divider { height: 1px; background: var(--bd); margin: 16px 0; }
.calc-row { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; }
.calc-row-label { font-size: 12px; color: var(--t2); display: flex; align-items: center; gap: 6px; }
.calc-row-val { font-family: var(--font-mono); font-size: 13px; font-weight: 600; color: var(--t1); }
.calc-row-val.gold { color: var(--gold); }
.calc-row-val.emerald { color: var(--emerald); }
.calc-row-val.red { color: var(--red); }
.calc-total { background: var(--gold-glow); border: 1px solid rgba(247,201,72,.15); border-radius: 10px; padding: 14px 16px; margin-top: 12px; }
.calc-total-label { font-size: 11px; font-weight: 700; color: var(--t3); text-transform: uppercase; letter-spacing: .7px; margin-bottom: 4px; }
.calc-total-val { font-family: var(--font-head); font-size: 22px; font-weight: 800; color: var(--gold); }
.calc-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; padding: 2px 8px; border-radius: 99px; font-weight: 600; }
.calc-badge.info { background: var(--blue-dim); color: var(--blue); }
.calc-badge.warn { background: rgba(245,158,11,.15); color: #F59E0B; }
.billing-note { font-size: 11px; color: var(--t3); text-align: center; margin-top: 10px; padding: 8px; background: var(--surface); border-radius: 7px; line-height: 1.5; }

/* Save section */
.save-section { background: var(--card); border: 1px solid rgba(247,201,72,.2); border-radius: 14px; padding: 20px 22px; margin-top: 4px; }
.save-title { font-family: var(--font-head); font-size: 14px; font-weight: 700; color: var(--t1); margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
.changes-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 18px; }
.change-item { display: flex; justify-content: space-between; align-items: center; padding: 9px 14px; background: var(--card2); border-radius: 8px; font-size: 12px; }
.change-item-label { color: var(--t2); }
.change-item-vals { display: flex; align-items: center; gap: 8px; font-family: var(--font-mono); }
.old-val { color: var(--red); text-decoration: line-through; opacity: .7; font-size: 11px; }
.new-val { color: var(--gold); font-weight: 600; }
.save-actions { display: flex; gap: 10px; justify-content: flex-end; }
.btn-cancel { padding: 10px 22px; border-radius: 99px; border: 1px solid var(--bd); background: none; color: var(--t2); font-size: 13px; font-weight: 600; cursor: pointer; font-family: var(--font); transition: all .2s; }
.btn-cancel:hover { border-color: var(--t2); color: var(--t1); }
.btn-save { padding: 10px 28px; border-radius: 99px; border: none; background: var(--gold); color: #070B14; font-size: 13px; font-weight: 800; cursor: pointer; font-family: var(--font-head); transition: all .2s; display: flex; align-items: center; gap: 7px; }
.btn-save:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(247,201,72,.3); }
.btn-save:disabled { opacity: .5; cursor: not-allowed; }

/* Toast */
.toast { position: fixed; bottom: 28px; right: 28px; padding: 14px 20px; border-radius: 12px; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 10px; z-index: 9999; animation: slideIn .3s ease; box-shadow: 0 8px 30px rgba(0,0,0,.4); }
.toast.success { background: #052E20; border: 1px solid rgba(16,185,129,.3); color: var(--emerald); }
.toast.error { background: #200505; border: 1px solid rgba(239,68,68,.3); color: var(--red); }
@keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

/* Loading shimmer */
.shimmer { background: linear-gradient(90deg, var(--card2) 25%, var(--bd) 50%, var(--card2) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 8px; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* No changes placeholder */
.no-changes { text-align: center; color: var(--t3); font-size: 12px; padding: 10px 0; }

@media (max-width: 1024px) {
  .ps-layout { grid-template-columns: 1fr; }
  .calc-card { position: static; margin-top: 16px; }
}

@media (max-width: 768px) {
  .ps-wrap { padding: 20px 16px; }
  .ps-title { font-size: 22px; }
  .ps-tabs { overflow-x: auto; white-space: nowrap; width: 100%; }
  .ps-tabs::-webkit-scrollbar { display: none; }
  .ps-tab { padding: 8px 16px; font-size: 12px; }
  
  .ps-card-body { padding: 16px; }
  .stepper { width: 100%; }
  .stepper-val { flex: 1; min-width: 60px; }
  .slider-wrap { gap: 10px; }
  .slider-val { font-size: 16px; min-width: 44px; }
  .save-section { padding: 16px; }
  
  .tiers-table, .tiers-table thead, .tiers-table tbody, .tiers-table th, .tiers-table td, .tiers-table tr {
    display: block;
  }
  .tiers-table thead { display: none; }
  .tiers-table tr {
    background: var(--card2) !important;
    border: 1px solid var(--bd);
    border-radius: 12px;
    margin-bottom: 12px;
    padding: 14px;
    position: relative;
  }
  .tiers-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px dashed rgba(99,130,190,.1);
    padding: 8px 0;
    font-size: 13px;
  }
  .tiers-table td:first-child {
    font-weight: 700;
    color: var(--gold) !important;
    border-bottom: 1px solid var(--bd);
    padding-bottom: 6px;
    margin-bottom: 6px;
  }
  .tiers-table td:first-child::before {
    content: "Tier #";
    font-size: 11px;
    color: var(--t3);
  }
  .tiers-table td:last-child {
    border-bottom: none;
    justify-content: flex-end;
    padding-top: 10px;
  }
  .tiers-table td::before {
    content: attr(data-label);
    font-weight: 700;
    color: var(--t3);
    text-transform: uppercase;
    font-size: 10px;
    letter-spacing: 0.5px;
    float: left;
  }
  .tier-input, .tier-pct {
    text-align: right;
  }
}

`;

export default function PlatformSettingsPage() {
  const [tab, setTab] = useState<'digital' | 'physical'>('digital');
  const [settings, setSettings] = useState<PricingSettings>(DEFAULTS);
  const [saved, setSaved] = useState<PricingSettings>(DEFAULTS);
  const [calcPrice, setCalcPrice] = useState<number>(500);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadSettings = useCallback(async () => {
    try {
      const res = await api.get('/api/master/pricing');
      const data = res.data;
      const s: PricingSettings = {
        id: data.id,
        digitalListingFee: data.digitalListingFee ?? 20,
        digitalBuyerFeePercent: data.digitalBuyerFeePercent ?? 15,
        digitalSellerCutPercent: data.digitalSellerCutPercent ?? 15,
        digitalPayoutDays: data.digitalPayoutDays ?? 7,
        physicalTiers: (data.physicalTiers as PhysicalTier[]) ?? DEFAULTS.physicalTiers,
        updatedAt: data.updatedAt,
        updatedBy: data.updatedBy,
      };
      setSettings(s);
      setSaved(s);
    } catch { /* use defaults */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/api/master/pricing', settings);
      const data = res.data;
      const updated = { ...settings, updatedAt: data.settings?.updatedAt };
      setSaved(updated);
      setSettings(updated);
      showToast('✅ Platform pricing saved successfully');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to save';
      showToast(msg, 'error');
    }
    setSaving(false);
  };

  const handleCancel = () => setSettings(saved);

  /* ---------- Tier helpers ---------- */
  const updateTier = (i: number, field: keyof PhysicalTier, val: any) => {
    setSettings(s => {
      const tiers = [...s.physicalTiers];
      tiers[i] = { ...tiers[i], [field]: val } as PhysicalTier;
      return { ...s, physicalTiers: tiers };
    });
  };
  const addTier = () => {
    setSettings(s => {
      const last = s.physicalTiers[s.physicalTiers.length - 1];
      const newMin = last ? last.max + 1 : 0;
      return { ...s, physicalTiers: [...s.physicalTiers, { min: newMin, max: newMin + 999, type: 'percent', value: 2 }] };
    });
  };
  const removeTier = (i: number) => {
    setSettings(s => ({ ...s, physicalTiers: s.physicalTiers.filter((_, idx) => idx !== i) }));
  };

  /* ---------- Computed diff for changes panel ---------- */
  const diffItems: { label: string; old: string; new: string }[] = [];
  if (settings.digitalListingFee !== saved.digitalListingFee)
    diffItems.push({ label: 'Digital Listing Fee', old: `₹${saved.digitalListingFee}`, new: `₹${settings.digitalListingFee}` });
  if (settings.digitalBuyerFeePercent !== saved.digitalBuyerFeePercent)
    diffItems.push({ label: 'Buyer Platform Fee', old: `${saved.digitalBuyerFeePercent}%`, new: `${settings.digitalBuyerFeePercent}%` });
  if (settings.digitalSellerCutPercent !== saved.digitalSellerCutPercent)
    diffItems.push({ label: 'Seller Revenue Cut', old: `${saved.digitalSellerCutPercent}%`, new: `${settings.digitalSellerCutPercent}%` });
  if (settings.digitalPayoutDays !== saved.digitalPayoutDays)
    diffItems.push({ label: 'Payout Hold (days)', old: `${saved.digitalPayoutDays}d`, new: `${settings.digitalPayoutDays}d` });
  if (JSON.stringify(settings.physicalTiers) !== JSON.stringify(saved.physicalTiers))
    diffItems.push({ label: 'Physical Fee Tiers', old: `${saved.physicalTiers.length} tiers`, new: `${settings.physicalTiers.length} tiers` });

  /* ---------- Calculator ---------- */
  const buyerFee     = parseFloat(((settings.digitalBuyerFeePercent / 100) * calcPrice).toFixed(2));
  const sellerCut    = parseFloat(((settings.digitalSellerCutPercent / 100) * calcPrice).toFixed(2));
  const netSeller    = parseFloat((calcPrice - sellerCut).toFixed(2));
  const buyerTotal   = parseFloat((calcPrice + buyerFee).toFixed(2));
  const physListFee  = getPhysicalFee(calcPrice, settings.physicalTiers);

  return (
    <>
      <style>{S}</style>
      <div className="ps-wrap">
        {/* Header */}
        <div className="ps-header">
          <div className="ps-breadcrumb">Master Admin · <span>Platform Settings</span></div>
          <h1 className="ps-title">💰 Platform Pricing</h1>
          <div className="ps-sub">
            Configure global fee structures for all marketplace transactions
            <span className="ps-badge">Live System</span>
          </div>
        </div>

        {/* Alert */}
        <div className="ps-alert">
          ⚠️ <span>Changes apply <strong>immediately</strong> to all new transactions across <strong>all colleges</strong>. Existing orders are not affected. Buyer platform fees are shown only in the <strong>billing / invoice</strong> section — not on product pages.</span>
        </div>

        {/* Tabs */}
        <div className="ps-tabs">
          <button className={`ps-tab${tab === 'digital' ? ' active' : ''}`} onClick={() => setTab('digital')}>
            🖥 Digital Products
          </button>
          <button className={`ps-tab${tab === 'physical' ? ' active' : ''}`} onClick={() => setTab('physical')}>
            📦 Physical Products
          </button>
        </div>

        {/* Main layout */}
        <div className="ps-layout">
          {/* Left column */}
          <div>
            {loading ? (
              <div className="ps-card"><div className="ps-card-body"><div className="shimmer" style={{height:200}} /></div></div>
            ) : tab === 'digital' ? (
              <>
                {/* Digital: Listing fee */}
                <div className="ps-card">
                  <div className="ps-card-head">
                    <div className="ps-card-icon gold">📋</div>
                    <div>
                      <div className="ps-card-ttl">Listing Fee</div>
                      <div className="ps-card-desc">One-time fee seller pays to publish a digital product</div>
                    </div>
                  </div>
                  <div className="ps-card-body">
                    <div className="field-row">
                      <div className="field-label">Flat Listing Fee <span className="field-hint">— Charged when seller submits a digital product</span></div>
                      <div className="stepper">
                        <button className="stepper-btn" onClick={() => setSettings(s => ({ ...s, digitalListingFee: Math.max(0, s.digitalListingFee - 1) }))}>−</button>
                        <input className="stepper-val" type="number" min={0} value={settings.digitalListingFee}
                          onChange={e => setSettings(s => ({ ...s, digitalListingFee: parseFloat(e.target.value) || 0 }))} />
                        <button className="stepper-btn" onClick={() => setSettings(s => ({ ...s, digitalListingFee: s.digitalListingFee + 1 }))}>+</button>
                        <div className="stepper-unit">₹ / listing</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Digital: Platform fees */}
                <div className="ps-card">
                  <div className="ps-card-head">
                    <div className="ps-card-icon gold">🏷</div>
                    <div>
                      <div className="ps-card-ttl">Platform Transaction Fees</div>
                      <div className="ps-card-desc">Applied on every completed digital product sale</div>
                    </div>
                  </div>
                  <div className="ps-card-body">
                    <div className="field-row">
                      <div className="field-label">
                        Buyer Platform Fee
                        <span className="calc-badge info">Billing only</span>
                        <span className="field-hint">— Hidden from product pages; shown only at checkout/invoice</span>
                      </div>
                      <div className="slider-wrap">
                        <input type="range" className="slider-track" min={0} max={30} step={0.5}
                          value={settings.digitalBuyerFeePercent}
                          onChange={e => setSettings(s => ({ ...s, digitalBuyerFeePercent: parseFloat(e.target.value) }))} />
                        <div className="slider-val">{settings.digitalBuyerFeePercent}<span>%</span></div>
                      </div>
                    </div>
                    <div className="field-row">
                      <div className="field-label">Seller Revenue Cut <span className="field-hint">— Deducted from seller's earning per sale</span></div>
                      <div className="slider-wrap">
                        <input type="range" className="slider-track" min={0} max={40} step={0.5}
                          value={settings.digitalSellerCutPercent}
                          onChange={e => setSettings(s => ({ ...s, digitalSellerCutPercent: parseFloat(e.target.value) }))} />
                        <div className="slider-val">{settings.digitalSellerCutPercent}<span>%</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Digital: Payout */}
                <div className="ps-card">
                  <div className="ps-card-head">
                    <div className="ps-card-icon blue">⏱</div>
                    <div>
                      <div className="ps-card-ttl">Seller Payout Hold Period</div>
                      <div className="ps-card-desc">Days to hold seller revenue after a deal completes</div>
                    </div>
                  </div>
                  <div className="ps-card-body">
                    <div className="field-row">
                      <div className="field-label">Hold Duration <span className="field-hint">— Revenue released to seller after this many days</span></div>
                      <div className="stepper">
                        <button className="stepper-btn" onClick={() => setSettings(s => ({ ...s, digitalPayoutDays: Math.max(0, s.digitalPayoutDays - 1) }))}>−</button>
                        <input className="stepper-val" type="number" min={0} max={90} value={settings.digitalPayoutDays}
                          onChange={e => setSettings(s => ({ ...s, digitalPayoutDays: parseInt(e.target.value) || 0 }))} />
                        <button className="stepper-btn" onClick={() => setSettings(s => ({ ...s, digitalPayoutDays: Math.min(90, s.digitalPayoutDays + 1) }))}>+</button>
                        <div className="stepper-unit">days after deal</div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Physical: Tier builder */}
                <div className="ps-card">
                  <div className="ps-card-head">
                    <div className="ps-card-icon emerald">📊</div>
                    <div>
                      <div className="ps-card-ttl">Price Range Fee Tiers</div>
                      <div className="ps-card-desc">Define listing fee % based on product price range. Sellers pay this upfront when listing.</div>
                    </div>
                  </div>
                  <div className="ps-card-body" style={{padding: '16px 22px'}}>
                    <table className="tiers-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Min Price (₹)</th>
                          <th>Max Price (₹)</th>
                          <th>Fee Type</th>
                          <th>Value</th>
                          <th>Fee on ₹{calcPrice.toLocaleString('en-IN')}</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {settings.physicalTiers.map((tier, i) => {
                          const type = tier.type || 'percent';
                          const val = typeof tier.value === 'number' ? tier.value : (tier.percent || 0);

                          const inRange = calcPrice >= tier.min && calcPrice <= tier.max;
                          const feeAmt = type === 'fixed' 
                            ? val 
                            : parseFloat(((val / 100) * calcPrice).toFixed(2));
                          return (
                            <tr key={i} style={inRange ? { background: 'rgba(247,201,72,.04)' } : {}}>
                              <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--t3)', width: 30 }}>{i + 1}</td>
                              <td data-label="Min Price (₹)">
                                <input className="tier-input" type="number" min={0} value={tier.min}
                                  onChange={e => updateTier(i, 'min', parseFloat(e.target.value) || 0)} />
                              </td>
                              <td data-label="Max Price (₹)">
                                <input className="tier-input" type="number" min={0} value={tier.max}
                                  onChange={e => updateTier(i, 'max', parseFloat(e.target.value) || 0)} />
                              </td>
                              <td data-label="Fee Type">
                                <select 
                                  value={type} 
                                  onChange={e => updateTier(i, 'type', e.target.value as any)}
                                  style={{
                                    background: 'var(--surface)',
                                    border: '1px solid var(--bd2)',
                                    borderRadius: '7px',
                                    color: 'var(--t1)',
                                    fontSize: '12px',
                                    padding: '7px 6px',
                                    outline: 'none',
                                    width: '120px'
                                  }}
                                >
                                  <option value="percent">Percentage (%)</option>
                                  <option value="fixed">Fixed Flat (₹)</option>
                                </select>
                              </td>
                              <td data-label="Value">
                                <input className="tier-pct" type="number" min={0} step={0.5} value={val}
                                  onChange={e => updateTier(i, 'value', parseFloat(e.target.value) || 0)} />
                              </td>
                              <td data-label="Sample Fee" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: inRange ? 'var(--gold)' : 'var(--t3)', fontWeight: inRange ? 700 : 400 }}>
                                {inRange ? `₹${feeAmt.toLocaleString('en-IN')}` : '—'}
                              </td>
                              <td data-label="Remove">
                                <button className="tier-del" onClick={() => removeTier(i)} title="Remove tier">✕</button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <button className="add-tier-btn" onClick={addTier}>
                      + Add Price Tier
                    </button>
                  </div>
                </div>

                {/* Physical: Info box */}
                <div className="ps-card">
                  <div className="ps-card-head">
                    <div className="ps-card-icon blue">ℹ️</div>
                    <div>
                      <div className="ps-card-ttl">How Physical Fees Work</div>
                      <div className="ps-card-desc">Reference guide for the fee structure</div>
                    </div>
                  </div>
                  <div className="ps-card-body">
                    <div style={{display:'grid', gap:10}}>
                      {[
                        ['📋 Listing Fee', 'Seller pays a one-time fee based on their product price tier when listing'],
                        ['🏷 No Buyer Surcharge', 'Physical products have NO extra platform fee added to the buyer price'],
                        ['💸 Revenue', 'Seller receives full product price after deal — listing fee was the platform cut'],
                        ['⚡ Instant Payout', 'Physical deals settle immediately — no hold period'],
                      ].map(([icon, text]) => (
                        <div key={icon} style={{ display:'flex', gap:12, alignItems:'flex-start', padding:'10px 14px', background:'var(--card2)', borderRadius:9 }}>
                          <span style={{fontSize:16}}>{icon}</span>
                          <span style={{fontSize:13, color:'var(--t2)', lineHeight:1.5}}>{text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Save section */}
            <div className="save-section">
              <div className="save-title">
                💾 Pending Changes
                {diffItems.length > 0 && (
                  <span style={{marginLeft:'auto', fontSize:11, background:'rgba(247,201,72,.15)', color:'var(--gold)', padding:'3px 10px', borderRadius:99, fontWeight:700}}>
                    {diffItems.length} change{diffItems.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {diffItems.length === 0 ? (
                <div className="no-changes">No unsaved changes</div>
              ) : (
                <div className="changes-list">
                  {diffItems.map((d, i) => (
                    <div className="change-item" key={i}>
                      <div className="change-item-label">{d.label}</div>
                      <div className="change-item-vals">
                        <span className="old-val">{d.old}</span>
                        <span style={{color:'var(--t3)'}}>→</span>
                        <span className="new-val">{d.new}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="save-actions">
                <button className="btn-cancel" onClick={handleCancel} disabled={saving}>Cancel</button>
                <button className="btn-save" onClick={handleSave} disabled={saving || diffItems.length === 0}>
                  {saving ? '⏳ Saving...' : '💾 Save Settings'}
                </button>
              </div>
              {saved.updatedAt && (
                <div style={{marginTop:12, fontSize:11, color:'var(--t3)', textAlign:'right', fontFamily:'var(--font-mono)'}}>
                  Last saved: {new Date(saved.updatedAt).toLocaleString('en-IN')}
                  {saved.updatedBy && ` by ${saved.updatedBy}`}
                </div>
              )}
            </div>
          </div>

          {/* Right column — Calculator */}
          <div className="calc-card">
            <div className="calc-head">
              <span style={{fontSize:16}}>🧮</span>
              <div className="calc-ttl">Fee Calculator</div>
            </div>
            <div className="calc-body">
              <div className="calc-label">Simulate Product Price</div>
              <div className="calc-price-input">
                <div className="calc-prefix">₹</div>
                <input className="calc-input" type="number" min={0} placeholder="500"
                  value={calcPrice} onChange={e => setCalcPrice(parseFloat(e.target.value) || 0)} />
              </div>

              {tab === 'digital' ? (
                <>
                  <div className="calc-label" style={{marginBottom:4}}>🖥 Digital Product Breakdown</div>
                  <div className="calc-divider" />

                  <div style={{marginBottom:10,padding:'8px 12px',background:'var(--gold-glow)',borderRadius:8}}>
                    <div style={{fontSize:10,color:'var(--t3)',fontWeight:700,textTransform:'uppercase',letterSpacing:'.7px',marginBottom:4}}>Seller Pays (Upfront)</div>
                    <div className="calc-row">
                      <span className="calc-row-label">📋 Listing Fee</span>
                      <span className="calc-row-val gold">₹{settings.digitalListingFee}</span>
                    </div>
                  </div>

                  <div style={{marginBottom:10,padding:'8px 12px',background:'rgba(59,130,246,.06)',borderRadius:8,border:'1px solid rgba(59,130,246,.1)'}}>
                    <div style={{fontSize:10,color:'var(--t3)',fontWeight:700,textTransform:'uppercase',letterSpacing:'.7px',marginBottom:4}}>
                      Buyer Pays <span className="calc-badge info" style={{marginLeft:4}}>Invoice Only</span>
                    </div>
                    <div className="calc-row">
                      <span className="calc-row-label">Product Price</span>
                      <span className="calc-row-val">₹{calcPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="calc-row">
                      <span className="calc-row-label">+ Platform Fee ({settings.digitalBuyerFeePercent}%)</span>
                      <span className="calc-row-val gold">+₹{buyerFee.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{height:1,background:'var(--bd)',margin:'6px 0'}} />
                    <div className="calc-row">
                      <span className="calc-row-label" style={{fontWeight:700,color:'var(--t1)'}}>Total Buyer Pays</span>
                      <span className="calc-row-val" style={{fontSize:16,color:'var(--blue)'}}>₹{buyerTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div style={{padding:'8px 12px',background:'var(--emerald-dim)',borderRadius:8,border:'1px solid rgba(16,185,129,.1)'}}>
                    <div style={{fontSize:10,color:'var(--t3)',fontWeight:700,textTransform:'uppercase',letterSpacing:'.7px',marginBottom:4}}>Seller Earns (After Hold)</div>
                    <div className="calc-row">
                      <span className="calc-row-label">Product Price</span>
                      <span className="calc-row-val">₹{calcPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="calc-row">
                      <span className="calc-row-label">− Platform Cut ({settings.digitalSellerCutPercent}%)</span>
                      <span className="calc-row-val red">−₹{sellerCut.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{height:1,background:'var(--bd)',margin:'6px 0'}} />
                    <div className="calc-row">
                      <span className="calc-row-label" style={{fontWeight:700,color:'var(--t1)'}}>Seller Payout</span>
                      <span className="calc-row-val emerald" style={{fontSize:16}}>₹{netSeller.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{fontSize:11,color:'var(--t3)',marginTop:4}}>
                      ⏱ Released after {settings.digitalPayoutDays} day{settings.digitalPayoutDays !== 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="calc-total" style={{marginTop:14}}>
                    <div className="calc-total-label">🏦 Platform Revenue</div>
                    <div className="calc-total-val">₹{(buyerFee + sellerCut + settings.digitalListingFee).toLocaleString('en-IN')}</div>
                    <div style={{fontSize:11,color:'var(--t3)',marginTop:3}}>
                      Listing ₹{settings.digitalListingFee} + Buyer ₹{buyerFee} + Seller Cut ₹{sellerCut}
                    </div>
                  </div>

                  <div className="billing-note">
                    🔒 Platform fee ({settings.digitalBuyerFeePercent}%) is shown<br/>only in buyer's invoice — not on product page
                  </div>
                </>
              ) : (
                <>
                  <div className="calc-label" style={{marginBottom:4}}>📦 Physical Product Breakdown</div>
                  <div className="calc-divider" />

                  <div style={{padding:'8px 12px',background:'var(--gold-glow)',borderRadius:8,marginBottom:12}}>
                    <div style={{fontSize:10,color:'var(--t3)',fontWeight:700,textTransform:'uppercase',letterSpacing:'.7px',marginBottom:4}}>Seller Pays (Upfront Listing Fee)</div>
                    {(() => {
                      const lastT = settings.physicalTiers[settings.physicalTiers.length - 1];
                      const matchedTier = settings.physicalTiers.find(t => calcPrice >= t.min && calcPrice <= t.max) || lastT;
                      const isBeyond = lastT && calcPrice > lastT.max;

                      let tierText = '—';
                      let feeRateText = '—';
                      if (matchedTier) {
                        tierText = isBeyond 
                          ? `Above ₹${lastT.max}` 
                          : `₹${matchedTier.min}–₹${matchedTier.max}`;
                        
                        const type = matchedTier.type || 'percent';
                        const val = typeof matchedTier.value === 'number' ? matchedTier.value : (matchedTier.percent || 0);
                        feeRateText = type === 'fixed' ? `₹${val} Flat` : `${val}%`;
                      }

                      return (
                        <>
                          <div className="calc-row">
                            <span className="calc-row-label">Applicable Tier</span>
                            <span className="calc-row-val" style={{fontSize:11}}>
                              {tierText}
                            </span>
                          </div>
                          <div className="calc-row">
                            <span className="calc-row-label">Fee Rate</span>
                            <span className="calc-row-val">{feeRateText}</span>
                          </div>
                          <div className="calc-row">
                            <span className="calc-row-label" style={{fontWeight:700,color:'var(--t1)'}}>Listing Fee</span>
                            <span className="calc-row-val gold" style={{fontSize:16}}>₹{physListFee.toLocaleString('en-IN')}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <div style={{padding:'8px 12px',background:'var(--emerald-dim)',borderRadius:8,border:'1px solid rgba(16,185,129,.1)',marginBottom:12}}>
                    <div style={{fontSize:10,color:'var(--t3)',fontWeight:700,textTransform:'uppercase',letterSpacing:'.7px',marginBottom:4}}>Buyer Pays</div>
                    <div className="calc-row">
                      <span className="calc-row-label">Product Price</span>
                      <span className="calc-row-val blue">₹{calcPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{fontSize:11,color:'var(--t3)',marginTop:2}}>No extra platform fee for buyer</div>
                  </div>

                  <div style={{padding:'8px 12px',background:'rgba(59,130,246,.06)',borderRadius:8,border:'1px solid rgba(59,130,246,.1)'}}>
                    <div style={{fontSize:10,color:'var(--t3)',fontWeight:700,textTransform:'uppercase',letterSpacing:'.7px',marginBottom:4}}>Seller Earns</div>
                    <div className="calc-row">
                      <span className="calc-row-label" style={{fontWeight:700,color:'var(--t1)'}}>Full Product Price</span>
                      <span className="calc-row-val emerald" style={{fontSize:16}}>₹{calcPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{fontSize:11,color:'var(--t3)',marginTop:2}}>⚡ Immediate payout — no hold period</div>
                  </div>

                  <div className="calc-total" style={{marginTop:14}}>
                    <div className="calc-total-label">🏦 Platform Revenue</div>
                    <div className="calc-total-val">₹{physListFee.toLocaleString('en-IN')}</div>
                    <div style={{fontSize:11,color:'var(--t3)',marginTop:3}}>Listing fee only (one-time)</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className={`toast ${toast.type}`}>{toast.msg}</div>
      )}
    </>
  );
}
