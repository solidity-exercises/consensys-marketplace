const DestructibleStore = artifacts.require('./DestructibleStore.sol');
const StoreManager = artifacts.require('./StoreManager.sol');
const assertRevert = require('../utils/test.util').assertRevert;
const inLogs = require('../utils/test.util').inLogs;
const BigNumber = web3.BigNumber;

contract('Store Inheritance Chain', function ([owner, market, another]) {
	const ZERO_ADDRESS = '0x' + '0'.repeat(40);

	describe('StoreOwnable', () => {
		let sut;

		it('constructor Should revert When invalid owner address is passed', async function () {
			// Arrange
			// Act
			const result = DestructibleStore.new(ZERO_ADDRESS, { from: market });
			// Assert
			await assertRevert(result);
		});

		it('constructor Should properly set owner account When valid arguments are passed', async function () {
			// Arrange
			sut = await DestructibleStore.new(owner, { from: market });
			// Act
			const result = await sut.owner.call();
			// Assert
			assert.equal(result, owner);
		});

		it('constructor Should properly set market account When valid arguments are passed', async function () {
			// Arrange
			sut = await DestructibleStore.new(owner, { from: market });
			// Act
			const result = await sut.marketplace.call();
			// Assert
			assert.equal(result, market);
		});

		it('requestOwnershipTransfer Should revert When invoked from non-owner', async function () {
			// Arrange
			sut = await DestructibleStore.new(owner, { from: market });
			// Act
			const result = sut.requestOwnershipTransfer(another, 0, { from: another });
			// Assert
			await assertRevert(result);
		});

		it('requestOwnershipTransfer Should raise OwnershipTransferRequested event When invoked from owner', async function () {
			// Arrange
			sut = await DestructibleStore.new(owner, { from: market });
			// Act
			const { logs } = await sut.requestOwnershipTransfer(another, 0);
			// Assert
			await inLogs(logs, 'OwnershipTransferRequested', { currentOwner: owner, ownerCandidate: another, storeIndex: new BigNumber(0) });
		});

		it('requestOwnershipTransfer Should set ownerCandidate to the passed value When invoked from owner', async function () {
			// Arrange
			sut = await DestructibleStore.new(owner, { from: market });
			// Act
			await sut.requestOwnershipTransfer(another, 0);
			const result = await sut.ownerCandidate.call();
			// Assert
			assert.equal(result, another);
		});

		it('requestOwnershipTransfer Should set storeIndex to the passed value When invoked from owner', async function () {
			// Arrange
			sut = await DestructibleStore.new(owner, { from: market });
			// Act
			await sut.requestOwnershipTransfer(another, 1);
			const result = await sut.storeIndex.call();
			// Assert
			assert.equal(result, 1);
		});

		it('approveOwnershipTransfer Should revert When invoked from non-owner candidate', async function () {
			// Arrange
			sut = await DestructibleStore.new(owner, { from: market });
			await sut.requestOwnershipTransfer(another, 1);
			// Act
			const result = sut.approveOwnershipTransfer(0);
			// Assert
			await assertRevert(result);
		});
	});

	describe('StoreOwnable approveOwnershipTransfer integration', () => {
		let marketplace;
		let sut;

		beforeEach(async () => {
			marketplace = await StoreManager.new();
			await marketplace.init();
			await marketplace.requestStore(0x1);
			await marketplace.approveStore(true, 0);
			const storeAddress = await marketplace.stores.call(owner, 0);
			sut = await DestructibleStore.at(storeAddress);
		});

		it('approveOwnershipTransfer Should emit OwnershipTransferred event When invoked from owner candidate with valid arguments', async function () {
			// Arrange
			await sut.requestOwnershipTransfer(another, 0);
			// Act
			const { logs } = await sut.approveOwnershipTransfer(0, { from: another });
			// Assert
			await inLogs(logs, 'OwnershipTransferred', { previousOwner: owner, newOwner: another });
		});

		it('approveOwnershipTransfer Should revert When invoked from owner candidate with wrong current store index', async function () {
			// Arrange
			await sut.requestOwnershipTransfer(another, 1);
			// Act
			const result = sut.approveOwnershipTransfer(0, { from: another });
			// Assert
			await assertRevert(result);
		});

		it('approveOwnershipTransfer Should revert When invoked from owner candidate with wrong new store index', async function () {
			// Arrange
			await sut.requestOwnershipTransfer(another, 0);
			// Act
			const result = sut.approveOwnershipTransfer(1, { from: another });
			// Assert
			await assertRevert(result);
		});

		it('approveOwnershipTransfer Should delete the store from the current owner stores array When invoked from owner candidate with valid arguments', async function () {
			// Arrange
			const storeCurrent = await marketplace.stores.call(owner, 0);
			assert.equal(storeCurrent, sut.address);
			await sut.requestOwnershipTransfer(another, 0);
			// Act
			await sut.approveOwnershipTransfer(0, { from: another });
			// Assert
			const storeAfter = await marketplace.stores.call(owner, 0);
			assert.equal(storeAfter, ZERO_ADDRESS);
		});

		it('approveOwnershipTransfer Should put the new owner to the owners array When invoked from owner candidate with valid arguments and it is the new owner\'s first store', async function () {
			// Arrange
			const currentOwners = await marketplace.getStoreOwners.call();
			assert.equal(currentOwners.length, 1);
			assert.equal(currentOwners[0], owner);
			await sut.requestOwnershipTransfer(another, 0);
			// Act
			await sut.approveOwnershipTransfer(0, { from: another });
			// Assert
			const ownersAfter = await marketplace.getStoreOwners.call();
			assert.equal(ownersAfter.length, 2);
			assert.equal(ownersAfter[1], another);
		});

		it('approveOwnershipTransfer Should push the new store to the owner candidate\'s stores array When invoked from owner candidate with valid arguments and new store index equal to the array length', async function () {
			// Arrange
			const currentStores = await marketplace.getStoresByOwner.call(another);
			assert.equal(currentStores.length, 0);
			await sut.requestOwnershipTransfer(another, 0);
			// Act
			await sut.approveOwnershipTransfer(0, { from: another });
			// Assert
			const storesAfter = await marketplace.getStoresByOwner.call(another);
			assert.equal(storesAfter.length, 1);
			assert.equal(storesAfter[0], sut.address);
		});

		it('approveOwnershipTransfer Should revert When invoked from owner candidate with new store index pointing to a non-empty slot', async function () {
			// Arrange
			await marketplace.requestStore(0x1, { from: another });
			await marketplace.approveStore(true, 0);
			await sut.requestOwnershipTransfer(another, 0);
			// Act
			const result = sut.approveOwnershipTransfer(0, { from: another });
			// Assert
			await assertRevert(result);
		});

		it('approveOwnershipTransfer Should set the transferred store to an exact index When invoked from owner candidate with valid arguments', async function () {
			// Arrange
			await marketplace.requestStore(0x1, { from: another });
			await marketplace.approveStore(true, 0);
			await marketplace.revokeStore(another, 0);

			const currentStores = await marketplace.getStoresByOwner.call(another);
			assert.equal(currentStores.length, 1);
			assert.equal(currentStores[0], ZERO_ADDRESS);

			await sut.requestOwnershipTransfer(another, 0);

			// Act
			await sut.approveOwnershipTransfer(0, { from: another });

			// Assert
			const storesAfter = await marketplace.getStoresByOwner.call(another);
			assert.equal(storesAfter.length, 1);
			assert.equal(storesAfter[0], sut.address);
		});

		it('approveOwnershipTransfer Should set the owner to owner candidate When invoked from owner candidate with valid arguments', async function () {
			// Arrange
			await sut.requestOwnershipTransfer(another, 0);
			// Act
			await sut.approveOwnershipTransfer(0, { from: another });
			// Assert
			const result = await sut.owner.call();
			assert.equal(result, another);
		});
	});

	describe('Pausable', () => {
		let sut;

		beforeEach(async () => {
			sut = await DestructibleStore.new(owner, { from: market });
		});

		it('Should be paused on contract instantiation', async function () {
			// Arrange
			// Act
			const result = await sut.paused.call();
			// Assert
			assert.equal(result, false);
		});

		it('pause Should revert When called by non-owner', async function () {
			// Arrange
			// Act
			const result = sut.pause({ from: another });
			// Assert
			assertRevert(result);
		});

		it('pause Should emit Pause event When valid call is made', async function () {
			// Arrange
			// Act
			const { logs } = await sut.pause();
			// Assert
			await inLogs(logs, 'Pause');
		});

		it('pause Should set paused to true When valid call is made', async function () {
			// Arrange
			// Act
			await sut.pause();
			const result = await sut.paused.call();
			// Assert
			assert.equal(result, true);
		});

		it('unpause Should revert When called by non-owner', async function () {
			// Arrange
			// Act
			const result = sut.unpause({ from: another });
			// Assert
			assertRevert(result);
		});

		it('unpause Should emit Unpause event When valid call is made', async function () {
			// Arrange
			// Act
			const { logs } = await sut.unpause();
			// Assert
			await inLogs(logs, 'Unpause');
		});

		it('unpause Should set paused to false When valid call is made', async function () {
			// Arrange
			await sut.pause();
			const current = await sut.paused.call();
			assert.equal(current, true);
			// Act
			await sut.unpause();
			// Assert
			const result = await sut.paused.call();
			assert.equal(result, false);
		});
	});

	describe('MarketplaceStore', () => {
		let sut;

		beforeEach(async () => {
			sut = await DestructibleStore.new(owner, { from: market });
		});

		it('Should have exact MARKETPLACE_TAX_DENOMINATOR value', async function () {
			// Arrange
			// Act
			const result = await sut.MARKETPLACE_TAX_DENOMINATOR.call();
			// Assert
			assert.deepEqual(result, new BigNumber(1000000));
		});

		it('marketplaceWithdraw Should revert When invoked from not marketplace account', async function () {
			// Arrange
			// Act
			const result = sut.marketplaceWithdraw(1, { from: owner });
			// Assert
			await assertRevert(result);
		});

		it('marketplaceWithdraw Should revert When 0 withdraw amount is passed', async function () {
			// Arrange
			// Act
			const result = sut.marketplaceWithdraw(0, { from: market });
			// Assert
			await assertRevert(result);
		});

		it('marketplaceWithdraw Should revert When withdraw amount passed is higher than the marketplace\'s balance', async function () {
			// Arrange
			// Act
			const result = sut.marketplaceWithdraw(1, { from: market });
			// Assert
			await assertRevert(result);
		});

		it('marketplaceWithdraw Should emit LogMarketplaceWithdrawal event When passed valid arguments', async function () {
			// Arrange
			await sut.addProduct(0x1, 1, 1000000);
			await sut.buy(0, 1, { value: 1000000 });
			// Act
			const { logs } = await sut.marketplaceWithdraw(1, { from: market });
			// Assert
			await inLogs(logs, 'LogMarketplaceWithdrawal', { amount: new BigNumber(1) });
		});

		it('marketplaceWithdraw Should subtract the passed amount from the marketplace balance When passed valid arguments', async function () {
			// Arrange
			await sut.addProduct(0x1, 1, 1000000);
			await sut.buy(0, 1, { value: 1000000 });
			const currentBalance = await sut.marketplaceBalance.call();
			assert.deepEqual(currentBalance, new BigNumber(1));
			// Act
			await sut.marketplaceWithdraw(1, { from: market });
			// Assert
			const newBalance = await sut.marketplaceBalance.call();
			assert.deepEqual(newBalance, new BigNumber(0));
		});

		it('marketplaceWithdraw Should transfer exact amount to the marketplace When passed valid arguments', async function () {
			// Arrange
			await sut.addProduct(0x1, 1, 1000000);
			await sut.buy(0, 1, { value: 1000000 });

			const marketOldBalance = await web3.eth.getBalance(market);

			// Act
			const { receipt } = await sut.marketplaceWithdraw(1, { from: market });
			const transaction = await web3.eth.getTransaction(receipt.transactionHash);

			const txCost = transaction.gasPrice.mul(receipt.cumulativeGasUsed);

			const marketNewBalance = await web3.eth.getBalance(market);
			const balanceDifference = marketOldBalance.sub(marketNewBalance);
			// Assert
			assert.deepEqual(balanceDifference, txCost.sub(1));
		});
	});

	describe('Store', () => {
		let sut;

		beforeEach(async () => {
			sut = await DestructibleStore.new(owner, { from: market });
		});

		it('Should have exact MAX_STORE_PRODUCTS value', async function () {
			// Arrange
			// Act
			const result = await sut.MAX_STORE_PRODUCTS.call();
			// Assert
			assert.deepEqual(result, new BigNumber(65536));
		});

		it('setStorefront Should revert When called by non-owner', async function () {
			// Arrange
			// Act
			const result = sut.setStorefront(0, 0, { from: another });
			// Assert
			await assertRevert(result);
		});

		it('setStorefront Should revert When passed invalid product index', async function () {
			// Arrange
			// Act
			const result = sut.setStorefront(0, 0);
			// Assert
			await assertRevert(result);
		});

		it('setStorefront Should revert When passed invalid storefront index', async function () {
			// Arrange
			// Act
			const result = sut.setStorefront(16, 0);
			// Assert
			await assertRevert(result);
		});

		it('setStorefront Should set the storefront at the specified index When passed valid arguments', async function () {
			// Arrange
			await sut.addProduct(0x1, 1, 1000000);
			await sut.addProduct(0x1, 1, 1000000);
			// Act
			await sut.setStorefront(0, 1);
			// Assert
			const result = await sut.storefront.call(0);

			assert.equal(result, 1);
		});

		it('addProduct Should revert When called by non-owner', async function () {
			// Arrange
			// Act
			const result = sut.addProduct(0x1, 1, 1000000, { from: another });
			// Assert
			await assertRevert(result);
		});

		it('addProduct Should revert When blank description is passed', async function () {
			// Arrange
			// Act
			const result = sut.addProduct(0x0, 1, 1000000);
			// Assert
			await assertRevert(result);
		});

		it('addProduct Should emit LogProductAdded When valid arguments are passed', async function () {
			// Arrange
			// Act
			const { logs } = await sut.addProduct(0x1, 1, 1000000);
			// Assert
			await inLogs(logs, 'LogProductAdded', { 'index': new BigNumber(0), 'description': '0x1'.padEnd(62, '0') });
		});

		it('addProduct Should push the new product to the products array When valid arguments are passed', async function () {
			// Arrange
			// Act
			await sut.addProduct(0x1, 1, 1000000);
			// Assert
			const result = await sut.products.call(0);

			assert.equal(result[0], '0x1'.padEnd(62, '0'));
			assert.equal(result[1], 1);
			assert.equal(result[2], 1000000);
		});

		it('updateProduct Should revert When called from non-owner', async function () {
			// Arrange
			// Act
			const result = sut.updateProduct(0, 0x1, 1, 1000000, { from: another });
			// Assert
			await assertRevert(result);
		});

		it('updateProduct Should revert When the specified product index is out of range', async function () {
			// Arrange
			// Act
			const result = sut.updateProduct(0, 0x1, 1, 1000000);
			// Assert
			await assertRevert(result);
		});

		it('updateProduct Should revert When the specified description is blank', async function () {
			// Arrange
			await sut.addProduct(0x1, 1, 1000000);
			// Act
			const result = sut.updateProduct(0, 0x0, 1, 1000000);
			// Assert
			await assertRevert(result);
		});

		it('updateProduct Should emit LogProductUpdated event When valid arguments are passed', async function () {
			// Arrange
			await sut.addProduct(0x1, 1, 1000000);
			// Act
			const { logs } = await sut.updateProduct(0, 0x2, 2, 2000000);
			// Assert
			await inLogs(logs, 'LogProductUpdated', { 'index': new BigNumber(0), 'description': '0x2'.padEnd(62, '0'), 'quantity': new BigNumber(2), 'price': new BigNumber(2000000) });
		});

		it('updateProduct Should update the product at the specified index When valid arguments are passed', async function () {
			// Arrange
			await sut.addProduct(0x1, 1, 1000000);
			// Act
			await sut.updateProduct(0, 0x2, 2, 2000000);
			// Assert
			const result = await sut.products.call(0);

			assert.equal(result[0], '0x2'.padEnd(62, '0'));
			assert.equal(result[1], 2);
			assert.equal(result[2], 2000000);
		});

		it('removeProduct Should revert When called from non-owner', async function () {
			// Arrange
			// Act
			const result = sut.removeProduct(0, { from: another });
			// Assert
			await assertRevert(result);
		});

		it('removeProduct Should revert When the specified product index is not in range', async function () {
			// Arrange
			// Act
			const result = sut.removeProduct(0);
			// Assert
			await assertRevert(result);
		});

		it('removeProduct Should emit LogProductRemoved event When passed valid arguments', async function () {
			// Arrange
			await sut.addProduct(0x1, 1, 1000000);
			// Act
			const { logs } = await sut.removeProduct(0);
			// Assert
			await inLogs(logs, 'LogProductRemoved', { 'index': new BigNumber(0) });
		});

		it('removeProduct Should delete the product from the specified index When passed valid arguments', async function () {
			// Arrange
			await sut.addProduct(0x1, 1, 1000000);
			const current = await sut.products.call(0);
			assert.equal(current[0], '0x1'.padEnd(62, '0'));
			assert.equal(current[1], 1);
			assert.equal(current[2], 1000000);
			// Act
			await sut.removeProduct(0);
			// Assert
			const result = await sut.products.call(0);
			assert.equal(result[0], '0x0'.padEnd(62, '0'));
			assert.equal(result[1], 0);
			assert.equal(result[2], 0);
		});

		it('setPrice Should revert When called from non-owner', async function () {
			// Arrange
			// Act
			const result = sut.setPrice(0, 0, { from: another });
			// Assert
			await assertRevert(result);
		});

		it('setPrice Should revert When the specified product index is not in range', async function () {
			// Arrange
			// Act
			const result = sut.setPrice(0, 0);
			// Assert
			await assertRevert(result);
		});

		it('setPrice Should emit LogProductPriceSet event When passed valid arguments', async function () {
			// Arrange
			await sut.addProduct(0x1, 1, 1000000);
			// Act
			const { logs } = await sut.setPrice(0, 2000000);
			// Assert
			await inLogs(logs, 'LogProductPriceSet', { 'index': new BigNumber(0), 'newPrice': new BigNumber(2000000) });
		});

		it('setPrice Should set the price of the product at the specified index to the new one When passed valid arguments', async function () {
			// Arrange
			await sut.addProduct(0x1, 1, 1000000);
			// Act
			await sut.setPrice(0, 2000000);
			// Assert
			const result = await sut.products.call(0);
			assert.equal(result[2], 2000000);
		});

		it('increaseQuantity Should revert When called from non-owner', async function () {
			// Arrange
			// Act
			const result = sut.increaseQuantity(0, 0, { from: another });
			// Assert
			await assertRevert(result);
		});

		it('increaseQuantity Should revert When the specified product index is not in range', async function () {
			// Arrange
			// Act
			const result = sut.increaseQuantity(0, 0);
			// Assert
			await assertRevert(result);
		});

		it('increaseQuantity Should revert When passed 0 increasement', async function () {
			// Arrange
			await sut.addProduct(0x1, 1, 1000000);
			// Act
			const result = sut.increaseQuantity(0, 0);
			// Assert
			await assertRevert(result);
		});

		it('increaseQuantity Should increase the product\'s quantity with the specified amount When passed valid arguments', async function () {
			// Arrange
			await sut.addProduct(0x1, 1, 1000000);
			// Act
			await sut.increaseQuantity(0, 1);
			// Assert
			const result = await sut.products.call(0);
			assert.equal(result[1], 2);
		});

		it('decreaseQuantity Should revert When called from non-owner', async function () {
			// Arrange
			// Act
			const result = sut.decreaseQuantity(0, 0, { from: another });
			// Assert
			await assertRevert(result);
		});

		it('decreaseQuantity Should revert When the specified product index is not in range', async function () {
			// Arrange
			// Act
			const result = sut.decreaseQuantity(0, 0);
			// Assert
			await assertRevert(result);
		});

		it('decreaseQuantity Should revert When passed 0 decreasement', async function () {
			// Arrange
			await sut.addProduct(0x1, 1, 1000000);
			// Act
			const result = sut.decreaseQuantity(0, 0);
			// Assert
			await assertRevert(result);
		});

		it('decreaseQuantity Should decrease the product\'s quantity with the specified amount When passed valid arguments', async function () {
			// Arrange
			await sut.addProduct(0x1, 1, 1000000);
			// Act
			await sut.decreaseQuantity(0, 1);
			// Assert
			const result = await sut.products.call(0);
			assert.equal(result[1], 0);
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

		it('ownerWithdraw Should revert When passed zero amount', async function () {
			// Arrange
			// Act
			const result = sut.ownerWithdraw(another, 0);
			// Assert
			await assertRevert(result);
		});

		it('ownerWithdraw Should revert When passed amount greater than the balance', async function () {
			// Arrange
			// Act
			const result = sut.ownerWithdraw(another, 1);
			// Assert
			await assertRevert(result);
		});

		it('ownerWithdraw Should raise LogOwnerWithdrawal event When passed valid arguments', async function () {
			// Arrange
			await sut.addProduct(0x1, 1, 1000000);
			await sut.buy(0, 1, { value: 1000000 });
			// Act
			const { logs } = await sut.ownerWithdraw(another, 999999);
			// Assert
			await inLogs(logs, 'LogOwnerWithdrawal', { 'to': another, 'amount': new BigNumber(999999) });
		});

		it('ownerWithdraw Should transfer amount ETH to the recipient When passed valid arguments', async function () {
			// Arrange
			await sut.addProduct(0x1, 1, 1000000);
			await sut.buy(0, 1, { value: 1000000 });
			const anotherOldBalance = await web3.eth.getBalance(another);
			// Act
			await sut.ownerWithdraw(another, 999999);
			// Assert
			const anotherNewBalance = await web3.eth.getBalance(another);
			assert.deepEqual(anotherNewBalance, anotherOldBalance.add(999999));
		});

		it('buy Should revert When the contract is paused', async function () {
			// Arrange
			await sut.pause();
			// Act
			const result = sut.buy(0, 1);
			// Assert
			await assertRevert(result);
		});

		it('buy Should revert When specified product index is out of range', async function () {
			// Arrange
			// Act
			const result = sut.buy(0, 1);
			// Assert
			await assertRevert(result);
		});

		it('buy Should revert When specified quantity is 0', async function () {
			// Arrange
			await sut.addProduct(0x1, 1, 1000000);
			// Act
			const result = sut.buy(0, 0);
			// Assert
			await assertRevert(result);
		});

		it('buy Should revert When the msg value is not sufficient', async function () {
			// Arrange
			await sut.addProduct(0x1, 1, 1000000);
			// Act
			const result = sut.buy(0, 1, { value: 999999 });
			// Assert
			await assertRevert(result);
		});

		it('buy Should emit LogPurchase event When passed valid arguments', async function () {
			// Arrange
			await sut.addProduct(0x1, 1, 1000000);
			// Act
			const { logs } = await sut.buy(0, 1, { value: 1000000 });
			// Assert
			await inLogs(logs, 'LogPurchase', { 'index': new BigNumber(0), 'quantitySold': new BigNumber(1), 'salePrice': new BigNumber(1000000) });
		});

		it('buy Should lower the quantity of the product bought When passed valid arguments', async function () {
			// Arrange
			await sut.addProduct(0x1, 1, 1000000);
			const current = await sut.products.call(0);
			assert.equal(current[1], 1);
			// Act
			await sut.buy(0, 1, { value: 1000000 });
			// Assert
			const result = await sut.products.call(0);
			assert.equal(result[1], 0);
		});

		it('buy Should add the marketplace share to the marketplace balance When passed valid arguments', async function () {
			// Arrange
			await sut.addProduct(0x1, 1, 1000000);
			const current = await sut.marketplaceBalance.call();
			assert.equal(current, 0);
			// Act
			await sut.buy(0, 1, { value: 1000000 });
			// Assert
			const result = await sut.marketplaceBalance.call();
			assert.equal(result, 1);
		});
	});

	describe('DestructibleStore', () => {
		let sut;

		beforeEach(async () => {
			sut = await DestructibleStore.new(owner, { from: market });
		});

		it('destroy Should revert When called from non-owner and non-marketplace account', async function () {
			// Arrange
			// Act
			const result = sut.destroy({ from: another });
			// Assert
			await assertRevert(result);
		});

		it('destroy Should destruct the contract and send the funds to the marketplace and the owner When called from the owner', async function () {
			// Arrange
			await sut.addProduct(0x1, 1, 1000000);
			await sut.buy(0, 1, { value: 1000000 });

			const marketOldBalance = await web3.eth.getBalance(market);
			const ownerOldBalance = await web3.eth.getBalance(owner);

			// Act
			const { receipt } = await sut.destroy();

			// Assert
			const transaction = await web3.eth.getTransaction(receipt.transactionHash);
			const txCost = transaction.gasPrice.mul(receipt.cumulativeGasUsed);

			const marketNewBalance = await web3.eth.getBalance(market);
			const ownerNewBalance = await web3.eth.getBalance(owner);
			const balanceDifference = ownerOldBalance.sub(ownerNewBalance);

			assert.deepEqual(marketNewBalance, marketOldBalance.add(1));
			assert.deepEqual(balanceDifference, txCost.sub(999999));
		});

		it('destroy Should destruct the contract and send the funds to the marketplace and the owner When called from the marketplace', async function () {
			// Arrange
			await sut.addProduct(0x1, 1, 1000000);
			await sut.buy(0, 1, { value: 1000000 });

			const marketOldBalance = await web3.eth.getBalance(market);
			const ownerOldBalance = await web3.eth.getBalance(owner);

			// Act
			const { receipt } = await sut.destroy({ from: market });

			// Assert
			const transaction = await web3.eth.getTransaction(receipt.transactionHash);
			const txCost = transaction.gasPrice.mul(receipt.cumulativeGasUsed);

			const marketNewBalance = await web3.eth.getBalance(market);
			const ownerNewBalance = await web3.eth.getBalance(owner);
			const balanceDifference = marketOldBalance.sub(marketNewBalance);

			assert.deepEqual(ownerNewBalance, ownerOldBalance.add(999999));
			assert.deepEqual(balanceDifference, txCost.sub(1));
		});
	});
});
