import { expect, test, USERS, waitForRealtime } from "./fixtures"
import {
  addToCart,
  cartItems,
  confirmButton,
  NFT,
  nftUpdatedEvent,
  openCheckout,
  orderDialog,
  orderIdFromUrl,
  ordersOf,
  placeOrder,
  submitLogin,
  TITLES,
} from "./helpers-checkout"

test.describe.configure({ mode: "parallel" })

const changeNotice = (page: import("@playwright/test").Page, text: string | RegExp) =>
  page.getByRole("status").filter({ hasText: text }).filter({ visible: true }).first()

test("purchase: catalog to confirmed receipt, cart emptied", async ({ page, signIn }) => {
  await signIn("ana", "/")

  await page.getByRole("heading", { level: 3 }).first().getByRole("link").click()
  await page.waitForURL(/\/nfts\//)
  await page
    .getByRole("button", { name: /^(COMPRAR|Comprar NFT)$/ })
    .filter({ visible: true })
    .click()
  await page.waitForURL(/\/cart/)
  await page.getByRole("link", { name: "Conectar e finalizar" }).filter({ visible: true }).click()
  await page.waitForURL(/\/checkout/)
  await expect(confirmButton(page)).toBeEnabled({ timeout: 10_000 })
  await confirmButton(page).click()
  await page.waitForURL(/\/orders\/ord-/)

  const dialog = orderDialog(page)
  await expect(dialog.getByRole("heading", { name: TITLES.confirmed })).toBeVisible({
    timeout: 15_000,
  })
  await expect(dialog.getByText("ID da transação")).toBeVisible()
  await expect(dialog.getByText(/0x[0-9a-f]{4}/i).first()).toBeVisible()
  await expect(dialog.getByText("Total", { exact: true }).first()).toBeVisible()
  await expect(dialog.getByText(/ETH/).first()).toBeVisible()
  await expect(dialog.getByText("Taxa de rede").first()).toBeVisible()
  await expect(dialog.getByText(/Edição/).first()).toBeVisible()

  await expect.poll(async () => (await cartItems(page)).length).toBe(0)
  expect(await ordersOf(page)).toHaveLength(1)
})

test("payment declined keeps items in the cart", async ({ page, signIn, mock }) => {
  await signIn("ana", "/")
  await mock.setScenario("payment-declined")
  await addToCart(page)
  await placeOrder(page)
  const dialog = orderDialog(page)
  await expect(dialog.getByRole("heading", { name: TITLES.declined })).toBeVisible({
    timeout: 15_000,
  })
  expect((await cartItems(page)).map((item) => item.nftId)).toEqual([NFT.id])
  await dialog.getByRole("button", { name: "Voltar ao pagamento" }).click()
  await page.waitForURL(/\/checkout/)
})

test("repeated clicks on confirm create a single order", async ({ page, signIn, mock }) => {
  await signIn("ana", "/")
  await mock.setScenario("order-pending")
  await addToCart(page)
  await openCheckout(page)
  await confirmButton(page).click({ clickCount: 3, delay: 10 })
  await page.waitForURL(/\/orders\/ord-/)
  await expect(orderDialog(page).getByRole("heading", { name: TITLES.pending })).toBeVisible()
  expect(await ordersOf(page)).toHaveLength(1)
})

test("order timeout is recovered by idempotency without a second order", async ({
  page,
  signIn,
  mock,
}) => {
  test.setTimeout(60_000)
  await page.clock.install()
  await signIn("ana", "/")
  await mock.setScenario("order-timeout")
  await addToCart(page)
  await openCheckout(page)
  await confirmButton(page).click()
  await expect(confirmButton(page)).toHaveText(/Confirmando/)
  await expect(confirmButton(page)).toHaveText(/Confirmar compra/, { timeout: 20_000 })
  expect(page.url()).toContain("/checkout")
  const created = await ordersOf(page)
  expect(created).toHaveLength(1)
  expect(created[0]?.status).toBe("pending")

  await expect(confirmButton(page)).toBeEnabled()
  await confirmButton(page).click()
  await page.waitForURL(/\/orders\/ord-/)
  expect(orderIdFromUrl(page)).toBe(created[0]?.id)
  expect(await ordersOf(page)).toHaveLength(1)
})

test("cart reflects price and availability changes pushed through Socket.IO", async ({
  page,
  signIn,
  mock,
}) => {
  await signIn("ana", "/")
  await addToCart(page, NFT, 2)
  await page.goto("/cart")
  await waitForRealtime(page, "connected")
  await expect(page.getByText("3.38 ETH").filter({ visible: true }).first()).toBeVisible()

  await mock.updateEdition(NFT.id, NFT.edition, { price: "2.5" })
  const notice = changeNotice(page, "Os valores do seu carrinho mudaram")
  await expect(notice).toBeVisible()
  await expect(notice).toContainText("1.69 ETH")
  await expect(notice).toContainText("2.50 ETH")
  await expect(page.getByText("2.50 ETH").filter({ visible: true }).first()).toBeVisible()

  await mock.updateEdition(NFT.id, NFT.edition, { available: 1 })
  await expect(notice).toContainText(/disponibilidade/i)
  await expect(notice.getByRole("listitem")).toHaveCount(2)

  await notice.getByRole("button", { name: "Entendi" }).click()
  await expect(changeNotice(page, "Os valores do seu carrinho mudaram")).toHaveCount(0)
})

test("checkout blocks confirmation until values are refreshed", async ({ page, signIn, mock }) => {
  await signIn("ana", "/")
  await addToCart(page)
  await openCheckout(page)
  await waitForRealtime(page, "connected")

  await mock.updateEdition(NFT.id, NFT.edition, { price: "3.1" })
  await expect(
    page.getByText("Os valores do seu pedido mudaram").filter({ visible: true }).first(),
  ).toBeVisible()
  await expect(confirmButton(page)).toBeDisabled()

  await page.getByRole("button", { name: "Atualizar valores" }).filter({ visible: true }).click()
  await expect(confirmButton(page)).toBeEnabled({ timeout: 10_000 })
  await expect(page.getByText("3.10 ETH").filter({ visible: true }).first()).toBeVisible()
  await expect(page.getByText("Os valores do seu pedido mudaram")).toHaveCount(0)
  await confirmButton(page).click()
  await page.waitForURL(/\/orders\/ord-/)
})

test("duplicate and stale events do not regress or reapply", async ({ page, signIn, mock }) => {
  await signIn("ana", "/")
  await addToCart(page)
  await page.goto("/cart")
  await waitForRealtime(page, "connected")

  await mock.updateEdition(NFT.id, NFT.edition, { price: "3.3" })
  const notice = changeNotice(page, "Os valores do seu carrinho mudaram")
  await expect(notice).toContainText("3.30 ETH")
  await expect(notice.getByRole("listitem")).toHaveCount(1)
  const toasts = page.locator("[data-sonner-toast]")
  const toastCount = await toasts.count()

  await mock.socket.replay(5)
  await mock.socket.replay(5)
  await page.waitForTimeout(600)
  await expect(notice.getByRole("listitem")).toHaveCount(1)
  await expect(notice).toContainText("1.69 ETH")
  expect(await toasts.count()).toBeLessThanOrEqual(toastCount)

  await mock.socket.emit(
    nftUpdatedEvent(NFT.id, NFT.edition, {
      id: "evt-stale-1",
      version: 1,
      price: "0.5",
      available: 10,
    }),
  )
  await page.waitForTimeout(600)
  await expect(page.getByText("0.50 ETH")).toHaveCount(0)
  await expect(page.getByText("3.30 ETH").filter({ visible: true }).first()).toBeVisible()
})

test("pending order survives a connection drop and settles after reconnect", async ({
  page,
  signIn,
  mock,
}) => {
  await signIn("ana", "/")
  await mock.setScenario("order-pending")
  await addToCart(page)
  const orderId = await placeOrder(page)
  const dialog = orderDialog(page)
  await expect(dialog.getByRole("heading", { name: TITLES.pending })).toBeVisible()
  await waitForRealtime(page, "connected")

  await mock.socket.disconnect()
  await expect(page.getByText("Reconectando ao tempo real…")).toBeVisible()
  await mock.settleOrder(orderId, "confirmed")
  await mock.socket.restore()
  await expect(page.getByText("Conexão em tempo real restabelecida.")).toBeVisible({
    timeout: 15_000,
  })
  await expect(dialog.getByRole("heading", { name: TITLES.confirmed })).toBeVisible({
    timeout: 15_000,
  })
  expect(await ordersOf(page)).toHaveLength(1)
})

test("logout and user switch replace the realtime session", async ({ page, signIn, mock }) => {
  await signIn("ana", "/profile")
  await waitForRealtime(page, "connected")
  await expect
    .poll(async () => (await mock.socket.status()).body)
    .toMatchObject({ connections: [{ userId: USERS.ana.id }] })

  await page.getByRole("button", { name: "Sair" }).filter({ visible: true }).first().click()
  await expect(page).toHaveURL(/\/$/)
  await waitForRealtime(page, "connected")
  await expect
    .poll(async () => {
      const body = (await mock.socket.status()).body as { connections: { userId: string | null }[] }
      return body.connections.map((connection) => connection.userId)
    })
    .toEqual([null])

  await page.goto("/login")
  await submitLogin(page, USERS.bruno)
  await expect(page).toHaveURL(/\/$/)
  await expect
    .poll(async () => {
      const body = (await mock.socket.status()).body as { connections: { userId: string | null }[] }
      return body.connections.map((connection) => connection.userId)
    })
    .toEqual([USERS.bruno.id])
  expect(await cartItems(page)).toEqual([])
})
