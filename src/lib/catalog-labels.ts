import type { NftCategory, NftChain, NftSort, NftTab } from "@/api/contracts"

export const categoryLabels: Record<NftCategory, string> = {
  "digital-art": "Arte digital",
  photography: "Fotografia",
  music: "Música",
  "3d-art": "Arte 3D",
  collectibles: "Colecionáveis",
  generative: "Generativa",
  gaming: "Jogos",
  memberships: "Assinaturas",
  utility: "Utilidade",
}

export const chainLabels: Record<NftChain, string> = {
  ethereum: "Ethereum",
  polygon: "Polygon",
  solana: "Solana",
}

export const tabLabels: Record<NftTab, string> = {
  all: "Todos os NFTs",
  new: "Novos lançamentos",
  trending: "Em alta",
}

export const sortLabels: Record<NftSort, string> = {
  recent: "Listados recentemente",
  "price-asc": "Menor preço",
  "price-desc": "Maior preço",
  popular: "Mais curtidos",
  name: "Nome (A–Z)",
}
