# Contratos REST e eventos

Fonte da verdade: schemas zod em [`src/api/contracts`](../src/api/contracts). App (Axios + `parseResponse`) e mocks (MSW) usam os mesmos schemas — uma divergência de contrato quebra o typecheck ou é rejeitada em runtime.

Base: `VITE_API_URL` (padrão `/api`). JSON em tudo, exceto upload de avatar (`multipart/form-data`).

## Convenções

| Tema | Regra |
| --- | --- |
| Autenticação | `Authorization: Bearer <token>` (token devolvido por login/cadastro). |
| Carrinho de visitante | Sem sessão, o cliente envia `X-Guest-Cart-Id: guest_<uuid>` (gerado e guardado no navegador). |
| Valores em ETH | Sempre string decimal (`"0.245"`), até 18 casas. Nunca `number`. Cálculos com big.js. |
| Quantidades | Inteiros ≥ 1. Limite efetivo por linha: `min(available, maxPerOrder)`. |
| Versionamento | NFTs e pedidos têm `version` monotônica; eventos carregam a versão após a mudança. |
| Idempotência | `POST /orders` exige `Idempotency-Key`. |

## Erros

Toda resposta não-2xx segue o envelope:

```json
{ "code": "VALIDATION_ERROR", "message": "Some fields are invalid", "fields": { "email": "Enter a valid email" }, "details": {} }
```

| `code` | HTTP | Quando |
| --- | --- | --- |
| `VALIDATION_ERROR` | 422 | Corpo inválido; `fields` por campo |
| `INVALID_CREDENTIALS` | 401 | Login com e-mail/senha errados |
| `UNAUTHENTICATED` | 401 | Sem sessão / token desconhecido |
| `SESSION_EXPIRED` | 401 | Sessão existia e expirou |
| `FORBIDDEN` | 403 | Recurso de outro usuário |
| `NOT_FOUND` | 404 | Recurso inexistente |
| `CONFLICT` | 409 | E-mail já cadastrado, papel de carteira ocupado, endereço repetido |
| `IDEMPOTENCY_CONFLICT` | 409 | Mesma `Idempotency-Key` com conteúdo diferente |
| `AVAILABILITY_CONFLICT` | 409 | Edição esgotada / quantidade acima do limite; `details.changes` |
| `QUOTE_OUTDATED` | 409 | Preço, estoque, cupom ou taxa mudou desde a cotação; `details.changes` |
| `QUOTE_EXPIRED` | 409 | Cotação passou do TTL (5 min) |
| `COUPON_INVALID` / `COUPON_EXPIRED` | 422 | Cupom inexistente, abaixo do mínimo ou vencido |
| `WALLET_REJECTED` | 403 | Usuário recusou a conexão (simulada) |
| `WALLET_NOT_CONNECTED` | 409 | Pedido sem carteira conectada na rede escolhida |
| `PAYMENT_DECLINED` | 402 | Reservado (a recusa acontece de forma assíncrona, via status do pedido) |
| `TRANSIENT` | 503 | Falha transitória, pode tentar de novo |
| `INTERNAL` | 500 | Erro inesperado |

Falhas sem resposta HTTP são normalizadas no cliente (`src/api/errors.ts`) como `NETWORK`, `TIMEOUT` ou `CANCELED`.

## Endpoints

### Sessão e conta

| Método | Rota | Corpo | Resposta |
| --- | --- | --- | --- |
| POST | `/auth/register` | `{ displayName, email, password }` | 201 `{ token, user, expiresAt }` · 409 `CONFLICT` (`fields.email`) · 422 |
| POST | `/auth/login` | `{ email, password }` | 200 `{ token, user, expiresAt }` · 401 `INVALID_CREDENTIALS` |
| GET | `/auth/session` | — | 200 `{ user, expiresAt }` · 401 `UNAUTHENTICATED`/`SESSION_EXPIRED` |
| POST | `/auth/logout` | — | 204 |

Senha: 8–72 caracteres, com pelo menos uma letra e um número. Nos mocks, guardada só como `sha256(salt:senha)`.

### NFTs

| Método | Rota | Resposta |
| --- | --- | --- |
| GET | `/nfts?q&categories&minPrice&maxPrice&availability&sort&page&pageSize` | `{ items: NftSummary[], page, pageSize, total, totalPages }` |
| GET | `/nfts/featured` | `{ items: NftSummary[] }` |
| GET | `/nfts/:nftId` | `NftDetail` (galeria, edições, tags, `tokenId`, `collection`, `rating`) · 404 |
| GET | `/nfts/:nftId/reviews` | `{ items: Review[], summary: { average, count, distribution } }` · 404 |

- `categories`: lista separada por vírgula (`art,music`), combinável com os demais filtros.
- `availability`: `all` | `available` | `sold-out`.
- `sort`: `recent` | `price-asc` | `price-desc` | `popular` | `name` (desempate por id, paginação estável).
- `minPrice`/`maxPrice` filtram por `priceFrom` (menor preço entre as edições).
- `nftListQueryToParams` e `nftListQueryFromParams` serializam e lêem a query, para que rota, request e handler concordem nos defaults.

### Favoritos (autenticado)

| Método | Rota | Resposta |
| --- | --- | --- |
| GET | `/me/favorites` | `{ nftIds: string[] }` |
| PUT | `/me/favorites/:nftId` | `{ nftId, favorited: true, favoritesCount }` (idempotente) |
| DELETE | `/me/favorites/:nftId` | `{ nftId, favorited: false, favoritesCount }` (idempotente) |

### Carrinho (visitante ou autenticado)

Toda operação devolve o `Cart` completo: linhas com preço **atual**, `available`, `maxPerOrder`, `status` (`ok` | `insufficient-stock` | `sold-out`), `nftVersion`, mais `coupon` e `summary` (`subtotal`, `discount`, `networkFee`, `total`, estimados na rede padrão).

| Método | Rota | Corpo | Observações |
| --- | --- | --- | --- |
| GET | `/cart` | — | Cria o carrinho vazio se não existir |
| POST | `/cart/items` | `{ nftId, editionId, quantity }` | Soma à linha existente; 409 `AVAILABILITY_CONFLICT` |
| PATCH | `/cart/items/:itemId` | `{ quantity }` | 409 acima do limite |
| DELETE | `/cart/items/:itemId` | — | |
| POST | `/cart/coupon` | `{ code }` | 422 `COUPON_INVALID`/`COUPON_EXPIRED` (`fields.code`) |
| DELETE | `/cart/coupon` | — | |
| POST | `/cart/merge` | `{ guestCartId }` | Autenticado; junta o carrinho do visitante respeitando os limites |

Um cupom já aplicado que vença ou deixe de atingir o mínimo continua no carrinho, com `status` `expired`/`not-applicable` e desconto zero.

### Cotação (autenticado)

| Método | Rota | Corpo | Resposta |
| --- | --- | --- | --- |
| POST | `/quotes` | `{ network }` | 201 `Quote` (linhas, cupom, subtotal, desconto, taxa da rede, total, `expiresAt`) · 409 `AVAILABILITY_CONFLICT` |

Taxas simuladas por rede: ethereum `0.0042`, polygon `0.0003`, arbitrum `0.0008`, base `0.0005`.

### Pedidos (autenticado)

| Método | Rota | Corpo | Resposta |
| --- | --- | --- | --- |
| POST | `/orders` + `Idempotency-Key` | `{ quoteId, walletId, network, collector: { fullName, email } }` | 201 `Order` (`pending`) · 200 o mesmo pedido (repetição) · 409 `IDEMPOTENCY_CONFLICT`/`QUOTE_OUTDATED`/`QUOTE_EXPIRED`/`WALLET_NOT_CONNECTED` |
| GET | `/orders?status=pending` | — | `{ items: Order[] }`, para recuperar pedidos em andamento |
| GET | `/orders/:orderId` | — | `Order` · 403 de outro usuário · 404 |

No `POST`, o servidor revalida a cotação contra o catálogo, o carrinho, o cupom e as taxas atuais e reserva o estoque. Ciclo de vida: `pending` → `confirmed` | `declined` (terminais). Na confirmação, remove do carrinho exatamente as quantidades compradas. Na recusa, devolve o estoque. O pedido guarda um snapshot das linhas e valores, que não muda com alterações posteriores do catálogo.

### Perfil (autenticado)

| Método | Rota | Corpo | Resposta |
| --- | --- | --- | --- |
| GET | `/me` | — | `Profile` |
| PATCH | `/me` | `{ displayName, email, bio, website }` | `Profile` · 409 e-mail em uso · 422 |
| PUT | `/me/avatar` | multipart `file` (PNG/JPEG/WebP ≤ 1 MB) | `Profile` · 422 |
| DELETE | `/me/avatar` | — | `Profile` |
| PUT | `/me/password` | `{ currentPassword, newPassword }` | 204 · 422 (`fields.currentPassword`) |

### Carteiras (autenticado)

| Método | Rota | Corpo | Resposta |
| --- | --- | --- | --- |
| GET | `/me/wallets` | — | `{ items: Wallet[] }` (principal primeiro) |
| POST | `/me/wallets` | `{ label, address, provider, role, networks }` | 201 · 409 papel ocupado ou endereço repetido · 422 |
| PATCH | `/me/wallets/:id` | parcial | Trocar `role` faz a troca com a outra carteira |
| POST | `/me/wallets/:id/connection` | `{ network }` | `Wallet` com `connection` · 403 `WALLET_REJECTED` · 422 rede não suportada |
| DELETE | `/me/wallets/:id/connection` | — | `Wallet` desconectada |

No máximo uma carteira `primary` e uma `secondary`. Endereço: `0x` seguido de 40 caracteres hexadecimais.

## Eventos Socket.IO

Envelope comum (`src/api/contracts/events.ts`):

```json
{ "id": "evt-000012", "type": "nft.updated", "resource": { "type": "nft", "id": "nft-002" }, "version": 3, "occurredAt": "…", "data": { … } }
```

| Evento | Destino | `data` |
| --- | --- | --- |
| `nft.updated` | Todos os clientes conectados | `{ nftId, priceFrom, totalAvailable, editions: [{ id, price, available }] }` |
| `order.updated` | Só conexões cuja sessão pertence ao dono do pedido | `{ orderId, status, transaction, failureReason, updatedAt }` |

- `id` é estável: uma duplicata chega com o mesmo id.
- `version` é a versão do recurso depois da mudança.
- O cliente (`src/realtime/event-guard.ts`) descarta ids já vistos e versões ≤ à conhecida, inclusive versões vistas em respostas REST.
- Handshake: o cliente envia `auth: { token }` no CONNECT. Sem token, a conexão só recebe eventos públicos.

Eventos emitidos durante uma queda são perdidos, como num servidor real. Depois de reconectar, `RealtimeSession.onReconnect` avisa para os donos dos dados buscarem o estado atual via REST.

## API de controle dos mocks (`/api/__mocks`)

Só existe com mocks ativos e não sofre efeito dos cenários de rede. É usada pelos testes e pela demo.

| Método | Rota | Corpo | Efeito |
| --- | --- | --- | --- |
| POST | `/reset` | `{ scenario? }` | Restaura o seed por completo e ativa o cenário (padrão `default`) |
| GET / PUT | `/scenario` | `{ name }` | Lista ou troca o cenário ativo |
| PATCH | `/nfts/:nftId/editions/:editionId` | `{ price?, available? }` | Altera o catálogo e emite `nft.updated` |
| POST | `/orders/:orderId/settle` | `{ outcome? }` | Liquida um pedido pendente agora |
| POST | `/session/expire` | — | Expira todas as sessões |
| GET | `/socket` | — | Conexões ativas e usuário de cada uma |
| POST | `/socket/disconnect` | `{ downForMs? }` | Derruba as conexões e recusa novas pelo período (ou até `/restore`) |
| POST | `/socket/restore` | — | Encerra a queda |
| POST | `/socket/replay` | `{ count, userId? }` | Reenvia os últimos eventos como estão (duplicatas) |
| POST | `/socket/emit` | `{ event, userId? }` | Emite um evento arbitrário, por exemplo de versão antiga |
| GET | `/db` | — | Dump do banco simulado (diagnóstico) |
