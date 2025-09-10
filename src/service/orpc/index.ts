// File: src/service/orpc/index.ts
import { RPCHandler } from '@orpc/server/message-port'
import { ipcMain } from 'electron'
import { router } from './router'
import { experimental_SmartCoercionPlugin as SmartCoercionPlugin } from '@orpc/json-schema'

// Create handler dengan router procedures
const handler = new RPCHandler(router, {
  plugins: [new SmartCoercionPlugin()]
})

export const initializeRPC = (): void => {
  // Listen untuk port dari renderer
  console.log('start-orpc-server starting....')
  ipcMain.on('start-orpc-server', async (event) => {
    const [serverPort] = event.ports
    handler.upgrade(serverPort)
    serverPort.start()
    console.log('start-orpc-server start on port: ', serverPort)
  })
}
