const { ethers } = require("hardhat");

async function main() {
  const AccountsListContract = await ethers.getContractFactory("AccountsList");
  const deployedAccountsList = await AccountsListContract.deploy(10000);
  await deployedAccountsList.deployed();
  // 0x8878b3b716CdAa6e97f1B159B068b8Dfbb3f1D5b
  console.log("AccountsList Contract Address:", deployedAccountsList.address);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });