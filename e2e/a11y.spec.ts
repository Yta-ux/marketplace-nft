import type { Page } from "@playwright/test"
import { expect, test } from "./fixtures"
import { horizontalOverflow } from "./helpers-account"
import { addToCart } from "./helpers-checkout"

async function settle(page: Page) {
  await page.locator("main").waitFor()
  await expect(page.locator("[data-slot=skeleton]")).toHaveCount(0)
  await page.evaluate(() => document.fonts.ready)
}

const isDesktopViewport = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024

async function insideDialog(page: Page): Promise<boolean> {
  return page.evaluate(() => Boolean(document.activeElement?.closest("[role=dialog]")))
}

test.describe("teclado e foco", () => {
  test("skip link é o primeiro foco e leva ao conteúdo", async ({ page, gotoWithScenario }) => {
    await gotoWithScenario("/")
    await page.locator("#main").waitFor()
    await page.keyboard.press("Tab")
    await expect(page.getByRole("link", { name: "Pular para o conteúdo" })).toBeFocused()
    await page.keyboard.press("Enter")
    await expect(page).toHaveURL(/#main$/)
  })

  test("busca do header prende o foco, fecha com Escape e devolve o foco", async ({
    page,
    gotoWithScenario,
  }) => {
    test.skip(!isDesktopViewport(page), "busca do header existe apenas no desktop")
    await gotoWithScenario("/")
    const trigger = page.getByRole("button", { name: "Buscar NFTs" })
    await trigger.focus()
    await page.keyboard.press("Enter")
    const dialog = page.getByRole("dialog", { name: "Buscar NFTs" })
    await expect(dialog).toBeVisible()
    expect(await insideDialog(page)).toBe(true)
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press("Tab")
      expect(await insideDialog(page)).toBe(true)
    }
    await page.keyboard.press("Escape")
    await expect(dialog).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })

  test("modal de login prende o foco e fecha com Escape", async ({ page, gotoWithScenario }) => {
    test.skip(!isDesktopViewport(page), "no mobile o login é tela cheia")
    await gotoWithScenario("/login")
    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()
    await expect.poll(() => insideDialog(page)).toBe(true)
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab")
      expect(await insideDialog(page)).toBe(true)
    }
    await page.keyboard.press("Escape")
    await expect(dialog).toHaveCount(0)
    await expect(page).toHaveURL(/\/$/)
  })

  test("drawer de filtros no mobile prende o foco e devolve ao fechar", async ({
    page,
    gotoWithScenario,
  }) => {
    test.skip(isDesktopViewport(page), "drawer de filtros existe apenas no mobile")
    await gotoWithScenario("/")
    const trigger = page.getByRole("button", { name: "Abrir filtros" })
    await trigger.click()
    const sheet = page.getByRole("dialog", { name: "Filtros" })
    await expect(sheet).toBeVisible()
    await expect.poll(() => insideDialog(page)).toBe(true)
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab")
      expect(await insideDialog(page)).toBe(true)
    }
    await page.keyboard.press("Escape")
    await expect(sheet).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })
})

test.describe("formulários e feedback", () => {
  test("cadastro vazio associa erros aos campos com role=alert", async ({
    page,
    gotoWithScenario,
  }) => {
    await gotoWithScenario("/register")
    await page
      .getByRole("button", { name: /^(Criar conta|Criar perfil)$/ })
      .filter({ visible: true })
      .click()
    for (const name of ["email", "password"]) {
      const input = page.locator(`#auth-${name}`)
      await expect(input).toHaveAttribute("aria-invalid", "true")
      await expect(input).toHaveAttribute("aria-describedby", `auth-${name}-error`)
      const error = page.locator(`#auth-${name}-error`)
      await expect(error).toHaveAttribute("role", "alert")
      await expect(error).not.toBeEmpty()
    }
  })
})

test.describe("semântica e feedback", () => {
  test("imagens relevantes têm texto alternativo", async ({ page, gotoWithScenario }) => {
    const relevantAlts = (path: string) =>
      page.locator(`${path} img`).evaluateAll((images) =>
        images
          .filter((image) => image.getBoundingClientRect().width > 40)
          .filter((image) => image.closest("[aria-hidden=true]") === null)
          .filter((image) => image.closest("button[aria-label], a[aria-label]") === null)
          .map((image) => image.getAttribute("alt") ?? ""),
      )
    await gotoWithScenario("/")
    await page.locator("#catalogo article").first().waitFor()
    const catalog = await relevantAlts("#catalogo article")
    expect(catalog.length).toBeGreaterThan(0)
    for (const alt of catalog) expect(alt.trim().length).toBeGreaterThan(0)

    await page.goto("/nfts/nft-001")
    await page.getByRole("heading", { level: 1 }).first().waitFor()
    const detail = await relevantAlts("main")
    expect(detail.length).toBeGreaterThan(0)
    for (const alt of detail) expect(alt.trim().length).toBeGreaterThan(0)
  })

  test("toasts e avisos são anunciados por regiões aria-live", async ({ page, signIn }) => {
    await signIn("ana", "/nfts/nft-001")
    await page
      .getByRole("button", { name: /^(Favoritar|Adicionar aos favoritos)$/ })
      .filter({ visible: true })
      .first()
      .click()
    const toast = page.locator("[data-sonner-toast]").first()
    await expect(toast).toBeVisible()
    const live = await toast.evaluate((el) => el.closest("[aria-live]")?.getAttribute("aria-live"))
    expect(live).toBe("polite")
    await expect(page.locator("[role=status][aria-live=polite]").first()).toBeAttached()
  })

  test("abas do detalhe funcionam por teclado com setas", async ({ page, gotoWithScenario }) => {
    await gotoWithScenario("/nfts/nft-001")
    const details = page.getByRole("tab", { name: "Detalhes do NFT" })
    const reviews = page.getByRole("tab", { name: /Avaliações/ })
    await details.focus()
    await page.keyboard.press("ArrowRight")
    await expect(reviews).toBeFocused()
    await expect(reviews).toHaveAttribute("aria-selected", "true")
    await page.keyboard.press("Home")
    await expect(details).toBeFocused()
    await expect(details).toHaveAttribute("aria-selected", "true")
  })
})

test.describe("sem overflow horizontal e reflow", () => {
  test.skip(({ isMobile }) => isMobile, "o teste percorre as larguras por conta própria")
  const WIDTHS = [320, 390, 768, 1440]

  test("rotas públicas em 320, 390, 768 e 1440", async ({ page, gotoWithScenario }) => {
    test.setTimeout(120_000)
    for (const path of ["/", "/nfts/nft-001", "/login", "/register"]) {
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 900 })
        await gotoWithScenario(path)
        await settle(page)
        expect(await horizontalOverflow(page), `${path} @${width}`).toBeLessThanOrEqual(1)
      }
    }
  })

  test("rotas privadas em 320, 390, 768 e 1440", async ({ page, signIn }) => {
    test.setTimeout(120_000)
    await signIn("ana", "/")
    await addToCart(page)
    for (const path of ["/cart", "/checkout", "/profile", "/wallets"]) {
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 900 })
        await page.goto(path)
        await settle(page)
        expect(await horizontalOverflow(page), `${path} @${width}`).toBeLessThanOrEqual(1)
      }
    }
  })
})
