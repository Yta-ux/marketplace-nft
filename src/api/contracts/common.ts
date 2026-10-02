import { z } from "zod"

export const ethAmountSchema = z.string().regex(/^\d+(\.\d{1,18})?$/, "Invalid ETH decimal string")

export const isoDateSchema = z.iso.datetime({ offset: true })

export const quantitySchema = z.number().int().min(1)

export const networkSchema = z.enum(["ethereum", "polygon", "arbitrum", "base"])
export type Network = z.infer<typeof networkSchema>

export const paginatedSchema = <T extends z.ZodType>(item: T) =>
  z.object({
    items: z.array(item),
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
  })

export type Paginated<T> = {
  items: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}
