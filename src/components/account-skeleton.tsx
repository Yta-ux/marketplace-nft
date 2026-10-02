import { FieldSkeleton, LoadingRegion } from "@/components/blocks"
import { Skeleton } from "@/components/ui/skeleton"

export function AccountFormSkeleton({ fields = 8, label }: { fields?: number; label: string }) {
  return (
    <LoadingRegion label={label}>
      <div className="flex min-w-0 flex-1 flex-col gap-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-44 rounded-xs" />
          <Skeleton className="h-3.5 w-3/4 rounded-xs" />
        </div>
        <div className="grid gap-x-7 gap-y-6 md:grid-cols-2">
          {Array.from({ length: fields }, (_, i) => `field-${i}`).map((key) => (
            <FieldSkeleton key={key} />
          ))}
        </div>
        <Skeleton className="h-10 w-[131px] rounded-[3px]" />
      </div>
    </LoadingRegion>
  )
}
