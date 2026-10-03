import { Skeleton } from "@/components/ui/skeleton"

export function ReceiptSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Carregando comprovante">
      <div className="flex h-[156px] w-full flex-col items-center justify-center gap-4">
        <Skeleton className="size-12 rounded-full" />
        <Skeleton className="h-4 w-60 rounded-xs" />
      </div>
      <div aria-hidden="true" className="h-px w-full bg-primary" />
      <div className="flex flex-col gap-4 px-6 py-6 sm:px-9">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {["t1", "t2", "t3", "t4"].map((key) => (
            <Skeleton key={key} className="h-10 w-full rounded-xs" />
          ))}
        </div>
        {["i1", "i2"].map((key) => (
          <Skeleton key={key} className="h-[70px] w-full rounded-none" />
        ))}
        <Skeleton className="h-4 w-full rounded-xs" />
        <Skeleton className="h-4 w-2/3 rounded-xs" />
        <Skeleton className="h-[52px] w-full rounded-[5px]" />
      </div>
    </div>
  )
}
