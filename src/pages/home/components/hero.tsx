import { Link } from "@tanstack/react-router"
import { preload } from "react-dom"
import { Button } from "@/components/ui/button"
import { useCarousel } from "@/hooks/use-carousel"
import { cn } from "@/lib/utils"
import { CarouselDots } from "@/pages/home/components/carousel-dots"
import type { HeroSlide } from "@/pages/home/hero-slides"

type HeroProps = {
  slides: HeroSlide[]
  className?: string
}

export function Hero({ slides, className }: HeroProps) {
  const carousel = useCarousel(slides.length)
  const [first] = slides
  if (first) preload(first.src, { as: "image", fetchPriority: "high" })

  return (
    <section
      aria-labelledby="hero-title"
      className={cn("relative hidden h-[450px] items-center pl-10 lg:flex", className)}
      {...carousel.handlers}
    >
      <div className="flex w-full max-w-[1160px] items-center justify-between gap-6">
        <div className="flex w-[600px] min-w-0 shrink animate-in flex-col items-end gap-11 duration-700 fade-in">
          <div className="flex w-full flex-col items-start gap-8">
            <div className="flex w-full flex-col gap-1">
              <div className="flex w-full flex-col gap-2 text-foreground">
                <p className="font-medium text-body-sm leading-4 tracking-brand">
                  Bem-vindo à Kurio
                </p>
                <h1 id="hero-title" className="font-bold text-[min(43px,3.49vw)] leading-[1.6279]">
                  SEJA DONO DO FUTURO
                  <br />
                  DA ARTE DIGITAL
                </h1>
              </div>
              <p className="w-[557px] max-w-full text-body-sm leading-6 text-text-secondary">
                Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte
                digital rara, apoie artistas e tenha uma parte da cultura da internet.
              </p>
            </div>
            <Button asChild variant="brand" size="cta">
              <Link to="/" hash="catalogo">
                EXPLORAR
              </Link>
            </Button>
          </div>
          <CarouselDots count={slides.length} carousel={carousel} />
        </div>
        <section
          aria-roledescription="carousel"
          aria-label="Destaques da coleção"
          aria-live={carousel.paused || !carousel.autoplay ? "polite" : "off"}
          className="relative aspect-square w-[min(450px,36.5vw)] shrink-0 overflow-hidden rounded-hero"
        >
          {slides.map((slide, i) => (
            <img
              key={slide.src}
              src={slide.src}
              alt={slide.alt}
              aria-hidden={i !== carousel.index}
              width={450}
              height={450}
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "auto"}
              className={cn(
                "absolute inset-0 size-full object-cover transition-[opacity,scale] duration-700 ease-in-out",
                i === carousel.index ? "scale-100 opacity-100" : "scale-105 opacity-0",
              )}
            />
          ))}
        </section>
      </div>
    </section>
  )
}
