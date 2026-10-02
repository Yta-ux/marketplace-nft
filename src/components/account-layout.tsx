import type { ReactNode } from "react"
import { AccountSidebar } from "@/components/account-sidebar"
import { useLogout } from "@/queries/session"

export function AccountLayout({ children }: { children: ReactNode }) {
  const logout = useLogout()
  return (
    <div className="flex flex-col gap-8 pt-8 lg:flex-row lg:items-start lg:gap-7">
      <AccountSidebar onLogout={() => logout.mutate()} />
      {children}
    </div>
  )
}
