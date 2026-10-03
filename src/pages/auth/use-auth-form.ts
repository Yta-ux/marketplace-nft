import { type ChangeEvent, type FormEvent, useState } from "react"
import { z } from "zod"
import { ApiError } from "@/api/errors"
import { type FieldErrors, readForm, zodFieldErrors } from "@/lib/form"
import { useLogin, useRegister } from "@/queries/session"

export type AuthMode = "login" | "register"

const emailField = z
  .string()
  .trim()
  .min(1, "Informe seu e-mail.")
  .pipe(z.email("Digite um e-mail válido."))

const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Informe sua senha."),
})

const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(2, "Use ao menos 2 caracteres.")
      .max(40, "Use no máximo 40 caracteres."),
    email: emailField,
    password: z
      .string()
      .min(8, "Use ao menos 8 caracteres.")
      .max(72, "Use no máximo 72 caracteres.")
      .regex(/[A-Za-z]/, "Inclua ao menos uma letra.")
      .regex(/\d/, "Inclua ao menos um número."),
    confirmPassword: z.string().min(1, "Confirme sua senha."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem.",
  })

const serverFieldMessages: Record<string, { name: string; message: string }> = {
  email: { name: "email", message: "Digite um e-mail válido." },
  displayName: { name: "username", message: "Nome de usuário inválido." },
  password: {
    name: "password",
    message: "Senha inválida: use ao menos 8 caracteres, com letra e número.",
  },
}

const GENERIC_ERROR = "Não foi possível concluir. Tente novamente."

type Failure = { fields: FieldErrors; form?: string }

function toFailure(error: unknown, mode: AuthMode): Failure {
  if (!(error instanceof ApiError)) return { fields: {}, form: GENERIC_ERROR }
  switch (error.code) {
    case "INVALID_CREDENTIALS":
      return { fields: {}, form: "E-mail ou senha incorretos." }
    case "CONFLICT":
      return mode === "register"
        ? { fields: { email: "Este e-mail já está cadastrado." } }
        : { fields: {}, form: GENERIC_ERROR }
    case "VALIDATION_ERROR": {
      const fields: FieldErrors = {}
      for (const key of Object.keys(error.fields ?? {})) {
        const mapped = serverFieldMessages[key]
        if (mapped) fields[mapped.name] = mapped.message
      }
      return Object.keys(fields).length > 0
        ? { fields }
        : { fields: {}, form: "Confira os dados informados." }
    }
    case "NETWORK":
    case "TIMEOUT":
      return { fields: {}, form: "Sem conexão. Verifique sua internet e tente novamente." }
    case "TRANSIENT":
      return { fields: {}, form: "Serviço indisponível no momento. Tente novamente em instantes." }
    default:
      return { fields: {}, form: GENERIC_ERROR }
  }
}

export function useAuthForm(mode: AuthMode) {
  const login = useLogin()
  const register = useRegister()
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | undefined>()
  const pending = login.isPending || register.isPending

  function clear(name: string) {
    setFormError(undefined)
    setErrors((current) => {
      if (!(name in current)) return current
      const { [name]: _removed, ...rest } = current
      return rest
    })
  }

  function onChange(event: ChangeEvent<HTMLFormElement>) {
    const target: EventTarget = event.target
    if (target instanceof HTMLInputElement) clear(target.name)
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    const values = readForm(event.currentTarget)
    setFormError(undefined)

    const parsed =
      mode === "login" ? loginSchema.safeParse(values) : registerSchema.safeParse(values)
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error))
      return
    }
    setErrors({})

    const onError = (error: unknown) => {
      const failure = toFailure(error, mode)
      setErrors(failure.fields)
      setFormError(failure.form)
    }

    if (mode === "login") {
      const data = parsed.data as z.infer<typeof loginSchema>
      login.mutate({ email: data.email, password: data.password }, { onError })
    } else {
      const data = parsed.data as z.infer<typeof registerSchema>
      register.mutate(
        { displayName: data.username, email: data.email, password: data.password },
        { onError },
      )
    }
  }

  return { errors, formError, pending, onSubmit, onChange }
}
