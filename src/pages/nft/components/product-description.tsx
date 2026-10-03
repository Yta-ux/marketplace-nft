import { type ReactNode, useState } from "react"
import { UnderlineTabs } from "@/pages/nft/components/underline-tabs"

export type ProductDescriptionData = {
  paragraphs: string[]
  facts: { label: string; value: string }[]
  reviewsLabel: string
  reviewsShortLabel: string
}

export function ProductDescription({
  data,
  reviews,
}: {
  data: ProductDescriptionData
  reviews: ReactNode
}) {
  const [tab, setTab] = useState("details")

  return (
    <section
      aria-labelledby="description-heading"
      className="flex w-full flex-col gap-3 max-lg:border-t max-lg:border-border-soft max-lg:pt-6"
    >
      <h2 id="description-heading" className="sr-only">
        Descrição e avaliações
      </h2>
      <UnderlineTabs
        label="Detalhes do NFT"
        idPrefix="description"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "details", label: "Detalhes do NFT" },
          { id: "reviews", label: data.reviewsLabel, shortLabel: data.reviewsShortLabel },
        ]}
      />
      <div
        id="description-panel"
        role="tabpanel"
        aria-labelledby={`description-tab-${tab}`}
        className="flex flex-col gap-3 text-body-sm leading-6"
      >
        {tab === "reviews" ? (
          reviews
        ) : (
          <>
            <div className="flex flex-col gap-6 text-text-secondary">
              {data.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <dl className="flex flex-col gap-3">
              {data.facts.map((fact) => (
                <div key={fact.label} className="min-w-0">
                  <dt className="font-bold text-foreground">{fact.label}</dt>
                  <dd className="break-words text-text-secondary">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </div>
    </section>
  )
}
