import type { Page } from "@playwright/test"
import { expect } from "./fixtures"

export const PNG_1PX = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
)

export const NEW_ADDRESS = `0x${"ab12".repeat(10)}`

export async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
}

export async function pickOption(page: Page, triggerId: string, name: string) {
  await page.locator(`#${triggerId}`).click()
  await page.getByRole("option", { name, exact: true }).click()
}

export async function expectToast(page: Page, text: string | RegExp) {
  await expect(page.locator("[data-sonner-toast]").filter({ hasText: text }).first()).toBeVisible()
}

export async function waitForStableContent(page: Page) {
  await expect(page.locator("[data-slot=skeleton]")).toHaveCount(0)
  await page.evaluate(async () => {
    const height = document.documentElement.scrollHeight
    for (let y = 0; y < height; y += window.innerHeight) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 80))
    }
    window.scrollTo(0, 0)
    await document.fonts.ready
    await Promise.all(
      [...document.images].map((image) =>
        image.complete
          ? Promise.resolve()
          : new Promise((resolve) => {
              image.addEventListener("load", resolve, { once: true })
              image.addEventListener("error", resolve, { once: true })
              setTimeout(resolve, 4_000)
            }),
      ),
    )
  })
}
