import { useEffect, useState } from "react"

const OFFSET = 140

export function useScrollState(sectionId: string, enabled: boolean) {
  const [scrolled, setScrolled] = useState(false)
  const [inSection, setInSection] = useState(false)

  useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
      setScrolled(window.scrollY > 8)
      if (!enabled) {
        setInSection(false)
        return
      }
      const rect = document.getElementById(sectionId)?.getBoundingClientRect()
      setInSection(Boolean(rect && rect.top <= OFFSET && rect.bottom > OFFSET))
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [sectionId, enabled])

  return { scrolled, inSection }
}
