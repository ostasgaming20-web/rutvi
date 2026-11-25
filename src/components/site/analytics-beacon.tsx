"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function sessionId() {
  try {
    const key = "rutvi_sid";
    let value = window.localStorage.getItem(key);
    if (!value) {
      value = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      window.localStorage.setItem(key, value);
    }
    return value;
  } catch {
    return null;
  }
}

export function AnalyticsBeacon({
  type = "page_view",
  productId,
  path,
}: {
  type?: "page_view" | "product_view";
  productId?: number;
  path?: string;
}) {
  const pathname = usePathname();
  const resolvedPath = path ?? pathname;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (resolvedPath.startsWith("/admin") || resolvedPath.startsWith("/api")) return;
    if (navigator.doNotTrack === "1") return;

    const dedupeKey = `rutvi_seen:${type}:${resolvedPath}`;
    try {
      if (window.sessionStorage.getItem(dedupeKey)) return;
      window.sessionStorage.setItem(dedupeKey, "1");
    } catch {
      /* storage unavailable — still send */
    }

    const params = new URLSearchParams(window.location.search);
    const payload = {
      type,
      path: resolvedPath,
      productId,
      referrer: document.referrer || null,
      utmSource: params.get("utm_source"),
      sessionId: sessionId(),
    };

    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/track", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
    }
  }, [type, productId, resolvedPath]);

  return null;
}
