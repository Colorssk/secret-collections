import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount, useContractWrite, usePrepareContractWrite, useContractEvent  } from 'wagmi'
import Button from '@mui/material/Button';
import { NFT_COLLECTIONS_ADDRESS, collectionsAbi } from '../config/contract'
import CircularProgress from '@mui/material/CircularProgress';
import { ethers } from "ethers";
import { useRouter } from 'next/router'
import style from '../styles/upload.module.css';
const upload = () => {
    const [ imgSrc, setimgSrc ] = useState(null);
    const [ avatar, setAvatar ] = useState(null);
    const [ avatarFile, setAvatarFile ] = useState(null);
    const [ name, setName ] = useState('');
    const [ descriptions, setDescriptions ] = useState('');
    const [ videoSrc, setVideoSrc ] = useState(null)
    const [ videoFile, setVideoFile ] = useState(null)
    const [ loading, setLoading ] = useState(false);
    const router = useRouter()
    const { address, isConnected } = useAccount()
    // contract write
    const { config: configMint } = usePrepareContractWrite({
        address: NFT_COLLECTIONS_ADDRESS,
        abi: collectionsAbi,
        functionName: 'mintNFT',
        overrides: { from: address, value: ethers.utils.parseUnits('10000000', 'gwei') },
        args: [address, ''],
    })
    const { write: writeMint } = useContractWrite(configMint)
    // event listerner
    useContractEvent({
        address: NFT_COLLECTIONS_ADDRESS,
        abi: collectionsAbi,
        eventName: 'MintNFT',
        listener(newId, blockInfo) {
          alert(`${address}:mint successfully,newId:${newId}`);
          router.push('/nftPage');
        }
    })

    useEffect(()=>{
        if(!isConnected){
            router.push('/');
        }
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

    const onHandleSubmit = async (e) => {
        e.preventDefault();
        console.log(e.target)
        const form = new FormData();
        form.append('avatar', avatarFile);
        form.append('resource', videoFile);
        form.append('name', name);
        form.append('descriptions', descriptions);
        setLoading(true);
        const res = await fetch('https://server-ashen-seven.vercel.app/upload', {
            method: "POST",
            body: form
        });
        const data = await res.json()
        if(!data || !data?.data || !data?.data?.IpfsHash){
           alert('上传失败!')
        } else {
            try {
                await writeMint?.({recklesslySetUnpreparedArgs: [address, data?.data?.IpfsHash]});
            } catch (error) {
                console.log('execute failed');
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