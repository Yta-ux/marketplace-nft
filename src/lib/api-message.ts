import { ApiError } from "@/api/errors"

const messages: Partial<Record<ApiError["code"], string>> = {
  NETWORK: "Sem conexão. Verifique sua internet e tente novamente.",
  TIMEOUT: "A requisição demorou demais. Tente novamente.",
  TRANSIENT: "Serviço temporariamente indisponível. Tente novamente.",
  UNAUTHENTICATED: "Entre na sua conta para continuar.",
  SESSION_EXPIRED: "Sua sessão expirou. Entre novamente.",
  FORBIDDEN: "Você não tem acesso a este recurso.",
  NOT_FOUND: "Não encontramos o que você procura.",
  AVAILABILITY_CONFLICT: "Alguns itens não estão mais disponíveis na quantidade escolhida.",
  QUOTE_EXPIRED: "Sua cotação expirou. Atualize os valores para continuar.",
  QUOTE_OUTDATED: "Preços ou disponibilidade mudaram. Revise o pedido.",
  WALLET_REJECTED: "A conexão foi recusada na sua carteira.",
  WALLET_NOT_CONNECTED: "Conecte sua carteira na rede escolhida.",
  PAYMENT_DECLINED: "O pagamento foi recusado pela carteira.",
  IDEMPOTENCY_CONFLICT: "Esta tentativa já foi usada com outros dados. Tente novamente.",
  VALIDATION_ERROR: "Verifique os dados informados.",
  CONFLICT: "Os dados informados entram em conflito com um registro existente.",
  INTERNAL: "Algo deu errado. Tente novamente.",
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return messages[error.code] ?? fallback
  return fallback
}

const fieldMessages: Record<string, string> = {
  "Email already in use": "Este e-mail já está em uso.",
  "Address already registered": "Este endereço já está cadastrado.",
  "Current password is incorrect": "A senha atual está incorreta.",
  "Unsupported by wallet": "Esta carteira não suporta a rede escolhida.",
  "Unsupported network": "Esta carteira não suporta a rede escolhida.",
  "Wallet not found": "Carteira não encontrada.",
  "Choose an image": "Escolha uma imagem.",
  "Use PNG, JPEG or WebP": "Use uma imagem PNG, JPEG ou WebP.",
  "Maximum size is 1 MB": "O tamanho máximo é 1 MB.",
}

export function translateFieldErrors(fields: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, fieldMessages[value] ?? value]),
  )
}
