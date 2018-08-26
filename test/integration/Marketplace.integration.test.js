const StoreManager = artifacts.require('./StoreManager.sol');
const UpgradeableProxy = artifacts.require('./UpgradeableProxy.sol');
const Aggregated = artifacts.require('./Aggregated.sol');
const DestructibleStore = artifacts.require('./DestructibleStore.sol');

const assertRevert = require('../utils/test.util').assertRevert;
const inLogs = require('../utils/test.util').inLogs;
const BigNumber = web3.BigNumber;

contract('Marketplace', function ([owner, storeOwner, another]) {
	const ZERO_ADDRESS = '0x' + '0'.repeat(40);

	let sut;

	beforeEach(async () => {
		const marketplaceImplementation = await StoreManager.new();
		const proxy = await UpgradeableProxy.new(marketplaceImplementation.address);
		sut = await Aggregated.at(proxy.address);
		await sut.init({ from: owner });
	});

	describe('MarketplaceManager', () => {
		let store;

		beforeEach(async () => {
			await sut.requestStore(0x1, { from: storeOwner });
			await sut.approveStore(true, 0);
			const storeAddress = await sut.stores.call(storeOwner, 0);
			store = await DestructibleStore.at(storeAddress);
			await store.addProduct.sendTransaction(0x1, 1, 1000000, { from: storeOwner });
			await store.buy.sendTransaction(0, 1, { from: another, value: 1000000 });
			await sut.withdrawFromStore.sendTransaction(store.address, 1, { from: owner });
		});

		it('ownerWithdraw Should revert When called from non-owner', async function () {
			// Arrange
			// Act
			const result = sut.ownerWithdraw(another, 1, { from: another });
			// Assert
			await assertRevert(result);
		});

		it('ownerWithdraw Should revert When passed empty recipient', async function () {
			// Arrange
			// Act
			const result = sut.ownerWithdraw(ZERO_ADDRESS, 1);
			// Assert
			await assertRevert(result);
		});

		it('ownerWithdraw Should revert When passed zero withdraw amount', async function () {
			// Arrange
			// Act
			const result = sut.ownerWithdraw(another, 0);
			// Assert
			await assertRevert(result);
		});

		it('ownerWithdraw Should revert When the balance is insufficient', async function () {
			// Arrange
			// Act
			const result = sut.ownerWithdraw(another, 2);
			// Assert
			await assertRevert(result);
		});

		it('ownerWithdraw Should emit LogOwnerWithdrawal event When passed valid arguments', async function () {
			// Arrange
			// Act
			const { logs } = await sut.ownerWithdraw(another, 1);
			// Assert
			await inLogs(logs, 'LogOwnerWithdrawal', { 'to': another, 'amount': new BigNumber(1) });
		});

		it('ownerWithdraw Should transfer exact amount funds to the recipient When passed valid arguments', async function () {
			// Arrange
			const anotherOldBalance = await web3.eth.getBalance(another);
			// Act
			await sut.ownerWithdraw(another, 1);
			// Assert
			const anotherNewBalance = await web3.eth.getBalance(another);

			assert.deepEqual(anotherNewBalance, anotherOldBalance.add(1));
		});

		it('isStoreOwner Should return false When the passed address is not store owner\'s', async function () {
			// Arrange
			// Act
			const result = await sut.isStoreOwner.call(another);
			// Assert
			assert.isFalse(result);
		});

		it('isStoreOwner Should return true When the passed address is store owner\'s', async function () {
			// Arrange
			// Act
			const result = await sut.isStoreOwner.call(storeOwner);
			// Assert
			assert.isTrue(result);
		});

		it('getStoresByOwner Should return empty array When the owner has no stores', async function () {
			// Arrange
			// Act
			const result = await sut.getStoresByOwner.call(another);
			// Assert
			assert.equal(result.length, 0);
		});

		it('getStoresByOwner Should return array with all stores When the owner has stores', async function () {
			// Arrange
			// Act
			const result = await sut.getStoresByOwner.call(storeOwner);
			// Assert
			assert.equal(result.length, 1);
			assert.equal(result[0], store.address);
		});

		it('getStoreOwners Should return array with all owners When there are owners', async function () {
			// Arrange
			// Act
			const result = await sut.getStoreOwners.call();
			// Assert
			assert.equal(result.length, 1);
			assert.equal(result[0], storeOwner);
		});
	});

	describe('StoreManager', () => {
		it('getStoreOwners Should return empty array When there are no owners', async function () {
			// Arrange
			// Act
			const result = await sut.getStoreOwners.call();
			// Assert
			assert.equal(result.length, 0);
		});

		it('Should have exact value of MAX_OWNER_STORES set', async function () {
			// Arrange
			// Act
			const result = await sut.MAX_OWNER_STORES.call();
			// Assert
			assert.equal(result, 65536);
		});

		it('requestStore Should revert When passed empty proposal', async function () {
			// Arrange
			// Act
			const result = sut.requestStore(0x0);
			// Assert
			await assertRevert(result);
		});

		it('requestStore Should emit LogStoreRequested event When passed valid arguments', async function () {
			// Arrange
			// Act
			const { logs } = await sut.requestStore(0x1);
			// Assert
			await inLogs(logs, 'LogStoreRequested', { 'requestIndex': new BigNumber(0) });
		});

		it('requestStore Should push the new request to the store requests array When passed valid arguments', async function () {
			// Arrange
			// Act
			await sut.requestStore(0x1);
			// Assert
			const result = await sut.storeRequests.call(0);

			assert.equal(result[0], '0x1'.padEnd(66, '0'));
			assert.equal(result[1], owner);
		});

		it('approveStore Should revert When called from non-owner', async function () {
			// Arrange
			await sut.requestStore(0x1);
			// Act
			const result = sut.approveStore(true, 0, { from: another });
			// Assert
			await assertRevert(result);
		});

		it('approveStore Should revert When the request queue is empty', async function () {
			// Arrange
			// Act
			const result = sut.approveStore(true, 0);
			// Assert
			await assertRevert(result);
		});

		it('approveStore Should increment the nextRequestIndex pointer value When the request is not approved', async function () {
			// Arrange
			await sut.requestStore(0x1);
			const before = await sut.nextRequestIndex.call();
			// Act
			await sut.approveStore(false, 0);
			// Assert
			const result = await sut.nextRequestIndex.call();
			assert.equal(before, 0);
			assert.equal(result, 1);
		});

		it('approveStore Should revert When passed out of range index in the stores array', async function () {
			// Arrange
			await sut.requestStore(0x1);
			// Act
			const result = sut.approveStore(true, 1);
			// Assert
			await assertRevert(result);
		});

		it('approveStore Should emit LogStoreApproved event When passed valid arguments', async function () {
			// Arrange
			await sut.requestStore(0x1);
			// Act
			const { logs } = await sut.approveStore(true, 0);
			// Assert
			await inLogs(logs, 'LogStoreApproved', { 'requestIndex': new BigNumber(0), 'owner': owner });
		});

		it('approveStore Should increment the nextRequestIndex pointer value When passed valid arguments', async function () {
			// Arrange
			await sut.requestStore(0x1);
			const before = await sut.nextRequestIndex.call();
			// Act
			await sut.approveStore(true, 0);
			// Assert
			const result = await sut.nextRequestIndex.call();
			assert.equal(before, 0);
			assert.equal(result, 1);
		});

		it('approveStore Should push the store owner to the owners array When passed valid arguments and the owner has not had previous stores', async function () {
			// Arrange
			await sut.requestStore(0x1);
			const before = await sut.getStoreOwners.call();
			// Act
			await sut.approveStore(true, 0);
			// Assert
			const result = await sut.getStoreOwners.call();
			assert.equal(before.length, 0);
			assert.equal(result.length, 1);
			assert.equal(result[0], owner);
		});

		it('approveStore Should push the new store to the owner\'s stores array When passed valid arguments', async function () {
			// Arrange
			await sut.requestStore(0x1);
			const before = await sut.getStoresByOwner.call(owner);
			// Act
			await sut.approveStore(true, 0);
			// Assert
			const result = await sut.getStoresByOwner.call(owner);
			assert.equal(before.length, 0);
			assert.equal(result.length, 1);
			assert.notEqual(result[0], ZERO_ADDRESS);
		});

		it('approveStore Should revert When the specified index in the stores array is non-empty', async function () {
			// Arrange
			await sut.requestStore(0x1);
			await sut.requestStore(0x1);
			await sut.approveStore(true, 0);
			// Act
			const result = sut.approveStore(true, 0);
			// Assert
			await assertRevert(result);
		});

		it('approveStore Should set the new store at the specified index in the owner\'s stores array When the previous store at the index has been revoked(is empty)', async function () {
			// Arrange
			await sut.requestStore(0x1);
			await sut.requestStore(0x1);
			await sut.approveStore(true, 0);

			const before = await sut.getStoresByOwner.call(owner);
			const previousStore = before[0];

			await sut.revokeStore(owner, 0);
			// Act
			await sut.approveStore(true, 0);
			// Assert
			const after = await sut.getStoresByOwner.call(owner);
			const newStore = after[0];

			assert.equal(before.length, 1);
			assert.equal(after.length, 1);
			assert.notEqual(previousStore, newStore);
			assert.notEqual(newStore, ZERO_ADDRESS);
		});

		it('revokeStore Should revert When called by non-owner', async function () {
			// Arrange
			// Act
			const result = sut.revokeStore(owner, 0, { from: another });
			// Assert
			await assertRevert(result);
		});

		it('revokeStore Should revert When called with an empty store owner address', async function () {
			// Arrange
			// Act
			const result = sut.revokeStore(ZERO_ADDRESS, 0);
			// Assert
			await assertRevert(result);
		});

		it('revokeStore Should revert When called with an invalid store index', async function () {
			// Arrange
			// Act
			const result = sut.revokeStore(owner, 1);
			// Assert
			await assertRevert(result);
		});

		it('revokeStore Should revert When the store address at the specified index in the stores array is empty', async function () {
			// Arrange
			await sut.requestStore(0x1);
			await sut.approveStore(true, 0);
			await sut.revokeStore(owner, 0);
			// Act
			const result = sut.revokeStore(owner, 0);
			// Assert
			await assertRevert(result);
		});

		it('revokeStore Should emit LogStoreRevoked event When passed valid arguments', async function () {
			// Arrange
			await sut.requestStore(0x1);
			await sut.approveStore(true, 0);

			const ownersStores = await sut.getStoresByOwner.call(owner);
			const current = ownersStores[0];

			// Act
			const { logs } = await sut.revokeStore(owner, 0);

			// Assert
			await inLogs(logs, 'LogStoreRevoked', { 'owner': owner, 'store': current });
		});

		it('revokeStore Should throw When trying to access it after it has been destructed', async function () {
			// Arrange
			await sut.requestStore(0x1);
			await sut.approveStore(true, 0);

			const ownersStores = await sut.getStoresByOwner.call(owner);
			const storeAddress = ownersStores[0];
			const store = await DestructibleStore.at(storeAddress);
			const before = await store.owner.call();
			// Act
			await sut.revokeStore(owner, 0);
			// Assert
			assert.equal(before, owner);
			try {
				await store.owner.call();
			} catch (error) {
				assert.exists(error);
			}
		});

		it('revokeStore Should delete the store at the specified index in the owner\'s stores array When passed valid arguments', async function () {
			// Arrange
			await sut.requestStore(0x1);
			await sut.approveStore(true, 0);

			const oldOwnersStores = await sut.getStoresByOwner.call(owner);
			// Act
			await sut.revokeStore(owner, 0);
			// Assert
			const newOwnersStores = await sut.getStoresByOwner.call(owner);

			assert.equal(oldOwnersStores.length, 1);
			assert.notEqual(oldOwnersStores[0], ZERO_ADDRESS);
			assert.equal(newOwnersStores.length, 1);
			assert.equal(newOwnersStores[0], ZERO_ADDRESS);
		});

		it('withdrawFromStore Should revert When called from non-owner', async function () {
			// Arrange
			// Act
			const result = sut.withdrawFromStore(another, 1, { from: another });
			// Assert
			await assertRevert(result);
		});

		it('withdrawFromStore Should revert When called with an empty store address', async function () {
			// Arrange
			// Act
			const result = sut.withdrawFromStore(ZERO_ADDRESS, 1);
			// Assert
			await assertRevert(result);
		});

		it('withdrawFromStore Should revert When called with zero value amount', async function () {
			// Arrange
			// Act
			const result = sut.withdrawFromStore(another, 0);
			// Assert
			await assertRevert(result);
		});

		it('withdrawFromStore Should revert When called with amount greater than the store\'s marketplace balance', async function () {
			// Arrange
			await sut.requestStore(0x1);
			await sut.approveStore(true, 0);

			const ownersStores = await sut.getStoresByOwner.call(owner);
			const storeAddress = ownersStores[0];
			// Act
			const result = sut.withdrawFromStore(storeAddress, 1);
			// Assert
			await assertRevert(result);
		});

		it('withdrawFromStore Should emit LogStoreWithdrawal event When passed valid arguments', async function () {
			// Arrange
			await sut.requestStore(0x1);
			await sut.approveStore(true, 0);

			const ownersStores = await sut.getStoresByOwner.call(owner);
			const storeAddress = ownersStores[0];

			const store = await DestructibleStore.at(storeAddress);
			await store.addProduct.sendTransaction(0x1, 1, 1000000, { from: owner });
			await store.buy.sendTransaction(0, 1, { from: another, value: 1000000 });
			// Act
			const { logs } = await sut.withdrawFromStore(storeAddress, 1, { from: owner });
			// Assert
			await inLogs(logs, 'LogStoreWithdrawal', { 'store': storeAddress, 'amount': new BigNumber(1) });
		});

		it('withdrawFromStore Should increase the balance of the marketplace with exact amount When passed valid arguments', async function () {
			// Arrange
			await sut.requestStore(0x1);
			await sut.approveStore(true, 0);

			const ownersStores = await sut.getStoresByOwner.call(owner);
			const storeAddress = ownersStores[0];

			const store = await DestructibleStore.at(storeAddress);
			await store.addProduct.sendTransaction(0x1, 1, 1000000, { from: owner });
			await store.buy.sendTransaction(0, 1, { from: another, value: 1000000 });

			const marketplaceOldBalance = await web3.eth.getBalance(sut.address);
			// Act
			await sut.withdrawFromStore.sendTransaction(storeAddress, 1, { from: owner });
			// Assert
			const marketplaceNewBalance = await web3.eth.getBalance(sut.address);

			assert.deepEqual(marketplaceNewBalance, marketplaceOldBalance.add(1));
		});

		it('withdrawFromStore Should decrease the store\'s marketplace balance state variable with exact amount When passed valid arguments', async function () {
			// Arrange
			await sut.requestStore(0x1);
			await sut.approveStore(true, 0);

			const ownersStores = await sut.getStoresByOwner.call(owner);
			const storeAddress = ownersStores[0];

			const store = await DestructibleStore.at(storeAddress);
			await store.addProduct.sendTransaction(0x1, 1, 1000000, { from: owner });
			await store.buy.sendTransaction(0, 1, { from: another, value: 1000000 });

			const marketplaceOldBalance = await store.marketplaceBalance.call();
			// Act
			await sut.withdrawFromStore.sendTransaction(storeAddress, 1, { from: owner });
			// Assert
			const marketplaceNewBalance = await store.marketplaceBalance.call();

			assert.deepEqual(marketplaceNewBalance, marketplaceOldBalance.sub(1));
		});
	});
});
