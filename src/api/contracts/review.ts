import { z } from "zod"
import { isoDateSchema } from "./common"

export const reviewRatingSchema = z.number().int().min(1).max(5)

export const reviewSchema = z.object({
  id: z.string(),
  nftId: z.string(),
  author: z.object({ id: z.string(), name: z.string() }),
  rating: reviewRatingSchema,
  title: z.string(),
  body: z.string(),
  createdAt: isoDateSchema,
})
export type Review = z.infer<typeof reviewSchema>

export const ratingSummarySchema = z.object({
  average: z.number().min(0).max(5),
  count: z.number().int().min(0),
  distribution: z.object({
    1: z.number().int().min(0),
    2: z.number().int().min(0),
    3: z.number().int().min(0),
    4: z.number().int().min(0),
    5: z.number().int().min(0),
  }),
})
export type RatingSummary = z.infer<typeof ratingSummarySchema>

export const reviewsResponseSchema = z.object({
  items: z.array(reviewSchema),
  summary: ratingSummarySchema,
})
export type ReviewsResponse = z.infer<typeof reviewsResponseSchema>
