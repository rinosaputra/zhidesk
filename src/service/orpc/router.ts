// File: src/service/orpc/router.ts
import { os } from '@orpc/server'
import * as z from 'zod'
import { CollectionRouter } from './collection.router'

// Inisialisasi DocGenerator

export const oRPCRouter = {
  // Contoh existing route
  example: os
    .input(
      z.object({
        call: z.string()
      })
    )
    .output(
      z.object({
        input: z.string(),
        result: z.boolean()
      })
    )
    .handler(async ({ input }) => {
      return {
        input: input.call,
        result: true
      }
    }),

  // ==================== COLLECTION MANAGEMENT ===================
  collection: CollectionRouter
}

export type oRPCRouter = typeof oRPCRouter
