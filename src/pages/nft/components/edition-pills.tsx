import { cn } from "@/lib/utils"

export type EditionOption = { id: string; label: string; width?: number }

type EditionPillsProps = {
  options: EditionOption[]
  value: string
  onChange: (id: string) => void
  label: string
  name?: string
  className?: string
}

export function EditionPills({
  options,
  value,
  onChange,
  label,
  name = "edition",
  className,
}: EditionPillsProps) {
  return (
    <fieldset
      className={cn("m-0 flex min-w-0 flex-wrap items-center gap-1.5 border-0 p-0", className)}
    >
      <legend className="sr-only">{label}</legend>
      {options.map((option) => {
        const active = option.id === value
        return (
          <label
            key={option.id}
            style={option.width ? { width: option.width } : undefined}
            className={cn(
              "flex h-7 cursor-pointer items-center justify-center rounded-[50%] border px-2 py-1.5 text-center text-body-sm leading-4 whitespace-nowrap has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-highlight",
              active
                ? "border-primary font-medium text-highlight"
                : "border-border font-normal text-text-secondary hover:border-primary",
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.id}
              checked={active}
              onChange={() => onChange(option.id)}
              className="sr-only"
            />
            {option.label}
          </label>
        )
      })}
    </fieldset>
  )
}
