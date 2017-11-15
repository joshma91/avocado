var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var Avocado = artifacts.require("./Avocado.sol");

module.exports = function(deployer) {
  deployer.deploy(SimpleStorage);
  deployer.deploy(Avocado);
};
