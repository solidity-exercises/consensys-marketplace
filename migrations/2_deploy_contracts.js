const StoreManager = artifacts.require('./StoreManager.sol');
const UpgradeableProxy = artifacts.require('./UpgradeableProxy.sol');
const Aggregated = artifacts.require('./Aggregated.sol');

module.exports = function (deployer, ...args) {
	deployer.then(async () => {
		await deployer.deploy(StoreManager);
		const marketplaceImplementation = await StoreManager.deployed();
		await deployer.deploy(UpgradeableProxy, marketplaceImplementation.address);
		const proxy = await UpgradeableProxy.deployed();
		const upgradeableMarketplace = await Aggregated.at(proxy.address);
		await upgradeableMarketplace.init();
	});
};
