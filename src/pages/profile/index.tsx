import { useQuery } from "@tanstack/react-query"
import { AccountLayout } from "@/components/account-layout"
import { AccountFormSkeleton } from "@/components/account-skeleton"
import { AccountError } from "@/components/account-state"
import { ProfileForm } from "@/pages/profile/components/profile-form"
import { profileQueryOptions } from "@/queries/account"

export function ProfilePage() {
  const profile = useQuery(profileQueryOptions())
  return (
    <AccountLayout>
      {profile.isPending ? (
        <AccountFormSkeleton label="Carregando perfil" fields={6} />
      ) : profile.isError ? (
        <AccountError
          title="Não foi possível carregar seu perfil."
          onRetry={() => void profile.refetch()}
        />
      ) : (
        <ProfileForm key={profile.data.updatedAt} profile={profile.data} />
      )}
    </AccountLayout>
  )
}
