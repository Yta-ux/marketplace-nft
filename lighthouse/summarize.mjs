import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const root = new URL("./reports/", import.meta.url).pathname
const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}
const categories = ["performance", "accessibility", "best-practices", "seo"]
const rows = []

for (const preset of ["mobile", "desktop"]) {
  const dir = join(root, preset)
  if (!existsSync(dir)) continue
  const runs = readdirSync(dir)
    .filter((name) => name.endsWith(".report.json"))
    .map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")))
  const byUrl = new Map()
  for (const run of runs)
    byUrl.set(run.finalDisplayedUrl, [...(byUrl.get(run.finalDisplayedUrl) ?? []), run])
  for (const [url, list] of byUrl) {
    const score = (id) => Math.round(median(list.map((run) => run.categories[id].score * 100)))
    const metric = (id) => median(list.map((run) => run.audits[id].numericValue))
    rows.push({
      preset,
      page: new URL(url).pathname,
      runs: list.length,
      ...Object.fromEntries(categories.map((id) => [id, score(id)])),
      lcp: (metric("largest-contentful-paint") / 1000).toFixed(2),
      cls: metric("cumulative-layout-shift").toFixed(3),
      tbt: Math.round(metric("total-blocking-time")),
      version: list[0].lighthouseVersion,
      chrome: list[0].environment.hostUserAgent.match(/Chrome\/[\d.]+/)?.[0],
    })
  }
}

const header =
  "| Perfil | Página | Execuções | Perf | A11y | BP | SEO | LCP (s) | CLS | TBT (ms) |\n|---|---|---|---|---|---|---|---|---|---|"
const lines = rows.map(
  (r) =>
    `| ${r.preset} | ${r.page} | ${r.runs} | ${r.performance} | ${r.accessibility} | ${r["best-practices"]} | ${r.seo} | ${r.lcp} | ${r.cls} | ${r.tbt} |`,
)
const table = [header, ...lines].join("\n")
const env = rows[0]
  ? `\nLighthouse ${rows[0].version} · ${rows[0].chrome} · mediana de ${rows[0].runs} execuções\n`
  : ""
console.log(table + env)
writeFileSync(join(root, "SUMMARY.md"), `${table}\n${env}`)
