import type { ComponentProps } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const sizes = { modal: "h-10 rounded-[5px] px-4 py-3", mobile: "h-[50px] rounded-[10px] px-4" }

type AuthInputProps = ComponentProps<"input"> & { fieldSize?: keyof typeof sizes }

export function AuthInput({ fieldSize = "modal", className, ...props }: AuthInputProps) {
  return (
    <Input className={cn("focus-visible:border-primary", sizes[fieldSize], className)} {...props} />
  )
}
