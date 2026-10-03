import { useState } from "react"
import type { Wallet } from "@/api/contracts"
import { CircleMark } from "@/components/circle-mark"
import { WalletEditor } from "@/pages/wallets/components/wallet-editor"
import { WalletSummary } from "@/pages/wallets/components/wallet-summary"

type AddButtonProps = { label: string; text?: string; onClick: () => void }

function AddButton({ label, text = "Adicionar", onClick }: AddButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xs font-medium text-body-lg leading-4 text-highlight hover:underline"
    >
      {text}
      <span className="sr-only"> {label}</span>
    </button>
  )
}

export function WalletsForm({ wallets }: { wallets: Wallet[] }) {
  const primary = wallets.find((wallet) => wallet.role === "primary")
  const secondary = wallets.find((wallet) => wallet.role === "secondary")
  const [sameAsMain, setSameAsMain] = useState(!secondary)
  const [editingSecondary, setEditingSecondary] = useState(false)
  const showSecondaryEditor = editingSecondary || (!secondary && !sameAsMain)

  function toggleSecondary() {
    if (!secondary) setSameAsMain(false)
    setEditingSecondary((current) => !current)
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-8">
      <section aria-labelledby="main-wallet-heading" className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between leading-4">
            <h1 id="main-wallet-heading" className="font-bold text-label text-foreground">
              Carteira principal
            </h1>
            {!primary && (
              <AddButton
                label="carteira principal"
                onClick={() => document.getElementById("primary-label")?.focus()}
              />
            )}
          </div>
          <p className="text-body-sm leading-[15px] text-text-secondary">
            Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.
          </p>
        </div>
        {primary && <WalletSummary wallet={primary} />}
        <WalletEditor
          key={primary?.updatedAt ?? "new-primary"}
          wallet={primary}
          walletRole="primary"
          idPrefix="primary"
          full
        />
      </section>
      <section aria-labelledby="secondary-wallet-heading" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
          <h2
            id="secondary-wallet-heading"
            className="font-bold text-label leading-4 text-foreground"
          >
            Carteira secundária
          </h2>
          <div className="flex flex-wrap items-center gap-x-[17px] gap-y-2 lg:w-[343px] lg:flex-nowrap lg:justify-between lg:gap-0">
            <label className="flex cursor-pointer items-center gap-2 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-highlight">
              <input
                type="checkbox"
                checked={sameAsMain && !secondary}
                disabled={Boolean(secondary)}
                onChange={(event) => {
                  setSameAsMain(event.target.checked)
                  if (event.target.checked) setEditingSecondary(false)
                }}
                className="sr-only"
              />
              <CircleMark checked={sameAsMain && !secondary} />
              <span className="text-body-sm leading-4 whitespace-nowrap text-foreground">
                Igual à carteira principal
              </span>
            </label>
            <AddButton
              label="carteira secundária"
              text={secondary ? "Editar" : "Adicionar"}
              onClick={toggleSecondary}
            />
          </div>
        </div>
        {secondary ? (
          <WalletSummary wallet={secondary} />
        ) : (
          <p className="text-body-sm leading-[15px] text-text-secondary">
            Você ainda não adicionou uma carteira secundária.
          </p>
        )}
        {showSecondaryEditor && (
          <div className="pt-5">
            <WalletEditor
              key={secondary?.updatedAt ?? "new-secondary"}
              wallet={secondary}
              walletRole="secondary"
              idPrefix="secondary"
              onSaved={() => setEditingSecondary(false)}
            />
          </div>
        )}
      </section>
    </div>
  )
}
