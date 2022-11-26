const { ethers } = require("hardhat");

async function main() {

  const NfTCollectionsContact = await ethers.getContractFactory("Nftcollections");
  const accountContractAddress = '0x3E5BEa9E63D6bbd6D4c96769CB15413E14C0Ea14'
  const nftContract = await NfTCollectionsContact.deploy(accountContractAddress);
  await nftContract.deployed();
  // 0x92aAB776Dd67096ade06bcfc11d931A939ec3056
  console.log("Nftcollections Contract Address:", nftContract.address);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });