const { ethers } = require("hardhat");

async function main() {

  const NfTCollectionsContact = await ethers.getContractFactory("Nftcollections");
  const accountContractAddress = '0x8878b3b716CdAa6e97f1B159B068b8Dfbb3f1D5b'
  const nftContract = await NfTCollectionsContact.deploy(accountContractAddress);
  await nftContract.deployed();
  // 0x7420Ba2e9E1db1a68371Cc00D7f87b9B6957F215  / 0xEFaBC291A4A3Dc1466Ee73A5CE39096948b66f06
  console.log("Nftcollections Contract Address:", nftContract.address);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });