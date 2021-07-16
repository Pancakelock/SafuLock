const Vesting = artifacts.require("PancakelockTokenVesting");
const Master = artifacts.require("PancakelockTokenVault");

module.exports = async (deployer) => {
  await deployer.deploy(Master);
  const masterInstance = await Master.deployed();
  const masterAddress = await masterInstance.address;
  await deployer.deploy(Vesting,  masterAddress, "0xDBf1520C34660B65C1352A110DABd5ce02D03f1c");
  
};
