import { type FocusEvent, useCallback, useEffect, useState } from "react"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

const INTERVAL_MS = 5000

export function useCarousel(count: number) {
  const reducedMotion = usePrefersReducedMotion()
  const [index, setIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [userPaused, setUserPaused] = useState(false)

  const select = useCallback(
    (target: number) => setIndex(((target % count) + count) % count),
    [count],
  )

  const autoplay = !reducedMotion && count > 1
  const paused = hovered || focused || userPaused

  useEffect(() => {
    if (!autoplay || paused) return
    const timer = window.setTimeout(() => select(index + 1), INTERVAL_MS)
    return () => window.clearTimeout(timer)
  }, [autoplay, paused, index, select])

  return {
    index,
    autoplay,
    paused,
    userPaused,
    select,
    togglePause: () => setUserPaused((current) => !current),
    handlers: {
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      onFocus: (event: FocusEvent<HTMLElement>) =>
        setFocused(event.target.matches(":focus-visible")),
      onBlur: (event: FocusEvent<HTMLElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
      },
    },
  }
}

export type Carousel = ReturnType<typeof useCarousel>
