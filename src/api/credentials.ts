import { GUEST_CART_HEADER } from "@/api/contracts"

const TOKEN_KEY = "nft:session-token"
const GUEST_CART_KEY = "nft:guest-cart-id"

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {}
}

export const credentials = {
  getToken: () => read(TOKEN_KEY),
  setToken: (token: string | null) => write(TOKEN_KEY, token),
  getGuestCartId: (): string => {
    const existing = read(GUEST_CART_KEY)
    if (existing) return existing
    const created = `guest_${crypto.randomUUID()}`
    write(GUEST_CART_KEY, created)
    return created
  },
  clearGuestCartId: () => write(GUEST_CART_KEY, null),
}

export { GUEST_CART_HEADER }
