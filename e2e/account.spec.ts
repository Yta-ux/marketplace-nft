import { expect, expectResponse, test, USERS } from "./fixtures"
import { expectToast, NEW_ADDRESS, PNG_1PX, pickOption } from "./helpers-account"

const save = (page: import("@playwright/test").Page) =>
  page.getByRole("button", { name: "Salvar", exact: true })

test.describe("perfil", () => {
  test("edita nome e e-mail e mantém após refresh", async ({ page, signIn }) => {
    await signIn("ana", "/profile")
    await expect(page.locator("#displayName")).toHaveValue("Ana Collector")
    await page.locator("#displayName").fill("Ana Nova")
    await page.locator("#email").fill("ana.nova@collector.test")
    await save(page).click()
    await expectToast(page, "Perfil atualizado.")
    await page.reload()
    await expect(page.locator("#displayName")).toHaveValue("Ana Nova")
    await expect(page.locator("#email")).toHaveValue("ana.nova@collector.test")
  })

  test("validação do cliente associa a mensagem ao campo", async ({ page, signIn }) => {
    await signIn("ana", "/profile")
    await page.locator("#displayName").fill("A")
    await page.locator("#email").fill("nao-e-email")
    await save(page).click()
    const name = page.locator("#displayName")
    await expect(name).toHaveAttribute("aria-invalid", "true")
    await expect(name).toHaveAttribute("aria-describedby", "displayName-error")
    await expect(page.locator("#displayName-error")).toHaveText("Use pelo menos 2 caracteres.")
    await expect(page.locator("#email")).toHaveAttribute("aria-describedby", "email-error")
    await expect(page.locator("#email-error")).toHaveText("Digite um e-mail válido.")
    await expect(page.locator("#email-error")).toHaveAttribute("role", "alert")
  })

  test("avatar válido persiste e pode ser removido", async ({ page, signIn }) => {
    await signIn("ana", "/profile")
    await page.locator("input[type=file]").setInputFiles({
      name: "avatar.png",
      mimeType: "image/png",
      buffer: PNG_1PX,
    })
    await expectToast(page, "Avatar atualizado.")
    await expect(page.getByRole("img", { name: "Avatar atual" })).toBeVisible()
    await page.reload()
    await expect(page.getByRole("img", { name: "Avatar atual" })).toBeVisible()
    await page.getByRole("button", { name: "Remover", exact: true }).click()
    await expectToast(page, "Avatar removido.")
    await expect(page.getByRole("img", { name: "Avatar atual" })).toHaveCount(0)
    await page.reload()
    await expect(page.getByRole("img", { name: "Avatar atual" })).toHaveCount(0)
  })

  test("avatar com tipo ou tamanho inválido mostra erro e não envia", async ({ page, signIn }) => {
    await signIn("ana", "/profile")
    const input = page.locator("input[type=file]")
    await input.setInputFiles({
      name: "nota.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("x"),
    })
    await expect(
      page.getByRole("alert").filter({ hasText: "Use uma imagem PNG, JPEG ou WebP." }),
    ).toBeVisible()
    await input.setInputFiles({
      name: "grande.png",
      mimeType: "image/png",
      buffer: Buffer.alloc(1024 * 1024 + 1),
    })
    await expect(
      page.getByRole("alert").filter({ hasText: "O tamanho máximo é 1 MB." }),
    ).toBeVisible()
    await expect(page.getByRole("img", { name: "Avatar atual" })).toHaveCount(0)
  })

  test("troca de senha: erros e sucesso com login pela nova senha", async ({
    page,
    signIn,
    api,
  }) => {
    await signIn("ana", "/profile")
    await page.locator("#currentPassword").fill("senha-errada-1")
    await page.locator("#newPassword").fill("NovaSenha2026")
    await page.locator("#confirmPassword").fill("NovaSenha2026")
    await save(page).click()
    await expect(page.locator("#currentPassword-error")).toHaveText("A senha atual está incorreta.")
    await expect(page.locator("#currentPassword")).toHaveAttribute("aria-invalid", "true")

    await page.locator("#currentPassword").fill(USERS.ana.password)
    await page.locator("#newPassword").fill("abc")
    await page.locator("#confirmPassword").fill("abc")
    await save(page).click()
    await expect(page.locator("#newPassword-error")).toHaveText("Use pelo menos 8 caracteres.")

    await page.locator("#newPassword").fill(USERS.ana.password)
    await page.locator("#confirmPassword").fill(USERS.ana.password)
    await save(page).click()
    await expect(page.locator("#newPassword-error")).toHaveText(
      "A nova senha deve ser diferente da atual.",
    )

    await page.locator("#newPassword").fill("NovaSenha2026")
    await page.locator("#confirmPassword").fill("OutraSenha2026")
    await save(page).click()
    await expect(page.locator("#confirmPassword-error")).toHaveText("As senhas não conferem.")

    await page.locator("#confirmPassword").fill("NovaSenha2026")
    await save(page).click()
    await expectToast(page, "Perfil atualizado.")

    const novo = expectResponse(
      await api("POST", "/auth/login", {
        body: { email: USERS.ana.email, password: "NovaSenha2026" },
      }),
    )
    expect(novo.status).toBe(200)
    const antigo = expectResponse(
      await api("POST", "/auth/login", {
        body: { email: USERS.ana.email, password: USERS.ana.password },
      }),
    )
    expect(antigo.status).toBe(401)
  })
})

test.describe("carteiras", () => {
  test("cadastra principal e secundária e mantém após refresh", async ({ page, signIn }) => {
    await signIn("carla", "/wallets")
    const primary = page.locator("section[aria-labelledby=main-wallet-heading]")
    await page.locator("#primary-label").fill("Carteira Carla")
    await page.locator("#primary-address").fill(NEW_ADDRESS)
    await pickOption(page, "primary-network", "Polygon")
    await pickOption(page, "primary-provider", "MetaMask")
    await primary.getByRole("button", { name: "Salvar carteira" }).click()
    await expectToast(page, "Carteira salva.")
    await expect(primary.getByText("Carteira Carla")).toBeVisible()
    await expect(primary.getByText("Não conectada")).toBeVisible()

    const secondary = page.locator("section[aria-labelledby=secondary-wallet-heading]")
    await secondary.getByRole("button", { name: /Adicionar/ }).click()
    await page.locator("#secondary-label").fill("Reserva Carla")
    await page.locator("#secondary-address").fill(`0x${"cd34".repeat(10)}`)
    await pickOption(page, "secondary-network", "Base")
    await pickOption(page, "secondary-provider", "Coinbase Wallet")
    await secondary.getByRole("button", { name: "Salvar carteira" }).click()
    await expect(secondary.getByText("Reserva Carla")).toBeVisible()

    await page.reload()
    await expect(primary.getByText("Carteira Carla")).toBeVisible()
    await expect(secondary.getByText("Reserva Carla")).toBeVisible()
  })
})
