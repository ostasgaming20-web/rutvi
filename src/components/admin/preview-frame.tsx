"use client";

import { useState } from "react";
import { Monitor, RefreshCw, Smartphone, Tablet } from "lucide-react";

const SIZES = {
  desktop: { width: "100%", label: "Desktop" },
  tablet: { width: "768px", label: "Tablet" },
  mobile: { width: "390px", label: "Mobile" },
} as const;

export function PreviewFrame({
  path = "/",
  height = 520,
  showDeviceBar = true,
  reloadKey = 0,
}: {
  path?: string;
  height?: number;
  showDeviceBar?: boolean;
  reloadKey?: number;
}) {
  const [device, setDevice] = useState<keyof typeof SIZES>("desktop");
  const [nonce, setNonce] = useState(0);

  return (
    <div>
      {showDeviceBar && (
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-0.5 rounded-lg border border-black/8 bg-white p-0.5">
            {(Object.keys(SIZES) as (keyof typeof SIZES)[]).map((key) => {
              const Icon = key === "desktop" ? Monitor : key === "tablet" ? Tablet : Smartphone;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setDevice(key)}
                  aria-pressed={device === key}
                  aria-label={SIZES[key].label}
                  className={`grid size-7 place-items-center rounded-md transition-colors ${
                    device === key ? "bg-[#0d1f3c] text-white" : "text-[#6b7280] hover:bg-black/5"
                  }`}
                >
                  <Icon className="size-3.5" />
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setNonce((value) => value + 1)}
            className="inline-flex items-center gap-1 rounded-md border border-black/8 bg-white px-2 py-1 text-[0.62rem] text-[#6b7280] hover:border-black/20"
          >
            <RefreshCw className="size-3" /> Refresh
          </button>
        </div>
      )}
      <div className="flex justify-center overflow-hidden rounded-lg border border-black/10 bg-[#e9ebef] p-2">
        <div
          className="overflow-hidden rounded-md bg-white shadow-inner transition-all"
          style={{ width: SIZES[device].width, maxWidth: "100%", height }}
        >
          <iframe
            key={`${device}-${nonce}-${reloadKey}`}
            src={path}
            title="Website preview"
            className="h-full w-full border-0"
            loading="lazy"
          />
        </div>
      </div>
      <p className="mt-1.5 text-center text-[0.6rem] text-[#8b919d]">
        Previewing {path} — drafts are shown because you are signed in as an administrator.
      </p>
    </div>
  );
}
