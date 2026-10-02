import { type FormEvent, useId } from "react"
import { cn } from "@/lib/utils"

type PromoCodeFieldProps = {
  onApply: (code: string) => void
  variant?: "box" | "pill"
  className?: string
}

export function PromoCodeField({ onApply, variant = "box", className }: PromoCodeFieldProps) {
  const id = useId()
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onApply(String(new FormData(event.currentTarget).get("code") ?? "").trim())
  }
  if (variant === "pill") {
    return (
      <form
        onSubmit={submit}
        className={cn(
          "flex h-[50px] w-full items-center rounded-[40px] border border-field bg-surface pl-4 drop-shadow-[0px_6px_10px_rgba(10,6,4,0.45)]",
          className,
        )}
      >
        <label htmlFor={id} className="sr-only">
          Código promocional
        </label>
        <input
          id={id}
          name="code"
          autoComplete="off"
          placeholder="Digite o código promocional..."
          className="min-w-0 flex-1 bg-transparent text-caption-lg leading-[22px] text-foreground outline-none placeholder:text-subtle"
        />
        <button
          type="submit"
          className="h-[50px] w-[97px] shrink-0 rounded-[40px] bg-[linear-gradient(96deg,rgba(210,138,76,0.54)_0.94%,#d28a4c_105%)] font-bold text-body leading-4 text-foreground transition-[filter] hover:brightness-110"
        >
          Aplicar
        </button>
      </form>
    )
  }
  return (
    <form onSubmit={submit} className={cn("flex w-full flex-col gap-2", className)}>
      <label htmlFor={id} className="font-bold text-body-sm leading-4 text-foreground">
        Código promocional
      </label>
      <div className="flex h-10 w-full items-center rounded-[3px] border border-primary pl-2">
        <input
          id={id}
          name="code"
          autoComplete="off"
          placeholder="Digite o código promocional..."
          className="min-w-0 flex-1 bg-transparent text-caption leading-4 text-foreground outline-none placeholder:text-subtle"
        />
        <button
          type="submit"
          className="h-10 w-[102px] shrink-0 rounded-tr-[3px] rounded-br-[3px] bg-primary font-bold text-body leading-4 text-ink transition-colors hover:bg-highlight"
        >
          Aplicar
        </button>
      </div>
    </form>
  )
}
