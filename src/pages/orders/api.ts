import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { ordersApi } from "@/api/endpoints"
import { orderKeys } from "@/queries/checkout"
import { settleOrderQueries } from "@/realtime/apply-events"
import { useRealtimeStatus } from "@/realtime/realtime-provider"

const POLL_INTERVAL_MS = 2_500
const SAFETY_POLL_INTERVAL_MS = 15_000

export const orderQueryOptions = (orderId: string) =>
  queryOptions({
    queryKey: orderKeys.detail(orderId),
    queryFn: ({ signal }) => ordersApi.get(orderId, signal),
    refetchInterval: (query) => (query.state.data?.status === "pending" ? POLL_INTERVAL_MS : false),
  })

export function useOrder(orderId: string) {
  const queryClient = useQueryClient()
  const connection = useRealtimeStatus()
  const query = useQuery({
    ...orderQueryOptions(orderId),
    refetchInterval: (state) =>
      state.state.data?.status === "pending"
        ? connection === "connected"
          ? SAFETY_POLL_INTERVAL_MS
          : POLL_INTERVAL_MS
        : false,
  })

  useEffect(() => {
    if (query.data && query.data.status !== "pending") settleOrderQueries(queryClient)
  }, [query.data?.status, query.data, queryClient])

  return query
}
