import { type FormEvent, useState } from "react"
import { toast } from "sonner"
import type { Network, Wallet, WalletProvider, WalletRole } from "@/api/contracts"
import { EnsField } from "@/components/ens-field"
import { FormField } from "@/components/form-field"
import { SelectField } from "@/components/select-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { networkOptions, providerOptions } from "@/lib/account-labels"
import { walletFormSchema } from "@/lib/account-schemas"
import { apiErrorMessage, translateFieldErrors } from "@/lib/api-message"
import { apiFieldErrors, type FieldErrors, readForm, zodFieldErrors } from "@/lib/form"
import { useCreateWallet, useUpdateWallet } from "@/queries/account"

const labelPull = "[&>label]:-mb-1"

type WalletEditorProps = {
  wallet?: Wallet
  walletRole: WalletRole
  idPrefix: string
  full?: boolean
  onSaved?: () => void
}

export function WalletEditor({
  wallet,
  walletRole,
  idPrefix,
  full = false,
  onSaved,
}: WalletEditorProps) {
  const create = useCreateWallet()
  const update = useUpdateWallet()
  const [errors, setErrors] = useState<FieldErrors>({})
  const [provider, setProvider] = useState<string | undefined>(wallet?.provider)
  const [network, setNetwork] = useState<string | undefined>(wallet?.networks[0])
  const saving = create.isPending || update.isPending
  const id = (name: string) => `${idPrefix}-${name}`
  const invalid = (name: string) => ({
    "aria-invalid": errors[name] ? (true as const) : undefined,
    "aria-describedby": errors[name] ? `${id(name)}-error` : undefined,
  })

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const values = readForm(event.currentTarget)
    const parsed = walletFormSchema.safeParse({
      label: values.label,
      address: values.address,
      provider,
      network,
    })
    if (!parsed.success) {
      const fields = zodFieldErrors(parsed.error)
      setErrors({
        label: fields.label ?? "",
        address: fields.address ?? "",
        provider: fields.provider ?? "",
        network: fields.network ?? "",
      })
      return
    }
    setErrors({})
    const chosen = parsed.data.network as Network
    const networks = [chosen, ...(wallet?.networks ?? []).filter((item) => item !== chosen)]
    const body = {
      label: parsed.data.label,
      address: parsed.data.address,
      provider: parsed.data.provider as WalletProvider,
      networks,
    }
    try {
      if (wallet) await update.mutateAsync({ id: wallet.id, body })
      else await create.mutateAsync({ ...body, role: walletRole })
      toast.success("Carteira salva.")
      onSaved?.()
    } catch (error) {
      const fields = translateFieldErrors(apiFieldErrors(error))
      if (Object.keys(fields).length > 0) setErrors(fields)
      else toast.error(apiErrorMessage(error, "Não foi possível salvar a carteira."))
    }
  }

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-8">
      <div className="grid gap-x-7 gap-y-6 md:grid-cols-2">
        {full && (
          <FormField
            label="Nome de exibição"
            htmlFor={id("display-name")}
            required
            className={labelPull}
          >
            <Input id={id("display-name")} name="displayName" autoComplete="name" />
          </FormField>
        )}
        <FormField
          label="Apelido da carteira"
          htmlFor={id("label")}
          required
          className={labelPull}
          error={errors.label}
        >
          <Input
            id={id("label")}
            name="label"
            autoComplete="off"
            defaultValue={wallet?.label}
            {...invalid("label")}
          />
        </FormField>
        <FormField
          label="Rede"
          htmlFor={id("network")}
          required
          className={labelPull}
          error={errors.network}
        >
          <SelectField
            id={id("network")}
            placeholder="Selecione uma rede"
            options={networkOptions}
            value={network}
            onValueChange={setNetwork}
            arrow="xl"
            required
          />
        </FormField>
        {full && (
          <FormField
            label="Nome do perfil"
            htmlFor={id("profile-name")}
            required
            className={labelPull}
          >
            <Input id={id("profile-name")} name="profileName" />
          </FormField>
        )}
        <FormField
          label="Endereço da carteira"
          htmlFor={id("address")}
          required
          className={labelPull}
          error={errors.address}
        >
          <Input
            id={id("address")}
            name="address"
            placeholder="Endereço 0x da carteira"
            autoComplete="off"
            defaultValue={wallet?.address}
            {...invalid("address")}
          />
        </FormField>
        {full && (
          <div className="flex items-end">
            <Input
              id={id("secondary-address")}
              name="secondaryAddress"
              aria-label="ENS ou carteira secundária (opcional)"
              placeholder="ENS ou carteira secundária (opcional)"
              autoComplete="off"
            />
          </div>
        )}
        <FormField
          label="Tipo de carteira"
          htmlFor={id("provider")}
          required
          className={labelPull}
          error={errors.provider}
        >
          <SelectField
            id={id("provider")}
            placeholder="Selecione uma carteira"
            options={providerOptions}
            value={provider}
            onValueChange={setProvider}
            arrow="xl"
            required
          />
        </FormField>
        {full && (
          <>
            <FormField
              label="Código de indicação"
              htmlFor={id("referral")}
              required
              className={labelPull}
            >
              <Input id={id("referral")} name="referralCode" autoComplete="off" />
            </FormField>
            <FormField label="E-mail" htmlFor={id("email")} required className={labelPull}>
              <Input id={id("email")} name="email" type="email" autoComplete="email" />
            </FormField>
            <FormField label="Nome ENS" htmlFor={id("ens")} required className={labelPull}>
              <EnsField id={id("ens")} name="ens" />
            </FormField>
          </>
        )}
      </div>
      <Button
        type="submit"
        variant="brand"
        size="form"
        className="w-[131px] text-body-sm whitespace-nowrap"
        disabled={saving}
        aria-busy={saving || undefined}
      >
        {saving ? "Salvando…" : "Salvar carteira"}
      </Button>
    </form>
  )
}
