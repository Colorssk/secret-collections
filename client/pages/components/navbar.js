import { useState } from "react";
import { useRouter } from 'next/router'
import { Web3Modal } from '@web3modal/react'
import style from '../../styles/navbar.module.css'
const config = {
    projectId: '8b89cf546397ae06ea1dfc52910639fc',
    theme: 'dark',
    accentColor: 'default',
    ethereum: {
      appName: 'dapp'
    }
}
export default function Navbar({ children }) {
    const router = useRouter()
    const tabs = [
        {
            title: 'NFT CREATE',
            link: '/upload'
        },
        {
            title: 'NFT MARKETPLACE',
            link: '/nftPage'
        }
    ]
    const next = (link) => {
        router.push(link);
    }
    return (
      <div className={style.navContainer}>
        <Web3Modal config={config}></Web3Modal>
        {
            tabs.map(item=>{
                return <div key={item.title} className={style.navItem} onClick={()=>{next(item?.link)}}>{item.title}</div>
            })
        }
      </div>
    )
  }