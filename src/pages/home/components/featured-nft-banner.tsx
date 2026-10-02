import { Link } from "@tanstack/react-router"
import { Skeleton } from "@/components/ui/skeleton"

export type FeaturedNftBannerProps = {
  nft: { id: string; image: { url: string; alt: string } } | null
}

const glow =
  "bg-[linear-gradient(145.46deg,rgba(210,138,76,0.3)_46.085%,rgba(210,138,76,0)_103.28%)]"

export function FeaturedNftBanner({ nft }: FeaturedNftBannerProps) {
  return (
    <section
      aria-labelledby="featured-title"
      className="relative flex h-[470px] w-full overflow-clip bg-gradient-to-b from-primary/10 to-primary/[0.03] pt-6 pb-1 lg:w-[310px]"
    >
      <div className="flex w-full flex-col gap-4">
        <div className="flex w-full flex-col items-center gap-4">
          <h2 id="featured-title" className="w-full px-5 font-bold text-heading text-highlight">
            NFT EM DESTAQUE
          </h2>
          <p className="w-full px-5 text-center font-bold text-title text-foreground">
            OFERTA LIMITADA
          </p>
        </div>
        {nft ? (
          <Link
            to="/nfts/$nftId"
            params={{ nftId: nft.id }}
            className="block h-[368px] w-full overflow-hidden rounded-feature"
          >
            <img
              src={nft.image.url}
              alt={`${nft.image.alt} — ver detalhes`}
              width={310}
              height={368}
              loading="lazy"
              className="size-full rounded-feature object-cover"
            />
          </Link>
        ) : (
          <Skeleton className="h-[368px] w-full rounded-feature" />
        )}
      </div>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-[299px] left-4 size-[22px] rounded-[7px] border-2 border-[#46a358] opacity-20"
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute top-[343px] left-[248px] size-[45px] rounded-[29px] ${glow}`}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute top-[105px] left-[38px] size-[15px] rounded-[29px] ${glow}`}
      />
    </section>
  )
}
