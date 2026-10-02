import type { CSSProperties, ElementType, ReactNode } from "react"
import { useInView } from "@/hooks/use-in-view"
import { cn } from "@/lib/utils"

type RevealProps = {
  as?: ElementType
  delay?: number
  className?: string
  children: ReactNode
}

export function Reveal({ as: Tag = "div", delay = 0, className, children }: RevealProps) {
  const { ref, visible } = useInView<HTMLElement>()
  return (
    <Tag
      ref={ref}
      data-visible={visible}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
      className={cn("reveal", className)}
    >
      {children}
    </Tag>
  )
}
