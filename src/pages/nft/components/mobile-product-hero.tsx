import { useRouter } from "@tanstack/react-router"
import { CircleButton } from "@/components/circle-button"
import { type EditionOption, EditionPills } from "@/pages/nft/components/edition-pills"
import { ReviewPill } from "@/pages/nft/components/review-pill"

type MobileProductHeroProps = {
  image: { url: string; alt: string }
  onFavorite: () => void
  favorited: boolean
}

export function MobileProductHero({ image, onFavorite, favorited }: MobileProductHeroProps) {
  const router = useRouter()
  return (
    <section
      aria-label="Imagem do NFT"
      className="relative h-[506px] w-full overflow-hidden bg-[linear-gradient(137.64deg,var(--color-surface)_12%,var(--color-surface-raised)_106.59%)]"
    >
      <div className="absolute inset-x-7 top-[23px] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <CircleButton icon="arrow-left" label="Voltar" onClick={() => router.history.back()} />
          <CircleButton
            icon={favorited ? "heart-filled-mobile" : "heart-mobile"}
            iconClassName={favorited ? "animate-heart-fill" : undefined}
            label={favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            aria-pressed={favorited}
            onClick={onFavorite}
          />
        </div>
        <img
          src={image.url}
          alt={image.alt}
          width={361}
          height={356}
          fetchPriority="high"
          className="h-[356px] w-full rounded-hero object-cover"
        />
      </div>
    </section>
  )
}

type MobileProductSheetProps = {
  name: string
  rating: { score: string; count: number }
  about: string
  editions: EditionOption[]
  edition: string
  onEditionChange: (id: string) => void
  meta: { label: string; value: string }[]
  unavailableNote?: string
}

export function MobileProductSheet({
  name,
  rating,
  about,
  editions,
  edition,
  onEditionChange,
  meta,
  unavailableNote,
}: MobileProductSheetProps) {
  return (
    <section
      aria-labelledby="mobile-product-title"
      className="relative -mt-[114px] flex flex-col gap-3 rounded-t-[31px] bg-surface px-6 pt-8 pb-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h1 id="mobile-product-title" className="font-bold text-[20px] leading-4 text-foreground">
          {name}
        </h1>
        {rating.count > 0 ? (
          <ReviewPill score={rating.score} count={rating.count} />
        ) : (
          <span className="shrink-0 text-body-sm leading-4 whitespace-nowrap text-text-secondary">
            Sem avaliações
          </span>
        )}
      </div>
      <p className="text-body-sm leading-6 text-text-secondary">{about}</p>
      <div className="flex flex-col gap-2">
        <p className="font-bold text-body leading-4 text-foreground">Edição:</p>
        <EditionPills
          options={editions}
          value={edition}
          onChange={onEditionChange}
          label="Edição"
          name="mobile-edition"
          className="gap-3"
        />
      </div>
      <dl className="flex flex-col gap-3 text-body leading-[normal] text-subtle">
        {meta.map((item) => (
          <div key={item.label}>
            <dt className="inline">{item.label}: </dt>
            <dd className="inline break-words">{item.value}</dd>
          </div>
        ))}
      </dl>
      {unavailableNote && (
        <p role="alert" className="text-body-sm leading-4 text-danger">
          {unavailableNote}
        </p>
      )}
    </section>
  )
}
