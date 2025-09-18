// File: src/service/orpc/router.ts
import { os } from '@orpc/server'
import * as z from 'zod'
import { databaseRouter } from '@service/database-v1/router'
import { aiRouter } from '@service/ai/router'

// Inisialisasi DocGenerator

export const router = {
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

  // ==================== DATABASE MANAGEMENT ===================
  database: databaseRouter,

  // ==================== AI INTEGRATION ===================
  ai: aiRouter
}

export type Router = typeof router
