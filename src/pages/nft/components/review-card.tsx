import { RatingStars } from "@/pages/nft/components/rating-stars"

export type ReviewCardData = {
  id: string
  author: string
  rating: number
  date: string
  title: string
  body: string
}

export function ReviewCard({ review }: { review: ReviewCardData }) {
  return (
    <article className="flex flex-col gap-3 bg-surface p-4 max-lg:rounded-[14px] max-lg:bg-surface-raised">
      <header className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-body-lg text-ink"
        >
          {review.author.charAt(0)}
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <p className="truncate font-bold text-body leading-4 text-foreground">{review.author}</p>
          <p className="text-caption leading-4 text-text-secondary">{review.date}</p>
        </div>
      </header>
      <RatingStars value={review.rating} caption={`${review.rating} de 5`} />
      <h3 className="font-bold text-body leading-4 text-foreground">{review.title}</h3>
      <p className="text-body-sm leading-6 text-text-secondary">{review.body}</p>
    </article>
  )
}
