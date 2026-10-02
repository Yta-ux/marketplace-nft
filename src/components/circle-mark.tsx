import { cn } from "@/lib/utils"

type CircleMarkProps = {
  checked: boolean
  variant?: "check" | "radio"
  className?: string
}

export function CircleMark({ checked, variant = "radio", className }: CircleMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border-primary",
        variant === "check" ? "size-[15px] border-2" : "size-4 border-[1.2px]",
        className,
      )}
    >
      {checked && (
        <span
          className={cn("rounded-full bg-primary", variant === "check" ? "size-[7px]" : "size-2.5")}
        />
      )}
    </span>
  )
}
