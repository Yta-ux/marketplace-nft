import { Icon } from "@/components/icon"

type RatingStarsProps = {
  value: number
  max?: number
  caption: string
}

export function RatingStars({ value, max = 5, caption }: RatingStarsProps) {
  const positions = [...Array(max).keys()]
  return (
    <div className="flex items-center gap-1">
      <span role="img" aria-label={`Nota ${value} de ${max}`} className="flex gap-1">
        {positions.map((i) => (
          <Icon key={i} name={i < value ? "star" : "star-empty"} />
        ))}
      </span>
      <p className="text-body leading-[normal] whitespace-nowrap text-foreground">{caption}</p>
    </div>
  )
}
