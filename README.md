# NFT Marketplace

Marketplace de NFTs em React + TypeScript com APIs, sessão, carteiras, pagamentos e eventos em tempo real simulados via MSW. Arquitetura, decisões, desvios do Figma, acessibilidade e resultados do Lighthouse: [`ARCHITECTURE.md`](ARCHITECTURE.md).

**Demo publicada:** https://marketplace-nft-tan.vercel.app/ (mocks e tempo real ativos; credenciais fictícias abaixo)

## Requisitos

- Node.js ≥ 22
- pnpm 10 (`corepack enable`)

## Setup

```bash
pnpm install
pnpm exec playwright install chromium   # apenas para testes E2E / Lighthouse
pnpm dev                                # http://localhost:5173 com mocks ativos
```

## Variáveis de ambiente

Os valores padrão (públicos, sem segredos) ficam versionados em `.env`. Para sobrescrever, crie um `.env.local`.

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `VITE_API_URL` | `/api` | Base das chamadas REST (Axios) |
| `VITE_SOCKET_URL` | `https://realtime.nft-market.mock` | Endpoint Socket.IO (interceptado pelo MSW) |
| `VITE_ENABLE_MOCKS` | `true` | Liga a camada MSW (REST + WebSocket) |
| `VITE_MOCK_SCENARIO` | `default` | Cenário padrão dos mocks |

## Comandos

| Comando | O que faz |
| --- | --- |
| `pnpm dev` | Desenvolvimento com mocks |
| `pnpm build` | Typecheck + build otimizado |
| `pnpm preview` | Serve o build em `http://localhost:4173` |
| `pnpm typecheck` | `tsc -b` (app, mocks, testes) |
| `pnpm lint` / `pnpm lint:fix` | Biome (lint + format) |
| `pnpm test:e2e` | Playwright (build + preview, Chromium desktop e mobile) |
| `pnpm test:e2e:update` | Atualiza baselines de regressão visual |
| `pnpm test:e2e:report` | Abre o relatório HTML |
| `pnpm lighthouse` | Auditoria Lighthouse mobile (build + 3 execuções em `/` e `/nfts/nft-001`) |
| `pnpm lighthouse:desktop` | Mesma auditoria no perfil desktop |
| `pnpm lighthouse:summary` | Tabela com as medianas (notas, LCP, CLS, TBT) em `lighthouse/reports/SUMMARY.md` |

## Testes

```bash
pnpm build && pnpm preview --port 4173   # ou deixe o Playwright subir o servidor
pnpm exec playwright test                # desktop e mobile
pnpm test:e2e:update                     # regrava as baselines visuais
pnpm test:e2e:report                     # relatório HTML e traces
```

Cobertura por requisito em [`ARCHITECTURE.md`](ARCHITECTURE.md#testes).

## Mocks

REST e Socket.IO são simulados com MSW na camada de rede ([`src/mocks`](src/mocks)). Ficam ativos no dev, na demo publicada e nos testes (`VITE_ENABLE_MOCKS=true`). O estado (usuários, carrinho, pedidos...) fica no `localStorage` do navegador e sobrevive ao refresh.

Contratos REST, eventos e API de controle: [`docs/API.md`](docs/API.md).

### Selecionar cenário

- Na URL: `http://localhost:5173/?scenario=payment-declined` (vale para a aba inteira).
- Por API: `PUT /api/__mocks/scenario` com `{ "name": "payment-declined" }`.
- Padrão do build: `VITE_MOCK_SCENARIO`.

### Reset

`POST /api/__mocks/reset` (opcional `{ "scenario": "<nome>" }`) restaura o seed por completo. No console do navegador:

```js
await fetch("/api/__mocks/reset", { method: "POST" }); location.reload()
```

### Cenários

| Cenário | Efeito |
| --- | --- |
| `default` | Tudo funciona, latência de 120 ms |
| `empty-catalog` | Catálogo e destaques vazios |
| `slow-network` | Toda requisição leva 2,5 s (skeletons) |
| `variable-latency` | Sequência fixa de latências (1600, 250, 900, 120, 1200, 400 ms); respostas chegam fora de ordem |
| `offline` | Todas as requisições falham sem resposta |
| `server-error` | GETs de `/nfts` respondem 500 |
| `request-timeout` | GETs de `/nfts` nunca respondem; o cliente desiste no timeout (10 s) e oferece nova tentativa |
| `flaky` | Cada GET falha com 503 três vezes e depois funciona (testa o "tentar de novo") |
| `session-expired` | Sessão expira 60 s após o login |
| `favorites-failure` | Favoritar/desfavoritar responde 503 (rollback otimista) |
| `wallet-rejected` | A conexão da carteira é recusada |
| `price-changed-during-checkout` | 1,5 s após a primeira cotação, o preço do primeiro item sobe 10% (`nft.updated`) |
| `sold-out-during-checkout` | 1,5 s após a primeira cotação, a edição do primeiro item esgota (`nft.updated`) |
| `order-timeout` | A primeira tentativa cria o pedido mas a resposta nunca chega; repetir com a mesma chave recupera o mesmo pedido (que liquida só após 20 s) |
| `order-pending` | Pedidos ficam pendentes até `POST /api/__mocks/orders/:id/settle` |
| `payment-declined` | O pagamento é recusado na liquidação |

## Credenciais fictícias

Todos os usuários usam a senha **`Collector#2026`**.

| E-mail | Perfil |
| --- | --- |
| `ana@collector.test` | Carteiras principal e secundária, 3 favoritos |
| `bruno@collector.test` | Uma carteira principal, 1 favorito |
| `carla@collector.test` | Sem carteiras (testa o cadastro de carteira antes do checkout) |

Cupons: `WELCOME10` (10%), `FLAT005` (0,05 ETH acima de 0,2 ETH), `EXPIRED20` (vencido). Qualquer outro código é inválido.

## Reproduzindo fluxos de falha

| Fluxo | Como reproduzir |
| --- | --- |
| Preço alterado no checkout | `?scenario=price-changed-during-checkout`, adicione um item, vá ao pagamento e aguarde 1,5 s |
| Edição esgotada no checkout | `?scenario=sold-out-during-checkout` |
| Timeout após criar o pedido | `?scenario=order-timeout`, confirme a compra e aguarde o timeout (8 s); repita o envio |
| Pagamento recusado | `?scenario=payment-declined` |
| Pedido pendente + queda de conexão | `?scenario=order-pending`, confirme; `POST /api/__mocks/socket/disconnect`; `POST /api/__mocks/orders/<id>/settle`; recarregue ou aguarde a reconexão |
| Sessão expirada | `POST /api/__mocks/session/expire` durante a navegação ou o checkout |
| Falha e nova tentativa | `?scenario=flaky`, `?scenario=server-error`, `?scenario=request-timeout` ou `?scenario=offline` |
| Skeletons | `?scenario=slow-network` |
| Evento duplicado/antigo | `POST /api/__mocks/socket/replay` · `POST /api/__mocks/socket/emit` |
