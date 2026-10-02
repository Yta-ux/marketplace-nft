import { Button } from "@/components/ui/button"

export function AccountError({ title, onRetry }: { title: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex min-h-[200px] min-w-0 flex-1 flex-col items-start justify-center gap-4 bg-surface p-8"
    >
      <p className="font-bold text-title-sm text-foreground">{title}</p>
      <p className="text-body-sm text-text-secondary">Verifique sua conexão e tente novamente.</p>
      <Button type="button" variant="brand" size="compact" onClick={onRetry}>
        Tentar novamente
      </Button>
    </div>
  )
}
