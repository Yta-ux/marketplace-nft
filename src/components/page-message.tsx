import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type PageMessageProps = {
  title: string
  text?: string
  action?: { label: string; onClick: () => void }
  role?: "alert"
  className?: string
}

export function PageMessage({ title, text, action, role, className }: PageMessageProps) {
  return (
    <div
      role={role}
      className={cn(
        "flex min-h-[300px] flex-col items-start justify-center gap-4 bg-surface p-8",
        className,
      )}
    >
      <p className="font-bold text-title-sm text-foreground">{title}</p>
      {text && <p className="text-body-sm text-text-secondary">{text}</p>}
      {action && (
        <Button variant="brand" size="compact" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
