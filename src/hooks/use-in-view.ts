import { useCallback, useState } from "react"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

export function useInView<T extends Element>(threshold = 0.12) {
  const reduced = usePrefersReducedMotion()
  const [seen, setSeen] = useState(false)
  const supported = typeof IntersectionObserver !== "undefined"

  const ref = useCallback(
    (node: T | null) => {
      if (!node || !supported) return
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            setSeen(true)
            observer.disconnect()
          }
        },
        { threshold, rootMargin: "0px 0px -6% 0px" },
      )
      observer.observe(node)
    },
    [supported, threshold],
  )

  return { ref, visible: seen || reduced || !supported }
}
