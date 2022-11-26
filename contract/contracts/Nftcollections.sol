// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "./AccountsList.sol";


interface IAccountsList{
    function accounts(address) external view returns (bool);
}


contract Nftcollections is ERC721URIStorage, ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter _tokenId;
    // _paused is used to pause the contract in case of an emergency
    bool public _paused;
    IAccountsList  accountsList;
    uint256 public _cost_price = 0.01 ether;
    mapping(address => uint[]) public tokenIds;
    event  Withdrawal(address indexed owner, uint value);
    event MintNFT(uint indexed newId);
    constructor(address _IAccountsList) ERC721("GLENNFT", "GLEN") {
        accountsList = IAccountsList(_IAccountsList);
    }

    modifier onlyWhenNotPaused {
        require(!_paused, "Contract currently paused");
        _;
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
    // generate nft
    function mintNFT(address recipents, string memory _tokenURI) public payable{
        require(msg.value >= _cost_price, "Ether sent is not correct");
        require(accountsList.accounts(msg.sender), "You have not registered");
        uint newId = _tokenId.current();
        _mint(recipents, newId);
        _setTokenURI(newId, _tokenURI);
        _tokenId.increment();
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
        payable(address(msg.sender)).transfer(address(this).balance);
        emit Withdrawal(msg.sender, address(this).balance);
    }

    receive() external payable{}
    fallback() external {}
}