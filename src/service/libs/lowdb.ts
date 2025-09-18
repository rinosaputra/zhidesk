import { Low, Memory } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import lodash from 'lodash'
import { join } from 'path'
import { app } from 'electron'

export class LowWithLodash<T> extends Low<T> {
  chain: lodash.ExpChain<this['data']> = lodash.chain(this).get('data')
}

export interface CreateLowDBProps<Value> {
  defaultValue: Value
  filepath: string
  filename: string
  onMemory?: boolean
}

export const createLowDB = <Value>({
  defaultValue,
  filepath,
  onMemory
}: CreateLowDBProps<Value>): LowWithLodash<Value> => {
  const adapter = !onMemory
    ? new JSONFile<Value>(join(filepath, [filepath, 'json'].join('.')))
    : new Memory<Value>()
  return new LowWithLodash(adapter, defaultValue)
}

export const pathDefaultLowDB = typeof app !== 'undefined' ? app.getPath('userData') : process.cwd()
