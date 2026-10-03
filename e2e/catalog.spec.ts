import { expect, test } from "./fixtures"
import { gridNames, listNfts, searchCatalog } from "./helpers-catalog-auth"

const resultCount = (page: import("@playwright/test").Page) =>
  page.getByRole("status").filter({ hasText: /encontrado/ })

async function expectGridToMatch(page: import("@playwright/test").Page, query: string) {
  const expected = await listNfts(page, query)
  await expect(resultCount(page)).toHaveText(
    expected.total === 1 ? "1 NFT encontrado" : `${expected.total} NFTs encontrados`,
  )
  await expect(gridNames(page)).toHaveText(expected.items.map((item) => item.name))
}

test.beforeEach(async ({ gotoWithScenario, mock }) => {
  await gotoWithScenario("/")
  await mock.reset()
  await gotoWithScenario("/").catch(() => undefined)
})

test.describe("busca", () => {
  test("respostas fora de ordem: o resultado final é o da última busca", async ({
    gotoWithScenario,
    page,
    isMobile,
  }) => {
    await gotoWithScenario("/", "variable-latency")
    await expect(gridNames(page).first()).toBeVisible({ timeout: 15_000 })
    await searchCatalog(page, isMobile, "Emerald")
    await searchCatalog(page, isMobile, "Sage")
    await expect(page).toHaveURL(/[?&]q=Sage/)
    const expected = await listNfts(page, "q=Sage")
    await expect(gridNames(page)).toHaveText(
      expected.items.map((item) => item.name),
      { timeout: 20_000 },
    )
    await page.waitForTimeout(2500)
    await expect(gridNames(page)).toHaveText(expected.items.map((item) => item.name))
  })
})

test.describe("filtros, ordenação e paginação (desktop)", () => {
  test.skip(({ isMobile }) => isMobile, "painel lateral de filtros só existe no desktop")

  test("categoria + rede + preço combinam e refletem a API", async ({ page }) => {
    await page.locator("label", { hasText: "Arte digital" }).click()
    await expect(page).toHaveURL(/categories=digital-art/)
    await expectGridToMatch(page, "categories=digital-art")

    await page.locator("label", { hasText: "Ethereum" }).click()
    await expect(page).toHaveURL(/chains=ethereum/)
    await expect(page).toHaveURL(/categories=digital-art/)
    await expectGridToMatch(page, "categories=digital-art&chains=ethereum")

    const max = page.getByRole("slider", { name: "Preço máximo" })
    await max.focus()
    for (let i = 0; i < 60; i++) await max.press("PageDown")
    await page.getByRole("button", { name: "Aplicar" }).click()
    await expect(page).toHaveURL(/maxPrice=/)
    const maxPrice = new URL(page.url()).searchParams.get("maxPrice")
    expect(maxPrice).toBeTruthy()
    await expectGridToMatch(page, `categories=digital-art&chains=ethereum&maxPrice=${maxPrice}`)

    await page.reload()
    await expect(page).toHaveURL(/maxPrice=/)
    await expectGridToMatch(page, `categories=digital-art&chains=ethereum&maxPrice=${maxPrice}`)
  })

  test("paginação, histórico e reinício da página ao mudar filtro", async ({ page }) => {
    await page.getByRole("button", { name: "Página 2" }).click()
    await expect(page).toHaveURL(/page=2/)
    await expectGridToMatch(page, "page=2")
    await expect(page.getByRole("button", { name: "Página 2" })).toHaveAttribute(
      "aria-current",
      "page",
    )

    await page.reload()
    await expect(page).toHaveURL(/page=2/)
    await expectGridToMatch(page, "page=2")

    await page.locator("label", { hasText: "Fotografia" }).click()
    await expect(page).toHaveURL(/categories=photography/)
    await expect(page).not.toHaveURL(/page=/)
    await expectGridToMatch(page, "categories=photography")

    await page.goBack()
    await expect(page).toHaveURL(/page=2/)
    await expectGridToMatch(page, "page=2")
  })
})
