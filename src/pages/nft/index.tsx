import { useQuery } from "@tanstack/react-query"
import { Link, useNavigate, useParams } from "@tanstack/react-router"
import { useState } from "react"
import type { NftDetail } from "@/api/contracts"
import { ApiError } from "@/api/errors"
import { Breadcrumb } from "@/components/breadcrumb"
import { PageMessage } from "@/components/page-message"
import { RelatedNfts } from "@/components/related-nfts"
import { chainLabels } from "@/lib/catalog-labels"
import { formatEth } from "@/lib/format"
import { MobileBuyBar } from "@/pages/nft/components/mobile-buy-bar"
import { MobileProductHero, MobileProductSheet } from "@/pages/nft/components/mobile-product-hero"
import { NftReviews } from "@/pages/nft/components/nft-reviews"
import {
  ProductDescription,
  type ProductDescriptionData,
} from "@/pages/nft/components/product-description"
import { ProductGallery } from "@/pages/nft/components/product-gallery"
import { ProductInfo, type ProductInfoData } from "@/pages/nft/components/product-info"
import { ProductSkeleton } from "@/pages/nft/components/product-skeleton"
import { useAddToCart } from "@/queries/cart"
import { nftDetailQueryOptions } from "@/queries/catalog"
import { useFavorites } from "@/queries/favorites"

const SHORT_ABOUT_LENGTH = 140

function shorten(text: string): string {
  if (text.length <= SHORT_ABOUT_LENGTH) return text
  return `${text.slice(0, SHORT_ABOUT_LENGTH).trimEnd()}…`
}

function toDescription(nft: NftDetail): ProductDescriptionData {
  return {
    reviewsLabel: `Avaliações de colecionadores (${nft.rating.count})`,
    reviewsShortLabel: `Avaliações (${nft.rating.count})`,
    paragraphs: nft.description.split(/\n{2,}/).filter(Boolean),
    facts: [
      { label: "Rede:", value: `Cunhado na ${chainLabels[nft.chain]}.` },
      { label: "Contrato:", value: `${nft.contractAddress} • ${nft.tokenStandard}` },
      { label: "Criador:", value: nft.creator.name },
    ],
  }
}

function formatTag(tag: string): string {
  const text = tag.replace(/-/g, " ")
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function toMeta(nft: NftDetail): ProductInfoData["meta"] {
  const meta = [
    { label: "ID do token", value: nft.tokenId },
    { label: "Coleção", value: nft.collection },
  ]
  if (nft.tags.length > 0) {
    meta.push({ label: "Atributos", value: nft.tags.map(formatTag).join(", ") })
  }
  return meta
}

function ratingCaption(count: number): string {
  if (count === 0) return "Sem avaliações ainda"
  return `${count} ${count === 1 ? "avaliação de colecionador" : "avaliações de colecionadores"}`
}

export function NftDetailPage() {
  const { nftId } = useParams({ from: "/nfts/$nftId" })
  const { data: nft, isPending, error, refetch } = useQuery(nftDetailQueryOptions(nftId))

  if (isPending) return <ProductSkeleton />

  if (!nft) {
    const notFound = error instanceof ApiError && error.code === "NOT_FOUND"
    return (
      <div className="flex flex-col gap-4 px-6 pt-8 lg:px-0">
        <PageMessage
          role="alert"
          title={notFound ? "NFT não encontrado." : "Não foi possível carregar este NFT."}
          text={
            notFound
              ? "O endereço acessado não existe ou foi removido."
              : "Verifique sua conexão e tente novamente."
          }
          action={
            notFound ? undefined : { label: "Tentar novamente", onClick: () => void refetch() }
          }
        />
        <Link to="/" className="font-bold text-body-lg text-highlight hover:underline">
          Voltar para o início
        </Link>
      </div>
    )
  }

  return <NftDetailView key={nft.id} nft={nft} />
}

function NftDetailView({ nft }: { nft: NftDetail }) {
  const navigate = useNavigate()
  const addToCart = useAddToCart()
  const favorites = useFavorites()
  const [selectedEdition, setSelectedEdition] = useState<string | null>(null)
  const [requested, setRequested] = useState(1)

  const edition =
    nft.editions.find((item) => item.id === selectedEdition) ??
    nft.editions.find((item) => item.id === nft.defaultEditionId) ??
    nft.editions[0]
  const maxQuantity = Math.max(1, Math.min(edition?.maxPerOrder ?? 1, edition?.available ?? 1))
  const quantity = Math.min(requested, maxQuantity)
  const soldOut = !edition || edition.available === 0
  const favorited = favorites.isFavorite(nft.id)
  const toggleFavorite = () => favorites.toggle(nft.id)

  const info: ProductInfoData = {
    name: nft.name,
    price: formatEth(edition?.price ?? nft.priceFrom),
    rating: { value: Math.round(nft.rating.average), caption: ratingCaption(nft.rating.count) },
    about: nft.description,
    shortAbout: shorten(nft.description),
    editions: nft.editions.map((item) => ({ id: item.id, label: item.label })),
    meta: toMeta(nft),
  }
  const images = nft.gallery.map((image, index) => ({
    id: `${index}`,
    url: image.url,
    alt: image.alt,
  }))
  const unavailableNote = soldOut ? "Esta edição está esgotada." : undefined

  const add = () => {
    if (!edition || soldOut) return Promise.reject(new Error("unavailable"))
    return addToCart.mutateAsync({ nftId: nft.id, editionId: edition.id, quantity })
  }
  const buy = () =>
    void add()
      .then(() => navigate({ to: "/cart" }))
      .catch(() => undefined)

  return (
    <div className="flex flex-col lg:gap-24 lg:pt-8">
      <div className="lg:hidden">
        <MobileProductHero
          image={images[0] ?? { id: "0", url: nft.image.url, alt: nft.image.alt }}
          favorited={favorited}
          onFavorite={toggleFavorite}
        />
        <MobileProductSheet
          name={info.name}
          rating={{ score: nft.rating.average.toFixed(1), count: nft.rating.count }}
          about={info.shortAbout}
          editions={info.editions}
          edition={edition?.id ?? ""}
          onEditionChange={setSelectedEdition}
          meta={info.meta}
          unavailableNote={unavailableNote}
        />
      </div>
      <div className="hidden flex-col gap-3 lg:flex">
        <Breadcrumb items={[{ label: "Início", link: { to: "/" } }, { label: "Mercado" }]} />
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <ProductGallery
            name={info.name}
            images={images}
            favorited={favorited}
            onToggleFavorite={toggleFavorite}
          />
          <ProductInfo
            data={info}
            edition={edition?.id ?? ""}
            onEditionChange={setSelectedEdition}
            quantity={quantity}
            onQuantityChange={setRequested}
            maxQuantity={maxQuantity}
            onBuy={buy}
            onFavorite={toggleFavorite}
            favorited={favorited}
            unavailableNote={unavailableNote}
            pending={addToCart.isPending}
          />
        </div>
      </div>
      <div className="bg-surface px-6 pb-8 lg:contents">
        <ProductDescription data={toDescription(nft)} reviews={<NftReviews nftId={nft.id} />} />
      </div>
      <div className="px-6 pt-12 lg:contents">
        <RelatedNfts title="Mais desta coleção" category={nft.category} exclude={[nft.id]} />
      </div>
      <MobileBuyBar
        price={info.price}
        quantity={quantity}
        onQuantityChange={setRequested}
        maxQuantity={maxQuantity}
        onBuy={buy}
        onAddToCart={() => void add().catch(() => undefined)}
        disabled={soldOut || addToCart.isPending}
      />
    </div>
  )
}
