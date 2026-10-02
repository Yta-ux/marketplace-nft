import { FieldSkeleton, LoadingRegion, SummaryRowsSkeleton } from "@/components/blocks"
import { Skeleton } from "@/components/ui/skeleton"

export function CheckoutSkeleton() {
  return (
    <LoadingRegion label="Carregando pagamento">
      <div className="flex min-h-dvh flex-col gap-4 bg-ink px-7 py-8 lg:hidden">
        <Skeleton className="size-11 rounded-full" />
        <Skeleton className="h-5 w-44 rounded-xs" />
        <Skeleton className="h-[93px] w-full rounded-[14px]" />
        <Skeleton className="h-[93px] w-full rounded-[14px]" />
        <Skeleton className="h-5 w-36 rounded-xs" />
        {["w1", "w2", "w3"].map((key) => (
          <Skeleton key={key} className="h-[65px] w-full rounded-[15px]" />
        ))}
        <Skeleton className="mt-auto h-[60px] w-full rounded-[40px]" />
      </div>
      <div className="hidden flex-col gap-8 pt-8 lg:flex">
        <Skeleton className="h-4 w-56 rounded-xs" />
        <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <Skeleton className="h-4 w-48 rounded-xs" />
            <div className="flex flex-col gap-6">
              {["r1", "r2", "r3"].map((key) => (
                <div key={key} className="flex flex-col gap-6 md:flex-row">
                  <FieldSkeleton />
                  <FieldSkeleton />
                </div>
              ))}
            </div>
          </div>
          <div className="flex w-full flex-col gap-3 xl:w-[405px]">
            <Skeleton className="h-4 w-32 rounded-xs" />
            {["i1", "i2"].map((key) => (
              <Skeleton key={key} className="h-[70px] w-full rounded-none" />
            ))}
            <SummaryRowsSkeleton rows={4} />
            <Skeleton className="h-[45px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    </LoadingRegion>
  )
}
