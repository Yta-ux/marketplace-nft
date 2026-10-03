import type { Locator, Page } from "@playwright/test"
import { callApi, expectResponse, USERS, type UserKey } from "./fixtures"

type NftPage = {
  items: { id: string; name: string; priceFrom: string }[]
  total: number
  totalPages: number
  page: number
}

export const gridNames = (page: Page): Locator => page.locator("#catalogo article h3")

export const onlyVisible = (locator: Locator): Locator => locator.filter({ visible: true })

export async function listNfts(page: Page, query = ""): Promise<NftPage> {
  await page.locator("html[data-mocks=ready]").waitFor({ state: "attached" })
  const res = expectResponse(
    await callApi<NftPage>(page, "GET", `/nfts${query ? `?${query}` : ""}`),
  )
  return res.body
}

export async function sessionToken(page: Page): Promise<string | null> {
  return page.evaluate(() => localStorage.getItem("nft:session-token"))
}

export async function guestCartId(page: Page): Promise<string | null> {
  return page.evaluate(() => localStorage.getItem("nft:guest-cart-id"))
}

type CartSnapshot = {
  items: { nftId: string; editionId: string; name: string; quantity: number }[]
  coupon: { code: string; status: string } | null
  itemCount: number
  summary: { subtotal: string; discount: string; total: string }
}

export async function fetchCart(page: Page): Promise<CartSnapshot> {
  const token = await sessionToken(page)
  const guest = token ? undefined : ((await guestCartId(page)) ?? undefined)
  return expectResponse(
    await callApi<CartSnapshot>(page, "GET", "/cart", { token, guestCartId: guest }),
  ).body
}

export async function fetchFavorites(page: Page): Promise<string[]> {
  const token = await sessionToken(page)
  return expectResponse(
    await callApi<{ nftIds: string[] }>(page, "GET", "/me/favorites", { token }),
  ).body.nftIds
}

export async function searchCatalog(page: Page, isMobile: boolean, term: string): Promise<void> {
  if (isMobile) {
    const field = page.getByRole("searchbox", { name: "Buscar NFTs" })
    await field.fill(term)
    await field.press("Enter")
    return
  }
  await page.getByRole("button", { name: "Buscar NFTs" }).click()
  await page.getByLabel("Termo de busca").fill(term)
  await page.getByRole("button", { name: "Buscar", exact: true }).click()
}

export function authRoot(page: Page): Locator {
  const width = page.viewportSize()?.width ?? 1440
  return width >= 1024 ? page.getByRole("dialog") : page.locator("main")
}

export async function fillAuthForm(
  page: Page,
  values: { username?: string; email?: string; password?: string; confirmPassword?: string },
): Promise<void> {
  const fill = async (label: string, value: string | undefined, exact = false) => {
    if (value === undefined) return
    await authRoot(page).getByLabel(label, { exact }).fill(value)
  }
  await fill("Nome de usuário", values.username)
  await fill("E-mail", values.email)
  await fill("Senha", values.password, true)
  await fill("Confirmar senha", values.confirmPassword)
}

export async function submitAuth(page: Page, label: "Entrar" | "Criar conta"): Promise<void> {
  const mobileLabel = label === "Criar conta" ? "Criar perfil" : label
  const width = page.viewportSize()?.width ?? 1440
  await authRoot(page)
    .getByRole("button", { name: width >= 1024 ? label : mobileLabel, exact: true })
    .click()
}

export async function loginViaUi(page: Page, user: UserKey, path = "/login"): Promise<void> {
  await page.goto(path)
  await page.locator("html[data-mocks=ready]").waitFor({ state: "attached" })
  await fillAuthForm(page, { email: USERS[user].email, password: USERS[user].password })
  await submitAuth(page, "Entrar")
}

export const buyButton = (page: Page): Locator =>
  onlyVisible(page.getByRole("button", { name: /^(COMPRAR|Comprar NFT)$/ }))

export async function addToCartAsVisitor(page: Page, nftId: string): Promise<void> {
  await page.goto(`/nfts/${nftId}`)
  await page.locator("html[data-mocks=ready]").waitFor({ state: "attached" })
  await buyButton(page).waitFor()
  await buyButton(page).click()
  await page.waitForURL(/\/cart$/)
}
