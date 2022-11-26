const { ethers } = require("hardhat");

async function main() {
  const AccountsListContract = await ethers.getContractFactory("AccountsList");
  const deployedAccountsList = await AccountsListContract.deploy(10000);
  await deployedAccountsList.deployed();
  // 0x3E5BEa9E63D6bbd6D4c96769CB15413E14C0Ea14
  console.log("AccountsList Contract Address:", deployedAccountsList.address);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });