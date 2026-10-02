import { useRef, useState } from "react"
import type { NftListQuery } from "@/api/contracts"
import { CatalogSection } from "@/pages/home/components/catalog-section"
import { Hero } from "@/pages/home/components/hero"
import { HeroBanner } from "@/pages/home/components/hero-banner"
import { Journal } from "@/pages/home/components/journal"
import { Promos } from "@/pages/home/components/promos"
import { SearchBar } from "@/pages/home/components/search-bar"
import { heroSlides } from "@/pages/home/hero-slides"

type HomeViewProps = {
  query: NftListQuery
  onQueryChange: (patch: Partial<NftListQuery>, options?: { keepPage?: boolean }) => void
  onClearFilters: () => void
}

export function HomeView({ query, onQueryChange, onClearFilters }: HomeViewProps) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const returnFocus = useRef<HTMLElement | null>(null)

  return (
    <div className="flex flex-col gap-4 lg:gap-24 lg:pt-8">
      <SearchBar
        className="lg:hidden"
        defaultValue={query.q}
        onSearch={(q) => onQueryChange({ q: q || undefined })}
        onOpenFilters={() => {
          returnFocus.current =
            document.activeElement instanceof HTMLElement ? document.activeElement : null
          setFiltersOpen(true)
        }}
      />
      <HeroBanner slides={heroSlides} className="lg:hidden" />
      <Hero slides={heroSlides} />
      <CatalogSection
        query={query}
        onQueryChange={onQueryChange}
        onClearFilters={onClearFilters}
        filtersOpen={filtersOpen}
        onFiltersCloseAutoFocus={(event) => {
          event.preventDefault()
          returnFocus.current?.focus()
        }}
        onFiltersOpenChange={setFiltersOpen}
      />
      <Promos />
      <Journal />
    </div>
  )
}
