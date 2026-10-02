import type { ReactNode } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

type FiltersSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCloseAutoFocus?: (event: Event) => void
  children: ReactNode
}

export function FiltersSheet({
  open,
  onOpenChange,
  onCloseAutoFocus,
  children,
}: FiltersSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        onCloseAutoFocus={onCloseAutoFocus}
        className="max-h-[88dvh] gap-0 overflow-y-auto rounded-t-[20px] border-t bg-ink p-0 lg:hidden"
      >
        <SheetHeader className="px-6 pt-6 pb-4">
          <SheetTitle>Filtros</SheetTitle>
          <SheetDescription>Refine os NFTs por coleção, preço e rede.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-6 px-6 pb-8">{children}</div>
      </SheetContent>
    </Sheet>
  )
}
