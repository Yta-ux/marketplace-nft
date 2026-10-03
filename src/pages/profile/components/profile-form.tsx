import { type FormEvent, useState } from "react"
import { toast } from "sonner"
import type { Profile } from "@/api/contracts"
import { EnsField } from "@/components/ens-field"
import { FormField } from "@/components/form-field"
import { PasswordInput } from "@/components/password-input"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { passwordFormSchema, profileFormSchema } from "@/lib/account-schemas"
import { apiErrorMessage, translateFieldErrors } from "@/lib/api-message"
import { apiFieldErrors, type FieldErrors, readForm, zodFieldErrors } from "@/lib/form"
import { AvatarField } from "@/pages/profile/components/avatar-field"
import {
  useChangePassword,
  useRemoveAvatar,
  useUpdateProfile,
  useUploadAvatar,
} from "@/queries/account"

const field = "gap-2.5"

const invalid = (errors: FieldErrors, name: string) => ({
  "aria-invalid": errors[name] ? (true as const) : undefined,
  "aria-describedby": errors[name] ? `${name}-error` : undefined,
})

export function ProfileForm({ profile }: { profile: Profile }) {
  const update = useUpdateProfile()
  const changePassword = useChangePassword()
  const uploadAvatar = useUploadAvatar()
  const removeAvatar = useRemoveAvatar()
  const [errors, setErrors] = useState<FieldErrors>({})
  const saving = update.isPending || changePassword.isPending

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const values = readForm(form)
    const next: FieldErrors = {}

    const profileResult = profileFormSchema.safeParse(values)
    if (!profileResult.success) Object.assign(next, zodFieldErrors(profileResult.error))

    const wantsPassword = Boolean(
      values.currentPassword || values.newPassword || values.confirmPassword,
    )
    const passwordResult = wantsPassword ? passwordFormSchema.safeParse(values) : null
    if (passwordResult && !passwordResult.success) {
      Object.assign(next, zodFieldErrors(passwordResult.error))
    }

    setErrors(next)
    if (!profileResult.success || (passwordResult && !passwordResult.success)) return

    try {
      if (passwordResult?.success) {
        await changePassword.mutateAsync({
          currentPassword: passwordResult.data.currentPassword,
          newPassword: passwordResult.data.newPassword,
        })
      }
      const changed =
        profileResult.data.displayName !== profile.displayName ||
        profileResult.data.email !== profile.email
      if (changed) {
        await update.mutateAsync({
          displayName: profileResult.data.displayName,
          email: profileResult.data.email,
          bio: profile.bio,
          website: profile.website ?? "",
        })
      }
      form.reset()
      toast.success("Perfil atualizado.")
    } catch (error) {
      const fields = translateFieldErrors(apiFieldErrors(error))
      if (Object.keys(fields).length > 0) setErrors(fields)
      else toast.error(apiErrorMessage(error, "Não foi possível salvar o perfil."))
    }
  }

  return (
    <section aria-labelledby="profile-heading" className="flex min-w-0 flex-1 flex-col gap-8">
      <h1 id="profile-heading" className="font-bold text-body-lg leading-4 text-foreground">
        Perfil do colecionador
      </h1>
      <form noValidate onSubmit={submit} className="flex flex-col gap-8">
        <div className="grid gap-x-7 gap-y-6 md:grid-cols-2">
          <FormField
            label="Nome de exibição"
            htmlFor="displayName"
            required
            className={field}
            error={errors.displayName}
          >
            <Input
              id="displayName"
              name="displayName"
              autoComplete="name"
              defaultValue={profile.displayName}
              {...invalid(errors, "displayName")}
            />
          </FormField>
          <FormField label="Nome de usuário" htmlFor="profile-username" required className={field}>
            <Input id="profile-username" name="username" autoComplete="username" />
          </FormField>
          <FormField label="E-mail" htmlFor="email" required className={field} error={errors.email}>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={profile.email}
              {...invalid(errors, "email")}
            />
          </FormField>
          <FormField label="Nome ENS" htmlFor="profile-ens" required className={field}>
            <EnsField id="profile-ens" name="ens" />
          </FormField>
          <FormField
            label="Apelido da carteira"
            htmlFor="profile-wallet-alias"
            required
            className={field}
          >
            <Input id="profile-wallet-alias" name="walletAlias" autoComplete="off" />
          </FormField>
          <FormField label="Avatar" htmlFor="profile-avatar" className={field}>
            <AvatarField
              id="profile-avatar"
              src={profile.avatarUrl}
              pending={uploadAvatar.isPending || removeAvatar.isPending}
              onPick={(file) => uploadAvatar.mutate(file)}
              onRemove={() => removeAvatar.mutate()}
            />
          </FormField>
        </div>
        <fieldset className="m-0 flex min-w-0 flex-col gap-6 border-0 p-0">
          <legend className="mb-6 font-medium text-body-lg leading-4 text-foreground">
            Alterar senha
          </legend>
          <FormField
            label="Senha atual"
            htmlFor="currentPassword"
            className="max-w-[417px] gap-3"
            error={errors.currentPassword}
          >
            <PasswordInput
              id="currentPassword"
              name="currentPassword"
              autoComplete="current-password"
              {...invalid(errors, "currentPassword")}
            />
          </FormField>
          <FormField
            label="Nova senha"
            htmlFor="newPassword"
            className="max-w-[417px] gap-3"
            error={errors.newPassword}
          >
            <PasswordInput
              id="newPassword"
              name="newPassword"
              autoComplete="new-password"
              {...invalid(errors, "newPassword")}
            />
          </FormField>
          <FormField
            label="Confirmar nova senha"
            htmlFor="confirmPassword"
            className="max-w-[417px] gap-3"
            error={errors.confirmPassword}
          >
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              {...invalid(errors, "confirmPassword")}
            />
          </FormField>
        </fieldset>
        <Button
          type="submit"
          variant="brand"
          size="form"
          className="w-[131px] text-body-sm"
          disabled={saving}
          aria-busy={saving || undefined}
        >
          {saving ? "Salvando…" : "Salvar"}
        </Button>
      </form>
    </section>
  )
}
