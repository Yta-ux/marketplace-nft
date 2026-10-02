import { Link, type LinkProps } from "@tanstack/react-router"
import type { CSSProperties } from "react"
import promoCircles from "@/assets/decor/promo-circles.svg"
import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"

export type PromoCardProps = {
  title: [string, string]
  text: string
  textWidth: number
  image: { src: string; alt: string; left: number; width: number; radius: number }
  insetRight: { title: number; text: number; button: number }
  cta: { label: string; link: Pick<LinkProps, "to" | "search" | "hash"> }
}

export function PromoCard({ title, text, textWidth, image, insetRight, cta }: PromoCardProps) {
  const vars = {
    "--img-w": `${image.width}px`,
    "--img-left": `${image.left}px`,
    "--img-radius": `${image.radius}px`,
    "--text-w": `${textWidth}px`,
    "--title-r": `${insetRight.title}px`,
    "--text-r": `${insetRight.text}px`,
    "--btn-r": `${insetRight.button}px`,
  } as CSSProperties

  return (
    <article
      style={vars}
      className="group relative flex w-full flex-col overflow-clip rounded-lg bg-surface transition-shadow duration-300 hover:shadow-card sm:h-[250px] sm:flex-row xl:w-[586px]"
    >
      <img
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={250}
        loading="lazy"
        className="h-[180px] w-full object-cover transition-[filter] duration-300 group-hover:brightness-110 sm:ml-[var(--img-left)] sm:h-[250px] sm:w-[var(--img-w)] sm:shrink-0 sm:rounded-[var(--img-radius)]"
      />
      <div className="flex flex-1 flex-col items-start gap-0 p-5 sm:items-end sm:p-0 sm:pt-[37px] sm:text-right">
        <h2 className="font-bold text-title-sm text-foreground sm:mr-[var(--title-r)] sm:whitespace-nowrap">
          {title[0]}
          <br className="hidden sm:block" /> {title[1]}
        </h2>
        <p className="mt-2 max-w-full text-body-sm leading-6 text-text-secondary sm:mt-[9px] sm:mr-[var(--text-r)] sm:h-[45px] sm:w-[var(--text-w)]">
          {text}
        </p>
        <Button
          asChild
          variant="brand"
          size="promo"
          className="relative z-10 mt-4 sm:mt-[25px] sm:mr-[var(--btn-r)]"
        >
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
        className="pointer-events-none absolute top-0 left-0 hidden h-[250px] w-[586px] max-w-none sm:block"
      />
    </article>
  )
}
