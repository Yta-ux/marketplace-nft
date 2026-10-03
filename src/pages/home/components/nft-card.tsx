import { Link } from "@tanstack/react-router"
import type { NftSummary } from "@/api/contracts"
import { FavoriteButton } from "@/components/favorite-button"
import { Icon } from "@/components/icon"
import { Skeleton } from "@/components/ui/skeleton"
import { formatEth } from "@/lib/format"
import { CardActionButton } from "@/pages/home/components/card-action-button"

type NftCardProps = {
  nft: NftSummary
  favorited?: boolean
  onToggleFavorite?: (nft: NftSummary) => void
  onAddToCart?: (nft: NftSummary) => void
  addToCartPending?: boolean
}

const badgeClass =
  "absolute top-4 left-0 flex h-8 items-center bg-primary pl-2 font-medium text-caption-lg leading-4 text-ink lg:top-3 lg:left-3 lg:h-auto lg:rounded-xs lg:bg-ink/85 lg:px-2 lg:py-1 lg:font-bold lg:text-caption lg:leading-[14px] lg:text-highlight"

export function NftCard({
  nft,
  favorited = false,
  onToggleFavorite,
  onAddToCart,
  addToCartPending,
}: NftCardProps) {
  const soldOut = nft.totalAvailable === 0
  return (
    <article className="group relative flex w-full flex-col gap-2 lg:gap-3">
      <div className="relative flex aspect-[175/200] w-full items-center justify-center overflow-clip rounded-[20px] transition-shadow duration-300 group-hover:shadow-card group-focus-within:shadow-card bg-[linear-gradient(139.55deg,var(--color-surface)_12%,var(--color-surface-raised)_106.59%)] lg:aspect-auto lg:h-[300px] lg:rounded-none lg:bg-surface lg:bg-none lg:px-1">
        <img
          src={nft.image.url}
          alt={nft.image.alt}
          width={250}
          height={250}
          loading="lazy"
          decoding="async"
          className="aspect-square w-[96%] rounded-2xl object-cover transition-[transform,filter] duration-300 group-hover:scale-[1.02] group-hover:brightness-110 lg:size-[250px] lg:w-[250px] lg:rounded-art"
        />
        {soldOut ? (
          <span className={`${badgeClass} w-[88px] lg:w-auto`}>ESGOTADO</span>
        ) : (
          nft.isRare && <span className={`${badgeClass} w-[68px] lg:hidden`}>RARO</span>
        )}
        {onAddToCart && onToggleFavorite && (
          <div className="absolute bottom-3 left-1/2 z-10 hidden -translate-x-1/2 translate-y-1 gap-2.5 opacity-0 transition-[opacity,translate] duration-200 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 lg:flex">
            <CardActionButton
              icon="cart-sm"
              label={`Adicionar ${nft.name} ao carrinho`}
              disabled={soldOut || !nft.defaultEditionId || addToCartPending}
              onClick={() => onAddToCart(nft)}
            />
            <CardActionButton
              icon={favorited ? "heart-filled-md" : "heart-sm"}
              iconClassName={favorited ? "animate-heart-fill" : undefined}
              label={`Favoritar ${nft.name}`}
              aria-pressed={favorited}
              onClick={() => onToggleFavorite(nft)}
            />
            <Link
              to="/nfts/$nftId"
              params={{ nftId: nft.id }}
              aria-label={`Ver detalhes de ${nft.name}`}
              title="Ver detalhes"
              className="flex size-[35px] items-center justify-center rounded-xs border border-border bg-surface-raised transition-colors hover:border-primary"
            >
              <Icon name="search-sm" />
            </Link>
          </div>
        )}
        {favorited && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-3 right-3 hidden size-7 items-center justify-center rounded-full border border-border bg-surface-raised lg:flex"
          >
            <Icon name="heart-filled" className="animate-heart-fill" />
          </span>
        )}
        {onToggleFavorite && (
          <FavoriteButton
            nftName={nft.name}
            pressed={favorited}
            onToggle={() => onToggleFavorite(nft)}
            className="absolute top-3 right-[11px] lg:hidden"
          />
        )}
      </div>
      <div className="flex flex-col pl-2 lg:gap-1.5 lg:pl-0">
        <h3 className="transition-colors duration-200 group-hover:text-highlight text-body leading-[normal] text-foreground lg:text-body-lg lg:leading-4">
          <Link
            to="/nfts/$nftId"
            params={{ nftId: nft.id }}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-has-[a:focus-visible]:underline"
          >
            {nft.name}
          </Link>
        </h3>
        <p className="flex items-center gap-3 whitespace-nowrap text-body-lg leading-4 lg:text-title-sm">
          <span className="font-bold text-highlight">
            <span className="sr-only">
              {nft.compareAtPrice ? "Preço promocional: " : "Preço: "}
            </span>
            {formatEth(nft.priceFrom)}
          </span>
          {nft.compareAtPrice && (
            <span className="text-subtle">
              <span className="sr-only">Preço original: </span>
              {formatEth(nft.compareAtPrice)}
            </span>
          )}
        </p>
      </div>
    </article>
  )
}

export function NftCardSkeleton() {
  return (
    <div className="flex w-full flex-col gap-2 lg:gap-3">
      <Skeleton className="aspect-[175/200] w-full rounded-[20px] lg:aspect-auto lg:h-[300px] lg:rounded-none" />
      <div className="flex flex-col gap-1.5 pl-2 lg:pl-0">
        <Skeleton className="h-4 w-[130px] lg:w-[164px]" />
        <Skeleton className="h-4 w-[72px] lg:w-[88px]" />
      </div>
    </div>
  )
}
