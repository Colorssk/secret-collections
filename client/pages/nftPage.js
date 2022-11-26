import { useCallback, useEffect, useRef, useState } from "react";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';
// import { useRouter } from 'next/router'
import Router from "next/router"
import { useAccount, useNetwork , useContract, useSigner  } from '@web3modal/react'
import { NFT_COLLECTIONS_ADDRESS, collectionsAbi } from '../config/contract'
import style from "../styles/nftPage.module.css"
import pg1 from "./imgs/pg1.png"

const nftPage = () => {
    const [ contractInstance, setContractInstance] = useState(null);
    const [ nfts, setNfts ] = useState([]);
    const [ nftInfos, setNftInfos ] = useState([])
    const loadOnce = useRef(false);
    console.log(JSON.stringify(pg1))
    const { account } = useAccount()
    const { network } = useNetwork()
    // const router = useRouter()
    const { data:  signer } = useSigner({ chainId: network?.chain?.id })
    // get contract
    const { contract } = useContract({
        address: NFT_COLLECTIONS_ADDRESS,
        abi: collectionsAbi,
    })
    // 账户切换
    useEffect(()=>{
        if(account?.address){
            if(loadOnce.current){
                Router.push('/');
            } else {
                loadOnce.current = true
            }
        } 
    }, [account?.address])
    useEffect(()=>{
        if(account.isConnected && signer && account.isConnected && network?.chain?.id ===5 && !contractInstance){
          console.log('signer changed')
          getContract()
         
        }
      }, [signer])
    // 网络切换
    useEffect(()=>{
    if(account.isConnected && network?.chain?.id && account?.address){
        console.log('网络切换', network)
        if(Number(network?.chain?.id) !== 5){
            Router.push('/');
        }
    }
    }, [network])
    const getContract =  async () => {
        try {
          console.log('获取合约')
          setContractInstance(await contract.connect(signer))
        } catch (error) {
          console.log('获取合约失败', error)
          // 需要重新加载页面
          location.reload();
        }
       
    }
    useEffect(()=>{
        if(contractInstance){
        initData();
        }
    }, [contractInstance])
    const initData = async () => {
        try{
            const res = await contractInstance.getAllNftByAddress(account?.address);
            console.log('res----',account?.address,  res)
            setNfts(res);
        }catch(err){
          console.log(err)
           // 需要重新加载页面
           location.reload();
        }
        
    }
    useEffect(()=>{
        if(nfts && nfts.length){
            nftCollections();
        }
    }, [nfts])
    
    const nftCollections = () => {
        const defaultUrl = 'https://ipfs.io/ipfs/';
        const promiseList = []
        nfts.forEach(async (hash)=>{
            promiseList.push(new Promise(async (resolve)=>{
                const res = await fetch(`${defaultUrl}${hash}`)
                resolve(res.json())
            }))
        })
        Promise.all(promiseList).then((res)=>{
            const defaultCardInfo = {
                pngSrc:  pg1.src,
                nftName: 'NFT1',
                nftInfo: `Lizards are a widespread group of squamate reptiles, with over 6,000
                species   species   species   species   species   species   species`
            }
            console.log('res', res)
            const tempNftInfos = res.map(el=>{
                defaultCardInfo.pngSrc = el.image;
                defaultCardInfo.nftName = el.name;
                defaultCardInfo.nftInfo = el.description;
                defaultCardInfo.resourceVideo = el.resourceVideo
                el = defaultCardInfo;
                return el
            })
            console.log('tempNftInfos', tempNftInfos)
            setNftInfos(tempNftInfos)
        })
    }
    const cardContent = (item, index) => {
        return (
            <Card sx={{ maxWidth: 245 }} key={index} className={style.cardContainer}>
                <CardActionArea>
                    <div className={style.pngContainer}>
                        <img className={style.nftPg} src={item?.pngSrc} alt="png"/>
                    </div>
                    <CardContent>
                        {/* <Typography gutterBottom variant="h5" component="div">
                            {item?.nftName}
                            <div className={style.buyInfo}><div className={style.buyInfoBlock}>buy</div></div>
                            <div className={style.sellInfo}><div className={style.sellInfoBlock}>sell</div></div>
                            <div className={style.statusInfo}>selling</div>
                        </Typography> */}
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
                <div>当前账户: OX.................</div>
                <div>当前拥有个数： xx个; &nbsp;&nbsp;&nbsp; 当前已售出个数: yy个</div>
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
export default nftPage