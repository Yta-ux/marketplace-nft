import { createFileRoute } from "@tanstack/react-router"
import { NftDetailPage } from "@/pages/nft"

export const Route = createFileRoute("/nfts/$nftId")({
  component: NftDetailPage,
})
