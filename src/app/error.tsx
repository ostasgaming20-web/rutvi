"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="container-lux flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="display mt-3 max-w-xl text-4xl text-ink sm:text-5xl">We could not load this page.</h1>
      <p className="mt-3 max-w-md text-sm text-ink/55">
        Please try again. If it keeps happening, call us on +91 98699 94699 or email sales.rutvi@gmail.com.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn-base btn-navy">
          Try again
        </button>
        <Link href="/" className="btn-base btn-ghost">
          Back to home
        </Link>
      </div>
    </main>
  );
}
