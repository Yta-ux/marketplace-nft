import { Reveal } from "@/components/reveal"
import { PromoCard, type PromoCardProps } from "@/pages/home/components/promo-card"

const promos: PromoCardProps[] = [
  {
    title: ["Lançamentos gênesis", "de edição limitada"],
    text: "Colecione edições escassas diretamente dos criadores antes da revelação pública.",
    textWidth: 263,
    image: {
      src: "/images/nfts/ape-green-jacket.webp",
      alt: "Macaco de jaqueta college verde",
      left: -5,
      width: 292,
      radius: 18,
    },
    insetRight: { title: 30, text: 30, button: 30 },
    cta: { label: "Explorar", link: { to: "/", search: { tab: "new" }, hash: "catalogo" } },
  },
  {
    title: ["Arte digital selecionada", "e muito mais"],
    text: "Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.",
    textWidth: 252,
    image: {
      src: "/images/nfts/ape-cream-blazer.webp",
      alt: "Macaco de blazer creme e gola alta verde",
      left: 2,
      width: 287,
      radius: 17,
    },
    insetRight: { title: 35, text: 39, button: 35 },
    cta: {
      label: "Explorar",
      link: { to: "/", search: { categories: ["digital-art"] }, hash: "catalogo" },
    },
  },
]

export function Promos() {
  return (
    <section
      aria-label="Destaques da coleção"
      className="flex flex-col gap-7 xl:flex-row xl:justify-between xl:gap-0"
    >
      {promos.map((promo, index) => (
        <Reveal key={promo.title[0]} delay={index * 120}>
          <PromoCard {...promo} />
        </Reveal>
      ))}
    </section>
  )
}
