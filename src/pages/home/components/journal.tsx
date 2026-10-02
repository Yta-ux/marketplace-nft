import { Reveal } from "@/components/reveal"
import { notifyUnavailable } from "@/lib/unavailable"
import { JournalCard } from "@/pages/home/components/journal-card"

const posts = [
  {
    date: "12 de setembro",
    readTime: "6 min",
    title: "Como funciona a propriedade de NFTs",
    excerpt: "Aprenda a colecionar, negociar e verificar ativos digitais.",
    image: "/images/nfts/ape-cream-blazer.webp",
  },
  {
    date: "13 de setembro",
    readTime: "2 min",
    title: "10 artistas digitais para acompanhar",
    excerpt: "Conheça criadores que moldam a cultura digital.",
    image: "/images/nfts/ape-green-jacket.webp",
  },
  {
    date: "15 de setembro",
    readTime: "3 min",
    title: "Raridade, atributos e procedência",
    excerpt: "Entenda raridade, procedência, direitos autorais e utilidade.",
    image: "/images/nfts/ape-purple-hoodie.webp",
  },
  {
    date: "15 de setembro",
    readTime: "2 min",
    title: "Como proteger sua carteira",
    excerpt: "Proteja sua carteira, seus ativos e sua identidade.",
    image: "/images/nfts/ape-orange-headphones.webp",
  },
]

export function Journal() {
  return (
    <section aria-labelledby="journal-title" className="flex flex-col items-center gap-10">
      <Reveal className="flex w-full flex-col items-center gap-3 text-center">
        <h2 id="journal-title" className="w-full font-bold text-heading-lg text-foreground-strong">
          Diário da Cunhagem
        </h2>
        <p className="w-full text-body-sm leading-[normal] text-text-secondary">
          Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.
        </p>
      </Reveal>
      <ul className="grid w-full grid-cols-1 gap-6 min-[520px]:grid-cols-2 lg:grid-cols-4 xl:grid-cols-[repeat(4,268px)] xl:justify-start">
        {posts.map((post, index) => (
          <Reveal as="li" key={post.title} delay={index * 100} className="flex">
            <JournalCard {...post} onReadMore={() => notifyUnavailable("O Diário da Cunhagem")} />
          </Reveal>
        ))}
      </ul>
    </section>
  )
}
