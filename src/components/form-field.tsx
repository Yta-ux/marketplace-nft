import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type FormFieldProps = {
  label: string
  htmlFor: string
  required?: boolean
  error?: string
  className?: string
  labelClassName?: string
  children: ReactNode
}

export function FormField({
  label,
  htmlFor,
  required,
  error,
  className,
  labelClassName,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("flex w-full flex-col", className)}>
      <label
        htmlFor={htmlFor}
        className={cn("flex items-center text-body leading-[15px] text-foreground", labelClassName)}
      >
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="text-[22px] leading-[29px] text-coral">
              *
            </span>
            <span className="sr-only"> (obrigatório)</span>
          </>
        )}
      </label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="pt-1 text-caption leading-4 text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
