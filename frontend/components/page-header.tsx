"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { AppLogo } from "@/components/app-logo"

export function PageHeader({ title }: { title: string }) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 backdrop-blur-xl" style={{ background: 'rgba(15, 23, 41, 0.70)' }}>
      <div className="mx-auto flex h-16 max-w-4xl items-center gap-4 px-6">
        <AppLogo />
        <span className="text-border">/</span>
        <h1 className="text-sm font-medium text-foreground">{title}</h1>
        <button
          onClick={() => router.back()}
          aria-label="返回上一页"
          className="ml-auto flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          返回上一页
        </button>
      </div>
    </header>
  )
}
