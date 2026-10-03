import { Link } from "@tanstack/react-router"
import { type FormEvent, Fragment, type ReactNode, useId, useState } from "react"
import { z } from "zod"
import type { NftCategory } from "@/api/contracts"
import { Icon, type IconName } from "@/components/icon"
import { categoryLabels } from "@/lib/catalog-labels"
import { notifyUnavailable } from "@/lib/unavailable"
import { cn } from "@/lib/utils"

const features = [
  {
    letter: "W",
    title: "Segurança da carteira",
    text: "Proteja sua carteira e colecione arte digital verificada com confiança.",
  },
  {
    letter: "C",
    title: "Criadores em destaque",
    text: "Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.",
  },
  {
    letter: "D",
    title: "Alertas de lançamentos",
    text: "Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.",
  },
]

const footerCategories: NftCategory[] = ["digital-art", "photography", "music", "3d-art", "utility"]

const socials: { label: string; icon: IconName }[] = [
  { label: "Facebook", icon: "facebook" },
  { label: "Instagram", icon: "instagram" },
  { label: "Twitter", icon: "twitter" },
  { label: "LinkedIn", icon: "linkedin" },
  { label: "YouTube", icon: "youtube" },
]

const linkClass = "text-left text-body-sm leading-[30px] text-foreground hover:text-highlight"

export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("flex flex-col", className)}>
      <div className="bg-surface p-8 xl:h-[250px]">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 xl:flex xl:w-[1154px] xl:items-end xl:justify-between xl:gap-0">
          {features.map((feature, index) => (
            <Fragment key={feature.letter}>
              {index > 0 && (
                <div aria-hidden="true" className="hidden w-px self-stretch bg-primary xl:block" />
              )}
              <div
                className={cn(
                  "flex flex-col gap-3 xl:px-4",
                  index === 0 ? "xl:min-w-0 xl:flex-1" : "xl:w-[264.667px]",
                )}
              >
                <span
                  aria-hidden="true"
                  className="flex size-[74px] items-center justify-center rounded-full bg-primary font-bold text-heading leading-[normal] text-ink"
                >
                  {feature.letter}
                </span>
                <h2 className="font-bold text-label text-foreground">{feature.title}</h2>
                <p className="max-w-[204px] text-body-sm leading-[22px] text-text-secondary">
                  {feature.text}
                </p>
              </div>
            </Fragment>
          ))}
          <div aria-hidden="true" className="hidden w-px self-stretch bg-primary xl:block" />
          <Newsletter />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 bg-surface-dark p-8 sm:grid-cols-2 xl:flex xl:h-[88px] xl:items-center xl:gap-[92px]">
        <p className="py-2 font-bold text-body-sm leading-[normal] tracking-brand text-foreground xl:flex-1">
          KURIO
        </p>
        <p className="text-body-sm leading-[22px] text-foreground xl:flex-1">
          Feito para colecionadores,
          <br />
          criadores e cultura
        </p>
        <a
          href="mailto:contato@email.com"
          className="text-body-sm leading-[22px] text-foreground hover:text-highlight xl:flex-1"
        >
          contato@email.com
        </a>
        <a
          href="tel:+551140028922"
          className="text-body-sm leading-[22px] text-foreground hover:text-highlight xl:w-[228px] xl:flex-none"
        >
          +55 11 4002 8922
        </a>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <div className="w-full bg-surface p-8 xl:h-[236px]">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 xl:flex xl:gap-[124px]">
            <FooterColumn title="Meu perfil">
              <Link to="/profile" className={linkClass}>
                Meu perfil
              </Link>
              <UnavailableLink label="Minha coleção" />
              <UnavailableLink label="Atividade" />
              <UnavailableLink label="Estúdio do criador" />
              <UnavailableLink label="Lista de interesse" />
            </FooterColumn>
            <FooterColumn title="Central de ajuda">
              <UnavailableLink label="Central de ajuda" />
              <UnavailableLink label="Como comprar NFTs" />
              <UnavailableLink label="Carteira e segurança" />
              <UnavailableLink label="Política do mercado" />
              <UnavailableLink label="Denunciar item" />
            </FooterColumn>
            <FooterColumn title="Coleções">
              {footerCategories.map((category) => (
                <Link
                  key={category}
                  to="/"
                  search={{ categories: [category] }}
                  hash="catalogo"
                  className={linkClass}
                >
                  {categoryLabels[category]}
                </Link>
              ))}
            </FooterColumn>
            <div className="col-span-2 flex flex-col gap-8 md:col-span-3 xl:w-[228px] xl:shrink-0">
              <div className="flex flex-col gap-5">
                <h2 className="font-bold text-title-sm leading-4 text-foreground">Redes sociais</h2>
                <ul className="flex flex-wrap items-center gap-2.5">
                  {socials.map((social) => (
                    <li key={social.label}>
                      <button
                        type="button"
                        aria-label={social.label}
                        onClick={() => notifyUnavailable(`Perfil no ${social.label}`)}
                        className="block rounded-sm transition-[background-color,box-shadow] duration-200 hover:bg-primary/15 hover:shadow-glow"
                      >
                        <Icon name={social.icon} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-3">
                <h2 className="font-bold text-title-sm leading-4 text-foreground">
                  Carteiras compatíveis
                </h2>
                <ul className="flex max-w-[280px] items-center justify-between gap-1 rounded-sm border border-border-soft bg-surface-dark px-2 py-2 font-bold text-tiny tracking-[0] whitespace-nowrap text-highlight">
                  {["METAMASK", "WALLETCONNECT", "COINBASE"].map((wallet, index) => (
                    <li key={wallet} className="flex items-center gap-1">
                      {wallet}
                      {index < 2 && (
                        <span aria-hidden="true" className="pl-1">
                          •
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <p className="w-full text-center text-body-sm leading-[30px] text-foreground">
          © 2026 Kurio. Propriedade digital para todos.
        </p>
      </div>
    </footer>
  )
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2 xl:flex-1">
      <h2 className="font-bold text-title-sm leading-4 text-foreground">{title}</h2>
      <div className="flex flex-col items-start">{children}</div>
    </div>
  )
}

function UnavailableLink({ label }: { label: string }) {
  return (
    <button type="button" onClick={() => notifyUnavailable(label)} className={linkClass}>
      {label}
    </button>
  )
}

const emailSchema = z.email()

function Newsletter() {
  const id = useId()
  const [error, setError] = useState<string | null>(null)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim()
    if (!emailSchema.safeParse(email).success) {
      setError("Digite um e-mail válido.")
      return
    }
    setError(null)
    notifyUnavailable("A inscrição na newsletter")
  }

  return (
    <div className="flex flex-col gap-3 sm:col-span-3 xl:w-[357px] xl:self-stretch xl:px-4">
      <form
        noValidate
        onSubmit={submit}
        className="flex flex-col gap-4"
        aria-labelledby={`${id}-title`}
      >
        <h2 id={`${id}-title`} className="font-bold text-title-sm leading-4 text-foreground">
          Antecipe-se ao próximo lançamento
        </h2>
        <div className="flex h-10 items-center justify-between rounded-sm bg-surface-dark pl-3 shadow-field">
          <label htmlFor={`${id}-email`} className="sr-only">
            E-mail
          </label>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="digite seu e-mail..."
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className="h-full min-w-0 flex-1 bg-transparent text-body-sm leading-4 text-foreground outline-none placeholder:text-subtle"
          />
          <button
            type="submit"
            className="flex h-10 w-[85px] shrink-0 items-center justify-center rounded-r-sm bg-primary pr-1 pl-4 font-bold text-title-sm leading-4 text-ink hover:bg-highlight"
          >
            Enviar
          </button>
        </div>
      </form>
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-caption-lg text-danger">
          {error}
        </p>
      ) : (
        <p className="text-caption-lg text-text-secondary xl:h-[89px]">
          Receba lançamentos selecionados, histórias de criadores e novidades do mercado.
        </p>
      )}
    </div>
  )
}
