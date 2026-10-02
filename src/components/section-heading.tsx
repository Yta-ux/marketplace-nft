import { Reveal } from "@/components/reveal"
import { cn } from "@/lib/utils"

type SectionHeadingProps = {
  children: string
  as?: "h2" | "h3"
  tone?: "accent" | "foreground"
  id?: string
  className?: string
}

export function SectionHeading({
  children,
  as: Tag = "h2",
  tone = "accent",
  id,
  className,
}: SectionHeadingProps) {
  return (
    <Reveal className={cn("flex w-full flex-col gap-3", className)}>
      <Tag
        id={id}
        className={cn(
          "font-bold leading-4",
          tone === "accent" ? "text-label text-highlight" : "text-title-sm text-foreground",
        )}
      >
        {children}
      </Tag>
      <div aria-hidden="true" className="h-[0.3px] w-full bg-primary" />
    </Reveal>
  )
}
