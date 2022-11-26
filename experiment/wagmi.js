import { configureChains, createClient, defaultChains } from 'wagmi'

import { MetaMaskConnector } from 'wagmi/connectors/metaMask'

import { publicProvider } from 'wagmi/providers/public'

const { chains, provider, webSocketProvider } = configureChains(defaultChains, [
  publicProvider(),
])

export const client = createClient({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains })
  ],
  provider,
  webSocketProvider,
})
