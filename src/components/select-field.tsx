import { Icon } from "@/components/icon"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export type SelectOption = { value: string; label: string }

type SelectFieldProps = {
  id: string
  placeholder: string
  options: SelectOption[]
  value?: string
  onValueChange?: (value: string) => void
  required?: boolean
  ariaLabel?: string
  arrow?: "lg" | "xl" | "ens"
  className?: string
}

export function SelectField({
  id,
  placeholder,
  options,
  value,
  onValueChange,
  required,
  ariaLabel,
  arrow = "lg",
  className,
}: SelectFieldProps) {
  return (
    <Select value={value} onValueChange={onValueChange} required={required}>
      <SelectTrigger
        id={id}
        aria-label={ariaLabel}
        className={cn(
          "h-10 w-full justify-between gap-0 rounded-[3px] border-field bg-transparent py-3 pr-2 pl-3 font-normal text-body-sm text-foreground data-placeholder:text-subtle dark:bg-transparent dark:hover:bg-transparent [&>svg:last-child]:hidden",
          className,
        )}
      >
        <SelectValue placeholder={placeholder} />
        <Icon
          name={arrow === "lg" ? "arrow-down-lg" : arrow === "xl" ? "arrow-down-xl" : "arrow-ens"}
        />
      </SelectTrigger>
      <SelectContent position="popper">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
