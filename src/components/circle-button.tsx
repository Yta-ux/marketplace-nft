import type { ComponentProps } from "react"
import { Icon, type IconName } from "@/components/icon"
import { cn } from "@/lib/utils"

type CircleButtonProps = Omit<ComponentProps<"button">, "children"> & {
  icon: IconName
  iconClassName?: string
  label: string
}

export function CircleButton({
  icon,
  iconClassName,
  label,
  className,
  ...props
}: CircleButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "flex size-[35px] shrink-0 items-center justify-center rounded-full border border-border bg-surface-raised transition-colors hover:border-primary",
        className,
      )}
      {...props}
    >
      <Icon name={icon} className={iconClassName} />
    </button>
  )
}
