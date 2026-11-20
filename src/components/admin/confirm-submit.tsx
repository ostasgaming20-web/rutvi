"use client";

import { useFormStatus } from "react-dom";
import { Loader2, Trash2 } from "lucide-react";

export function ConfirmSubmit({
  message,
  children,
  className,
}: {
  message: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {pending ? <Loader2 className="size-3.5 animate-spin" /> : children ?? <Trash2 className="size-3.5" />}
    </button>
  );
}
