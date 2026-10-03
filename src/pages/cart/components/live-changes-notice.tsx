import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type LiveChangesNoticeProps = {
  title: string
  changes: string[]
  onDismiss: () => void
  className?: string
}

export function LiveChangesNotice({
  title,
  changes,
  onDismiss,
  className,
}: LiveChangesNoticeProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col gap-3 rounded-sm border border-primary bg-surface p-4 text-body-sm leading-6 text-foreground",
        className,
      )}
    >
      <p className="font-bold">{title}</p>
      <ul className="flex list-disc flex-col gap-1 pl-5 text-text-secondary">
        {changes.map((change) => (
          <li key={change}>{change}</li>
        ))}
      </ul>
      <Button
        type="button"
        variant="outline-brand"
        size="compact"
        className="self-start"
        onClick={onDismiss}
      >
        Entendi
      </Button>
    </div>
  )
}
