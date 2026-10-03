import { z } from "zod"

export const collectorFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Informe seu nome completo.")
    .max(80, "Use no máximo 80 caracteres."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Informe seu e-mail.")
    .max(120, "Use no máximo 120 caracteres.")
    .pipe(z.email("Digite um e-mail válido.")),
})
