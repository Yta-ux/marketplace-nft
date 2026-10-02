import type { ComponentProps } from "react"
import { Icon, type IconName } from "@/components/icon"
import { cn } from "@/lib/utils"

type CardActionButtonProps = Omit<ComponentProps<"button">, "children"> & {
  icon: IconName
  label: string
}

export function CardActionButton({ icon, label, className, ...props }: CardActionButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "flex size-[35px] items-center justify-center rounded-xs border border-border bg-surface-raised transition-colors hover:border-primary disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <Icon name={icon} />
    </button>
  )
}
