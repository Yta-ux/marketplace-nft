import type { OrderStatus } from "@/api/contracts"
import { Icon } from "@/components/icon"
import { OrderItem, type OrderItemData } from "@/components/order-item"
import { Hairline, SummaryRow, TotalRow } from "@/components/summary-rows"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { ReceiptSkeleton } from "@/pages/orders/components/receipt-skeleton"

export type OrderReceiptData = {
  status: OrderStatus
  transactionId: string
  date: string
  total: string
  wallet: string
  networkFee: string
  items: OrderItemData[]
  note: string
  explorerUrl: string | null
}

type OrderConfirmationModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  data?: OrderReceiptData
  onPrimaryAction: () => void
}

const titles: Record<OrderStatus, string> = {
  pending: "Aguardando a confirmação na rede",
  confirmed: "Seus NFTs agora estão na sua carteira",
  declined: "Pagamento recusado",
}

const actionLabels: Record<OrderStatus, string> = {
  pending: "Aguardando confirmação…",
  confirmed: "Ver no explorador de blocos",
  declined: "Voltar ao pagamento",
}

function MetaDivider() {
  return <span aria-hidden="true" className="hidden h-[31px] w-px bg-primary sm:block" />
}

export function OrderConfirmationModal({
  open,
  onOpenChange,
  data,
  onPrimaryAction,
}: OrderConfirmationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-[clamp(16px,calc(50dvh-410px),166px)] max-h-[calc(100dvh-2rem)] w-[578px] translate-y-0 gap-0 overflow-y-auto rounded-none border-0 bg-surface p-0 sm:max-w-[578px]"
      >
        {data ? (
          <>
            <div className="flex h-[156px] w-full flex-col items-center justify-center gap-4">
              {data.status !== "declined" && (
                <span className={data.status === "pending" ? "animate-pulse" : undefined}>
                  <Icon name="thanks" />
                </span>
              )}
              <DialogTitle
                className={cn(
                  "px-6 text-center font-bold text-body-lg leading-4 text-text-secondary",
                  data.status === "declined" && "text-danger",
                )}
              >
                {titles[data.status]}
              </DialogTitle>
            </div>
            <div aria-hidden="true" className="h-px w-full bg-primary" />
            <dl className="grid w-full grid-cols-2 gap-4 px-6 py-4 text-text-secondary sm:flex sm:h-[65px] sm:items-center sm:justify-between sm:px-9 sm:py-1">
              <div className="flex flex-col sm:w-[127px]">
                <dt className="font-bold text-body-sm leading-4">ID da transação</dt>
                <dd className="text-body leading-[normal]">{data.transactionId}</dd>
              </div>
              <MetaDivider />
              <div className="flex flex-col sm:w-[109px]">
                <dt className="text-body-sm leading-4">Data</dt>
                <dd className="text-body leading-[normal]">{data.date}</dd>
              </div>
              <MetaDivider />
              <div className="flex flex-col sm:w-[91px]">
                <dt className="text-body-sm leading-4">Total</dt>
                <dd className="text-body leading-[normal]">{data.total}</dd>
              </div>
              <MetaDivider />
              <div className="flex flex-col sm:w-[73px]">
                <dt className="font-bold text-body-sm leading-4">Carteira</dt>
                <dd className="text-body leading-[normal]">{data.wallet}</dd>
              </div>
            </dl>
            <div aria-hidden="true" className="h-px w-full bg-primary" />
            <div className="flex min-h-[588px] w-full flex-col gap-3 px-4 pt-5 pb-12 sm:px-11">
              <h3 className="font-bold text-body leading-4 text-foreground">
                Detalhes da transação
              </h3>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col items-end gap-3">
                  <div className="flex w-full flex-col gap-3">
                    <div className="flex flex-col gap-3">
                      <div
                        aria-hidden="true"
                        className="flex items-center justify-between text-body-lg leading-4 whitespace-nowrap text-foreground"
                      >
                        <span className="font-bold">NFTs</span>
                        <span className="flex items-center gap-12">
                          <span className="font-bold">Edições</span>
                          <span className="font-medium">Subtotal</span>
                        </span>
                      </div>
                      <Hairline />
                    </div>
                    <ul className="flex flex-col gap-3">
                      {data.items.map((item) => (
                        <OrderItem key={item.id} item={item} variant="receipt" />
                      ))}
                    </ul>
                  </div>
                  <dl className="flex w-full flex-col gap-3 xl:w-[321px]">
                    <SummaryRow label="Taxa de rede" value={data.networkFee} />
                    <TotalRow value={data.total} />
                  </dl>
                </div>
                <Hairline />
              </div>
              <div className="flex flex-1 flex-col items-center justify-between gap-6">
                <DialogDescription className="text-center text-body-sm leading-[22px] text-text-secondary">
                  {data.note}
                </DialogDescription>
                <Button
                  variant="brand"
                  size="receipt"
                  onClick={onPrimaryAction}
                  disabled={
                    data.status === "pending" || (data.status === "confirmed" && !data.explorerUrl)
                  }
                >
                  {actionLabels[data.status]}
                </Button>
              </div>
            </div>
            <div aria-hidden="true" className="h-[10px] w-full bg-primary" />
            <DialogClose className="absolute top-4 right-3.5 rounded-xs p-0.5" aria-label="Fechar">
              <Icon name="close" />
            </DialogClose>
          </>
        ) : (
          <>
            <DialogTitle className="sr-only">Carregando comprovante</DialogTitle>
            <ReceiptSkeleton />
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
