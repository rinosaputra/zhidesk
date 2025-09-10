// File: src/renderer/src/lib/orpc-client.ts
import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/message-port'
import { RouterClient } from '@orpc/server'
import type { Router } from '@service/orpc/router'

let orpcClient: RouterClient<Router>

export const getORPCClient = (): typeof orpcClient => {
  if (!orpcClient) {
    // Create MessageChannel untuk communication
    const { port1: clientPort, port2: serverPort } = new MessageChannel()

    // Send server port ke preload script
    window.postMessage('start-orpc-client', '*', [serverPort])

    // Create RPC link
    const link = new RPCLink({
      port: clientPort
    })

    // Create client
    orpcClient = createORPCClient(link)

    clientPort.start()
  }

  return orpcClient
}
