import { type NftTab, nftTabSchema } from "@/api/contracts"
import { tabLabels } from "@/lib/catalog-labels"
import { cn } from "@/lib/utils"

type CatalogTabsProps = {
  value: NftTab
  onChange: (tab: NftTab) => void
  className?: string
}

export function CatalogTabs({ value, onChange, className }: CatalogTabsProps) {
  return (
    <ul
      aria-label="Seções do catálogo"
      className={cn(
        "flex flex-wrap items-start gap-x-4 gap-y-2 whitespace-nowrap text-body-sm lg:gap-5 lg:font-medium lg:text-body",
        className,
      )}
    >
      {nftTabSchema.options.map((tab, index) => {
        const active = value === tab
        return (
          <li key={tab} className={index === 0 ? "-mr-3 lg:mr-0" : undefined}>
            <button
              type="button"
              aria-pressed={active}
              onClick={() => onChange(tab)}
              className={cn(
                "relative block pb-1 leading-4 lg:pb-0",
                active
                  ? "font-bold text-highlight lg:font-medium"
                  : "font-normal text-foreground hover:text-highlight",
              )}
            >
              {tabLabels[tab]}
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute top-[18px] left-0 h-0.5 w-full bg-primary lg:top-[22px] lg:w-[101px]"
                />
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
