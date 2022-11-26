
import Layout from './components/layout.js'
import '../styles/globals.css'
import NextHead from 'next/head'
import { useState, useEffect } from 'react'
import { WagmiConfig } from 'wagmi'

import { client } from '../wagmi'

function App({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false)
  useEffect(()=>{
    setMounted(true)
  }, [])
  return (
    <WagmiConfig client={client}> 
      <NextHead>
        <title>nft-collections</title>
      </NextHead>
      <Layout>
       {mounted && <Component {...pageProps} />}
      </Layout>
     
    </WagmiConfig>
  )
}

export default App

