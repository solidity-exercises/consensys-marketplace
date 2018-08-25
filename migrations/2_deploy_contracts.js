const DestructibleStore = artifacts.require('./DestructibleStore.sol');

module.exports = function (deployer, ...args) {
	const coinbase = args[1][0];
	deployer.deploy(DestructibleStore, coinbase);
};
