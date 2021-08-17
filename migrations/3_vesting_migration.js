const Vesting = artifacts.require("PancakelockTokenVesting");
const Master = artifacts.require("PancakelockTokenVault");

module.exports = async (deployer) => {
  await deployer.deploy(Master);
  const masterInstance = await Master.deployed();
  const masterAddress = await masterInstance.address;
  await deployer.deploy(Vesting,  masterAddress, "0x3021F88ed12051f74798D0a115Ff2b9BECd1a687");
  
};
