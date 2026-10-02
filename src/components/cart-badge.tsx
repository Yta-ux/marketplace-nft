import { cn } from "@/lib/utils"

export function CartBadge({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-5 items-center justify-center rounded-full border-2 border-ink bg-primary font-medium text-micro text-ink",
        className,
      )}
    >
      {count > 9 ? "9+" : count}
    </span>
  )
}
