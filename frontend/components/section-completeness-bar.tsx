import { cn } from "@/lib/utils"

type SectionCompletenessBarProps = {
  title?: string
  barWidth: number
  label: string
  barClassName: string
  className?: string
}

export function SectionCompletenessBar({
  title = "资料完整度",
  barWidth,
  label,
  barClassName,
  className,
}: SectionCompletenessBarProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card/40 p-4",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium">{title}</span>
        <span className="text-muted-foreground">{label}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", barClassName)}
          style={{ width: `${Math.min(100, Math.max(0, barWidth))}%` }}
        />
      </div>
    </div>
  )
}
