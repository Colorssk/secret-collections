import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount, useContractRead, useBalance, useContractWrite, usePrepareContractWrite, useContractEvent  } from 'wagmi'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';
import { useRouter } from 'next/router'
import { ethers } from "ethers";
import pg1 from "./imgs/pg1.png"
import { NFT_COLLECTIONS_ADDRESS, collectionsAbi } from '../config/contract'
import style from "../styles/nftPage.module.css"

const NftPage = () => {
    const [ nftInfos, setNftInfos ] = useState([])
    const router = useRouter()
    const { address, isConnected } = useAccount()
    useEffect(()=>{
        if(!isConnected){
            router.push('/');
        }
    }, [])

    // contract read

    const balance = useBalance({
        address,
        watch: true,
    })
    // contract write
    const { config: configPurchase } = usePrepareContractWrite({
        address: NFT_COLLECTIONS_ADDRESS,
        abi: collectionsAbi,
        functionName: 'purchase',
        overrides: { from: address, value: ethers.utils.parseUnits('10000000', 'gwei'), gasLimit: 1000000 },
        args: [''],
        onSettled(data, error) {
            console.log('Settled', { data, error });
        },
    })
    const { data, isLoading, isSuccess, write: writePurchase } = useContractWrite(configPurchase);

    const { data: nfts } = useContractRead({
        address: NFT_COLLECTIONS_ADDRESS,
        abi: collectionsAbi,
        functionName: 'showAllBriefNFTExcludeOwner',
        watch: true,
        overrides: { from: address },
        onSuccess: (nfts) => {
            const defaultUrl = 'https://ipfs.io/ipfs/';
            const promiseList = []
            nfts.forEach(async (hash)=>{
                promiseList.push(new Promise(async (resolve)=>{
                    const res = await fetch(`${defaultUrl}${hash}`)
                    const data = await res.json();
                    resolve({...data, hash})
                }))
            })
            Promise.all(promiseList).then((res)=>{
                const tempNftInfos = res.map(el=>{
                    let defaultCardInfo = {
                        pngSrc:  pg1.src,
                        nftName: 'NFT1',
                        nftInfo: `Lizards are a widespread group of squamate reptiles, with over 6,000
                        species   species   species   species   species   species   species`
                    }
                    defaultCardInfo.pngSrc = el.image;
                    defaultCardInfo.nftName = el.name;
                    defaultCardInfo.nftInfo = el.description;
                    defaultCardInfo.hash = el.hash;
                    el = defaultCardInfo;
                    return el;
                })
                console.log('tempBriefNftInfos', tempNftInfos)
                setNftInfos(tempNftInfos)
            })   
        },
    })
    
    

    // event listerner
    useContractEvent({
        address: NFT_COLLECTIONS_ADDRESS,
        abi: collectionsAbi,
        eventName: 'Purchase',
        listener(payer, tokenId) {
          alert(`${payer}: you buy(tokenId: ${tokenId}) successfully`);
        }
    })
    const onPurchase = async (item) => {
        try {
            await writePurchase?.({
                recklesslySetUnpreparedArgs: [item?.hash], 
            });
        } catch (error) {
            console.log('execute failed', error); 
        } 
    }
    const cardContent = (item, index) => {
        return (
            <Card sx={{ maxWidth: 245 }} key={index} className={style.cardContainer}>
                <CardActionArea>
                    <div className={style.pngContainer}>
                        <img className={style.nftPg} src={item?.pngSrc} alt="png"/>
                    </div>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            {item?.nftName}
                            <div className={style.buyInfo} onClick={() => {onPurchase(item)}}><div className={style.buyInfoBlock}>buy</div></div>
                        </Typography>
                        <Typography variant="body2" color="text.secondary" className={style.infoContent} title={item?.nftInfo}>
                            {item?.nftInfo}
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
        )
    }
    return (
        <div className={style.nftPageContainer}>
            <div className={style.header}>
                <div>当前账户: {address}; 账户余额:{Number(ethers.utils.formatEther(balance?.data?.value ?? 0) ?? 0)}(ETH)</div> 
            </div>
            <div className={style.listContainer}>
                {
                    nftInfos.map((item, index) => {
                        return cardContent(item, index)
                    })
                }
            </div>
        </div>
    )
}
export default NftPage