export function parseSearch(search: string): Record<string, string> {
  return Object.fromEntries(new URLSearchParams(search))
}

export function stringifySearch(search: Record<string, unknown>): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(search)) {
    if (value === undefined || value === null || value === "") continue
    if (Array.isArray(value)) {
      if (value.length > 0) params.set(key, value.join(","))
      continue
    }
    params.set(key, String(value))
  }
  const query = params.toString()
  return query ? `?${query}` : ""
}
