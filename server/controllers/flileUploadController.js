const { Readable } = require('stream');
const pinataSDK = require('@pinata/sdk');
const uploadFiles = async (req, res) => {
    try {
        // console.log(req.body);
        // console.log(req.files)
        const baseUrl = 'https://ipfs.io/ipfs/';
        const pinata = new pinataSDK('f0f777c0b6b272cdcbf2', '04b847178d5083de356cacc70405e281e49ff527a5783fdbbbee60c5727025ba')
        const files = req.files;
        const avatarIndex = files.findIndex(file=> file.fieldname === 'avatar')
        const resourceIndex = files.findIndex(file=> file.fieldname === 'resource')
        if(avatarIndex !== -1 && resourceIndex !== -1){
            let streams = [];
            files.forEach(file => {
                streams.push(Readable.from(file.buffer));
            });
           
            const uploadToPinata = (stream, index) => {
                const options = {
                    pinataMetadata: {
                        name: files[index].originalname + String(new Date().getTime()),
                    },
                    pinataOptions: {
                        cidVersion: 0
                    }
                };
                return pinata.pinFileToIPFS(stream, options)
            }
            Promise.all([uploadToPinata(streams[0], avatarIndex), uploadToPinata(streams[1], resourceIndex)]).then(result=>{
                console.log(result);
                // {
                //     IpfsHash: 'QmeQtTH9CGCdezxGBbtcFQaMkrva7JDRLdC83Cgfm8R517',
                //     PinSize: 150981,
                //     Timestamp: '2022-11-21T12:16:20.765Z'
                // }
                if(result && result.length === 2){
                    const ipfsBody = {};
                    ipfsBody.image = baseUrl + result[0]?.IpfsHash;
                    ipfsBody.name = req.body?.name;
                    ipfsBody.description = req.body?.descriptions;
                    const options = {
                        pinataMetadata: {
                            name: req.body?.name + String(new Date().getTime()) + '-brief',
                        }
                    };
                    pinata.pinJSONToIPFS(ipfsBody, options).then((resultBrief) => {
                        ipfsBody.resourceVideo = baseUrl + result[1]?.IpfsHash;
                        const options = {
                            pinataMetadata: {
                                name: req.body?.name + String(new Date().getTime()) + '-detail',
                            }
                        };
                        pinata.pinJSONToIPFS(ipfsBody, options).then((resultDetail) => {
                            console.log(resultDetail);
                            return res.status(200).json({ message: '??????????????????', data: resultDetail, briefData: resultBrief})
                        }).catch((err) => {
                            return res.status(500).send({
                                message: `??????????????????????????????: ${err}`
                            });
                        });
                    }).catch((err) => {
                        return res.status(500).send({
                            message: `??????????????????????????????: ${err}`
                        });
                    });
                   
                }
            }).catch((err) => {
                return res.status(500).send({
                    message: `?????????????????????pinata: ${err}`
                });
            });
        } else {
            return res.status(200).json({ message: '????????????'})
        }
        
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        message: `??????????????????:, ${error}`
      });
    }
};

module.exports = {
    uploadFiles
};