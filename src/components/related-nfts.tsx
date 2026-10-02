import { useQuery } from "@tanstack/react-query"
import type { NftCategory } from "@/api/contracts"
import { nftListQuerySchema } from "@/api/contracts"
import { RelatedProducts } from "@/components/related-products"
import { RelatedProductsSkeleton } from "@/components/related-products-skeleton"
import { relatedNftsQueryOptions } from "@/queries/catalog"

type RelatedNftsProps = {
  title: string
  variant?: "detail" | "cart"
  category?: NftCategory
  exclude: string[]
}

export function RelatedNfts({ title, variant = "detail", category, exclude }: RelatedNftsProps) {
  const query = nftListQuerySchema.parse({
    categories: category ? [category] : undefined,
    tab: category ? "all" : "trending",
    pageSize: 6,
  })
  const { data, isPending } = useQuery(
    relatedNftsQueryOptions(category ?? "trending", query, exclude),
  )
  if (isPending) return <RelatedProductsSkeleton />
  if (!data || data.length === 0) return null
  return <RelatedProducts title={title} items={data} variant={variant} />
}
