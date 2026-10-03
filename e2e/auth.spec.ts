import { callApi, expect, expectResponse, test, USERS } from "./fixtures"
import {
  addToCartAsVisitor,
  authRoot,
  fetchCart,
  fetchFavorites,
  fillAuthForm,
  loginViaUi,
  onlyVisible,
  sessionToken,
  submitAuth,
} from "./helpers-catalog-auth"

test.beforeEach(async ({ page, mock }) => {
  await page.goto("/")
  await page.locator("html[data-mocks=ready]").waitFor({ state: "attached" })
  await mock.reset()
})

test.describe("cadastro", () => {
  test("valida cada campo em pt-BR com erro associado ao input", async ({ page }) => {
    await page.goto("/register")
    await submitAuth(page, "Criar conta")
    await expect(onlyVisible(page.getByText("Use ao menos 2 caracteres."))).toBeVisible()
    await expect(onlyVisible(page.getByText("Informe seu e-mail."))).toBeVisible()
    await expect(onlyVisible(page.getByText("Use ao menos 8 caracteres."))).toBeVisible()
    await expect(onlyVisible(page.getByText("Confirme sua senha."))).toBeVisible()
    await expect(authRoot(page).getByLabel("E-mail")).toHaveAttribute("aria-invalid", "true")
    await expect(page).toHaveURL(/\/register/)

    await fillAuthForm(page, {
      username: "Novo Colecionador",
      email: "isso-nao-e-email",
      password: "senhasemnumero",
      confirmPassword: "outra-senha",
    })
    await submitAuth(page, "Criar conta")
    await expect(onlyVisible(page.getByText("Digite um e-mail válido."))).toBeVisible()
    await expect(onlyVisible(page.getByText("Inclua ao menos um número."))).toBeVisible()
    await expect(onlyVisible(page.getByText("As senhas não coincidem."))).toBeVisible()
  })

  test("e-mail já cadastrado retorna conflito no campo", async ({ page }) => {
    await page.goto("/register")
    await fillAuthForm(page, {
      username: "Outra Ana",
      email: USERS.ana.email,
      password: "Colecao2026",
      confirmPassword: "Colecao2026",
    })
    await submitAuth(page, "Criar conta")
    await expect(onlyVisible(page.getByText("Este e-mail já está cadastrado."))).toBeVisible()
    await expect(page).toHaveURL(/\/register/)
    expect(await sessionToken(page)).toBeNull()
  })
})

test.describe("sessão", () => {
  test("sessão expirada leva ao login com retorno e retoma o contexto", async ({
    page,
    signIn,
    mock,
  }) => {
    await signIn("ana", "/profile")
    await expect(page).toHaveURL(/\/profile$/)
    await mock.expireSessions()
    await page.reload()
    await expect(page).toHaveURL(/\/login\?redirect=%2Fprofile/)
    expect(await sessionToken(page)).toBeNull()

    await fillAuthForm(page, { email: USERS.ana.email, password: USERS.ana.password })
    await submitAuth(page, "Entrar")
    await expect(page).toHaveURL(/\/profile$/)
  })

  test("troca de usuário não expõe carrinho nem favoritos do anterior", async ({
    page,
    api,
    signIn,
  }) => {
    const anaToken = await signIn("ana", "/")
    expect(
      expectResponse(
        await api("POST", "/cart/items", {
          token: anaToken,
          body: { nftId: "nft-001", editionId: "nft-001-standard", quantity: 1 },
        }),
      ).status,
    ).toBe(201)
    await page.goto("/cart")
    await expect(onlyVisible(page.getByText("Emerald Ape #042")).first()).toBeVisible()
    expect(await fetchFavorites(page)).toContain("nft-002")

    await page.goto("/")
    await onlyVisible(page.getByRole("link", { name: /perfil/i }))
      .first()
      .click()
    await onlyVisible(page.getByRole("button", { name: "Sair" }))
      .first()
      .click()
    await expect(page).toHaveURL(/\/$/)

    await loginViaUi(page, "bruno")
    await expect(page).toHaveURL(/\/$/)
    const brunoCart = await fetchCart(page)
    expect(brunoCart.items).toHaveLength(0)
    expect(await fetchFavorites(page)).not.toContain("nft-002")

    await page.goto("/nfts/nft-002")
    await expect(
      onlyVisible(page.getByRole("button", { name: /Favoritar|favoritos/i })).first(),
    ).toBeVisible()
    await expect(page.getByRole("button", { name: "Favoritado" })).toHaveCount(0)
  })

  test("carrinho do visitante é preservado ao autenticar", async ({ page }) => {
    await addToCartAsVisitor(page, "nft-001")
    await page.goto("/login?redirect=%2Fcart")
    await fillAuthForm(page, { email: USERS.carla.email, password: USERS.carla.password })
    await submitAuth(page, "Entrar")
    await expect(page).toHaveURL(/\/cart$/)
    await expect(onlyVisible(page.getByText("Emerald Ape #042")).first()).toBeVisible()
    const cart = await fetchCart(page)
    expect(cart.items.map((item) => item.nftId)).toEqual(["nft-001"])
    const token = await sessionToken(page)
    const direct = expectResponse(
      await callApi<{ itemCount: number }>(page, "GET", "/cart", { token }),
    )
    expect(direct.body.itemCount).toBe(1)
  })
})
