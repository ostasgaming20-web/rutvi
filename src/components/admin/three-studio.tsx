"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Boxes, Save } from "lucide-react";
import { AdminSubmit } from "@/components/admin/admin-submit";
import { saveThreeSettings } from "@/app/admin/content-actions";
import type { ThreeSettings } from "@/lib/settings";

const GiftBoxPreview = dynamic(() => import("@/components/three/gift-box-preview"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-[0.7rem] text-[#8b919d]">Loading 3D preview…</div>,
});

function ColorRow({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-2 rounded-lg border border-black/8 bg-white px-2.5 py-1.5">
      <span className="text-[0.64rem] font-medium text-[#3f4552]">{label}</span>
      <span className="flex items-center gap-1.5">
        <input
          type="color"
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="size-7 cursor-pointer rounded border border-black/10 bg-transparent"
        />
        <span className="font-mono text-[0.58rem] text-[#8b919d]">{value}</span>
      </span>
    </label>
  );
}

export function ThreeStudio({ settings }: { settings: ThreeSettings }) {
  const [boxColor, setBoxColor] = useState(settings.boxColor);
  const [ribbonColor, setRibbonColor] = useState(settings.ribbonColor);
  const [bowColor, setBowColor] = useState(settings.bowColor);
  const [lidColor, setLidColor] = useState(settings.lidColor);

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
      <div className="overflow-hidden rounded-xl border border-black/7 bg-gradient-to-b from-[#f6f1e8] to-[#e9e3d7]">
        <div className="flex items-center justify-between border-b border-black/6 bg-white/70 px-3 py-2 backdrop-blur">
          <span className="inline-flex items-center gap-1.5 text-[0.66rem] font-semibold text-[#14161a]">
            <Boxes className="size-3.5 text-[#8a6a33]" /> Interactive preview
          </span>
          <span className="text-[0.58rem] text-[#8b919d]">Drag to orbit · scroll to zoom</span>
        </div>
        <div className="h-[440px] w-full">
          <GiftBoxPreview boxColor={boxColor} ribbonColor={ribbonColor} logoText="RUTVI" />
        </div>
        <div className="flex flex-wrap gap-1.5 border-t border-black/6 bg-white/70 px-3 py-2 text-[0.58rem] text-[#6b7280]">
          <span className="rounded-full border border-black/10 px-2 py-0.5">Lid {lidColor}</span>
          <span className="rounded-full border border-black/10 px-2 py-0.5">Bow {bowColor}</span>
          <span className="rounded-full border border-black/10 px-2 py-0.5">{settings.openingAnimation}</span>
        </div>
      </div>

      <form action={saveThreeSettings} className="space-y-3">
        <div className="rounded-xl border border-black/7 bg-white p-3.5">
          <p className="mb-2 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">Materials</p>
          <div className="grid gap-1.5">
            <ColorRow label="Box" name="boxColor" value={boxColor} onChange={setBoxColor} />
            <ColorRow label="Lid" name="lidColor" value={lidColor} onChange={setLidColor} />
            <ColorRow label="Ribbon" name="ribbonColor" value={ribbonColor} onChange={setRibbonColor} />
            <ColorRow label="Bow" name="bowColor" value={bowColor} onChange={setBowColor} />
          </div>
        </div>

        <div className="rounded-xl border border-black/7 bg-white p-3.5">
          <p className="mb-2 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">Camera &amp; motion</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: "cameraX", label: "Camera X", value: settings.cameraX, step: "0.1" },
              { name: "cameraY", label: "Camera Y", value: settings.cameraY, step: "0.1" },
              { name: "cameraZ", label: "Camera Z", value: settings.cameraZ, step: "0.1" },
              { name: "cameraFov", label: "Field of view", value: settings.cameraFov, step: "1" },
              { name: "scale", label: "Scale", value: settings.scale, step: "0.05" },
              { name: "positionY", label: "Vertical offset", value: settings.positionY, step: "0.05" },
              { name: "lightIntensity", label: "Key light", value: settings.lightIntensity, step: "0.05" },
              { name: "ambientIntensity", label: "Ambient light", value: settings.ambientIntensity, step: "0.05" },
            ].map((input) => (
              <label key={input.name} className="block">
                <span className="mb-0.5 block text-[0.56rem] font-semibold uppercase tracking-[0.08em] text-[#6b7280]">{input.label}</span>
                <input
                  type="number"
                  step={input.step}
                  name={input.name}
                  defaultValue={input.value}
                  className="w-full rounded-lg border border-black/10 bg-white px-2 py-1.5 text-[0.72rem] outline-none focus:border-[#0d1f3c]"
                />
              </label>
            ))}
          </div>
          <label className="mt-2 block">
            <span className="mb-0.5 block text-[0.56rem] font-semibold uppercase tracking-[0.08em] text-[#6b7280]">Opening animation</span>
            <select name="openingAnimation" defaultValue={settings.openingAnimation} className="w-full rounded-lg border border-black/10 bg-white px-2 py-1.5 text-[0.72rem]">
              <option value="unwrap">Unwrap</option>
              <option value="fade">Fade</option>
              <option value="none">None</option>
            </select>
          </label>
          <label className="mt-2 flex items-center gap-2 text-[0.68rem] text-[#3f4552]">
            <input type="checkbox" name="autoRotate" defaultChecked={settings.autoRotate} className="size-3.5 accent-[#0d1f3c]" /> Auto-rotate
          </label>
          <label className="mt-1.5 flex items-center gap-2 text-[0.68rem] text-[#3f4552]">
            <input type="checkbox" name="enableZoom" defaultChecked={settings.enableZoom} className="size-3.5 accent-[#0d1f3c]" /> Enable zoom
          </label>
          <label className="mt-1.5 flex items-center gap-2 text-[0.68rem] text-[#3f4552]">
            <input type="checkbox" name="showProducts" defaultChecked={settings.showProducts} className="size-3.5 accent-[#0d1f3c]" /> Show products inside box
          </label>
        </div>

        <div className="rounded-xl border border-black/7 bg-white p-3.5">
          <p className="mb-2 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">Copy &amp; model</p>
          <label className="block">
            <span className="mb-0.5 block text-[0.56rem] font-semibold uppercase tracking-[0.08em] text-[#6b7280]">Unwrap label</span>
            <input name="unwrapLabel" defaultValue={settings.unwrapLabel} className="w-full rounded-lg border border-black/10 px-2 py-1.5 text-[0.72rem]" />
          </label>
          <label className="mt-2 block">
            <span className="mb-0.5 block text-[0.56rem] font-semibold uppercase tracking-[0.08em] text-[#6b7280]">GLB model URL (optional)</span>
            <input name="modelUrl" defaultValue={settings.modelUrl} placeholder="/uploads/models/box.glb" className="w-full rounded-lg border border-black/10 px-2 py-1.5 text-[0.72rem]" />
          </label>
          <input type="hidden" name="background" value={settings.background} />
          <input type="hidden" name="rotateSpeed" value={settings.rotateSpeed} />
          <input type="hidden" name="animationAssetUrl" value={settings.animationAssetUrl} />
        </div>

        <AdminSubmit className="w-full"><Save className="size-3.5" /> Save 3D configuration</AdminSubmit>
        <p className="text-[0.6rem] leading-relaxed text-[#8b919d]">
          Colours update the preview instantly. Saved settings are staged as a draft until published.
        </p>
      </form>
    </div>
  );
}
