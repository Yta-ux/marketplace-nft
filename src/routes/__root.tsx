import { useQuery } from "@tanstack/react-query"
import { createRootRouteWithContext, Link, Outlet, useRouterState } from "@tanstack/react-router"
import type { RouterContext } from "@/app/router"
import { ConnectionStatus } from "@/components/layout/connection-status"
import { MobileTabBar } from "@/components/layout/mobile-tab-bar"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { Reveal } from "@/components/reveal"
import { cn } from "@/lib/utils"
import { cartQueryOptions } from "@/queries/cart"

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFound,
})

function RootLayout() {
  const { data: cart } = useQuery(cartQueryOptions())
  const cartCount = cart?.itemCount ?? 0
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const market = /^\/(nfts|cart|checkout|orders)(\/|$)/.test(pathname)
  const detail = /^\/nfts(\/|$)/.test(pathname)
  const account = /^\/(profile|wallets)(\/|$)/.test(pathname)
  const focused = /^\/(cart|checkout|orders|login|register)(\/|$)/.test(pathname)
  return (
    <>
      <ConnectionStatus />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-sm focus:bg-primary focus:px-3 focus:py-2 focus:text-ink"
      >
        Pular para o conteúdo
      </a>
      <SiteHeader
        className="hidden lg:block"
        cartCount={cartCount}
        active={market ? "market" : "home"}
        divider={!market}
      />
      <div
        className={cn(
          "page-container flex flex-col lg:pt-0 lg:pb-6",
          detail && "max-lg:px-0 max-lg:pb-[188px]",
          focused && "max-lg:px-0 max-lg:pb-0",
          !(detail || focused) && "pt-10 pb-[126px]",
        )}
      >
        <div className="flex flex-col">
          <main id="main">
            <div key={pathname} className="animate-in duration-500 fade-in">
              <Outlet />
            </div>
          </main>
          {!account && (
            <Reveal className={cn("mt-24", focused && "max-lg:hidden")}>
              <SiteFooter />
            </Reveal>
          )}
        </div>
        {!(detail || focused) && <MobileTabBar cartCount={cartCount} className="lg:hidden" />}
      </div>
    </>
  )
}

function NotFound() {
  return (
    <section className="flex flex-col items-start gap-4 py-24">
      <h1 className="font-bold text-heading text-foreground">Página não encontrada</h1>
      <p className="text-body-sm text-text-secondary">
        O endereço acessado não existe ou foi removido.
      </p>
      <Link to="/" className="font-bold text-body-lg text-highlight hover:underline">
        Voltar para o início
      </Link>
    </section>
  )
}
