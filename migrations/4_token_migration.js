const Token = artifacts.require("PancakelockToken");

module.exports = function (deployer) {
  deployer.deploy(Token);
};
