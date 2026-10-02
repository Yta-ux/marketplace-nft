import { Icon } from "@/components/icon"

type PaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

const MAX_BUTTONS = 5

function pageWindow(page: number, totalPages: number): number[] {
  if (totalPages <= MAX_BUTTONS) return Array.from({ length: totalPages }, (_, i) => i + 1)
  const start = Math.min(Math.max(1, page - 2), totalPages - MAX_BUTTONS + 1)
  return Array.from({ length: MAX_BUTTONS }, (_, i) => start + i)
}

const boxClass = "flex size-[35px] items-center justify-center rounded-xs text-title-sm leading-4"

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null
  return (
    <nav aria-label="Paginação do catálogo">
      <ul className="flex items-center gap-2">
        {page > 1 && (
          <li>
            <ArrowButton direction="previous" onClick={() => onPageChange(page - 1)} />
          </li>
        )}
        {pageWindow(page, totalPages).map((n) => (
          <li key={n}>
            <button
              type="button"
              aria-current={n === page ? "page" : undefined}
              aria-label={`Página ${n}`}
              onClick={() => onPageChange(n)}
              className={
                n === page
                  ? `${boxClass} bg-primary font-bold text-ink`
                  : `${boxClass} border border-border pt-2 pb-2.5 font-normal text-foreground hover:border-primary hover:text-highlight`
              }
            >
              {n}
            </button>
          </li>
        ))}
        {page < totalPages && (
          <li>
            <ArrowButton direction="next" onClick={() => onPageChange(page + 1)} />
          </li>
        )}
      </ul>
    </nav>
  )
}

function ArrowButton({
  direction,
  onClick,
}: {
  direction: "previous" | "next"
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "next" ? "Próxima página" : "Página anterior"}
      className={`${boxClass} border border-border p-2 hover:border-primary`}
    >
      <Icon name={direction === "next" ? "chevron-right" : "chevron-left"} />
    </button>
  )
}
