// File: src/service/orpc/router.ts
import { os } from '@orpc/server'
import * as z from 'zod'
import { databaseRouter } from '../database/router'

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
  database: databaseRouter
}

export type Router = typeof router
