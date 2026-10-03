import { Icon } from "@/components/icon"
import { QuantityStepper } from "@/components/quantity-stepper"
import { Hairline } from "@/components/summary-rows"
import { Button } from "@/components/ui/button"
import { type EditionOption, EditionPills } from "@/pages/nft/components/edition-pills"
import { RatingStars } from "@/pages/nft/components/rating-stars"
import { ShareRow } from "@/pages/nft/components/share-row"

export type ProductInfoData = {
  name: string
  price: string
  rating: { value: number; caption: string }
  about: string
  shortAbout: string
  editions: EditionOption[]
  meta: { label: string; value: string }[]
}

type ProductInfoProps = {
  data: ProductInfoData
  edition: string
  onEditionChange: (id: string) => void
  quantity: number
  onQuantityChange: (quantity: number) => void
  maxQuantity?: number
  onBuy: () => void
  onFavorite: () => void
  favorited: boolean
  unavailableNote?: string
  pending?: boolean
}

export function ProductInfo({
  data,
  edition,
  onEditionChange,
  quantity,
  onQuantityChange,
  maxQuantity,
  onBuy,
  onFavorite,
  favorited,
  unavailableNote,
  pending,
}: ProductInfoProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6 self-stretch lg:min-h-[448px] lg:justify-between lg:gap-0">
      <div className="flex w-full flex-col gap-3">
        <div className="flex w-full flex-col gap-3">
          <h1 className="font-bold text-heading-lg leading-[normal] text-foreground">
            {data.name}
          </h1>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <p className="font-bold text-[22px] leading-4 whitespace-nowrap text-highlight">
              {data.price}
            </p>
            <RatingStars value={data.rating.value} caption={data.rating.caption} />
          </div>
        </div>
        <Hairline className="w-full lg:w-[573px] lg:max-w-full" />
      </div>
      <div className="flex w-full flex-col gap-3 lg:max-w-[574px]">
        <h2 className="font-bold text-body leading-4 text-foreground">Sobre este NFT:</h2>
        <p className="text-body-sm leading-6 text-text-secondary">{data.about}</p>
      </div>
      <div className="flex w-full flex-col gap-3 lg:w-[209px]">
        <p id="edition-label" className="font-bold text-body leading-4 text-foreground">
          Edição:
        </p>
        <EditionPills
          options={data.editions}
          value={edition}
          onChange={onEditionChange}
          label="Edição"
        />
      </div>
      <div className="flex w-full flex-wrap items-start justify-between gap-4">
        <QuantityStepper
          value={quantity}
          onChange={onQuantityChange}
          max={maxQuantity}
          label="Quantidade"
        />
        <div className="flex items-center gap-2">
          <Button
            variant="brand"
            size="detail"
            onClick={onBuy}
            disabled={Boolean(unavailableNote) || pending}
          >
            COMPRAR
          </Button>
          <Button
            variant="outline-brand"
            size="detail"
            className="font-medium"
            aria-pressed={favorited}
            onClick={onFavorite}
          >
            <Icon
              name={favorited ? "heart-filled-lg" : "heart-outline"}
              className={favorited ? "animate-heart-fill" : undefined}
            />
            {favorited ? "Favoritado" : "Favoritar"}
          </Button>
        </div>
      </div>
      {unavailableNote && (
        <p role="alert" className="text-body-sm leading-4 text-danger">
          {unavailableNote}
        </p>
      )}
      <div className="flex w-full flex-col gap-3 lg:w-[308px]">
        <dl className="flex flex-col gap-3 text-body leading-[normal] text-subtle">
          {data.meta.map((item) => (
            <div key={item.label}>
              <dt className="inline">{item.label}: </dt>
              <dd className="inline break-words">{item.value}</dd>
            </div>
          ))}
        </dl>
        <ShareRow title="Compartilhar este NFT:" />
      </div>
    </div>
  )
}
