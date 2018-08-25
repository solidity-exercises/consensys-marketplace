const StoreManager = artifacts.require('./StoreManager.sol');
const StoreFactory = artifacts.require('./StoreFactory.sol');

module.exports = function (deployer, ...args) {
	deployer.deploy(StoreFactory);
	deployer.link(StoreFactory, StoreManager);
	deployer.deploy(StoreManager);
};
