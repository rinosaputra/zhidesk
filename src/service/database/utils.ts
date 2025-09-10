// File: src/service/database/utils.ts
import { join } from 'path'
import { app } from 'electron'
import { mkdir } from 'fs/promises'

export class DatabaseUtils {
  static getBaseDataPath(): string {
    // Untuk Electron app, gunakan userData directory
    if (typeof app !== 'undefined') {
      return join(app.getPath('userData'), 'data')
    }

    // Untuk environment lain, gunakan direktori current
    return join(process.cwd(), 'data')
  }

  static async ensureDirectoryExists(path: string): Promise<void> {
    try {
      await mkdir(path, { recursive: true })
    } catch (error) {
      console.error(`Error creating directory ${path}:`, error)
      throw error
    }
  }
}
