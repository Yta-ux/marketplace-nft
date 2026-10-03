import { LoadingRegion, SummaryRowsSkeleton, TextLines } from "@/components/blocks"
import { RelatedProductsSkeleton } from "@/components/related-products-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

function RowSkeleton() {
  return (
    <li className="flex min-h-[70px] w-full items-center gap-4 bg-surface pr-6 xl:h-[70px]">
      <Skeleton className="size-[70px] shrink-0 rounded-[6px]" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-36 rounded-xs" />
        <Skeleton className="h-3.5 w-24 rounded-xs" />
      </div>
      <Skeleton className="hidden h-4 w-[77px] rounded-xs xl:block" />
      <Skeleton className="h-6 w-[75px] rounded-xs" />
      <Skeleton className="hidden h-4 w-[87px] rounded-xs xl:block" />
    </li>
  )
}

function MobileItemSkeleton() {
  return (
    <li className="flex h-[100px] w-full rounded-[14px] bg-surface shadow-[0px_6px_20px_rgba(10,6,4,0.45)]">
      <Skeleton className="size-[100px] shrink-0 rounded-l-[14px] rounded-r-none" />
      <div className="flex flex-1 flex-col justify-between py-[14px] pr-[42px] pl-[9px]">
        <Skeleton className="h-4 w-3/4 rounded-xs" />
        <Skeleton className="h-4 w-20 rounded-xs" />
      </div>
    </li>
  )
}

export function CartSkeleton() {
  return (
    <LoadingRegion label="Carregando carrinho">
      <div className="flex min-h-dvh flex-col gap-1 bg-ink pt-8 lg:hidden">
        <div className="flex flex-col gap-3 px-7">
          <Skeleton className="size-11 rounded-full" />
          <ul className="flex flex-col gap-5">
            {["m1", "m2", "m3"].map((key) => (
              <MobileItemSkeleton key={key} />
            ))}
          </ul>
        </div>
        <div className="mt-3 flex flex-1 flex-col gap-4 bg-surface px-7 py-6">
          <SummaryRowsSkeleton rows={4} />
          <Skeleton className="h-[60px] w-full rounded-[40px]" />
        </div>
      </div>
      <div className="hidden flex-col gap-24 pt-8 lg:flex">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-56 rounded-xs" />
          <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex w-full flex-col gap-3 xl:w-[782px]">
              <TextLines lines={1} lastWidth="100%" />
              <ul className="flex flex-col gap-3">
                {["d1", "d2", "d3"].map((key) => (
                  <RowSkeleton key={key} />
                ))}
              </ul>
            </div>
            <div className="flex w-full flex-col gap-6 xl:w-[332px]">
              <SummaryRowsSkeleton rows={4} />
              <Skeleton className="h-[45px] w-full rounded-lg" />
            </div>
          </div>
        </div>
        <RelatedProductsSkeleton />
      </div>
    </LoadingRegion>
  )
}
