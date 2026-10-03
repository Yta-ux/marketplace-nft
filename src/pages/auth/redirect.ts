export function safeRedirect(target: unknown): string {
  if (typeof target !== "string") return "/"
  if (!target.startsWith("/") || target.startsWith("//") || target.startsWith("/\\")) return "/"
  return target
}
