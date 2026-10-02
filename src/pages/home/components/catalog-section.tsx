import { useQuery } from "@tanstack/react-query"
import type { NftListQuery } from "@/api/contracts"
import { PageMessage } from "@/components/page-message"
import { Reveal } from "@/components/reveal"
import { CatalogFilters } from "@/pages/home/components/catalog-filters"
import { CatalogTabs } from "@/pages/home/components/catalog-tabs"
import { FeaturedNft } from "@/pages/home/components/featured-nft"
import { FiltersSheet } from "@/pages/home/components/filters-sheet"
import { NftCard, NftCardSkeleton } from "@/pages/home/components/nft-card"
import { Pagination } from "@/pages/home/components/pagination"
import { SortSelect } from "@/pages/home/components/sort-select"
import { useAddToCart } from "@/queries/cart"
import { nftListQueryOptions } from "@/queries/catalog"
import { useFavorites } from "@/queries/favorites"

type CatalogSectionProps = {
  query: NftListQuery
  onQueryChange: (patch: Partial<NftListQuery>, options?: { keepPage?: boolean }) => void
  onClearFilters: () => void
  filtersOpen: boolean
  onFiltersCloseAutoFocus?: (event: Event) => void
  onFiltersOpenChange: (open: boolean) => void
}

const SKELETON_KEYS = Array.from({ length: 9 }, (_, i) => `skeleton-${i}`)
const gridClass =
  "grid grid-cols-2 gap-x-4 gap-y-6 pb-8 md:grid-cols-3 md:pb-0 lg:grid-cols-[repeat(auto-fill,minmax(258px,1fr))] lg:gap-x-[34px] lg:gap-y-[72px] [&>li:nth-child(even)]:translate-y-8 md:[&>li:nth-child(even)]:translate-y-0"

export function CatalogSection({
  query,
  onQueryChange,
  onClearFilters,
  filtersOpen,
  onFiltersCloseAutoFocus,
  onFiltersOpenChange,
}: CatalogSectionProps) {
  const { data, isPending, isError, isFetching, isPlaceholderData, refetch } = useQuery(
    nftListQueryOptions(query),
  )
  const updating = isFetching && isPlaceholderData
  const addToCart = useAddToCart()
  const favorites = useFavorites()

  function goToPage(page: number) {
    onQueryChange({ page }, { keepPage: true })
    document.getElementById("catalogo")?.scrollIntoView({ block: "start" })
  }

  return (
    <section
      id="catalogo"
      aria-labelledby="catalog-title"
      className="flex scroll-mt-6 flex-col gap-4 lg:flex-row lg:gap-12"
    >
      <h2 id="catalog-title" className="sr-only">
        Catálogo de NFTs
      </h2>
      <div className="hidden w-[310px] shrink-0 flex-col gap-6 lg:flex">
        <CatalogFilters query={query} facets={data?.facets} onChange={onQueryChange} />
        <FeaturedNft />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-4 lg:items-end lg:gap-[88px]">
        <div className="flex w-full flex-col gap-4 lg:gap-8">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <CatalogTabs value={query.tab} onChange={(tab) => onQueryChange({ tab })} />
            <SortSelect
              value={query.sort}
              onChange={(sort) => onQueryChange({ sort })}
              className="hidden lg:flex"
            />
          </div>
          <p className="sr-only" role="status">
            {data
              ? `${data.total} ${data.total === 1 ? "NFT encontrado" : "NFTs encontrados"}`
              : "Carregando NFTs"}
          </p>
          {isPending ? (
            <ul className={gridClass} aria-busy="true" aria-label="Carregando NFTs">
              {SKELETON_KEYS.map((key) => (
                <li key={key}>
                  <NftCardSkeleton />
                </li>
              ))}
            </ul>
          ) : isError && !data ? (
            <PageMessage
              title="Não foi possível carregar o catálogo."
              text="Verifique sua conexão e tente novamente."
              action={{ label: "Tentar novamente", onClick: () => void refetch() }}
              role="alert"
            />
          ) : data.items.length === 0 ? (
            <PageMessage
              title="Nenhum NFT encontrado."
              text={
                query.page > 1 && data.total > 0
                  ? "Esta página não existe para os filtros atuais."
                  : "Ajuste a busca ou os filtros para ver mais resultados."
              }
              action={{ label: "Limpar filtros", onClick: onClearFilters }}
            />
          ) : (
            <ul
              className={`${gridClass} transition-opacity ${updating ? "opacity-60" : ""}`}
              aria-busy={updating || undefined}
            >
              {data.items.map((nft, index) => (
                <Reveal as="li" key={nft.id} delay={(index % 3) * 90}>
                  <NftCard
                    nft={nft}
                    favorited={favorites.isFavorite(nft.id)}
                    onToggleFavorite={(item) => favorites.toggle(item.id)}
                    onAddToCart={(item) => {
                      if (item.defaultEditionId) {
                        addToCart.mutate({
                          nftId: item.id,
                          editionId: item.defaultEditionId,
                          quantity: 1,
                        })
                      }
                    }}
                    addToCartPending={addToCart.isPending}
                  />
                </Reveal>
              ))}
            </ul>
          )}
        </div>
        {data && (
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={goToPage} />
        )}
      </div>
      <FiltersSheet
        open={filtersOpen}
        onOpenChange={onFiltersOpenChange}
        onCloseAutoFocus={onFiltersCloseAutoFocus}
      >
        <SortSelect value={query.sort} onChange={(sort) => onQueryChange({ sort })} />
        <CatalogFilters query={query} facets={data?.facets} onChange={onQueryChange} />
      </FiltersSheet>
    </section>
  )
}
