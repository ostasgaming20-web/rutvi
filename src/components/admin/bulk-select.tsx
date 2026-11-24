"use client";

import { useState } from "react";

export function BulkSelectAll({ total }: { total: number }) {
  const [checked, setChecked] = useState(false);
  return (
    <input
      type="checkbox"
      aria-label="Select all rows"
      checked={checked}
      onChange={(event) => {
        setChecked(event.target.checked);
        document.querySelectorAll<HTMLInputElement>("input[name='ids']").forEach((box) => {
          box.checked = event.target.checked;
        });
      }}
      className="size-3.5 accent-[#0d1f3c]"
      title={`Select all ${total}`}
    />
  );
}
