import { expect, test } from "./fixtures"
import { addToCart, NFT, SECOND_NFT } from "./helpers-checkout"

const first = (locator: import("@playwright/test").Locator) =>
  locator.filter({ visible: true }).first()

test("detalhe: acesso direto, limite de quantidade, NFT inexistente e edição esgotada", async ({
  page,
  gotoWithScenario,
  mock,
}) => {
  await gotoWithScenario("/nfts/nft-001")
  await expect(
    first(page.getByRole("heading", { level: 1, name: "Emerald Ape #042" })),
  ).toBeVisible()

  const increase = first(page.getByRole("button", { name: "Aumentar quantidade" }))
  for (let i = 0; i < 12; i++) if (await increase.isEnabled()) await increase.click()
  await expect(increase).toBeDisabled()

  await page.goto("/nfts/nft-999")
  await expect(page.getByText("NFT não encontrado.")).toBeVisible()
  await expect(page.getByRole("link", { name: "Voltar para o início" })).toBeVisible()

  await mock.updateEdition("nft-001", "nft-001-standard", { available: 0 })
  await page.goto("/nfts/nft-001")
  await expect(first(page.getByText("Esta edição está esgotada."))).toBeVisible()
  await expect(first(page.getByRole("button", { name: /^(COMPRAR|Comprar NFT)$/ }))).toBeDisabled()
})

test("favoritos: atualização otimista, falha com rollback e recuperação", async ({
  page,
  signIn,
  mock,
}) => {
  await signIn("ana", "/nfts/nft-001")
  const heart = () =>
    first(
      page.getByRole("button", {
        name: /^(Favoritar|Favoritado|Adicionar aos favoritos|Remover dos favoritos)$/,
      }),
    )
  await expect(heart()).toHaveAttribute("aria-pressed", "false")

  await mock.setScenario("favorites-failure")
  await heart().click()
  await expect(
    page
      .locator("[data-sonner-toast]")
      .filter({ hasText: "Não foi possível atualizar seus favoritos." }),
  ).toBeVisible()
  await expect(heart()).toHaveAttribute("aria-pressed", "false")

  await mock.setScenario("default")
  await heart().click()
  await expect(heart()).toHaveAttribute("aria-pressed", "true")
  await expect(
    page.locator("[data-sonner-toast]").filter({ hasText: "Adicionado aos favoritos." }),
  ).toBeVisible()
  await page.reload()
  await expect(heart()).toHaveAttribute("aria-pressed", "true")
})

test("carrinho: quantidade, remoção, cupom inválido/expirado/válido e persistência após refresh", async ({
  page,
  signIn,
}) => {
  await signIn("ana", "/")
  await addToCart(page, NFT, 1)
  await addToCart(page, SECOND_NFT, 1)
  await page.goto("/cart")

  const quantity = first(page.getByRole("group", { name: /Quantidade de Sage Nomad/ }))
  await expect(quantity).toContainText("1")
  await first(page.getByRole("button", { name: "Aumentar quantidade" })).click()
  await expect(quantity).toContainText("2")

  await first(page.getByRole("button", { name: /Remover Violet Nomad #314 do carrinho/ })).click()
  await expect(page.getByRole("button", { name: /Remover Violet Nomad #314/ })).toHaveCount(0)

  const code = first(page.getByPlaceholder("Digite o código promocional..."))
  const apply = first(page.getByRole("button", { name: "Aplicar" }))
  const toast = (text: string) =>
    page.locator("[data-sonner-toast]").filter({ hasText: text }).first()

  await code.fill("NAOEXISTE")
  await apply.click()
  await expect(toast("Cupom inválido.")).toBeVisible()

  await code.fill("EXPIRED20")
  await apply.click()
  await expect(toast("Este cupom expirou.")).toBeVisible()

  await code.fill("WELCOME10")
  await apply.click()
  await expect(first(page.getByText("WELCOME10"))).toBeVisible()

  await page.reload()
  await expect(first(page.getByRole("group", { name: /Quantidade de Sage Nomad/ }))).toContainText(
    "2",
  )
  await expect(first(page.getByText("WELCOME10"))).toBeVisible()
})
