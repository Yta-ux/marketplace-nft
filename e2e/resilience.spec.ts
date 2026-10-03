import { expect, test } from "./fixtures"

test("rede lenta mostra skeleton; erro 5xx mostra falha e a nova tentativa recupera", async ({
  page,
  gotoWithScenario,
  mock,
}) => {
  await gotoWithScenario("/", "slow-network")
  await expect(
    page.locator("#catalogo ul[aria-busy=true] [data-slot=skeleton]").first(),
  ).toBeVisible()
  await expect(page.locator("#catalogo article").first()).toBeVisible({ timeout: 20_000 })

  await gotoWithScenario("/", "server-error")
  await expect(page.getByText("Não foi possível carregar o catálogo.")).toBeVisible()
  await mock.setScenario("default")
  await page.getByRole("button", { name: "Tentar novamente" }).click()
  await expect(page.locator("#catalogo article").first()).toBeVisible()
})

test("timeout de requisição mostra falha com nova tentativa e recupera", async ({
  page,
  gotoWithScenario,
  mock,
}) => {
  test.setTimeout(90_000)
  await gotoWithScenario("/", "request-timeout")
  await expect(page.getByText("Não foi possível carregar o catálogo.")).toBeVisible({
    timeout: 70_000,
  })
  await mock.setScenario("default")
  await page.getByRole("button", { name: "Tentar novamente" }).click()
  await expect(page.locator("#catalogo article").first()).toBeVisible()
})
