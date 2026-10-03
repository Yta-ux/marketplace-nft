import { RatingStars } from "@/pages/nft/components/rating-stars"
import { ReviewCard, type ReviewCardData } from "@/pages/nft/components/review-card"

export type ReviewsPanelData = {
  average: string
  roundedAverage: number
  count: number
  distribution: { stars: number; count: number }[]
  items: ReviewCardData[]
}

export function ReviewsPanel({ data }: { data: ReviewsPanelData }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6 bg-surface p-4 sm:flex-row sm:items-center sm:gap-12 sm:p-6">
        <div className="flex flex-col gap-2">
          <p className="font-bold text-heading-lg leading-[normal] text-highlight">
            {data.average}
            <span className="font-normal text-body text-text-secondary"> / 5</span>
          </p>
          <RatingStars
            value={data.roundedAverage}
            caption={`${data.count} ${data.count === 1 ? "avaliação" : "avaliações"}`}
          />
        </div>
        <ul className="flex flex-1 flex-col gap-2" aria-label="Distribuição das notas">
          {data.distribution.map((row) => (
            <li
              key={row.stars}
              className="flex items-center gap-3 text-caption text-text-secondary"
            >
              <span className="w-12 shrink-0 text-foreground">{row.stars} estrelas</span>
              <span
                aria-hidden="true"
                className="h-2 flex-1 overflow-hidden rounded-full bg-surface-dark"
              >
                <span
                  className="block h-full rounded-full bg-primary"
                  style={{ width: `${data.count === 0 ? 0 : (row.count / data.count) * 100}%` }}
                />
              </span>
              <span className="w-6 shrink-0 text-right">{row.count}</span>
            </li>
          ))}
        </ul>
      </div>
      <ul className="grid gap-4 md:grid-cols-2">
        {data.items.map((review) => (
          <li key={review.id} className="flex">
            <div className="w-full">
              <ReviewCard review={review} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
