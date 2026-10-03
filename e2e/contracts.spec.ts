import {
  apiErrorSchema,
  authResponseSchema,
  cartSchema,
  nftListResponseSchema,
  orderSchema,
  quoteSchema,
  sessionSchema,
  walletSchema,
  walletsResponseSchema,
} from "../src/api/contracts"
import { type Api, expect, expectResponse, test, USERS } from "./fixtures"

test.describe.configure({ mode: "parallel" })
test.skip(({ isMobile }) => isMobile, "API contracts are viewport-independent")

const guest = "guest_e2e"

test.beforeEach(async ({ gotoWithScenario }) => {
  await gotoWithScenario("/does-not-exist")
})

async function login(api: Api, user: keyof typeof USERS) {
  const res = expectResponse(
    await api("POST", "/auth/login", {
      body: { email: USERS[user].email, password: USERS[user].password },
    }),
  )
  expect(res.status).toBe(200)
  return authResponseSchema.parse(res.body).token
}

test("auth: register validation and conflict, login, session, logout, expiry", async ({
  api,
  mock,
}) => {
  const invalid = expectResponse(
    await api("POST", "/auth/register", {
      body: { displayName: "A", email: "bad", password: "short" },
    }),
  )
  expect(invalid.status).toBe(422)
  const invalidBody = apiErrorSchema.parse(invalid.body)
  expect(Object.keys(invalidBody.fields ?? {})).toEqual(
    expect.arrayContaining(["displayName", "email", "password"]),
  )

  const conflict = expectResponse(
    await api("POST", "/auth/register", {
      body: { displayName: "Ana", email: USERS.ana.email, password: "Another123" },
    }),
  )
  expect(conflict.status).toBe(409)
  expect(apiErrorSchema.parse(conflict.body).fields?.email).toBeDefined()

  const created = expectResponse(
    await api("POST", "/auth/register", {
      body: { displayName: "Dora", email: "dora@collector.test", password: "Dora12345" },
    }),
  )
  expect(created.status).toBe(201)
  authResponseSchema.parse(created.body)

  const wrong = expectResponse(
    await api("POST", "/auth/login", { body: { email: USERS.ana.email, password: "nope1234" } }),
  )
  expect(wrong.status).toBe(401)
  expect(apiErrorSchema.parse(wrong.body).code).toBe("INVALID_CREDENTIALS")

  const token = await login(api, "ana")
  const session = sessionSchema.parse(
    expectResponse(await api("GET", "/auth/session", { token })).body,
  )
  expect(session.user.id).toBe(USERS.ana.id)

  await mock.expireSessions()
  const expired = expectResponse(await api("GET", "/auth/session", { token }))
  expect(expired.status).toBe(401)
  expect(apiErrorSchema.parse(expired.body).code).toBe("SESSION_EXPIRED")

  const token2 = await login(api, "ana")
  expect(expectResponse(await api("POST", "/auth/logout", { token: token2 })).status).toBe(204)
  expect(
    apiErrorSchema.parse(expectResponse(await api("GET", "/auth/session", { token: token2 })).body)
      .code,
  ).toBe("UNAUTHENTICATED")
})

test("cart: limits, coupons, guest merge on login", async ({ api }) => {
  const add = expectResponse(
    await api("POST", "/cart/items", {
      guestCartId: guest,
      body: { nftId: "nft-002", editionId: "nft-002-standard", quantity: 2 },
    }),
  )
  expect(add.status).toBe(201)
  const cart = cartSchema.parse(add.body)
  expect(cart.itemCount).toBe(2)
  const itemId = cart.items[0]?.id as string

  const overLimit = expectResponse(
    await api("PATCH", `/cart/items/${itemId}`, { guestCartId: guest, body: { quantity: 6 } }),
  )
  expect(overLimit.status).toBe(409)
  expect(apiErrorSchema.parse(overLimit.body).code).toBe("AVAILABILITY_CONFLICT")

  const soldOut = expectResponse(
    await api("POST", "/cart/items", {
      guestCartId: guest,
      body: { nftId: "nft-014", editionId: "nft-014-gold", quantity: 1 },
    }),
  )
  expect(apiErrorSchema.parse(soldOut.body).code).toBe("AVAILABILITY_CONFLICT")

  const invalid = expectResponse(
    await api("POST", "/cart/coupon", { guestCartId: guest, body: { code: "NOPE" } }),
  )
  expect(apiErrorSchema.parse(invalid.body).code).toBe("COUPON_INVALID")
  const expired = expectResponse(
    await api("POST", "/cart/coupon", { guestCartId: guest, body: { code: "expired20" } }),
  )
  expect(apiErrorSchema.parse(expired.body).code).toBe("COUPON_EXPIRED")

  const withCoupon = cartSchema.parse(
    expectResponse(
      await api("POST", "/cart/coupon", { guestCartId: guest, body: { code: "WELCOME10" } }),
    ).body,
  )
  expect(withCoupon.coupon?.status).toBe("applied")
  expect(Number(withCoupon.summary.discount)).toBeGreaterThan(0)

  const { subtotal, discount, networkFee, total } = withCoupon.summary
  expect(Number(total)).toBeCloseTo(Number(subtotal) - Number(discount) + Number(networkFee), 12)

  const token = await login(api, "bruno")
  const merged = cartSchema.parse(
    expectResponse(await api("POST", "/cart/merge", { token, body: { guestCartId: guest } })).body,
  )
  expect(merged.items.map((i) => i.editionId)).toContain("nft-002-standard")
  expect(merged.coupon?.code).toBe("WELCOME10")
  const guestAfter = cartSchema.parse(
    expectResponse(await api("GET", "/cart", { guestCartId: guest })).body,
  )
  expect(guestAfter.items).toHaveLength(0)
})

test("checkout: quote, idempotent order, conflict, settlement, receipt snapshot, isolation", async ({
  api,
  mock,
}) => {
  await mock.setScenario("order-pending")
  const token = await login(api, "ana")
  await api("POST", "/cart/items", {
    token,
    body: { nftId: "nft-002", editionId: "nft-002-standard", quantity: 3 },
  })
  await api("POST", "/cart/items", {
    token,
    body: { nftId: "nft-005", editionId: "nft-005-standard", quantity: 1 },
  })

  const notConnected = walletsResponseSchema.parse(
    expectResponse(await api("GET", "/me/wallets", { token })).body,
  )
  expect(notConnected.items.map((w) => w.role)).toEqual(["primary", "secondary"])
  walletSchema.parse(
    expectResponse(
      await api("POST", "/me/wallets/wallet-001/connection", {
        token,
        body: { network: "polygon" },
      }),
    ).body,
  )

  const quote = quoteSchema.parse(
    expectResponse(await api("POST", "/quotes", { token, body: { network: "polygon" } })).body,
  )
  const body = {
    quoteId: quote.id,
    walletId: "wallet-001",
    network: "polygon",
    collector: { fullName: "Ana Collector", email: USERS.ana.email },
  }

  const missingKey = expectResponse(await api("POST", "/orders", { token, body }))
  expect(missingKey.status).toBe(422)

  const first = expectResponse(
    await api("POST", "/orders", { token, body, headers: { "Idempotency-Key": "key-1" } }),
  )
  expect(first.status).toBe(201)
  const order = orderSchema.parse(first.body)
  expect(order.status).toBe("pending")

  const retry = expectResponse(
    await api("POST", "/orders", { token, body, headers: { "Idempotency-Key": "key-1" } }),
  )
  expect(retry.status).toBe(200)
  expect(orderSchema.parse(retry.body).id).toBe(order.id)

  const reused = expectResponse(
    await api("POST", "/orders", {
      token,
      body: { ...body, collector: { ...body.collector, fullName: "Someone Else" } },
      headers: { "Idempotency-Key": "key-1" },
    }),
  )
  expect(apiErrorSchema.parse(reused.body).code).toBe("IDEMPOTENCY_CONFLICT")

  const pending = expectResponse(await api("GET", "/orders?status=pending", { token }))
  expect((pending.body as { items: unknown[] }).items).toHaveLength(1)

  const bruno = await login(api, "bruno")
  const forbidden = expectResponse(await api("GET", `/orders/${order.id}`, { token: bruno }))
  expect(apiErrorSchema.parse(forbidden.body).code).toBe("FORBIDDEN")

  const settled = orderSchema.parse((await mock.settleOrder(order.id)).body)
  expect(settled.status).toBe("confirmed")
  expect(settled.transaction?.hash).toMatch(/^0x[0-9a-f]{64}$/)

  expect(orderSchema.parse((await mock.settleOrder(order.id, "declined")).body).status).toBe(
    "confirmed",
  )

  const cartAfter = cartSchema.parse(expectResponse(await api("GET", "/cart", { token })).body)
  expect(cartAfter.items).toHaveLength(0)

  await mock.updateEdition("nft-002", "nft-002-standard", { price: "9.99" })
  const receipt = orderSchema.parse(
    expectResponse(await api("GET", `/orders/${order.id}`, { token })).body,
  )
  expect(receipt.lines.find((l) => l.nftId === "nft-002")?.unitPrice).toBe(
    quote.lines.find((l) => l.nftId === "nft-002")?.unitPrice,
  )
  expect(receipt.total).toBe(quote.total)
})

test("scenarios: offline, flaky recovery, empty catalog", async ({ api, mock }) => {
  await mock.setScenario("offline")
  expect("networkError" in (await api("GET", "/nfts"))).toBe(true)

  await mock.setScenario("flaky")
  for (let i = 0; i < 3; i++) expect(expectResponse(await api("GET", "/nfts")).status).toBe(503)
  expect(expectResponse(await api("GET", "/nfts")).status).toBe(200)

  await mock.setScenario("empty-catalog")
  expect(nftListResponseSchema.parse(expectResponse(await api("GET", "/nfts")).body).total).toBe(0)
})
