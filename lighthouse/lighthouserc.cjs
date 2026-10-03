const preset = process.env.LH_PRESET === "desktop" ? "desktop" : "mobile"
const base = "http://localhost:4173"

module.exports = {
  ci: {
    collect: {
      startServerCommand: "pnpm preview --port 4173",
      startServerReadyPattern: "localhost:4173",
      url: [`${base}/`, `${base}/nfts/nft-001`],
      numberOfRuns: 3,
      settings: {
        ...(preset === "desktop" ? { preset: "desktop" } : {}),
        chromeFlags: "--headless=new --no-sandbox",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.9, aggregationMethod: "median-run" }],
        "categories:accessibility": ["warn", { minScore: 0.95, aggregationMethod: "median-run" }],
        "categories:best-practices": ["warn", { minScore: 0.95, aggregationMethod: "median-run" }],
        "categories:seo": ["warn", { minScore: 0.9, aggregationMethod: "median-run" }],
      },
    },
    upload: { target: "filesystem", outputDir: `lighthouse/reports/${preset}` },
  },
}
