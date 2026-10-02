import { Link } from "@tanstack/react-router"
import { Icon, type IconName } from "@/components/icon"
import { Hairline } from "@/components/summary-rows"
import { notifyUnavailable } from "@/lib/unavailable"
import { cn } from "@/lib/utils"

type Item = {
  id: string
  label: string
  icon: IconName
  activeIcon?: IconName
  to?: "/profile" | "/wallets"
  gap: string
}

const items: Item[] = [
  {
    id: "profile",
    label: "Dados do perfil",
    icon: "account-user",
    activeIcon: "account-user-active",
    to: "/profile",
    gap: "gap-4",
  },
  {
    id: "wallets",
    label: "Carteiras",
    icon: "account-location",
    activeIcon: "account-location-active",
    to: "/wallets",
    gap: "gap-3",
  },
  { id: "activity", label: "Atividade", icon: "account-shopping", gap: "gap-3" },
  { id: "wishlist", label: "Lista de interesse", icon: "account-heart", gap: "gap-3" },
  { id: "offers", label: "Ofertas", icon: "account-activity", gap: "gap-3" },
  { id: "downloads", label: "Arquivos baixados", icon: "account-download", gap: "gap-3" },
  { id: "support", label: "Suporte", icon: "account-danger", gap: "gap-3" },
]

const rowClass =
  "flex w-full items-center px-4 text-left text-body leading-[45px] whitespace-nowrap text-highlight hover:bg-surface-raised"

type AccountSidebarProps = {
  onLogout: () => void
  className?: string
}

export function AccountSidebar({ onLogout, className }: AccountSidebarProps) {
  return (
    <nav
      aria-label="Menu da conta"
      className={cn("flex w-full flex-col bg-surface py-2 lg:w-[310px] lg:shrink-0", className)}
    >
      <h2 className="flex items-center justify-center p-2.5 font-bold text-title-sm leading-4 text-foreground">
        Meu perfil
      </h2>
      <ul className="flex flex-col">
        {items.map((item) => (
          <li key={item.id}>
            {item.to ? (
              <Link
                to={item.to}
                activeOptions={{ exact: true }}
                className={cn(
                  rowClass,
                  item.gap,
                  "data-[status=active]:border-l-[6px] data-[status=active]:border-primary",
                )}
              >
                {({ isActive }) => (
                  <>
                    <Icon name={isActive && item.activeIcon ? item.activeIcon : item.icon} />
                    {item.label}
                  </>
                )}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => notifyUnavailable(item.label)}
                className={cn(rowClass, item.gap)}
              >
                <Icon name={item.icon} />
                {item.label}
              </button>
            )}
          </li>
        ))}
      </ul>
      <Hairline />
      <button
        type="button"
        onClick={onLogout}
        className="flex h-10 w-full items-center gap-2 px-4 font-bold text-body leading-[15px] text-highlight hover:bg-surface-raised"
      >
        <Icon name="account-logout" />
        Sair
      </button>
    </nav>
  )
}
