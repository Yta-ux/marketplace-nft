import { toast } from "sonner"

export function notifyUnavailable(feature: string): void {
  toast.info(`${feature} não está disponível nesta demonstração.`)
}
