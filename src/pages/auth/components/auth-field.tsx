import type { ComponentProps } from "react"
import { PasswordInput } from "@/components/password-input"
import { cn } from "@/lib/utils"
import { AuthInput } from "@/pages/auth/components/auth-input"

type Size = "modal" | "mobile"

type BaseProps = { error?: string; className?: string }

function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null
  return (
    <p id={id} role="alert" className="text-caption leading-4 text-danger">
      {error}
    </p>
  )
}

export function AuthField({
  error,
  className,
  fieldSize = "modal",
  name,
  ...props
}: BaseProps & Omit<ComponentProps<"input">, "size"> & { fieldSize?: Size }) {
  const errorId = `auth-${name}-error`
  return (
    <div className={cn("flex w-full flex-col gap-1", className)}>
      <AuthInput
        id={`auth-${name}`}
        name={name}
        fieldSize={fieldSize}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      <FieldError id={errorId} error={error} />
    </div>
  )
}

export function AuthPasswordField({
  error,
  className,
  variant = "modal",
  name,
  ...props
}: BaseProps & Omit<ComponentProps<typeof PasswordInput>, "variant"> & { variant?: Size }) {
  const errorId = `auth-${name}-error`
  return (
    <div className={cn("flex w-full flex-col gap-1", className)}>
      <PasswordInput
        id={`auth-${name}`}
        name={name}
        variant={variant}
        containerClassName={error ? "border-destructive" : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      <FieldError id={errorId} error={error} />
    </div>
  )
}
