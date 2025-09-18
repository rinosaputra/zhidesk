import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import lodash from 'lodash'
import { join } from 'path'
import { app } from 'electron'

class LowWithLodash<T> extends Low<T> {
  chain: lodash.ExpChain<this['data']> = lodash.chain(this).get('data')
}

interface CreateLowDBProps<Value> {
  defaultValue: Value
  filename: string
}

export const createLowDB = <Value>({
  defaultValue,
  filename
}: CreateLowDBProps<Value>): LowWithLodash<Value> => {
  const filepath = join(
    typeof app !== 'undefined' ? app.getPath('userData') : process.cwd(),
    'data',
    `${filename}.json`
  )
  const adapter = new JSONFile<Value>(filepath)
  return new LowWithLodash(adapter, defaultValue)
}
