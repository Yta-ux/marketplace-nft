import { LoadingRegion, SectionHeadingSkeleton, TextLines } from "@/components/blocks"
import { RelatedProductsSkeleton } from "@/components/related-products-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

function DesktopProduct() {
  return (
    <div className="hidden flex-col gap-3 lg:flex">
      <Skeleton className="h-4 w-56 rounded-xs" />
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="flex w-full max-w-[573px] gap-7 lg:h-[448px] lg:items-center">
          <div className="flex flex-col gap-4">
            {["a", "b", "c", "d"].map((key) => (
              <Skeleton key={key} className="size-[88px] rounded-lg" />
            ))}
          </div>
          <Skeleton className="aspect-square w-full max-w-[444px] rounded-[6px]" />
        </div>
        <div className="flex min-h-[448px] min-w-0 flex-1 flex-col justify-between">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-8 w-3/4 rounded-xs" />
            <Skeleton className="h-4 w-48 rounded-xs" />
            <Skeleton className="h-6 w-28 rounded-xs" />
          </div>
          <TextLines lines={3} className="lg:max-w-[573px]" />
          <div className="flex gap-3">
            {["e1", "e2", "e3", "e4"].map((key) => (
              <Skeleton key={key} className="h-9 w-[52px] rounded-xs" />
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {["m1", "m2", "m3"].map((key) => (
              <Skeleton key={key} className="h-4 w-64 rounded-xs" />
            ))}
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-[130px]" />
            <Skeleton className="h-10 w-[130px]" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
      </div>
    </div>
  )
}

function MobileProduct() {
  return (
    <div className="lg:hidden">
      <Skeleton className="h-[506px] w-full rounded-none" />
      <div className="relative -mt-[114px] flex flex-col gap-3 rounded-t-[31px] bg-surface px-6 pt-8 pb-6">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-5 w-40 rounded-xs" />
          <Skeleton className="h-4 w-16 rounded-xs" />
        </div>
        <TextLines lines={2} />
        <div className="flex gap-3">
          {["e1", "e2", "e3", "e4"].map((key) => (
            <Skeleton key={key} className="h-9 w-[52px] rounded-xs" />
          ))}
        </div>
        <TextLines lines={3} lastWidth="40%" />
      </div>
    </div>
  )
}

export function ProductSkeleton() {
  return (
    <LoadingRegion label="Carregando NFT">
      <div className="flex flex-col gap-12 pb-4 lg:gap-24 lg:pt-8 lg:pb-0">
        <MobileProduct />
        <DesktopProduct />
        <div className="flex flex-col gap-12 px-6 lg:contents">
          <section className="flex w-full flex-col gap-3">
            <SectionHeadingSkeleton />
            <TextLines lines={4} />
            <TextLines lines={4} lastWidth="55%" />
          </section>
          <RelatedProductsSkeleton />
        </div>
        <div className="fixed inset-x-0 bottom-0 z-40 h-[140px] bg-surface lg:hidden" />
      </div>
    </LoadingRegion>
  )
}
