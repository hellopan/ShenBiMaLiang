"use client"

import Link from "next/link"
import { Feather } from "lucide-react"
import { cn } from "@/lib/utils"

export function AppLogo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2.5 transition-opacity hover:opacity-80", className)}
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Feather className="size-4.5" />
      </span>
      <span className="text-lg font-semibold tracking-tight">神笔马良</span>
    </Link>
  )
}
