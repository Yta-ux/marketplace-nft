import { Icon } from "@/components/icon"

export function ReviewPill({ score, count }: { score: string; count: number }) {
  return (
    <span
      role="img"
      aria-label={`Nota ${score} de 5, ${count} avaliações`}
      className="flex h-[27px] w-[80.16px] shrink-0 items-center rounded-[32px] border border-primary pl-[5.58px] text-body-sm leading-4 whitespace-nowrap"
    >
      <Icon name="star-amber" />
      <span aria-hidden="true" className="ml-1 font-medium text-foreground">
        {score}
      </span>
      <span aria-hidden="true" className="text-text-secondary">
        ({count})
      </span>
    </span>
  )
}
