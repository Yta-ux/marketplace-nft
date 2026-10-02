import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useRouterState } from "@tanstack/react-router"
import { toast } from "sonner"
import type { FavoritesResponse } from "@/api/contracts"
import { credentials } from "@/api/credentials"
import { favoritesApi } from "@/api/endpoints"
import { ApiError } from "@/api/errors"

export const favoriteKeys = {
  all: ["favorites"] as const,
}

export const favoritesQueryOptions = () =>
  queryOptions({
    queryKey: favoriteKeys.all,
    queryFn: async ({ signal }): Promise<FavoritesResponse> =>
      credentials.getToken() ? favoritesApi.list(signal) : { nftIds: [] },
  })

type ToggleInput = { nftId: string; favorited: boolean }

function favoriteMessage(error: unknown): string {
  if (error instanceof ApiError && error.code === "NETWORK") return "Sem conexão. Tente novamente."
  return "Não foi possível atualizar seus favoritos."
}

export function useFavorites() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const href = useRouterState({ select: (state) => state.location.href })
  const { data } = useQuery(favoritesQueryOptions())
  const ids = new Set(data?.nftIds ?? [])

  const mutation = useMutation({
    mutationFn: ({ nftId, favorited }: ToggleInput) =>
      favorited ? favoritesApi.add(nftId) : favoritesApi.remove(nftId),
    onMutate: async ({ nftId, favorited }) => {
      await queryClient.cancelQueries({ queryKey: favoriteKeys.all })
      const previous = queryClient.getQueryData<FavoritesResponse>(favoriteKeys.all)
      const current = previous?.nftIds ?? []
      queryClient.setQueryData<FavoritesResponse>(favoriteKeys.all, {
        nftIds: favorited
          ? current.includes(nftId)
            ? current
            : [...current, nftId]
          : current.filter((id) => id !== nftId),
      })
      return { previous }
    },
    onError: (error, _input, context) => {
      queryClient.setQueryData(favoriteKeys.all, context?.previous)
      toast.error(favoriteMessage(error))
    },
    onSuccess: (_result, { favorited }) => {
      toast.success(favorited ? "Adicionado aos favoritos." : "Removido dos favoritos.")
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: favoriteKeys.all })
    },
  })

  function toggle(nftId: string) {
    if (!credentials.getToken()) {
      toast.info("Entre na sua conta para favoritar NFTs.")
      void navigate({ to: "/login", search: { redirect: href } })
      return
    }
    mutation.mutate({ nftId, favorited: !ids.has(nftId) })
  }

  return { isFavorite: (nftId: string) => ids.has(nftId), toggle, pending: mutation.isPending }
}
