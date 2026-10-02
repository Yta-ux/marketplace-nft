import { SectionHeadingSkeleton } from "@/components/blocks"
import { Skeleton } from "@/components/ui/skeleton"

export function RelatedProductsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <section aria-busy="true" className="flex w-full flex-col gap-8">
      <SectionHeadingSkeleton />
      <ul className="grid w-full grid-cols-2 gap-6 md:grid-cols-3 xl:flex xl:justify-between xl:gap-0">
        {Array.from({ length: count }, (_, i) => `related-${i}`).map((key) => (
          <li key={key} className="flex flex-col gap-3 xl:w-[219px]">
            <Skeleton className="h-[255px] w-full rounded-none" />
            <Skeleton className="h-4 w-32 rounded-xs" />
            <Skeleton className="h-4 w-20 rounded-xs" />
          </li>
        ))}
      </ul>
    </section>
  )
}
