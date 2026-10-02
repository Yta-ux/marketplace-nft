import type { Carousel } from "@/hooks/use-carousel"
import { cn } from "@/lib/utils"

const sizes = {
  md: { row: "gap-2", dot: "size-2" },
  sm: { row: "gap-1.5", dot: "size-[7px]" },
}

type CarouselDotsProps = {
  count: number
  carousel: Carousel
  size?: keyof typeof sizes
  className?: string
}

export function CarouselDots({ count, carousel, size = "md", className }: CarouselDotsProps) {
  const { index, autoplay, userPaused, select, togglePause } = carousel
  const positions = [...Array(count).keys()]
  return (
    <div className={cn("relative flex items-center", sizes[size].row, className)}>
      {autoplay && (
        <button
          type="button"
          aria-pressed={userPaused}
          onClick={togglePause}
          className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:right-full focus-visible:mr-3 focus-visible:rounded-sm focus-visible:bg-surface focus-visible:px-2 focus-visible:py-1 focus-visible:text-caption focus-visible:whitespace-nowrap focus-visible:text-foreground"
        >
          {userPaused ? "Retomar rotação" : "Pausar rotação"}
        </button>
      )}
      {positions.map((i) => (
        <button
          key={i}
          type="button"
          aria-label={`Ir para o slide ${i + 1} de ${count}`}
          aria-current={i === index ? "true" : undefined}
          onClick={() => select(i)}
          className="relative block rounded-full after:absolute after:-inset-x-1 after:-inset-y-2 after:content-['']"
        >
          <span
            className={cn(
              "block rounded-full",
              sizes[size].dot,
              i === index ? "bg-primary" : "bg-primary/30",
            )}
          />
        </button>
      ))}
    </div>
  )
}
