# Arquitetura

## Stack

| Responsabilidade | Tecnologia |
| --- | --- |
| Build | Vite 8 |
| UI | React 19 + TypeScript 6 (strict, `noUncheckedIndexedAccess`) |
| Roteamento | TanStack Router (file-based, `src/routes`) |
| Estado remoto | TanStack Query 5 |
| HTTP | Axios (instância única em `src/api/http.ts`) |
| Tempo real | socket.io-client 4 |
| Estilo | Tailwind CSS 4 + shadcn/ui (Radix) |
| Validação | zod (contratos e formulários) |
| Valores ETH | big.js (strings decimais, nunca `number`) |
| Mocks | MSW 2 + `@mswjs/socket.io-binding` |
| E2E / visual | Playwright |
| Auditoria | Lighthouse CI |
| Lint/format | Biome |

## Estrutura

```
src/
├── main.tsx            # liga o MSW (se habilitado) e só depois carrega o app
├── app/                # start.tsx (monta o app), QueryClient, Router, providers
├── routes/             # rotas TanStack (file-based); _authenticated protege os fluxos privados
├── pages/              # uma pasta por tela: index.tsx + components/ (só dessa tela) + hooks/helpers da tela
│   └── home · nft · cart · checkout · orders · auth · profile · wallets
├── components/         # só o que é usado por 2+ telas
│   ├── ui/             # primitivos shadcn/ui adaptados aos tokens
│   ├── layout/         # site-header, site-footer, mobile-tab-bar, connection-status
│   └── *.tsx           # form-field, summary-rows, quantity-stepper, page-message, reveal, ...
├── queries/            # consultas e mutations do TanStack Query usadas por mais de uma tela
├── api/
│   ├── contracts/      # schemas zod + tipos, compartilhados entre app, mocks e testes
│   ├── endpoints/      # uma função tipada por operação REST (Axios + validação da resposta)
│   ├── credentials.ts  # token de sessão e id do carrinho de visitante
│   ├── http.ts         # instância Axios, interceptors, evento de 401, parseResponse
│   └── errors.ts       # ApiError normalizado (HTTP, rede, timeout, cancelamento)
├── realtime/           # RealtimeProvider, RealtimeSession, EventGuard, aplicação de eventos no cache
├── hooks/ · lib/       # hooks genéricos; env, ETH, formatação, formulários
├── assets/             # ícones e decoração do Figma
└── mocks/              # MSW; nada daqui é importado por componentes ou hooks
    ├── browser.ts · socket.ts · scenarios.ts
    ├── handlers/       # REST por recurso + network.ts (cenários) + control.ts (/__mocks)
    ├── domain/         # regras do "servidor": catálogo, cupom, carrinho, cotação, pedidos, eventos
    ├── db/ · fixtures/ # banco no localStorage com reset; seed determinístico
    └── lib/            # envelope de erro, auth, hash de senha
e2e/                    # specs Playwright + __snapshots__ (baselines visuais)
lighthouse/             # lighthouserc.cjs, summarize.mjs, reports/
docs/API.md             # contratos REST, eventos e API de controle dos mocks
```

**Regra de organização:** um componente só vai para `components/` se for usado por duas ou mais telas. Se for de uma tela só, fica em `pages/<tela>/components/`. As consultas compartilhadas entre telas ficam em `queries/`; as de uma tela só ficam na própria página.

### Regras de dependência

- Código de UI → `api/`, `realtime/`, `queries/`, `components/`, `lib/`. Nunca → `mocks/`.
- `mocks/` → `api/contracts` (mesmos schemas) e `lib/`. Nunca → `pages/` nem componentes.
- `api/contracts` depende só de zod: é a fronteira tipada entre transporte, estado e UI.
- Os mocks são ligados só em `main.tsx`, por configuração (`VITE_ENABLE_MOCKS`), via import dinâmico.

## Decisões

- **Mocks antes do app (`main.tsx`).** O `engine.io-client` guarda `globalThis.WebSocket` quando o módulo carrega, e o MSW só troca o `WebSocket` depois do `worker.start()`. Por isso os mocks sobem primeiro e o app é importado depois; se for invertido, o socket tenta o host real.
- **`ws.link` na origem.** O MSW remove o prefixo `/socket.io/` da URL antes de comparar, então o handler usa só `VITE_SOCKET_URL`.
- **Biome em vez de ESLint + Prettier**, com regras relaxadas só em `components/ui` (código do shadcn).
- **msw fixado em 2.x**: `@mswjs/socket.io-binding@0.2.0` declara peer `msw ^2.10.2`.
- **E2E contra o build otimizado** (`vite preview`), o mesmo artefato publicado.
- **`.env` versionado** com defaults públicos, para um checkout limpo rodar com mocks.
- **`routeTree.gen.ts` versionado**, para `tsc` funcionar num checkout limpo.

## Contratos REST e eventos

Ver [`docs/API.md`](docs/API.md). Os schemas zod de `src/api/contracts` são a única definição: o cliente valida toda resposta (`parseResponse`) e os handlers validam todo corpo recebido (`parseBody`), respondendo 422 com erros por campo.

## Mocks: como o "servidor" funciona

- **Uma escrita, dois canais.** Toda mudança de preço ou estoque passa por `updateEdition` (que incrementa `version`) e depois por `publishNftUpdated`. REST e evento refletem o mesmo estado.
- **Persistência.** O banco fica em memória e é gravado no `localStorage` a cada `commit`; o reset regrava o seed. O `DB_SCHEMA_VERSION` descarta um banco antigo de outra versão. Cada contexto do Playwright tem o próprio storage.
- **Determinismo.** Fixtures vêm de um PRNG com semente fixa (36 NFTs, 3 usuários, carteiras e cupons); ids vêm de contadores (`ord-000001`).
- **Liquidação.** O pedido nasce `pending` com `settleAt`; um timer o liquida e, após refresh, os timers pendentes são retomados. A liquidação gera `order.updated`.

## Sessão

- Login e cadastro devolvem um token opaco, guardado em `localStorage` e enviado como `Authorization: Bearer`. A senha nunca é guardada no cliente; nos mocks fica só o hash com salt.
- A sessão é recuperada no refresh por `GET /auth/session`. TTL de 30 min (60 s no cenário `session-expired`), sem renovação.
- **Proteção de rotas:** `_authenticated` redireciona para `/login?redirect=<destino>` sem token. Após login, o app volta ao destino (só caminhos internos são aceitos).
- **Expiração:** qualquer 401 (`SESSION_EXPIRED` ou `UNAUTHENTICATED`) limpa a sessão e os caches privados e leva ao login com `redirect` para a página atual, inclusive no checkout; ao voltar, o carrinho continua no servidor.
- **Logout e troca de usuário:** limpam sessão, carrinho, favoritos, carteiras, perfil e pedidos do cache e fecham a sessão de Socket.IO anterior.

## Carrinho

- O carrinho fica no servidor. O visitante é identificado por `X-Guest-Cart-Id`; o usuário, pela sessão. Por isso sobrevive ao refresh nos dois casos.
- Ao autenticar, `POST /cart/merge` junta o carrinho do visitante (limitado ao estoque e ao `maxPerOrder`).
- O `summary` do carrinho é uma estimativa. A **cotação** (`POST /quotes`) é a referência: o pedido só é criado se ela ainda bater com o estado atual; senão a API responde `QUOTE_OUTDATED` com a lista de mudanças e o usuário precisa confirmar de novo.
- Mudanças de preço ou estoque recebidas por `nft.updated` enquanto o carrinho está aberto ficam num pequeno store (`realtime/cart-changes.ts`). O carrinho mostra um aviso (`role="status"`) e o checkout desabilita "Confirmar compra" até o usuário clicar em "Atualizar valores".

## Estratégia de cache

Padrões em `src/app/query-client.ts`: `staleTime` 30 s, `gcTime` 5 min, `refetchOnWindowFocus`, retry só para erros transitórios (rede, timeout, 5xx; até 2, backoff 500 ms → 4 s). Mutations não têm retry automático.

| Recurso | Política |
| --- | --- |
| Catálogo (lista) | Chave inclui todos os parâmetros; `keepPreviousData` durante a troca; o `signal` cancela respostas obsoletas |
| Detalhe | Atualizado por `nft.updated`; reviews com `staleTime` 60 s |
| Destaque | `staleTime` 5 min |
| Carrinho | Atualizado pelo retorno das mutations (`setQueryData`) e invalidado por `nft.updated` |
| Cotação | Criada ao abrir o checkout; `staleTime` infinito, `gcTime` 0, refetch ao montar |
| Pedido | Atualizado por `order.updated`; refetch de segurança a cada 15 s com socket conectado e 2,5 s sem ele, enquanto `pending` |
| Sessão | `staleTime` 5 min, sem retry |
| Favoritos | **Atualização otimista** com rollback e `invalidate` em `onSettled` |

**Isolamento por usuário:** a sessão é a raiz; ao trocar de usuário, as chaves privadas são removidas do cache.

## Reconciliação REST × Socket.IO

- **Uma sessão de tempo real por usuário** (`RealtimeProvider`): é recriada a cada login, logout ou troca de usuário; `close()` remove o socket e todos os listeners.
- **Duplicatas e eventos antigos** (`EventGuard`): ids já vistos e versões menores ou iguais à conhecida são descartados. As versões lidas no REST entram no guard, então um evento atrasado nunca sobrescreve um dado mais novo.
- **Reconexão:** eventos emitidos durante a queda se perdem. No `connect` seguinte, o app invalida e refaz no REST o catálogo, o carrinho e os pedidos ativos. A UI mostra "Reconectando ao tempo real…" e, depois, "Conexão em tempo real restabelecida".
- **Isolamento:** o servidor simulado só entrega `order.updated` à conexão cuja sessão é a do dono do pedido, conferindo no envio.
- **Pedido pendente:** sobrevive à queda e ao refresh; o estado vem do REST, e `confirmed` e `declined` são terminais.

## Testes

38 testes Playwright (Chromium), contra o build otimizado, em desktop (1440) e mobile (390). O mobile roda os fluxos principais; contratos e conta rodam só no desktop.

| Arquivo | Cobre |
| --- | --- |
| `catalog.spec.ts` | busca, filtros combinados, ordenação, paginação, histórico, vazio, respostas fora de ordem |
| `detail-cart-favorites.spec.ts` | detalhe direto, inexistente, esgotado, limite; favoritos com falha; carrinho, cupom, persistência |
| `auth.spec.ts` | cadastro (validação e conflito), expiração, logout, troca de usuário, carrinho de visitante |
| `checkout-realtime.spec.ts` | compra completa, recusa, clique repetido, timeout com mesmo pedido, `nft.updated`, duplicados e antigos, queda e retomada |
| `account.spec.ts` | perfil, avatar, senha, carteiras, com erros de validação |
| `a11y.spec.ts` | teclado, foco em diálogos e drawer, erros associados, alt, `aria-live`, abas, overflow em 320/390/768/1440 |
| `resilience.spec.ts` | skeleton em rede lenta, erro 5xx e timeout de requisição com nova tentativa |
| `visual.spec.ts` | regressão visual de início, detalhe, carrinho e pagamento (baselines em `e2e/__snapshots__`) |
| `contracts.spec.ts` | respostas dos handlers MSW validadas com os schemas do app |

Os eventos de tempo real sempre entram pela API de controle (`/__mocks/socket/*`, `/__mocks/nfts/...`) e chegam à UI pelo `socket.io-client`. Cada teste começa de um contexto novo; relatório HTML e traces das falhas ficam em `playwright-report/` e `test-results/`.

## Performance (Lighthouse)

Configuração em `lighthouse/lighthouserc.cjs` (3 execuções por página e perfil, mediana). `pnpm lighthouse:summary` gera `lighthouse/reports/SUMMARY.md`. Ferramentas: Lighthouse 12.6.1, Chrome 154, build otimizado servido por `vite preview`, cenário `default` dos mocks.

| Perfil | Página | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| mobile | `/` | 73 | 96 | 96 | 92 | 4,15 s | 0 | 460 ms |
| mobile | `/nfts/nft-001` | 73 | 100 | 96 | 92 | 4,00 s | 0 | 432 ms |
| desktop | `/` | 98 | 96 | 96 | 92 | 1,06 s | 0 | 16 ms |
| desktop | `/nfts/nft-001` | 98 | 100 | 96 | 92 | 1,09 s | 0 | 14 ms |

**Abaixo da meta: Performance no mobile (73 nestas execuções, meta 90).** Em medições anteriores na mesma máquina, com menos carga, a nota ficou entre 77 e 80, então há variação de TBT entre execuções (270 a 460 ms). Todas as demais categorias e o desktop atingem as metas. Causas identificadas nos relatórios, sem simplificar a entrega para melhorar a nota:

- **Cadeia de carregamento:** o app só inicia depois que o MSW (cerca de 170 KB, exigido na demonstração) termina de subir. Isso pesa no FCP (2,0–2,2 s) e no LCP sob a CPU 4× mais lenta e a rede 4G emuladas.
- **JS inicial e TBT:** React, TanStack Router e Query, zod e MSW somam um bootup de 1,1–1,5 s; 70 KB são JS não usado na primeira tela.
- **Imagem do LCP:** na home é a primeira imagem do catálogo (`loading="lazy"`, dentro de um bloco com fade de entrada); no detalhe é a imagem principal, que só é descoberta depois que o JS renderiza a página.
- CLS é 0: os skeletons reservam as dimensões do conteúdo.

## Desvios do Figma e acessibilidade

**Ajustes de acessibilidade em relação ao layout**
- **Bordas dos campos de formulário:** o Figma usa `#3F2319` (contraste 1,2:1 com o fundo). Os campos usam `#8F6B50` (≥ 3,2:1), conforme WCAG 1.4.11.
- **Foco visível global:** contorno de 2 px em todos os elementos interativos.
- **Movimento reduzido:** respeitado em shimmer, fades e carrossel.
- **Rótulos e erros:** todo campo tem `label`, `aria-invalid` e mensagem associada por `aria-describedby`; toasts e avisos de tempo real ficam em regiões `aria-live="polite"`.
- **Diálogos e drawers:** Radix, com foco preso e devolvido; o drawer de filtros devolve o foco ao botão.
- **Abas:** navegação por setas, Home e End.
- **Toasts no mobile:** abaixo da barra superior, para não cobrir botões nem o botão principal.

**Desvios de conteúdo**
- **Avaliações:** o Figma mostra estrelas e a contagem. As avaliações vêm da API simulada (`GET /nfts/:id/reviews`) e a aba "Avaliações de colecionadores" lista nota, distribuição e comentários.
- **Detalhe:** o breadcrumb segue "Início / Mercado"; "ID do token" deriva do nome do NFT; "Ver no Etherscan" virou "Ver no explorador de blocos" (o link é simulado).
- **Campos sem equivalente na API** (nome de usuário no perfil, ENS, código de indicação etc.) existem como no Figma, mas não são persistidos.
- **Telas sem frame** (perfil, carteiras, confirmação em mobile) seguem os mesmos padrões das telas desenhadas; o header logado (nome, perfil, sair) também.
- **Assets:** as 4 artes de NFT do Figma são reutilizadas entre os 36 NFTs das fixtures (WebP 800 px); ícones exportados do Figma em `src/assets/icons`; fontes locais via `@fontsource-variable/roboto-mono`.

## Limitações

- **Só WebSocket:** o MSW intercepta WebSocket, não HTTP long-polling, por isso `transports: ["websocket"]`.
- **Handshake e heartbeat:** `@mswjs/socket.io-binding@0.2.0` responde ao handshake sozinho, sem expor o `auth` do CONNECT e sem enviar pings. O servidor simulado lê o pacote `40{...}` cru para ligar a conexão ao token e envia ping a cada 20 s. O binding não tem rooms nem namespaces; o roteamento por usuário usa o registro de conexões.
- **Queda simulada:** durante uma queda (`/__mocks/socket/disconnect`) novas conexões são fechadas com o código 4000; o `socket.io-client` só trata isso como falha após o `timeout` de conexão, reduzido para 5 s.
- **Uma aba:** cada aba carrega o banco do `localStorage` ao iniciar; abas abertas ao mesmo tempo não sincronizam entre si.
- **Performance mobile:** ver a seção de Lighthouse.
