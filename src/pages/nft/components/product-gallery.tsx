import { useState } from "react"
import { FavoriteButton } from "@/components/favorite-button"
import { cn } from "@/lib/utils"

type GalleryImage = { id: string; url: string; alt: string }

type ProductGalleryProps = {
  name: string
  images: GalleryImage[]
  favorited: boolean
  onToggleFavorite: () => void
}

export function ProductGallery({ name, images, favorited, onToggleFavorite }: ProductGalleryProps) {
  const [index, setIndex] = useState(0)
  const main = images[index] ?? images[0]
  if (!main) return null

  return (
    <div className="flex w-full max-w-[573px] flex-col-reverse gap-4 lg:h-[448px] lg:flex-row lg:items-center lg:gap-7">
      <ul aria-label="Miniaturas" className="flex gap-4 lg:flex-col">
        {images.map((image, i) => (
          <li key={image.id}>
            <button
              type="button"
              aria-label={`Ver imagem ${i + 1} de ${images.length}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => setIndex(i)}
              className={cn(
                "block size-[100px] overflow-hidden rounded-lg border",
                i === index ? "border-primary" : "border-transparent hover:border-border",
              )}
            >
              <img
                src={image.url}
                alt=""
                width={100}
                height={100}
                className="size-full rounded-lg object-cover"
              />
            </button>
          </li>
        ))}
      </ul>
      <div className="relative flex aspect-square w-full max-w-[444px] shrink-0 items-center justify-center rounded-[6px] bg-surface p-4">
        <img
          src={main.url}
          alt={main.alt}
          width={404}
          height={404}
          fetchPriority="high"
          className="aspect-square w-full max-w-[404px] rounded-hero object-cover"
        />
        <FavoriteButton
          size="lg"
          nftName={name}
          pressed={favorited}
          onToggle={onToggleFavorite}
          className="absolute top-[13px] right-3"
        />
      </div>
    </div>
  )
}
