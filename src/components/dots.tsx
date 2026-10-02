import { cn } from "@/lib/utils"

export function Dots({
  count,
  index,
  className,
}: {
  count: number
  index: number
  className?: string
}) {
  const positions = [...Array(count).keys()]
  return (
    <div aria-hidden="true" className={cn("flex gap-2", className)}>
      {positions.map((i) => (
        <span
          key={i}
          className={cn(
            "block size-3 rounded-full border-[1.3px] border-primary",
            i === index && "bg-primary",
          )}
        />
      ))}
    </div>
  )
}
