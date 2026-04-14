import { useEffect, useRef } from "react";

const UTM_STORAGE_KEY = "tillie_referral";

interface ReferralData {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  captured_at: string;
}

/** Captures UTM params on first visit and persists to sessionStorage */
export const useReferralCapture = () => {
  const captured = useRef(false);

  useEffect(() => {
    if (captured.current) return;
    captured.current = true;

    const params = new URLSearchParams(window.location.search);
    const source = params.get("utm_source") || params.get("ref");
    const medium = params.get("utm_medium");
    const campaign = params.get("utm_campaign");

    // Also detect from document.referrer if no UTM
    let detectedSource = source;
    if (!detectedSource && document.referrer) {
      try {
        const refHost = new URL(document.referrer).hostname;
        if (refHost.includes("facebook") || refHost.includes("fb.")) detectedSource = "facebook";
        else if (refHost.includes("instagram")) detectedSource = "instagram";
        else if (refHost.includes("google")) detectedSource = "google";
        else if (refHost.includes("twitter") || refHost.includes("x.com")) detectedSource = "twitter";
        else if (refHost.includes("tiktok")) detectedSource = "tiktok";
        else detectedSource = refHost;
      } catch {}
    }

    if (detectedSource) {
      const data: ReferralData = {
        source: detectedSource,
        medium,
        campaign,
        captured_at: new Date().toISOString(),
      };
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(data));
    }
  }, []);
};

/** Returns the referral source string to attach to orders */
export const getReferralSource = (): string | null => {
  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return null;
    const data: ReferralData = JSON.parse(raw);
    const parts = [data.source, data.medium, data.campaign].filter(Boolean);
    return parts.join(" / ") || null;
  } catch {
    return null;
  }
};
