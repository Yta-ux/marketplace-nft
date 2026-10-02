import { cn } from "@/lib/utils"

type SummaryRowProps = {
  label: string
  value: string
  valueSize?: "lg" | "md" | "sm"
  className?: string
}

export function SummaryRow({ label, value, valueSize = "lg", className }: SummaryRowProps) {
  return (
    <div
      className={cn("flex w-full items-center justify-between gap-3 text-foreground", className)}
    >
      <dt className="min-w-0 text-body leading-[normal]">{label}</dt>
      <dd
        className={cn(
          "shrink-0 text-right whitespace-nowrap",
          valueSize === "lg"
            ? "text-title-sm leading-4"
            : valueSize === "sm"
              ? "text-body-lg leading-4"
              : "text-body leading-[normal]",
        )}
      >
        {value}
      </dd>
    </div>
  )
}

export function TotalRow({ value, className }: { value: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-between whitespace-nowrap font-bold leading-4",
        className,
      )}
    >
      <dt className="text-body-lg text-foreground">Total</dt>
      <dd className="text-right text-title-sm text-highlight">{value}</dd>
    </div>
  )
}

export function Hairline({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("h-[0.3px] w-full bg-primary", className)} />
}
