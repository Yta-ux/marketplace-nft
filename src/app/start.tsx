import { RouterProvider } from "@tanstack/react-router"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { onUnauthorized } from "@/api/http"
import { AppProviders } from "@/app/providers"
import { createQueryClient } from "@/app/query-client"
import { createAppRouter } from "@/app/router"
import { clearSession } from "@/queries/session"

export function startApp(): void {
  const queryClient = createQueryClient()
  const router = createAppRouter(queryClient)

  onUnauthorized(() => {
    clearSession(queryClient)
    const { pathname, href } = router.state.location
    if (pathname !== "/login" && pathname !== "/register") {
      void router.navigate({ to: "/login", search: { redirect: href } })
    }
  })

  const root = document.getElementById("root")
  if (!root) throw new Error("#root not found")
  createRoot(root).render(
    <StrictMode>
      <AppProviders queryClient={queryClient}>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>,
  )
}
