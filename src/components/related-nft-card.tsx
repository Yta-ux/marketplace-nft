import { Link } from "@tanstack/react-router"
import type { NftSummary } from "@/api/contracts"
import { formatEth } from "@/lib/format"
import { cn } from "@/lib/utils"

export type RelatedNft = {
  id: string
  name: string
  price: string
  image: { url: string; alt: string }
}

type RelatedNftCardProps = {
  nft: Pick<NftSummary, "id" | "name" | "image" | "priceFrom">
  variant?: "detail" | "cart"
  className?: string
}

export function RelatedNftCard({ nft, variant = "detail", className }: RelatedNftCardProps) {
  return (
    <article
      className={cn(
        "group relative flex w-full flex-col xl:w-[219px]",
        variant === "detail" ? "gap-3" : "gap-2",
        className,
      )}
    >
      <div className="flex h-[255px] w-full items-center justify-center bg-surface">
        <img
          src={nft.image.url}
          alt={nft.image.alt}
          width={212}
          height={212}
          loading="lazy"
          decoding="async"
          className={cn(
            "size-[212px] object-cover transition-[transform,filter] duration-300 group-hover:scale-[1.02] group-hover:brightness-110",
            variant === "detail" ? "rounded-[13px]" : "rounded-[17px]",
          )}
        />
      </div>
      <div className={cn("flex flex-col", variant === "cart" && "gap-2")}>
        <h3 className="text-body leading-[normal] text-foreground">
          <Link
            to="/nfts/$nftId"
            params={{ nftId: nft.id }}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-has-[a:focus-visible]:underline"
          >
            {nft.name}
          </Link>
        </h3>
        <p className="font-bold text-body-lg leading-4 whitespace-nowrap text-highlight">
          {formatEth(nft.priceFrom)}
        </p>
      </div>
    </article>
  )
}
