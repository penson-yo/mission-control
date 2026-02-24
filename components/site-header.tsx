"use client";

import * as React from "react";
import Link from "next/link";
import { Activity } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2 mr-4">
          <Activity className="h-6 w-6 text-orange-500" />
          <Link href="/" className="font-bold text-lg">
            Mission Control
          </Link>
        </div>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="transition-colors hover:text-foreground/80">
            Dashboard
          </Link>
          <Link href="/bots" className="transition-colors hover:text-foreground/80">
            Bots
          </Link>
          <Link href="/account" className="transition-colors hover:text-foreground/80">
            Account
          </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
