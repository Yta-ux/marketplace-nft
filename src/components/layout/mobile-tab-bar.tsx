import { Link } from "@tanstack/react-router"
import type { ReactNode } from "react"
import tabCenter from "@/assets/icons/tab-center.svg"
import tabHeart from "@/assets/icons/tab-heart.svg"
import tabHome from "@/assets/icons/tab-home.svg"
import tabShop from "@/assets/icons/tab-shop.svg"
import tabUser from "@/assets/icons/tab-user.svg"
import { CartBadge } from "@/components/cart-badge"
import { Icon } from "@/components/icon"
import { notifyUnavailable } from "@/lib/unavailable"
import { cn } from "@/lib/utils"

type MobileTabBarProps = {
  cartCount: number
  className?: string
}

const hitArea = "pointer-events-auto absolute flex size-11 items-center justify-center rounded-sm"
const itemColor = "text-text-secondary data-[status=active]:text-highlight"

function MaskedIcon({ src, width, height }: { src: string; width: number; height: number }) {
  const mask = `url("${src}")`
  return (
    <span
      aria-hidden="true"
      className="block bg-current"
      style={{
        width,
        height,
        maskImage: mask,
        WebkitMaskImage: mask,
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskSize: "100% 100%",
        WebkitMaskSize: "100% 100%",
      }}
    />
  )
}

function ActiveDot() {
  return (
    <span
      aria-hidden="true"
      className="absolute bottom-0.5 left-1/2 hidden size-1 -translate-x-1/2 rounded-full bg-highlight group-data-[status=active]:block"
    />
  )
}

export function MobileTabBar({ cartCount, className }: MobileTabBarProps) {
  return (
    <nav
      aria-label="Navegação principal"
      className={cn("pointer-events-none fixed inset-x-0 bottom-0 z-40 h-[126px]", className)}
    >
      <div
        aria-hidden="true"
        className="pointer-events-auto absolute inset-x-0 bottom-0 flex h-[95px] [filter:drop-shadow(0_-10px_30px_rgba(10,6,4,0.45))]"
      >
        <div className="flex-1 rounded-tl-[28.93px] bg-surface" />
        <svg
          aria-hidden="true"
          width="151.7"
          height="95"
          viewBox="0 0 151.7 95"
          fill="none"
          className="-mx-px shrink-0"
        >
          <path
            d="M0 0C13.76 0 25.98 8.2 31.83 20.65C39.59 37.17 56.39 48.62 75.85 48.62C95.31 48.62 112.11 37.18 119.87 20.65C125.72 8.2 137.95 0 151.7 0V95H0Z"
            fill="var(--color-surface)"
          />
        </svg>
        <div className="flex-1 rounded-tr-[28.93px] bg-surface" />
      </div>

      <div className="relative mx-auto h-full w-full max-w-[414px]">
        <TabLink to="/" label="Início" className="top-[59px] left-[calc(11.11%-22px)]">
          <MaskedIcon src={tabHome} width={15.83} height={16.67} />
        </TabLink>
        <TabButton
          label="Favoritos"
          onClick={() => notifyUnavailable("Favoritos")}
          className="top-[59px] left-[calc(28.5%-22px)]"
        >
          <MaskedIcon src={tabHeart} width={20} height={17.79} />
        </TabButton>
        <TabLink
          to="/cart"
          label={
            cartCount > 0
              ? `Carrinho, ${cartCount} ${cartCount === 1 ? "item" : "itens"}`
              : "Carrinho"
          }
          className="top-[59px] right-[calc(27.05%-22px)]"
        >
          <MaskedIcon src={tabShop} width={20} height={20} />
          <CartBadge
            count={cartCount}
            className="absolute -top-0.5 right-0 size-4 border-[1.5px] text-[9px]"
          />
        </TabLink>
        <TabLink to="/profile" label="Perfil" className="top-[59px] right-[calc(12.08%-22px)]">
          <MaskedIcon src={tabUser} width={20} height={20} />
        </TabLink>

        <button
          type="button"
          aria-label="Ler QR code"
          onClick={() => notifyUnavailable("O leitor de QR code")}
          className="pointer-events-auto absolute top-0 left-1/2 size-[65px] -translate-x-1/2 rounded-full"
        >
          <img
            src={tabCenter}
            alt=""
            width={65}
            height={65}
            className="block size-full max-w-none"
          />
          <span className="absolute top-[21px] left-[19px]">
            <Icon name="scan" />
          </span>
        </button>
      </div>
    </nav>
  )
}

function TabLink({
  to,
  label,
  className,
  children,
}: {
  to: "/" | "/cart" | "/profile"
  label: string
  className: string
  children: ReactNode
}) {
  return (
    <Link
      to={to}
      aria-label={label}
      activeOptions={{ exact: true }}
      className={cn("group", hitArea, itemColor, className)}
    >
      <span className="relative flex items-center justify-center">{children}</span>
      <ActiveDot />
    </Link>
  )
}

function TabButton({
  label,
  onClick,
  className,
  children,
}: {
  label: string
  onClick: () => void
  className: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(hitArea, "text-text-secondary", className)}
    >
      {children}
    </button>
  )
}
