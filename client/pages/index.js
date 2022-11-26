import Head from 'next/head'
import Image from 'next/image'
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import { useAccount, Web3Button, useNetwork , useContract, useSigner, Web3Modal  } from '@web3modal/react'
import { utils } from 'ethers';
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from 'next/router'
import { accountAbi, ACCOUNT_CONTRACT_ADDRESS } from '../config/contract'
import styles from '../styles/home.module.css'
export default function Login() {
  const [ hasJoined, setHasJoined] = useState(false);
  const [ warningInfo, setWarningInfo ] = useState('');
  const [ messageOpen, setMessageOpen ] = useState(false);
  const [ limit, setLimit ] = useState(0);
  const [ count, setCount ] = useState(0);
  const [ contractInstance, setContractInstance] = useState(null);
  const [ hasAppiedFor,setHasAppiedFor ] = useState(false);
  const [ shakeFlag, setShakeFlag ] = useState(false);
  const loadOnce = useRef(false);
  const { account } = useAccount()
  const { network } = useNetwork()
  const router = useRouter()
  const config = {
    projectId: '8b89cf546397ae06ea1dfc52910639fc',
    theme: 'dark',
    accentColor: 'default',
    ethereum: {
      appName: 'dapp'
    }
  }
  // get contract
  const { contract } = useContract({
    address: ACCOUNT_CONTRACT_ADDRESS,
    abi: accountAbi,
  })

  const { data:  signer } = useSigner()
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
        setWarningInfo('Please change the network to Goerli');
      } else {
        setWarningInfo('');
      }
      
    }
  }, [network])
  useEffect(()=>{
    const handleEvent = (member, message) => {
      setTimeout(()=>{
        location.reload()
      }, 2000)
    }
    const cancelHandleEvent = (member, message) => {
      console.log('取消执行')
    }
    if(contractInstance){
      initData(); 
      contractInstance.off('IncreaseMember', cancelHandleEvent)
      contractInstance.off('DecreaseMember', cancelHandleEvent)
      contractInstance.once('IncreaseMember', handleEvent)
      contractInstance.once('DecreaseMember', handleEvent)
      console.log('合约执行初始化')
    }
    return ()=>{
      if(contractInstance){
        contractInstance.removeAllListeners();
      }
    }
  }, [contractInstance])


  const initData = async () => {
    try{
      setLimit(Number(await contractInstance.registerLimit()))
      setCount(Number(await contractInstance.listCount()))
      setHasAppiedFor(Boolean(await contractInstance.accounts(account?.address) ))
    }catch(err){
      console.log(err)
      // 需要重新加载页面
      location.reload();
    }
    
  }
  // 账户切换
  useEffect(()=>{
    if(account?.address){
      if(loadOnce.current){
        console.log(account?.address, '账户切换')
        location.reload();
      } else {
        loadOnce.current = true
      }
     
    } 
  }, [account?.address])
  const getContract =  async () => {
    try {
      console.log('获取合约')
      setContractInstance(await contract.connect(signer))
    } catch (error) {
      console.log(error)
      // 需要重新加载页面
      location.reload();
    }
   
  }
  const accountApply = async () => {
    try {
      await contractInstance?.addMember();
    }catch(error){
      const errMessage = new utils.Logger(error)?.version?.reason.split(':')[1]
      if(errMessage){
        alert(errMessage)
      }
    }
  }
  const onDel = async () => {
    try {
      await contractInstance?.delMember();
    }catch(error){
      const errMessage = new utils.Logger(error)?.version?.reason.split(':')[1]
      if(errMessage){
        alert(errMessage)
      }
    }
    return false;
  }
  useEffect(()=>{
    if(shakeFlag){
      setTimeout(()=>{
        setShakeFlag(false);
      }, 1000)
    }
  }, [shakeFlag])
  const loginCard =  () => {
    return (
      <Card variant="outlined" className={`${styles.loginInfoCardContainer} ${shakeFlag ? styles.shaking : ''}`}>
        <div className={styles.loginInfo}>{account.isConnected ? account?.address : `Please use wallet(metaMask) to log in`}</div>
        <div className={styles.buttonContainer} >
          {
            !account.isConnected &&  <Web3Button/>
          }
          {
            contractInstance && account.isConnected && !hasJoined  && <Button disabled={network?.chain?.id !==5 || !limit || hasAppiedFor} style={{color: `${(network?.chain?.id !==5 || !limit || hasAppiedFor) ? 'grey' : 'white'}`}} variant="outlined" onClick={accountApply}>apply for joining(申请入驻)</Button>
          }
          {/* 测试时候用 */}
          {
            contractInstance && <Button variant="outlined" onClick={onDel}>del</Button>
          }
        </div>
      </Card>
    )
  }
  const handleClose = () => {
    setWarningInfo('')
  }
  return (
    <div className={styles.container}>
      <Head>
        <title>Dapp</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Web3Modal config={config} />
      <div className={styles.warningInfo}>{warningInfo}</div>
      <div className={styles.hasjoinedInfo}>当前已入驻名额{limit ?? '**'}/{count}</div>
      <main className={styles.main}>
      {
        loginCard()
      }
      </main>
    </div>
  )
}
