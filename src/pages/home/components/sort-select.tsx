import { useId } from "react"
import { type NftSort, nftSortSchema } from "@/api/contracts"
import { Icon } from "@/components/icon"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { sortLabels } from "@/lib/catalog-labels"
import { cn } from "@/lib/utils"

type SortSelectProps = {
  value: NftSort
  onChange: (sort: NftSort) => void
  className?: string
}

export function SortSelect({ value, onChange, className }: SortSelectProps) {
  const labelId = useId()
  return (
    <div
      className={cn(
        "flex h-[18px] shrink-0 items-center whitespace-nowrap text-body leading-[normal] text-foreground",
        className,
      )}
    >
      <span id={labelId} className="mr-px">
        Ordenar por:
      </span>
      <Select value={value} onValueChange={(sort) => onChange(nftSortSchema.parse(sort))}>
        <SelectTrigger
          aria-labelledby={labelId}
          className="h-[18px] gap-1 rounded-xs border-0 bg-transparent p-0 text-body leading-[normal] text-foreground hover:text-highlight dark:bg-transparent dark:hover:bg-transparent [&>svg:last-child]:hidden"
        >
          <SelectValue />
          <Icon name="arrow-down" />
        </SelectTrigger>
        <SelectContent position="popper" align="end">
          {nftSortSchema.options.map((sort) => (
            <SelectItem key={sort} value={sort}>
              {sortLabels[sort as NftSort]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
