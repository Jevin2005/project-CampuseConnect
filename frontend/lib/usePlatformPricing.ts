import { useState, useEffect } from "react";
import api from "./axios";

export interface PhysicalTier {
  min: number;
  max: number;
  type: "percent" | "fixed";
  value: number;
}

export interface PlatformPricing {
  listingFeePhysical: number;
  listingFeeDigital: number;
  platformFeePercent: number;
  digitalBuyerFeePercent: number;
  digitalSellerCutPercent: number;
  digitalPayoutDays: number;
  physicalTiers: PhysicalTier[];
}

const DEFAULT_PRICING: PlatformPricing = {
  listingFeePhysical: 49,
  listingFeeDigital: 20,
  platformFeePercent: 15,
  digitalBuyerFeePercent: 15,
  digitalSellerCutPercent: 15,
  digitalPayoutDays: 7,
  physicalTiers: [
    { min: 0, max: 500, type: "percent", value: 5 },
    { min: 501, max: 1000, type: "percent", value: 4 },
    { min: 1001, max: 2000, type: "percent", value: 3 },
  ],
};

export function findTier(price: number, tiers: PhysicalTier[]): PhysicalTier | null {
  if (!Array.isArray(tiers) || tiers.length === 0) return null;
  for (const tier of tiers) {
    if (price >= tier.min && price <= tier.max) {
      return tier;
    }
  }
  return tiers[tiers.length - 1] || null;
}

export function calcPhysicalListingFee(price: number, tiers: PhysicalTier[]): number {
  if (!Array.isArray(tiers) || tiers.length === 0) return 0;
  const tier = findTier(price, tiers);
  if (!tier) return 0;
  const type = tier.type || "percent";
  const val = tier.value || 0;
  return type === "fixed" ? val : parseFloat(((val / 100) * price).toFixed(2));
}

export function usePlatformPricing() {
  const [pricing, setPricing] = useState<PlatformPricing>(DEFAULT_PRICING);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api
      .get("/api/marketplace/settings")
      .then((res) => {
        if (!active) return;
        if (res.data) {
          const data = res.data;
          const physicalTiers = (Array.isArray(data.physicalTiers) ? data.physicalTiers : []).map((t: any) => ({
            min: typeof t.min === "number" ? t.min : 0,
            max: typeof t.max === "number" ? t.max : 999999,
            type: t.type || "percent",
            value: typeof t.value === "number" ? t.value : (typeof t.percent === "number" ? t.percent : 0)
          }));
          setPricing({
            listingFeePhysical: data.listingFeePhysical ?? DEFAULT_PRICING.listingFeePhysical,
            listingFeeDigital: data.listingFeeDigital ?? DEFAULT_PRICING.listingFeeDigital,
            platformFeePercent: data.platformFeePercent ?? DEFAULT_PRICING.platformFeePercent,
            digitalBuyerFeePercent: data.digitalBuyerFeePercent ?? DEFAULT_PRICING.digitalBuyerFeePercent,
            digitalSellerCutPercent: data.digitalSellerCutPercent ?? DEFAULT_PRICING.digitalSellerCutPercent,
            digitalPayoutDays: data.digitalPayoutDays ?? DEFAULT_PRICING.digitalPayoutDays,
            physicalTiers,
          });
        }
      })
      .catch((err) => {
        if (!active) return;
        console.error("Failed to load platform settings, using defaults.", err);
        setError("Failed to load live settings. Using default fallback values.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { pricing, loading, error };
}
