import Big from "big.js"
import { useEffect, useState } from "react"
import {
  type NftCategory,
  type NftChain,
  type NftFacets,
  type NftListQuery,
  nftCategorySchema,
  nftChainSchema,
} from "@/api/contracts"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { categoryLabels, chainLabels } from "@/lib/catalog-labels"
import { formatEthPtBr } from "@/lib/format"

type CatalogFiltersProps = {
  query: NftListQuery
  facets: NftFacets | undefined
  onChange: (patch: Partial<NftListQuery>) => void
}

export function CatalogFilters({ query, facets, onChange }: CatalogFiltersProps) {
  return (
    <div className="flex w-full flex-col overflow-clip bg-surface p-5 lg:w-[310px]">
      <div className="flex w-full flex-col gap-10">
        <CheckboxGroup
          title="Coleções"
          options={nftCategorySchema.options}
          labels={categoryLabels}
          selected={query.categories ?? []}
          counts={facets?.categories}
          boldCounts
          listClassName="px-3"
          onToggle={(categories) => onChange({ categories: categories as NftCategory[] })}
        />
        <PriceFilter query={query} range={facets?.priceRange} onChange={onChange} />
        <CheckboxGroup
          title="Rede"
          options={nftChainSchema.options}
          labels={chainLabels}
          selected={query.chains ?? []}
          counts={facets?.chains}
          listClassName="pl-3"
          onToggle={(chains) => onChange({ chains: chains as NftChain[] })}
        />
      </div>
    </div>
  )
}

type CheckboxGroupProps<T extends string> = {
  title: string
  options: readonly T[]
  labels: Record<T, string>
  selected: readonly T[]
  counts: Record<T, number> | undefined
  boldCounts?: boolean
  listClassName: string
  onToggle: (next: T[]) => void
}

function CheckboxGroup<T extends string>({
  title,
  options,
  labels,
  selected,
  counts,
  boldCounts,
  listClassName,
  onToggle,
}: CheckboxGroupProps<T>) {
  return (
    <fieldset className="flex w-full min-w-0 flex-col gap-3">
      <legend className="mb-3 font-bold text-title-sm leading-4 text-foreground">{title}</legend>
      <ul className={`flex w-full flex-col ${listClassName}`}>
        {options.map((option) => {
          const checked = selected.includes(option)
          return (
            <li key={option}>
              <label
                className={`flex w-full cursor-pointer items-start justify-between rounded-xs text-body leading-10 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-highlight ${
                  checked ? "text-highlight" : "text-text-secondary hover:text-foreground"
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() =>
                    onToggle(
                      checked
                        ? selected.filter((value) => value !== option)
                        : [...selected, option],
                    )
                  }
                />
                <span>{labels[option]}</span>
                {counts ? (
                  <span className={`text-right ${boldCounts ? "font-bold" : ""}`}>
                    ({counts[option]})<span className="sr-only"> NFTs</span>
                  </span>
                ) : (
                  <Skeleton className="mt-3 h-4 w-9" />
                )}
              </label>
            </li>
          )
        })}
      </ul>
    </fieldset>
  )
}

const toCents = (value: string, mode: "floor" | "ceil") =>
  new Big(value)
    .times(100)
    .round(0, mode === "floor" ? Big.roundDown : Big.roundUp)
    .toNumber()
const fromCents = (cents: number) => new Big(cents).div(100).toFixed(2)

function PriceFilter({
  query,
  range,
  onChange,
}: {
  query: NftListQuery
  range: NftFacets["priceRange"] | undefined
  onChange: CatalogFiltersProps["onChange"]
}) {
  const bounds: [number, number] | null = range
    ? [toCents(range.min, "floor"), toCents(range.max, "ceil")]
    : null
  const applied: [number, number] | null = bounds
    ? [
        query.minPrice ? toCents(query.minPrice, "floor") : bounds[0],
        query.maxPrice ? toCents(query.maxPrice, "ceil") : bounds[1],
      ]
    : null
  const [value, setValue] = useState<number[] | null>(applied)
  const appliedKey = applied?.join("-")

  useEffect(() => {
    if (appliedKey) setValue(appliedKey.split("-").map(Number))
  }, [appliedKey])

  function apply() {
    if (!bounds || !value) return
    const [low = bounds[0], high = bounds[1]] = value
    onChange({
      minPrice: low > bounds[0] ? fromCents(low) : undefined,
      maxPrice: high < bounds[1] ? fromCents(high) : undefined,
    })
  }

  return (
    <fieldset className="flex w-full min-w-0 flex-col gap-3">
      <legend className="mb-3 font-bold text-title-sm leading-4 text-foreground">
        Faixa de preço
      </legend>
      <div className="flex w-full flex-col items-start gap-3 pl-3">
        {bounds && value ? (
          <>
            <Slider
              min={bounds[0]}
              max={bounds[1]}
              step={1}
              minStepsBetweenThumbs={1}
              value={value}
              onValueChange={setValue}
              thumbLabels={["Preço mínimo", "Preço máximo"]}
              className="h-[15px]"
            />
            <p className="text-body leading-[normal] text-foreground" aria-live="polite">
              Preço: {formatEthPtBr(fromCents(value[0] ?? 0))} -{" "}
              {formatEthPtBr(fromCents(value[1] ?? 0))} ETH
            </p>
          </>
        ) : (
          <>
            <Skeleton className="h-[15px] w-full" />
            <Skeleton className="h-[18px] w-[214px]" />
          </>
        )}
        <Button variant="brand" size="compact" onClick={apply} disabled={!bounds}>
          Aplicar
        </Button>
      </div>
    </fieldset>
  )
}
