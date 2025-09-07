/* eslint-disable @typescript-eslint/no-explicit-any */
// File: src/service/database/lowdb.ts
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import lodash from 'lodash'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'

// Extend Low class with lodash functionality
class LowWithLodash<T> extends Low<T> {
  chain: lodash.ExpChain<this['data']> = lodash.chain(this).get('data')

  constructor(adapter: any, data: T) {
    super(adapter, data)
  }
}

// Database schema interface
export interface DatabaseSchema {
  collections: Record<string, string> // Mengubah dari any[] menjadi string (path file)
  _meta: {
    version: string
    createdAt: string
    lastModified: string
  }
}

// Collection interface untuk setiap file collection
export interface CollectionData {
  documents: any[]
  _meta: {
    createdAt: string
    lastModified: string
  }
}

// Default database structure
const defaultData: DatabaseSchema = {
  collections: {},
  _meta: {
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
  }
}

// Default collection structure
const defaultCollectionData: CollectionData = {
  documents: [],
  _meta: {
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
  }
}

// Get database directory path
function getDatabasePath(): string {
  const isDev = process.env.NODE_ENV === 'development'

  if (isDev) {
    // During development, use project data directory
    const devDataPath = path.join(process.cwd(), 'data')
    if (!fs.existsSync(devDataPath)) {
      fs.mkdirSync(devDataPath, { recursive: true })
    }
    return path.join(devDataPath, 'db.json')
  } else {
    // In production, use user data directory
    const userDataPath = app.getPath('userData')
    const dbPath = path.join(userDataPath, 'data')

    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true })
    }

    return path.join(dbPath, 'zhidesk-db.json')
  }
}

// Get collection file path
function getCollectionPath(collectionName: string): string {
  const dbDir = path.dirname(getDatabasePath())
  return path.join(dbDir, `${collectionName}.json`)
}

// Database initialization
let db: LowWithLodash<DatabaseSchema>

// Cache untuk collection databases
const collectionDbs: Map<string, LowWithLodash<CollectionData>> = new Map()

export async function initializeDatabase(): Promise<void> {
  try {
    const dbPath = getDatabasePath()
    console.log('Database path:', dbPath)

    // Initialize database adapter
    const adapter = new JSONFile<DatabaseSchema>(dbPath)

    // Create database instance dengan data default
    db = new LowWithLodash(adapter, defaultData)

    // Read existing data or initialize with default
    await db.read()

    // Ensure default structure exists
    if (!db.data) {
      db.data = { ...defaultData }
    }

    if (!db.data._meta) {
      db.data._meta = defaultData._meta
    }

    // Initialize with default collections if they don't exist
    const defaultCollections = ['users', 'settings', 'collections']

    for (const collection of defaultCollections) {
      if (!db.data.collections[collection]) {
        const collectionPath = getCollectionPath(collection)
        db.data.collections[collection] = collectionPath

        // Create collection file dengan data default
        const collectionAdapter = new JSONFile<CollectionData>(collectionPath)
        const collectionDb = new LowWithLodash(collectionAdapter, { ...defaultCollectionData })
        await collectionDb.read()

        if (!collectionDb.data) {
          collectionDb.data = { ...defaultCollectionData }
        }

        await collectionDb.write()
        collectionDbs.set(collection, collectionDb)
      }
    }

    // Update metadata
    db.data._meta.lastModified = new Date().toISOString()
    await db.write()

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

// Helper function untuk mendapatkan collection database
async function getCollectionDb(
  collectionName: string
): Promise<LowWithLodash<CollectionData> | null> {
  if (!db.data?.collections[collectionName]) {
    return null
  }

  // Jika sudah di cache, return dari cache
  if (collectionDbs.has(collectionName)) {
    return collectionDbs.get(collectionName)!
  }

  try {
    const collectionPath = db.data.collections[collectionName]
    const adapter = new JSONFile<CollectionData>(collectionPath)

    // Buat instance dengan data default terlebih dahulu
    const collectionDb = new LowWithLodash(adapter, { ...defaultCollectionData })

    await collectionDb.read()

    if (!collectionDb.data) {
      collectionDb.data = { ...defaultCollectionData }
      await collectionDb.write()
    }

    collectionDbs.set(collectionName, collectionDb)
    return collectionDb
  } catch (error) {
    console.error(`Failed to load collection ${collectionName}:`, error)
    return null
  }
}

// Database operations
export const databaseService = {
  // Get all collections
  getCollections(): string[] {
    return Object.keys(db.data?.collections || {})
  },

  // Check if collection exists
  collectionExists(collectionName: string): boolean {
    return !!db.data?.collections[collectionName]
  },

  // Create new collection
  async createCollection(collectionName: string): Promise<boolean> {
    if (this.collectionExists(collectionName)) {
      return false
    }

    try {
      const collectionPath = getCollectionPath(collectionName)

      // Create collection file dengan data default
      const adapter = new JSONFile<CollectionData>(collectionPath)
      const collectionDb = new LowWithLodash(adapter, { ...defaultCollectionData })
      await collectionDb.write()

      // Update main database
      db.data!.collections[collectionName] = collectionPath
      db.data!._meta!.lastModified = new Date().toISOString()
      await db.write()

      collectionDbs.set(collectionName, collectionDb)
      return true
    } catch (error) {
      console.error(`Failed to create collection ${collectionName}:`, error)
      return false
    }
  },

  // Delete collection
  async deleteCollection(collectionName: string): Promise<boolean> {
    if (!this.collectionExists(collectionName)) {
      return false
    }

    try {
      // Delete collection file
      const collectionPath = db.data!.collections[collectionName]
      if (fs.existsSync(collectionPath)) {
        fs.unlinkSync(collectionPath)
      }

      // Update main database
      delete db.data!.collections[collectionName]
      db.data!._meta!.lastModified = new Date().toISOString()
      await db.write()

      // Remove from cache
      collectionDbs.delete(collectionName)
      return true
    } catch (error) {
      console.error(`Failed to delete collection ${collectionName}:`, error)
      return false
    }
  },

  // Get all documents from collection
  async getAll<T = any>(collectionName: string): Promise<T[]> {
    const collectionDb = await getCollectionDb(collectionName)
    if (!collectionDb) {
      return []
    }

    return collectionDb.data?.documents || []
  },

  // Get document by ID
  async getById<T = any>(collectionName: string, id: string): Promise<T | null> {
    const collectionDb = await getCollectionDb(collectionName)
    if (!collectionDb) {
      return null
    }

    return lodash.chain(collectionDb.data?.documents).find({ id }).value() || null
  },

  // Find documents by query
  async find<T = any>(collectionName: string, query: object): Promise<T[]> {
    const collectionDb = await getCollectionDb(collectionName)
    if (!collectionDb) {
      return []
    }

    return lodash.chain(collectionDb.data?.documents).filter(query).value() || []
  },

  // Find one document by query
  async findOne<T = any>(collectionName: string, query: object): Promise<T | null> {
    const collectionDb = await getCollectionDb(collectionName)
    if (!collectionDb) {
      return null
    }

    return lodash.chain(collectionDb.data?.documents).find(query).value() || null
  },

  // Create new document
  async create<T = any>(collectionName: string, data: Omit<T, 'id'>): Promise<T | null> {
    let collectionDb = await getCollectionDb(collectionName)

    // Jika collection tidak ada, buat baru
    if (!collectionDb) {
      const created = await this.createCollection(collectionName)
      if (!created) return null
      collectionDb = await getCollectionDb(collectionName)
      if (!collectionDb) return null
    }

    const document = {
      ...data,
      id: this.generateId()
    }

    collectionDb.data!.documents.push(document)
    collectionDb.data!._meta!.lastModified = new Date().toISOString()
    await collectionDb.write()

    return document as T
  },

  // Update document
  async update<T = any>(collectionName: string, id: string, data: Partial<T>): Promise<T | null> {
    const collectionDb = await getCollectionDb(collectionName)
    if (!collectionDb) {
      return null
    }

    const documentIndex = collectionDb.data!.documents.findIndex((doc: any) => doc.id === id)
    if (documentIndex === -1) {
      return null
    }

    collectionDb.data!.documents[documentIndex] = {
      ...collectionDb.data!.documents[documentIndex],
      ...data
    }

    collectionDb.data!._meta!.lastModified = new Date().toISOString()
    await collectionDb.write()

    return collectionDb.data!.documents[documentIndex]
  },

  // Delete document
  async delete(collectionName: string, id: string): Promise<boolean> {
    const collectionDb = await getCollectionDb(collectionName)
    if (!collectionDb) {
      return false
    }

    const initialLength = collectionDb.data!.documents.length
    collectionDb.data!.documents = collectionDb.data!.documents.filter((doc: any) => doc.id !== id)

    if (collectionDb.data!.documents.length === initialLength) {
      return false
    }

    collectionDb.data!._meta!.lastModified = new Date().toISOString()
    await collectionDb.write()

    return true
  },

  // Count documents in collection
  async count(collectionName: string, query?: object): Promise<number> {
    const collectionDb = await getCollectionDb(collectionName)
    if (!collectionDb) {
      return 0
    }

    if (query) {
      return lodash.chain(collectionDb.data?.documents).filter(query).size().value()
    }

    return collectionDb.data?.documents.length || 0
  },

  // Paginate documents
  async paginate<T = any>(
    collectionName: string,
    page: number = 1,
    limit: number = 10,
    query?: object
  ): Promise<{ data: T[]; total: number; page: number; totalPages: number }> {
    const collectionDb = await getCollectionDb(collectionName)
    if (!collectionDb) {
      return { data: [], total: 0, page, totalPages: 0 }
    }

    let documents = collectionDb.data?.documents || []

    if (query) {
      documents = lodash.chain(documents).filter(query).value()
    }

    const total = documents.length
    const totalPages = Math.ceil(total / limit)
    const skip = (page - 1) * limit

    const data = lodash.chain(documents).drop(skip).take(limit).value() as T[]

    return {
      data,
      total,
      page,
      totalPages
    }
  },

  // Generate unique ID
  generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  },

  // Backup database
  async backup(): Promise<string> {
    const backupDir = path.join(path.dirname(getDatabasePath()), 'backups')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    const backupPath = path.join(backupDir, `backup-${Date.now()}.json`)

    // Backup file database utama
    const backupAdapter = new JSONFile<DatabaseSchema>(backupPath)
    const backupDb = new LowWithLodash(backupAdapter, { ...db.data! })
    await backupDb.write()

    return backupPath
  },

  // Restore database from backup
  async restore(backupPath: string): Promise<boolean> {
    try {
      const backupAdapter = new JSONFile<DatabaseSchema>(backupPath)
      const backupDb = new LowWithLodash(backupAdapter, { ...defaultData })

      await backupDb.read()

      if (backupDb.data) {
        db.data = backupDb.data
        await db.write()

        // Clear cache dan reload semua collections
        collectionDbs.clear()
        return true
      }

      return false
    } catch (error) {
      console.error('Restore failed:', error)
      return false
    }
  },

  // Get database statistics
  async getStats(): Promise<{ collections: number; totalDocuments: number; size: number }> {
    const collections = this.getCollections()
    let totalDocuments = 0
    let totalSize = 0

    for (const collection of collections) {
      const count = await this.count(collection)
      totalDocuments += count

      // Hitung size file collection
      if (db.data?.collections[collection]) {
        try {
          const stats = fs.statSync(db.data.collections[collection])
          totalSize += stats.size
        } catch (error) {
          console.error(`Failed to get size for collection ${collection}:`, error)
        }
      }
    }

    // Hitung size file database utama
    try {
      const mainDbStats = fs.statSync(getDatabasePath())
      totalSize += mainDbStats.size
    } catch (error) {
      console.error('Failed to get main database size:', error)
    }

    return {
      collections: collections.length,
      totalDocuments,
      size: totalSize
    }
  },

  // Clear entire database (use with caution!)
  async clear(): Promise<void> {
    const collections = this.getCollections()

    for (const collection of collections) {
      await this.deleteCollection(collection)
    }

    db.data!._meta!.lastModified = new Date().toISOString()
    await db.write()
  }
}

// Export db instance for direct access if needed
export { db }

// Default export
export default databaseService
