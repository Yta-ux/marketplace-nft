import { Icon } from "@/components/icon"
import { notifyUnavailable } from "@/lib/unavailable"
import { cn } from "@/lib/utils"

const providers = {
  google: { label: "Continuar com Google", icon: "google" as const, name: "O login com Google" },
  facebook: {
    label: "Continuar com Facebook",
    icon: "facebook-logo" as const,
    name: "O login com Facebook",
  },
}

export function SocialButton({
  provider,
  className,
}: {
  provider: keyof typeof providers
  className?: string
}) {
  const p = providers[provider]
  return (
    <button
      type="button"
      onClick={() => notifyUnavailable(p.name)}
      className={cn(
        "flex h-10 w-full items-center justify-center gap-3 overflow-clip rounded-[5px] border border-border font-medium text-caption-lg leading-4 text-text-secondary transition-colors hover:border-primary",
        className,
      )}
    >
      <Icon name={p.icon} />
      {p.label}
    </button>
  )
}

export function SocialDivider({
  gap = "md",
  className,
}: {
  gap?: "md" | "sm"
  className?: string
}) {
  return (
    <div className={cn("flex w-full items-center", gap === "md" ? "gap-3" : "gap-2.5", className)}>
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
      <span className="text-caption-lg leading-4 whitespace-nowrap text-foreground">
        Ou continue com
      </span>
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
    </div>
  )
}
