import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function TextLines({
  lines,
  className,
  lastWidth = "70%",
}: {
  lines: number
  className?: string
  lastWidth?: string
}) {
  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      {Array.from({ length: lines }, (_, i) => `line-${i}`).map((key, i) => (
        <Skeleton
          key={key}
          className="h-3.5 rounded-xs"
          style={i === lines - 1 ? { width: lastWidth } : undefined}
        />
      ))}
    </div>
  )
}

export function FieldSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-1 flex-col gap-3", className)}>
      <Skeleton className="h-4 w-28 rounded-xs" />
      <Skeleton className="h-10 w-full rounded-[3px]" />
    </div>
  )
}

export function SectionHeadingSkeleton() {
  return (
    <div className="flex w-full flex-col gap-3">
      <Skeleton className="h-4 w-44 rounded-xs" />
      <div aria-hidden="true" className="h-[0.3px] w-full bg-primary" />
    </div>
  )
}

export function SummaryRowsSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: rows }, (_, i) => `row-${i}`).map((key) => (
        <div key={key} className="flex items-center justify-between">
          <Skeleton className="h-4 w-24 rounded-xs" />
          <Skeleton className="h-4 w-20 rounded-xs" />
        </div>
      ))}
    </div>
  )
}

export function LoadingRegion({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="status" aria-busy="true" aria-label={label}>
      {children}
    </div>
  )
}
