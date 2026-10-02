import {
  type QueryClient,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import type { AuthResponse, LoginRequest, RegisterRequest, Session } from "@/api/contracts"
import { credentials } from "@/api/credentials"
import { authApi, cartApi } from "@/api/endpoints"

export const sessionKeys = { all: ["session"] as const }

const USER_SCOPED_KEYS = [["cart"], ["favorites"], ["wallets"], ["profile"], ["orders"]] as const

export const sessionQueryOptions = () =>
  queryOptions({
    queryKey: sessionKeys.all,
    queryFn: async ({ signal }): Promise<Session | null> =>
      credentials.getToken() ? authApi.session(signal) : null,
    staleTime: 5 * 60_000,
    retry: false,
  })

export function useSession() {
  return useQuery(sessionQueryOptions())
}

export function clearSession(queryClient: QueryClient) {
  credentials.setToken(null)
  queryClient.setQueryData(sessionKeys.all, null)
  for (const key of USER_SCOPED_KEYS) queryClient.removeQueries({ queryKey: key })
  void queryClient.invalidateQueries({ queryKey: ["cart"] })
}

async function completeAuth(queryClient: QueryClient, auth: AuthResponse) {
  const guestCartId = credentials.getGuestCartId()
  credentials.setToken(auth.token)
  try {
    await cartApi.merge({ guestCartId })
  } catch {}
  credentials.clearGuestCartId()
  queryClient.setQueryData(sessionKeys.all, { user: auth.user, expiresAt: auth.expiresAt })
  for (const key of USER_SCOPED_KEYS) void queryClient.invalidateQueries({ queryKey: key })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: LoginRequest) => {
      const auth = await authApi.login(body)
      await completeAuth(queryClient, auth)
      return auth
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: RegisterRequest) => {
      const auth = await authApi.register(body)
      await completeAuth(queryClient, auth)
      return auth
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: () => authApi.logout().catch(() => undefined),
    onSettled: () => {
      clearSession(queryClient)
      toast.success("Você saiu da sua conta.")
      void navigate({ to: "/" })
    },
  })
}
