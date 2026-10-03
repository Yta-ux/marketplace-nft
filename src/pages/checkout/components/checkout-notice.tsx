import { Button } from "@/components/ui/button"
import type { CheckoutProblem } from "@/pages/checkout/problems"

type CheckoutNoticeProps = {
  problem: CheckoutProblem
  onRefresh: () => void
  refreshing: boolean
}

export function CheckoutNotice({ problem, onRefresh, refreshing }: CheckoutNoticeProps) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-sm border border-primary bg-surface p-4 text-body-sm leading-6 text-foreground"
    >
      <p className="font-bold">{problem.message}</p>
      {problem.changes.length > 0 && (
        <ul className="flex list-disc flex-col gap-1 pl-5 text-text-secondary">
          {problem.changes.map((change) => (
            <li key={change}>{change}</li>
          ))}
        </ul>
      )}
      <Button
        type="button"
        variant="outline-brand"
        size="compact"
        className="self-start"
        onClick={onRefresh}
        disabled={refreshing}
      >
        Atualizar valores
      </Button>
    </div>
  )
}
