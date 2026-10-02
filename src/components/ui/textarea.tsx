import type * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-[152px] w-full resize-none rounded-[3px] border border-field bg-transparent p-3 text-body-sm text-foreground outline-none placeholder:text-subtle focus-visible:border-ring aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
