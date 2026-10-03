import { createFileRoute } from "@tanstack/react-router"
import { AuthPage } from "@/pages/auth"

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: () => <AuthPage mode="login" />,
})
