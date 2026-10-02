import { useQuery } from "@tanstack/react-query"
import { FeaturedNftBanner } from "@/pages/home/components/featured-nft-banner"
import { featuredNftsQueryOptions } from "@/queries/catalog"

export function FeaturedNft() {
  const { data, isError } = useQuery(featuredNftsQueryOptions())
  const nft = data?.items[0]
  if (isError || (data && !nft)) return null
  return <FeaturedNftBanner nft={nft ?? null} />
}
