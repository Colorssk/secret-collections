import { useState, useCallback } from "react";
import { useAccount  } from 'wagmi'
import { useRouter } from 'next/router'
import Button from '@mui/material/Button';
import style from '../styles/navbar.module.css'
export default function Navbar({ children }) {
    const router = useRouter()
    const { isConnected } = useAccount()
    const tabs = [
        {
            title: 'HOME',
            link: '/'
        },
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
        isConnected && router.push(link);
    }
    return (
      <div className={style.navContainer}>
        {
            tabs.map(item=>{
                return <div key={item.title} className={style.navItem} onClick={()=>{next(item?.link)}}>{item.title}</div>
            })
        }
      </div>
    )
  }