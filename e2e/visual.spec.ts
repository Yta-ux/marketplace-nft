import { expect, test } from "./fixtures"
import { waitForStableContent } from "./helpers-account"
import { addToCart, NFT, openCheckout } from "./helpers-checkout"

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
})

const carousel = (page: import("@playwright/test").Page) =>
  page.locator("[aria-roledescription=carousel]")

test("visual: início", async ({ page, gotoWithScenario }) => {
  await gotoWithScenario("/")
  await page.locator("#catalogo article").first().waitFor()
  await waitForStableContent(page)
  await expect(page).toHaveScreenshot("inicio.png", { mask: [carousel(page)] })
})

test("visual: detalhe do NFT", async ({ page, gotoWithScenario }) => {
  await gotoWithScenario("/nfts/nft-001")
  await page.getByRole("heading", { level: 1 }).first().waitFor()
  await waitForStableContent(page)
  await expect(page).toHaveScreenshot("detalhe.png")
})

test("visual: carrinho", async ({ page, signIn }) => {
  await signIn("ana", "/")
  await addToCart(page, NFT, 1)
  await page.goto("/cart")
  await expect(page.getByText(NFT.name).filter({ visible: true }).first()).toBeVisible()
  await waitForStableContent(page)
  await expect(page).toHaveScreenshot("carrinho.png")
})

test("visual: pagamento", async ({ page, signIn }) => {
  await signIn("ana", "/")
  await addToCart(page, NFT, 1)
  await openCheckout(page)
  await waitForStableContent(page)
  await expect(page).toHaveScreenshot("pagamento.png")
})
