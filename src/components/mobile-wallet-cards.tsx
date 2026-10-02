import { Icon } from "@/components/icon"
import { cn } from "@/lib/utils"

type WalletCardProps = {
  name: string
  lines: [string, string]
  selected: boolean
  onSelect: () => void
}

export function WalletCard({ name, lines, selected, onSelect }: WalletCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "relative block h-[93px] w-full rounded-[14px] bg-surface text-left",
        selected && "shadow-[0px_20px_20px_rgba(10,6,4,0.45)]",
      )}
    >
      <span className="absolute top-[39px] left-[19px]">
        <Icon name={selected ? "radio-selected" : "radio-muted"} />
      </span>
      <span className="absolute top-[15px] left-[54px] font-bold text-body-lg leading-4 text-foreground">
        {name}
      </span>
      <span className="absolute top-[38px] left-[54px] text-body-sm leading-[22px] text-text-secondary">
        {lines[0]}
        <br />
        {lines[1]}
      </span>
      <span aria-hidden="true" className="absolute top-[39px] right-[19px]">
        <Icon name="more-dots" />
      </span>
    </button>
  )
}

type WalletOptionProps = {
  id: string
  label: string
  initial?: string
  icon?: "wallet-mobile"
  selected: boolean
  onSelect: () => void
}

export function WalletOptionCard({
  id,
  label,
  initial,
  icon,
  selected,
  onSelect,
}: WalletOptionProps) {
  return (
    <label
      className={cn(
        "relative block h-[65px] w-full cursor-pointer rounded-[15px] bg-surface has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-highlight",
        selected
          ? "shadow-[0px_0px_40px_rgba(10,6,4,0.45)]"
          : "shadow-[0px_0px_20px_rgba(10,6,4,0.45)]",
      )}
    >
      <input
        type="radio"
        name="mobile-wallet"
        value={id}
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />
      <span className="absolute top-[13px] left-[14px] flex size-10 items-center justify-center">
        <span aria-hidden="true" className="absolute inset-0">
          <Icon name="wallet-avatar" />
        </span>
        {icon ? (
          <Icon name={icon} className="relative" />
        ) : (
          <span
            aria-hidden="true"
            className="relative font-bold text-body-sm leading-[normal] text-highlight"
          >
            {initial}
          </span>
        )}
      </span>
      <span className="absolute top-[25px] left-[65px] text-body-sm leading-4 text-foreground">
        {label}
      </span>
      <span aria-hidden="true" className="absolute top-[25px] right-[17px]">
        <Icon name={selected ? "radio-selected" : "radio-muted"} />
      </span>
    </label>
  )
}
