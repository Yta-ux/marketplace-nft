import { useNavigate, useRouter, useSearch } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { nftListQuerySchema } from "@/api/contracts"
import { useMediaQuery } from "@/hooks/use-media-query"
import { AuthModal, type AuthMode } from "@/pages/auth/components/auth-modal"
import { MobileAuth } from "@/pages/auth/components/mobile-auth"
import { safeRedirect } from "@/pages/auth/redirect"
import { HomeView } from "@/pages/home"
import { useSession } from "@/queries/session"

const backgroundQuery = nftListQuerySchema.parse({})
const noop = () => undefined

export function AuthPage({ mode }: { mode: AuthMode }) {
  const desktop = useMediaQuery("(min-width: 1024px)")
  const navigate = useNavigate()
  const router = useRouter()
  const { redirect } = useSearch({ strict: false }) as { redirect?: string }
  const { data: session } = useSession()
  const [open, setOpen] = useState(true)
  const authenticated = Boolean(session)

  useEffect(() => {
    if (authenticated) router.history.replace(safeRedirect(redirect))
  }, [authenticated, redirect, router])

  if (authenticated) return null
  if (!desktop) return <MobileAuth mode={mode} />

  return (
    <>
      <HomeView query={backgroundQuery} onQueryChange={noop} onClearFilters={noop} />
      <AuthModal
        mode={mode}
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) void navigate({ to: "/" })
        }}
      />
    </>
  )
}
