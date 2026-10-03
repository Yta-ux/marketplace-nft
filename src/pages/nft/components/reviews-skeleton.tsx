import { LoadingRegion, TextLines } from "@/components/blocks"
import { Skeleton } from "@/components/ui/skeleton"

export function ReviewsSkeleton() {
  return (
    <LoadingRegion label="Carregando avaliações">
      <div className="flex flex-col gap-6">
        <Skeleton className="h-[120px] w-full rounded-none" />
        <div className="grid gap-4 md:grid-cols-2">
          {["r1", "r2", "r3", "r4"].map((key) => (
            <div key={key} className="flex flex-col gap-3 bg-surface p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <Skeleton className="h-4 w-32 rounded-xs" />
              </div>
              <Skeleton className="h-4 w-24 rounded-xs" />
              <TextLines lines={3} />
            </div>
          ))}
        </div>
      </div>
    </LoadingRegion>
  )
}
