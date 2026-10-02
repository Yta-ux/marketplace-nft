import { z } from "zod"

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Informe seu e-mail.")
  .pipe(z.email("Digite um e-mail válido."))

export const profileFormSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Use pelo menos 2 caracteres.")
    .max(40, "Use no máximo 40 caracteres."),
  email,
})

export const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual."),
    newPassword: z
      .string()
      .min(8, "Use pelo menos 8 caracteres.")
      .max(72, "Use no máximo 72 caracteres.")
      .regex(/[A-Za-z]/, "Inclua ao menos uma letra.")
      .regex(/\d/, "Inclua ao menos um número."),
    confirmPassword: z.string(),
  })
  .superRefine((value, ctx) => {
    if (value.confirmPassword !== value.newPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "As senhas não conferem.",
      })
    }
    if (value.currentPassword && value.currentPassword === value.newPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["newPassword"],
        message: "A nova senha deve ser diferente da atual.",
      })
    }
  })

export const walletFormSchema = z.object({
  label: z.string().trim().min(1, "Informe um apelido.").max(30, "Use no máximo 30 caracteres."),
  address: z
    .string()
    .trim()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Use um endereço válido (0x seguido de 40 caracteres)."),
  provider: z.enum(["metamask", "coinbase", "walletconnect"], "Selecione uma carteira."),
  network: z.enum(["ethereum", "polygon", "arbitrum", "base"], "Selecione uma rede."),
})
