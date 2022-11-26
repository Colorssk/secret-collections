import { useCallback, useEffect, useRef, useState } from "react";
import Button from '@mui/material/Button';
import { useAccount, useNetwork , useContract, useSigner  } from '@web3modal/react'
import { NFT_COLLECTIONS_ADDRESS, collectionsAbi } from '../config/contract'
import { useRouter } from 'next/router'
import CircularProgress from '@mui/material/CircularProgress';
import { ethers } from "ethers";
import style from '../styles/upload.module.css';
const upload = () => {
    const pinata = useRef(null);
    const [ imgSrc, setimgSrc ] = useState(null);
    const [ avatar, setAvatar ] = useState(null);
    const [ avatarFile, setAvatarFile ] = useState(null);
    const [ name, setName ] = useState('');
    const [ descriptions, setDescriptions ] = useState('');
    const [ videoSrc, setVideoSrc ] = useState(null)
    const [ videoFile, setVideoFile ] = useState(null)
    const [ loading, setLoading ] = useState(false); 
    const [ contractInstance, setContractInstance] = useState(null);
    const loadOnce = useRef(false);
    const { account } = useAccount()
    const { network } = useNetwork()
    const { data:  signer } = useSigner()
    const router = useRouter()
    // get contract
    const { contract } = useContract({
        address: NFT_COLLECTIONS_ADDRESS,
        abi: collectionsAbi,
    })
    const baseUrl = 'https://ipfs.io/ipfs/';
    // 账户切换
    useEffect(()=>{
        if(account?.address){
            if(loadOnce.current){
                router.push('/');
            } else {
                loadOnce.current = true
            }
        } 
    }, [account?.address])
    useEffect(()=>{
        if(account.isConnected && signer && account.isConnected && network?.chain?.id ===5 && !contractInstance){
          console.log('signer changed')
          setTimeout(() => {
            getContract()
          }, 1000);
          
        }
      }, [signer])
    // 网络切换
    useEffect(()=>{
    if(account.isConnected && network?.chain?.id && account?.address){
        console.log('网络切换', network)
        if(Number(network?.chain?.id) !== 5){
            router.push('/');
        }
    }
    console.log('network useEffect', account, network)
    }, [network])
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
    useEffect(()=>{
        if(contractInstance){
          initData();
        }
    }, [contractInstance])
    const initData = async () => {
        try{
            const res = await contractInstance.getAllNftByAddress(account?.address);
            console.log('res----',account?.address,  res)
        }catch(err){
          console.log(err)
           // 需要重新加载页面
        //    location.reload();
        }
        
    }
    useEffect(()=>{ 
        var avator = document.getElementById("avator");
        if(avator){
            avator.onchange = function(e){
                var blob2 = URL.createObjectURL(this.files[0]);
                setAvatar(blob2)
                setAvatarFile(this.files[0])
            }
        }
        var resource = document.getElementById("resource");
        if(resource){
            resource.onchange = function(){
                var blob2 = URL.createObjectURL(this.files[0]);
                setVideoSrc(blob2)
                setVideoFile(this.files[0])
            }
        }
    }, [])

    const handleChange = (type, e) => {
        console.log(type, e)
        const value = e.target.value
        switch (type) {
            case 'name':
                setName(value)
                break;
            case 'descriptions':
                setDescriptions(value)
                break;
            default:
                break;
        }
    }
    useEffect(()=>{
        if(contractInstance){
            const handleEvent = (newId, message) => {
                console.log('mint successfully', Number(newId), message)
                setTimeout(() => {
                    location.reload();
                }, 2000);
            }
            const cancelHandleEvent = () => {
                console.log('unsubscribe successfully')
            }
            contractInstance.off('MintNFT', cancelHandleEvent)
            contractInstance.once('MintNFT', handleEvent)
        }
    }, [contractInstance])
    const onHandleSubmit = async (e) => {
        e.preventDefault();
        console.log(e.target)
        const form = new FormData();
        form.append('avatar', avatarFile);
        form.append('resource', videoFile);
        form.append('name', name);
        form.append('descriptions', descriptions);
        setLoading(true);
        const res = await fetch('http://127.0.0.1:8080/upload', {
            method: "POST",
            body: form //自动修改请求头,formdata的默认请求头的格式是 multipart/form-data
        });
        const data = await res.json()
        if(!data || !data?.data || !data?.data?.IpfsHash){
           alert('上传失败!')
        } else {
            if(contractInstance){
                try {
                    await contractInstance.mintNFT(account.address, data?.data?.IpfsHash, { value:  ethers.utils.parseUnits('10000000', 'gwei')});
                } catch (error) {
                    console.log('execute failed', mintNFT);
                }
               
            }
        }
        setLoading(false);
        console.log('res', data);

    }
    return (
        <div className={style.uploadContainer}>
            <div className={style.formContainer}>
                <form onSubmit={onHandleSubmit}>
                    <label className={style.lineBlock}>name:&nbsp;&nbsp;
                        <input className={style.inputStyle} value={name} onChange={(e)=>{handleChange('name', e)}}></input>
                    </label>
                    <label className={style.lineBlock}>icon:&nbsp;&nbsp;
                        <input type="file" name="upResource" id="avator" accept="image/*"/>
                    </label>
                    {avatar && <img src={avatar} className={style.avatarStyle} alt="avatar" />}
                    <label className={style.lineBlock}>resource:&nbsp;&nbsp;
                        <input type="file" name="upResource" id="resource" accept="video/*"/>
                    </label>
                    {
                        videoSrc &&  <video className={style.videoStyle} controls width="200">
                                        <source src={videoSrc}
                                        type="video/mp4"/>
                                    </video>
                                   
                    } 
                    <label className={style.lineBlock}>descriptions:&nbsp;&nbsp;
                        <textarea className={style.inputStyle} value={descriptions} onChange={(e)=>{handleChange('descriptions', e)}}></textarea>
                    </label>
                    {
                        <Button type="submit" variant="contained" className={`${style.lineBlock} ${style.buttonStyle}`}>Click to submit</Button>
                    }   
                </form>
            </div>
            {
                loading && <div className={style.loadingContainer}>
                    <CircularProgress color="secondary" />
                </div>
            }
            
        </div>
    )
}

export default upload