import { Link, type LinkProps } from "@tanstack/react-router"
import type { CSSProperties } from "react"
import promoCircles from "@/assets/decor/promo-circles.svg"
import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"

export type PromoCardProps = {
  title: [string, string]
  text: string
  image: { src: string; alt: string; left: number; width: number; radius: number }
  cta: { label: string; link: Pick<LinkProps, "to" | "search" | "hash"> }
}

export function PromoCard({ title, text, image, cta }: PromoCardProps) {
  const vars = {
    "--img-w": `${image.width}px`,
    "--img-left": `${image.left}px`,
    "--img-radius": `${image.radius}px`,
  } as CSSProperties

  return (
    <article
      style={vars}
      className="group relative flex w-full flex-col overflow-clip rounded-lg bg-surface transition-shadow duration-300 hover:shadow-card sm:min-h-[250px] sm:flex-row xl:w-[586px]"
    >
      <img
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={250}
        loading="lazy"
        className="h-[180px] w-full object-cover transition-[filter] duration-300 group-hover:brightness-110 sm:ml-[var(--img-left)] sm:h-auto sm:min-h-[250px] sm:w-[var(--img-w)] sm:shrink-0 sm:self-stretch sm:rounded-[var(--img-radius)]"
      />
      <div className="flex min-w-0 flex-1 flex-col items-start justify-between gap-4 p-5 sm:items-end sm:py-6 sm:pr-8 sm:pl-6 sm:text-right">
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <h2 className="font-bold text-title-sm text-balance text-foreground">
            {title[0]}
            <br className="hidden sm:block" /> {title[1]}
          </h2>
          <p className="text-body-sm leading-6 text-text-secondary">{text}</p>
        </div>
        <Button asChild variant="brand" size="promo" className="relative z-10">
          <Link {...cta.link}>
            <span className="flex w-[86px] items-end justify-between">
              {cta.label}
              <Icon name="arrow-right" />
            </span>
          </Link>
        </Button>
      </div>
      <img
        src={promoCircles}
        alt=""
        aria-hidden="true"
        width={586}
        height={250}
        className="pointer-events-none absolute top-0 left-0 hidden h-full w-[586px] max-w-none object-cover object-left-top sm:block"
      />
    </article>
  )
}
