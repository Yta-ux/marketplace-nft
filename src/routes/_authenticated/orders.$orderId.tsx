import { createFileRoute } from "@tanstack/react-router"
import { OrderConfirmationPage } from "@/pages/orders"

export const Route = createFileRoute("/_authenticated/orders/$orderId")({
  component: OrderConfirmationPage,
})
