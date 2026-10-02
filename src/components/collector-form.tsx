import { useState } from "react"
import type { Network } from "@/api/contracts"
import { CircleMark } from "@/components/circle-mark"
import { FormField } from "@/components/form-field"
import { SelectField, type SelectOption } from "@/components/select-field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { networkOptions } from "@/lib/account-labels"
import type { CollectorErrors, CollectorValues, WalletChoice } from "@/lib/checkout-types"

const ensSuffixes: SelectOption[] = [{ value: ".eth", label: ".eth" }]

type CollectorFormProps = {
  values: CollectorValues
  onValuesChange: (patch: Partial<CollectorValues>) => void
  errors: CollectorErrors
  network: Network
  onNetworkChange: (network: Network) => void
  wallets: WalletChoice[]
  walletId: string | null
  onWalletChange: (id: string) => void
  readOnly?: boolean
}

export function CollectorForm({
  values,
  onValuesChange,
  errors,
  network,
  onNetworkChange,
  wallets,
  walletId,
  onWalletChange,
  readOnly = false,
}: CollectorFormProps) {
  const [otherWallet, setOtherWallet] = useState(false)
  const wallet = wallets.find((item) => item.id === walletId)
  const walletOptions: SelectOption[] = wallets.map((item) => ({
    value: item.id,
    label: item.label,
  }))

  return (
    <section aria-labelledby="collector-heading" className="flex min-w-0 flex-1 flex-col gap-3">
      <h2 id="collector-heading" className="font-bold text-label leading-4 text-foreground">
        Perfil do colecionador
      </h2>
      <form
        id="collector-form"
        noValidate
        onSubmit={(event) => event.preventDefault()}
        className="flex flex-col gap-6"
      >
        <fieldset disabled={readOnly} className="m-0 flex min-w-0 flex-col gap-6 border-0 p-0">
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="flex flex-1 flex-col gap-3">
              <FormField
                label="Nome de exibição"
                htmlFor="display-name"
                required
                error={errors.fullName}
              >
                <Input
                  id="display-name"
                  name="displayName"
                  autoComplete="name"
                  value={values.fullName}
                  onChange={(event) => onValuesChange({ fullName: event.target.value })}
                  aria-invalid={errors.fullName ? true : undefined}
                  aria-describedby={errors.fullName ? "display-name-error" : undefined}
                />
              </FormField>
              <FormField label="Rede" htmlFor="network" required error={errors.network}>
                <SelectField
                  id="network"
                  placeholder="Selecione uma rede"
                  options={networkOptions}
                  value={network}
                  onValueChange={(value) => onNetworkChange(value as Network)}
                  required
                />
              </FormField>
              <FormField label="Endereço da carteira" htmlFor="wallet-address" required>
                <Input
                  id="wallet-address"
                  name="walletAddress"
                  placeholder="Endereço 0x da carteira"
                  autoComplete="off"
                  value={wallet?.address ?? ""}
                  readOnly
                />
              </FormField>
              <FormField
                label="Tipo de carteira"
                htmlFor="wallet-type"
                required
                error={errors.walletId}
              >
                <SelectField
                  id="wallet-type"
                  placeholder="Selecione uma carteira"
                  options={walletOptions}
                  value={walletId ?? undefined}
                  onValueChange={onWalletChange}
                  required
                />
              </FormField>
              <FormField label="E-mail" htmlFor="email" required error={errors.email}>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={(event) => onValuesChange({ email: event.target.value })}
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
              </FormField>
            </div>
            <div className="flex flex-1 flex-col gap-3">
              <FormField label="Nome de usuário" htmlFor="username" required>
                <Input id="username" name="username" autoComplete="username" />
              </FormField>
              <FormField
                label="Nome do perfil"
                htmlFor="profile-name"
                required
                className="justify-end"
              >
                <Input id="profile-name" name="profileName" />
              </FormField>
              <div className="flex h-[69px] w-full items-end">
                <Input
                  id="secondary-wallet"
                  name="secondaryWallet"
                  aria-label="ENS ou carteira secundária (opcional)"
                  placeholder="ENS ou carteira secundária (opcional)"
                  autoComplete="off"
                />
              </div>
              <FormField
                label="Código de indicação"
                htmlFor="referral-code"
                required
                labelClassName="w-[172px]"
              >
                <Input id="referral-code" name="referralCode" autoComplete="off" />
              </FormField>
              <FormField label="Nome ENS" htmlFor="ens-suffix" required className="w-[92px]">
                <SelectField
                  id="ens-suffix"
                  placeholder=".eth"
                  options={ensSuffixes}
                  value=".eth"
                  className="w-[78px] gap-1.5 pt-2.5 pr-2 pb-3 pl-2.5 text-body text-foreground"
                />
              </FormField>
            </div>
          </div>
          <label className="flex w-fit cursor-pointer items-start gap-2 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-highlight">
            <input
              type="checkbox"
              name="otherWallet"
              checked={otherWallet}
              onChange={(event) => setOtherWallet(event.target.checked)}
              className="sr-only"
            />
            <CircleMark variant="check" checked={otherWallet} />
            <span className="text-body leading-[normal] whitespace-nowrap text-foreground">
              Usar outra carteira?
            </span>
          </label>
          <FormField
            label="Observação do colecionador (opcional)"
            htmlFor="notes"
            className="max-w-[350px] gap-3"
          >
            <Textarea id="notes" name="notes" />
          </FormField>
        </fieldset>
      </form>
    </section>
  )
}
