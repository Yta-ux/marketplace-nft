import {
  createFileRoute,
  type SearchSchemaInput,
  stripSearchParams,
  useNavigate,
} from "@tanstack/react-router"
import {
  NFT_PAGE_SIZE,
  type NftListQuery,
  type NftListQueryInput,
  nftListQuerySchema,
} from "@/api/contracts"
import { HomeView } from "@/pages/home"

export const Route = createFileRoute("/")({
  validateSearch: (search: NftListQueryInput & SearchSchemaInput) =>
    nftListQuerySchema.parse(search),
  search: {
    middlewares: [
      stripSearchParams({ tab: "all", sort: "recent", page: 1, pageSize: NFT_PAGE_SIZE }),
    ],
  },
  component: HomePage,
})

function HomePage() {
  const query = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  function updateQuery(patch: Partial<NftListQuery>, options?: { keepPage?: boolean }) {
    void navigate({
      search: (prev) => ({ ...prev, ...patch, ...(options?.keepPage ? {} : { page: undefined }) }),
      resetScroll: false,
    })
  }

  return (
    <HomeView
      query={query}
      onQueryChange={updateQuery}
      onClearFilters={() => void navigate({ search: {}, resetScroll: false })}
    />
  )
}
