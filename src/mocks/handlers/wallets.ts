import { HttpResponse, http } from "msw"
import {
  connectWalletRequestSchema,
  createWalletRequestSchema,
  updateWalletRequestSchema,
  type Wallet,
} from "@/api/contracts"
import { commit, type DbWallet, getDb, nextId } from "@/mocks/db"
import { requireAuth } from "@/mocks/lib/auth"
import { api, HttpError, nowIso, parseBody, route } from "@/mocks/lib/http"
import { scenario } from "@/mocks/scenarios"

const toWallet = ({ userId: _u, ...w }: DbWallet): Wallet => w

function findWallet(walletId: string, userId: string): DbWallet {
  const wallet = getDb().wallets.find((w) => w.id === walletId)
  if (!wallet) throw new HttpError("NOT_FOUND", "Wallet not found")
  if (wallet.userId !== userId)
    throw new HttpError("FORBIDDEN", "This wallet belongs to another account")
  return wallet
}

function assertUniqueAddress(userId: string, address: string, exceptId?: string): void {
  const taken = getDb().wallets.some(
    (w) =>
      w.userId === userId && w.id !== exceptId && w.address.toLowerCase() === address.toLowerCase(),
  )
  if (taken)
    throw new HttpError("CONFLICT", "This address is already registered", {
      fields: { address: "Address already registered" },
    })
}

function mutateWallet(walletId: string, mutator: (w: DbWallet, all: DbWallet[]) => void): DbWallet {
  return commit((db) => {
    const wallet = db.wallets.find((w) => w.id === walletId) as DbWallet
    mutator(wallet, db.wallets)
    wallet.updatedAt = nowIso()
    return wallet
  })
}

export const walletHandlers = [
  http.get(
    api("/me/wallets"),
    route(({ request }) => {
      const { user } = requireAuth(request)
      const items = getDb()
        .wallets.filter((w) => w.userId === user.id)
        .sort((a, b) => (a.role === b.role ? 0 : a.role === "primary" ? -1 : 1))
        .map(toWallet)
      return HttpResponse.json({ items })
    }),
  ),

  http.post(
    api("/me/wallets"),
    route(async ({ request }) => {
      const { user } = requireAuth(request)
      const body = await parseBody(request, createWalletRequestSchema)
      if (getDb().wallets.some((w) => w.userId === user.id && w.role === body.role)) {
        throw new HttpError("CONFLICT", `You already have a ${body.role} wallet`, {
          fields: { role: `A ${body.role} wallet already exists` },
        })
      }
      assertUniqueAddress(user.id, body.address)
      const createdAt = nowIso()
      const wallet: DbWallet = {
        id: nextId("wallet", "wallet", 3),
        userId: user.id,
        ...body,
        connection: null,
        createdAt,
        updatedAt: createdAt,
      }
      commit((db) => {
        db.wallets.push(wallet)
      })
      return HttpResponse.json(toWallet(wallet), { status: 201 })
    }),
  ),

  http.patch<{ walletId: string }>(
    api("/me/wallets/:walletId"),
    route(async ({ request, params }) => {
      const { user } = requireAuth(request)
      const current = findWallet(params.walletId, user.id)
      const body = await parseBody(request, updateWalletRequestSchema)
      if (body.address) assertUniqueAddress(user.id, body.address, current.id)
      const updated = mutateWallet(current.id, (wallet, all) => {
        if (body.role && body.role !== wallet.role) {
          const other = all.find(
            (w) => w.userId === user.id && w.id !== wallet.id && w.role === body.role,
          )
          if (other) {
            other.role = wallet.role
            other.updatedAt = nowIso()
          }
        }
        Object.assign(wallet, body)
        if (wallet.connection && !wallet.networks.includes(wallet.connection.network))
          wallet.connection = null
      })
      return HttpResponse.json(toWallet(updated))
    }),
  ),

  http.post<{ walletId: string }>(
    api("/me/wallets/:walletId/connection"),
    route(async ({ request, params }) => {
      const { user } = requireAuth(request)
      const wallet = findWallet(params.walletId, user.id)
      const { network } = await parseBody(request, connectWalletRequestSchema)
      if (!wallet.networks.includes(network)) {
        throw new HttpError(
          "VALIDATION_ERROR",
          "This wallet does not support the selected network",
          { fields: { network: "Unsupported network" } },
        )
      }
      if (scenario.config.walletRejects)
        throw new HttpError("WALLET_REJECTED", "The connection request was rejected in your wallet")
      const updated = mutateWallet(wallet.id, (w) => {
        w.connection = { network, connectedAt: nowIso() }
      })
      return HttpResponse.json(toWallet(updated))
    }),
  ),

  http.delete<{ walletId: string }>(
    api("/me/wallets/:walletId/connection"),
    route(({ request, params }) => {
      const { user } = requireAuth(request)
      const wallet = findWallet(params.walletId, user.id)
      return HttpResponse.json(
        toWallet(
          mutateWallet(wallet.id, (w) => {
            w.connection = null
          }),
        ),
      )
    }),
  ),
]
