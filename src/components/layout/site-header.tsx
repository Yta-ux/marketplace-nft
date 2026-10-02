import { Link, useNavigate } from "@tanstack/react-router"
import { type FormEvent, useState } from "react"
import { CartBadge } from "@/components/cart-badge"
import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useScrollState } from "@/hooks/use-scroll-state"
import { notifyUnavailable } from "@/lib/unavailable"
import { cn } from "@/lib/utils"
import { useLogout, useSession } from "@/queries/session"

type NavKey = "home" | "market"

type SiteHeaderProps = { active?: NavKey; divider?: boolean; cartCount: number; className?: string }

export function SiteHeader({
  active = "home",
  divider = true,
  cartCount,
  className,
}: SiteHeaderProps) {
  const { scrolled, inSection } = useScrollState("catalogo", active === "home")
  const current: NavKey = inSection ? "market" : active
  return (
    <div
      data-scrolled={scrolled}
      className={cn(
        "group sticky top-0 z-40 border-b border-transparent bg-transparent pt-6 pb-0 transition-[padding,background-color,border-color,box-shadow,backdrop-filter] duration-300 ease-out data-[scrolled=true]:border-primary/25 data-[scrolled=true]:bg-ink/90 data-[scrolled=true]:py-3 data-[scrolled=true]:shadow-[0_10px_30px_rgb(10_6_4/0.55)] data-[scrolled=true]:backdrop-blur-md",
        className,
      )}
    >
      <header className="page-container flex flex-col">
        <div className="flex items-start justify-between">
          <Link
            to="/"
            className="block h-[34.3px] w-40 pt-[8.15px] font-bold text-body-sm leading-[normal] tracking-brand text-foreground"
          >
            KURIO
          </Link>
          <nav aria-label="Principal" className="hidden gap-10 md:flex">
            <NavItem label="Início" active={current === "home"} to="/" />
            <NavItem label="Mercado" active={current === "market"} to="/" hash="catalogo" />
            <UnavailableNavItem label="Criadores" />
            <UnavailableNavItem label="Aprenda" />
          </nav>
          <div className="flex items-center gap-7">
            <SearchDialog />
            <CartLink count={cartCount} />
            <AccountArea />
          </div>
        </div>
        {divider && (
          <div
            aria-hidden="true"
            className="h-[0.3px] w-full bg-primary transition-opacity duration-300 group-data-[scrolled=true]:opacity-0"
          />
        )}
      </header>
    </div>
  )
}

function NavItem({
  label,
  active,
  to,
  hash,
}: {
  label: string
  active: boolean
  to: "/"
  hash?: string
}) {
  return (
    <Link
      to={to}
      hash={hash}
      aria-current={active ? "page" : undefined}
      className={`group flex flex-col text-body-lg leading-[normal] ${
        active ? "font-bold text-highlight" : "font-normal text-foreground hover:text-highlight"
      }`}
    >
      {label}
      <span
        aria-hidden="true"
        className={`mt-[21px] h-[3px] w-full bg-primary transition-opacity duration-300 ${active ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`}
      />
    </Link>
  )
}

function UnavailableNavItem({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => notifyUnavailable(label)}
      className="flex h-[45px] items-start self-start text-body-lg leading-[normal] text-foreground hover:text-highlight"
    >
      <span className="block">{label}</span>
    </button>
  )
}

function AccountArea() {
  const { data: session, isPending } = useSession()
  const logout = useLogout()
  const user = session?.user

  if (isPending) return <Skeleton className="h-[35px] w-[100px] rounded-sm" />

  if (!user) {
    return (
      <Button asChild variant="brand" size="header">
        <Link to="/login">
          <Icon name="login" />
          Entrar
        </Link>
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <Link
        to="/profile"
        aria-label={`Meu perfil, ${user.displayName}`}
        className="group flex items-center gap-2 rounded-sm text-body-sm text-foreground hover:text-highlight"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            width={28}
            height={28}
            className="size-7 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex size-7 items-center justify-center rounded-full bg-primary font-bold text-caption text-ink transition-shadow group-hover:shadow-glow"
          >
            {user.displayName.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="max-w-[110px] truncate">{user.displayName}</span>
      </Link>
      <Button
        type="button"
        variant="outline-brand"
        size="header"
        className="w-[72px]"
        disabled={logout.isPending}
        onClick={() => logout.mutate()}
      >
        Sair
      </Button>
    </div>
  )
}

function CartLink({ count }: { count: number }) {
  return (
    <Link
      to="/cart"
      aria-label={count > 0 ? `Carrinho, ${count} ${count === 1 ? "item" : "itens"}` : "Carrinho"}
      className="relative block h-6 w-[24.004px]"
    >
      <Icon name="cart" />
      <CartBadge count={count} className="absolute -top-0.5 left-[13px]" />
    </Link>
  )
}

function SearchDialog() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const q = String(new FormData(event.currentTarget).get("q") ?? "").trim()
    setOpen(false)
    void navigate({ to: "/", search: { q: q || undefined }, hash: "catalogo" })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" aria-label="Buscar NFTs" className="block h-5 w-[20.001px]">
          <Icon name="search" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogTitle>Buscar NFTs</DialogTitle>
        <DialogDescription>Pesquise por nome do NFT, criador ou coleção.</DialogDescription>
        <search>
          <form onSubmit={submit} className="flex gap-2">
            <label htmlFor="site-search" className="sr-only">
              Termo de busca
            </label>
            <Input
              id="site-search"
              className="rounded-sm border-input bg-surface-dark"
              name="q"
              type="search"
              placeholder="Ex.: Emerald Ape"
              autoComplete="off"
              maxLength={80}
            />
            <Button type="submit" variant="brand" className="h-10 px-4 font-bold text-body-lg">
              Buscar
            </Button>
          </form>
        </search>
      </DialogContent>
    </Dialog>
  )
}
