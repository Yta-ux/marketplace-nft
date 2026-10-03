import type { Page } from "@playwright/test"
import { callApi, expect, expectResponse } from "./fixtures"

export const NFT = { id: "nft-002", edition: "nft-002-standard", name: "Sage Nomad #009" }
export const SECOND_NFT = { id: "nft-005", edition: "nft-005-standard" }

type CartBody = { items: { nftId: string; editionId: string; quantity: number }[] }
type OrdersBody = { items: { id: string; status: string }[] }

export function authToken(page: Page): Promise<string> {
  return page.evaluate(() => localStorage.getItem("nft:session-token") ?? "")
}

export async function addToCart(
  page: Page,
  item: { id: string; edition: string } = NFT,
  quantity = 1,
) {
  const token = await authToken(page)
  const result = expectResponse(
    await callApi(page, "POST", "/cart/items", {
      token,
      body: { nftId: item.id, editionId: item.edition, quantity },
    }),
  )
  expect([200, 201]).toContain(result.status)
}

export async function cartItems(page: Page) {
  const token = await authToken(page)
  const result = expectResponse(await callApi<CartBody>(page, "GET", "/cart", { token }))
  return result.body.items
}

export async function ordersOf(page: Page) {
  const token = await authToken(page)
  const result = expectResponse(await callApi<OrdersBody>(page, "GET", "/orders", { token }))
  return result.body.items
}

export function confirmButton(page: Page) {
  return page
    .getByRole("button", { name: /confirmar compra|confirmando/i })
    .filter({ visible: true })
    .first()
}

export async function openCheckout(page: Page) {
  await page.goto("/cart")
  await page
    .getByRole("link", { name: "Conectar e finalizar" })
    .filter({ visible: true })
    .first()
    .click()
  await page.waitForURL(/\/checkout/)
  await expect(confirmButton(page)).toBeEnabled({ timeout: 10_000 })
}

export async function placeOrder(page: Page): Promise<string> {
  await openCheckout(page)
  await confirmButton(page).click()
  await page.waitForURL(/\/orders\/ord-/)
  return orderIdFromUrl(page)
}

export function orderIdFromUrl(page: Page): string {
  const match = page.url().match(/\/orders\/([^/?#]+)/)
  if (!match?.[1]) throw new Error(`No order id in ${page.url()}`)
  return match[1]
}

export function orderDialog(page: Page) {
  return page.getByRole("dialog")
}

export const TITLES = {
  pending: "Aguardando a confirmação na rede",
  confirmed: "Seus NFTs agora estão na sua carteira",
  declined: "Pagamento recusado",
}

export function nftUpdatedEvent(
  nftId: string,
  editionId: string,
  data: { id: string; version: number; price: string; available: number },
) {
  return {
    id: data.id,
    type: "nft.updated",
    resource: { type: "nft", id: nftId },
    version: data.version,
    occurredAt: new Date().toISOString(),
    data: {
      nftId,
      priceFrom: data.price,
      totalAvailable: data.available,
      editions: [{ id: editionId, price: data.price, available: data.available }],
    },
  }
}

export async function submitLogin(page: Page, user: { email: string; password: string }) {
  await page.locator('input[aria-label="E-mail"]').filter({ visible: true }).fill(user.email)
  await page.locator('input[aria-label="Senha"]').filter({ visible: true }).fill(user.password)
  await page.getByRole("button", { name: "Entrar" }).filter({ visible: true }).last().click()
}
