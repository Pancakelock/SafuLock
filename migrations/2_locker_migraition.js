const PancakelockLocker = artifacts.require("PancakelockLocker");

module.exports = function (deployer) {
  deployer.deploy(PancakelockLocker);
};
