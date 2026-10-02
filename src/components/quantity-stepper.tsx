import { Icon } from "@/components/icon"
import { cn } from "@/lib/utils"

const sizes = {
  lg: {
    button: "h-[49.5px] w-[33px] rounded-[33px] drop-shadow-[0px_6.6px_9.9px_rgba(20,13,10,0.15)]",
    value: "text-[20px] leading-7",
    minus: "minus-lg",
    plus: "plus-lg",
  },
  sm: {
    button: "h-[30px] w-5 rounded-[20px] drop-shadow-[0px_4px_6px_rgba(20,13,10,0.15)]",
    value: "text-label leading-6",
    minus: "minus",
    plus: "plus",
  },
} as const

type QuantityStepperProps = {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  size?: keyof typeof sizes
  label: string
  className?: string
  valueClassName?: string
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  size = "lg",
  label,
  className,
  valueClassName,
}: QuantityStepperProps) {
  const s = sizes[size]
  const button = cn(
    "flex items-center justify-center border border-ink bg-primary transition-colors hover:bg-highlight disabled:opacity-50 disabled:hover:bg-primary",
    s.button,
  )
  return (
    <fieldset className={cn("m-0 flex min-w-0 items-center gap-3 border-0 p-0", className)}>
      <legend className="sr-only">{label}</legend>
      <button
        type="button"
        aria-label="Diminuir quantidade"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className={button}
      >
        <Icon name={s.minus} />
      </button>
      <output
        aria-live="polite"
        className={cn("whitespace-nowrap text-foreground", s.value, valueClassName)}
      >
        {value}
      </output>
      <button
        type="button"
        aria-label="Aumentar quantidade"
        disabled={max !== undefined && value >= max}
        onClick={() => onChange(value + 1)}
        className={button}
      >
        <Icon name={s.plus} />
      </button>
    </fieldset>
  )
}
