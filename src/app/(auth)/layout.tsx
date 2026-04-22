"use client";

import { Zap } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-lg font-bold tracking-tight"
      >
        <Zap className="h-6 w-6 text-[var(--brand-accent)]" />
        <span>AmpSim</span>
      </Link>
      {children}
    </div>
  );
}
