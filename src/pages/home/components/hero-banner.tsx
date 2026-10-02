import { Link } from "@tanstack/react-router"
import { Icon } from "@/components/icon"
import { useCarousel } from "@/hooks/use-carousel"
import { cn } from "@/lib/utils"
import { CarouselDots } from "@/pages/home/components/carousel-dots"
import type { HeroSlide } from "@/pages/home/hero-slides"

const circle = "pointer-events-none absolute size-[248px] rounded-full"

type HeroBannerProps = {
  slides: HeroSlide[]
  className?: string
}

const fade =
  "absolute inset-0 size-full object-cover transition-[opacity,scale] duration-700 ease-in-out"
const state = (active: boolean) => (active ? "scale-100 opacity-100" : "scale-105 opacity-0")

export function HeroBanner({ slides, className }: HeroBannerProps) {
  const carousel = useCarousel(slides.length)
  return (
    <section
      aria-labelledby="hero-banner-title"
      className={cn(
        "relative flex min-h-[190px] items-center overflow-clip rounded-xl px-4 py-[5.5px]",
        className,
      )}
      {...carousel.handlers}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(117deg,rgba(210,138,76,0.2),rgba(210,138,76,0.1))]"
      />
      <span
        aria-hidden="true"
        className={cn(
          circle,
          "top-[-31px] left-[-80px] bg-[linear-gradient(160.2deg,rgba(221,154,95,0.43)_22.1%,rgba(210,138,76,0.04)_87.4%)]",
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          circle,
          "top-[-10px] left-[73px] bg-[linear-gradient(160.2deg,rgba(221,154,95,0.37)_22.1%,rgba(210,138,76,0)_87.4%)]",
        )}
      />
      <div className="relative flex w-full flex-col items-center gap-4">
        <div className="flex w-full items-center gap-2">
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex flex-col gap-1.5">
              <p className="font-medium text-caption text-foreground">Bem-vindo à Kurio</p>
              <h1
                id="hero-banner-title"
                className="font-bold text-[clamp(14px,4.35vw,18px)] leading-[1.6111] text-foreground"
              >
                SEJA DONO DA
                <br />
                CULTURA DIGITAL
              </h1>
              <p className="text-caption leading-[18px] text-text-secondary">
                Descubra NFTs selecionados de criadores do mundo todo.
              </p>
            </div>
            <Link
              to="/"
              hash="catalogo"
              className="flex items-center gap-2 self-start font-bold text-caption leading-[14px] text-highlight hover:underline"
            >
              EXPLORAR
              <Icon name="arrow-right-sm" />
            </Link>
          </div>
          <section
            aria-roledescription="carousel"
            aria-label="Destaques da coleção"
            aria-live={carousel.paused || !carousel.autoplay ? "polite" : "off"}
            className="relative aspect-[138/146] w-[clamp(96px,33.3vw,138px)] shrink-0"
          >
            <div className="absolute top-0 left-0 aspect-square w-full overflow-hidden rounded-2xl">
              {slides.map((slide, i) => (
                <img
                  key={slide.src}
                  src={slide.src}
                  alt={slide.alt}
                  aria-hidden={i !== carousel.index}
                  width={138}
                  height={138}
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                  className={cn(fade, state(i === carousel.index))}
                />
              ))}
            </div>
            <div
              aria-hidden="true"
              className="absolute top-[60.27%] left-[10.14%] aspect-square w-[42.03%] overflow-hidden rounded-2xl"
            >
              {slides.map((slide, i) => (
                <img
                  key={slide.src}
                  src={slide.src}
                  alt=""
                  width={58}
                  height={58}
                  loading="lazy"
                  className={cn(fade, state(i === (carousel.index + 1) % slides.length))}
                />
              ))}
            </div>
          </section>
        </div>
        <CarouselDots count={slides.length} carousel={carousel} size="sm" />
      </div>
    </section>
  )
}
