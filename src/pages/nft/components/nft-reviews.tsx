import { useQuery } from "@tanstack/react-query"
import type { ReviewsResponse } from "@/api/contracts"
import { PageMessage } from "@/components/page-message"
import { ReviewsPanel, type ReviewsPanelData } from "@/pages/nft/components/reviews-panel"
import { ReviewsSkeleton } from "@/pages/nft/components/reviews-skeleton"
import { nftReviewsQueryOptions } from "@/queries/catalog"

const dateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "UTC" })

function toPanel(data: ReviewsResponse): ReviewsPanelData {
  const { summary } = data
  return {
    average: summary.average.toFixed(1).replace(".", ","),
    roundedAverage: Math.round(summary.average),
    count: summary.count,
    distribution: ([5, 4, 3, 2, 1] as const).map((stars) => ({
      stars,
      count: summary.distribution[stars],
    })),
    items: data.items.map((review) => ({
      id: review.id,
      author: review.author.name,
      rating: review.rating,
      date: dateFormat.format(new Date(review.createdAt)),
      title: review.title,
      body: review.body,
    })),
  }
}

export function NftReviews({ nftId }: { nftId: string }) {
  const { data, isPending, isError, refetch } = useQuery(nftReviewsQueryOptions(nftId))

  if (isPending) return <ReviewsSkeleton />
  if (isError || !data) {
    return (
      <PageMessage
        role="alert"
        title="Não foi possível carregar as avaliações."
        text="Verifique sua conexão e tente novamente."
        action={{ label: "Tentar novamente", onClick: () => void refetch() }}
      />
    )
  }
  if (data.summary.count === 0) {
    return (
      <PageMessage
        title="Ainda não há avaliações."
        text="Este NFT ainda não foi avaliado por colecionadores."
      />
    )
  }
  return <ReviewsPanel data={toPanel(data)} />
}
