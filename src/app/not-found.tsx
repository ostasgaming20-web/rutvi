import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <main className="container-lux flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="display mt-3 max-w-xl text-4xl text-ink sm:text-5xl">This page has been unwrapped.</h1>
      <p className="mt-3 max-w-md text-sm text-ink/55">
        The page you were looking for is not here. Explore the collection or tell us what you need and we will curate it for you.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/products" className="btn-base btn-navy">
          Explore products <ArrowRight className="size-4" />
        </Link>
        <Link href="/contact" className="btn-base btn-ghost">
          Contact us
        </Link>
      </div>
    </main>
  );
}
