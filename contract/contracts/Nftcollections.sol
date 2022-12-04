// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./AccountsList.sol";


interface IAccountsList{
    function accounts(address) external view returns (bool);
}


contract Nftcollections is ERC721URIStorage, ERC721Enumerable, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter _tokenId;
    // _paused is used to pause the contract in case of an emergency
    bool public _paused;
    IAccountsList  accountsList;
    uint256 public _cost_price = 0.01 ether;// mint price
    uint256 public _trans_price = 0.01 ether;// transaction price
    mapping(address => uint256[]) public collectionsIn;// somwone own by purchase
    mapping(uint256 => string) public tokenIdToUrlBrief;
    mapping(string => uint256) public urlBriefToTokenId;
    event Purchase(address indexed payer, uint256 tokenId);
    mapping(uint256 => mapping(address => bool)) public payerLists;// tokenId: {payer: true}
    uint256 mintBenefit;
    event  Withdrawal(address indexed owner, uint value);
    event MintNFT(uint indexed newId);

    constructor(address _IAccountsList) ERC721("GLENNFT", "GLEN") {
        accountsList = IAccountsList(_IAccountsList);
    }

    modifier onlyWhenNotPaused {
        require(!_paused, "Contract currently paused");
        _;
    }
    // record the transaction
    function purchase(string memory _pay_tokenUrl) public payable onlyWhenNotPaused nonReentrant{
        uint256 _pay_tokenId =  urlBriefToTokenId[_pay_tokenUrl];
        require(msg.value >= _trans_price, "warning: payment is not enough!");
        require(_exists(_pay_tokenId) && bytes(_pay_tokenUrl).length != 0, "tokenId is not exist");
        // record
        mapping(address => bool) storage payerList = payerLists[_pay_tokenId];
        // msg.sender never pay the tokenId
        if(!payerList[msg.sender]){
            if (msg.value > _trans_price) {
                payable(msg.sender).transfer(msg.value - _trans_price);
            }
            collectionsIn[msg.sender].push(_pay_tokenId);
            payerList[msg.sender] = true;
            payable(address(ownerOf(_pay_tokenId))).transfer(_trans_price);
            emit Purchase(msg.sender, _pay_tokenId);
        } else {
            revert("you have already paid the NFT");
        }
    }

    // show all nfts, exclude owner, for sell in the market
    function showAllBriefNFTExcludeOwner() public view  returns(string[] memory) {
        uint256 totalIndexs = totalSupply();
        string[] memory _briefTokenUrls = new string[](totalIndexs);
        uint256 delIndex;
        bool matchFlag;
        for(uint index; index < totalIndexs; index++){
            uint256 tokenId = tokenByIndex(index);
            
            if(address(ownerOf(tokenId)) != address(msg.sender)){
                if(matchFlag && delIndex <= index){
                    _briefTokenUrls[index - 1] =  tokenIdToUrlBrief[tokenId];
                } else {
                    _briefTokenUrls[index] =  tokenIdToUrlBrief[tokenId];
                }
            } else {
                delIndex = index;
                matchFlag = true;
            }
        }
        return _briefTokenUrls;
    }

    // get collections
    function getCollections()public view returns(string[] memory){
        require(address(msg.sender) != address(0), "msg.sender is invalid");
        uint256[] memory tokenIdCollections = collectionsIn[msg.sender];
        string[] memory tokenUrlDetailCollections = new string[](tokenIdCollections.length);
        if(tokenIdCollections.length > 0){
            for(uint i = 0; i < tokenIdCollections.length; i++){
                tokenUrlDetailCollections[i] = tokenURI(tokenIdCollections[i]);
            }
        }
        return tokenUrlDetailCollections;  
    }

    function _beforeTokenTransfer(address from, address to, uint256 firstTokenId, uint256 batchSize) internal override(ERC721, ERC721Enumerable){
      super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function setPaused(bool val) public onlyOwner {
        _paused = val;
    }

    function setTransFee(uint256 __trans_price) public onlyOwner onlyWhenNotPaused {
        _trans_price  = __trans_price;
    }

    

    // generate nft
    function mintNFT(address recipents, string memory _tokenURI, string memory _briefTokenURI) public payable onlyWhenNotPaused{
        require(msg.value >= _cost_price, "Ether sent is not correct");
        require(accountsList.accounts(msg.sender), "You have not registered");
        uint newId = _tokenId.current();
        _mint(recipents, newId);
        _setTokenURI(newId, _tokenURI);
        tokenIdToUrlBrief[newId] = _briefTokenURI;
        urlBriefToTokenId[_briefTokenURI] = newId;
        _tokenId.increment();
        mintBenefit += _cost_price;
        emit MintNFT(newId);
    }

    // search all nft by address
    function getAllNftByAddress(address _address) public view returns(string[] memory){
        uint nu = balanceOf(_address); 
        string[] memory tokenURIs = new string[](nu);
       
        for(uint i = 0; i < nu ; i++){
          uint tokenId = tokenOfOwnerByIndex(_address, i);
          tokenURIs[i] = tokenURI(tokenId);
        }
        return tokenURIs;
    }

    // withdraw money
    function withdraw() public onlyOwner{
        payable(address(msg.sender)).transfer(mintBenefit);
        mintBenefit = 0;
        emit Withdrawal(msg.sender, mintBenefit);
    }

    receive() external payable{}
    fallback() external {}
}