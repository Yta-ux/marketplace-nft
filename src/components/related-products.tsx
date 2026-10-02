import type { NftSummary } from "@/api/contracts"
import { Dots } from "@/components/dots"
import { RelatedNftCard } from "@/components/related-nft-card"
import { Reveal } from "@/components/reveal"
import { SectionHeading } from "@/components/section-heading"

type RelatedProductsProps = {
  title: string
  items: NftSummary[]
  variant?: "detail" | "cart"
}

export function RelatedProducts({ title, items, variant = "detail" }: RelatedProductsProps) {
  return (
    <section aria-labelledby="related-heading" className="flex w-full flex-col gap-8">
      <SectionHeading id="related-heading">{title}</SectionHeading>
      <div className="flex flex-col items-center gap-8">
        <ul className="grid w-full grid-cols-2 gap-6 md:grid-cols-3 xl:flex xl:justify-between xl:gap-0">
          {items.map((nft, index) => (
            <Reveal as="li" key={nft.id} delay={index * 90}>
              <RelatedNftCard nft={nft} variant={variant} />
            </Reveal>
          ))}
        </ul>
        <Dots count={Math.min(items.length, 3)} index={Math.min(1, items.length - 1)} />
      </div>
    </section>
  )
}
