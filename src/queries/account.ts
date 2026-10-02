import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type {
  ChangePasswordRequest,
  ConnectWalletRequest,
  CreateWalletRequest,
  UpdateProfileRequest,
  UpdateWalletRequest,
} from "@/api/contracts"
import { profileApi, walletsApi } from "@/api/endpoints"
import { apiErrorMessage } from "@/lib/api-message"
import { sessionKeys } from "@/queries/session"

export const profileKeys = { all: ["profile"] as const }
export const walletKeys = { all: ["wallets"] as const }

export const profileQueryOptions = () =>
  queryOptions({
    queryKey: profileKeys.all,
    queryFn: ({ signal }) => profileApi.get(signal),
  })

export const walletsQueryOptions = () =>
  queryOptions({
    queryKey: walletKeys.all,
    queryFn: ({ signal }) => walletsApi.list(signal),
  })

function useProfileCache() {
  const queryClient = useQueryClient()
  return (profile: Awaited<ReturnType<typeof profileApi.get>>) => {
    queryClient.setQueryData(profileKeys.all, profile)
    void queryClient.invalidateQueries({ queryKey: sessionKeys.all })
  }
}

export function useUpdateProfile() {
  const store = useProfileCache()
  return useMutation({
    mutationFn: (body: UpdateProfileRequest) => profileApi.update(body),
    onSuccess: store,
  })
}

export function useUploadAvatar() {
  const store = useProfileCache()
  return useMutation({
    mutationFn: (file: File) => profileApi.uploadAvatar(file),
    onSuccess: (profile) => {
      store(profile)
      toast.success("Avatar atualizado.")
    },
    onError: (error) => toast.error(apiErrorMessage(error, "Não foi possível enviar o avatar.")),
  })
}

export function useRemoveAvatar() {
  const store = useProfileCache()
  return useMutation({
    mutationFn: () => profileApi.removeAvatar(),
    onSuccess: (profile) => {
      store(profile)
      toast.success("Avatar removido.")
    },
    onError: (error) => toast.error(apiErrorMessage(error, "Não foi possível remover o avatar.")),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (body: ChangePasswordRequest) => profileApi.changePassword(body),
  })
}

function useWalletsInvalidation() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: walletKeys.all })
}

export function useCreateWallet() {
  const invalidate = useWalletsInvalidation()
  return useMutation({
    mutationFn: (body: CreateWalletRequest) => walletsApi.create(body),
    onSuccess: invalidate,
  })
}

export function useUpdateWallet() {
  const invalidate = useWalletsInvalidation()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateWalletRequest }) =>
      walletsApi.update(id, body),
    onSuccess: invalidate,
  })
}

export function useConnectWallet() {
  const invalidate = useWalletsInvalidation()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ConnectWalletRequest }) =>
      walletsApi.connect(id, body),
    onSuccess: () => {
      toast.success("Carteira conectada.")
      return invalidate()
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, "Não foi possível conectar a carteira.")),
  })
}

export function useDisconnectWallet() {
  const invalidate = useWalletsInvalidation()
  return useMutation({
    mutationFn: (id: string) => walletsApi.disconnect(id),
    onSuccess: () => {
      toast.success("Carteira desconectada.")
      return invalidate()
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, "Não foi possível desconectar a carteira.")),
  })
}
