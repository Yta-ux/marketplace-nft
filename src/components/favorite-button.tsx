import { Icon } from "@/components/icon"
import { cn } from "@/lib/utils"

type FavoriteButtonProps = {
  nftName: string
  pressed: boolean
  onToggle: () => void
  size?: "md" | "lg"
  className?: string
}

export function FavoriteButton({
  nftName,
  pressed,
  onToggle,
  size = "md",
  className,
}: FavoriteButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={`${pressed ? "Remover dos favoritos" : "Adicionar aos favoritos"}: ${nftName}`}
      onClick={onToggle}
      className={cn(
        "relative z-10 block rounded-full",
        size === "lg" ? "size-[30px]" : "size-7",
        className,
      )}
    >
      <Icon name={size === "lg" ? "favorite-lg" : "favorite"} />
      {pressed && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-px flex items-center justify-center rounded-full bg-surface-raised"
        >
          <Icon name="heart-filled" className="animate-heart-fill" />
        </span>
      )}
    </button>
  )
}
