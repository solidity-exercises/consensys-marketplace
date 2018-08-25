const DestructibleStore = artifacts.require('./DestructibleStore.sol');
const assertRevert = require('../utils/test.util').assertRevert;
const inLogs = require('../utils/test.util').inLogs;
const BigNumber = web3.BigNumber;

contract('Store Inheritance Chain', function ([owner, marketplace, another]) {
	const ZERO_ADDRESS = '0x' + '0'.repeat(40);

	describe('StoreOwnable', () => {
		let sut;

		it('constructor Should revert When invalid owner address is passed', async function () {
			// Arrange
			// Act
			const result = DestructibleStore.new(ZERO_ADDRESS, { from: marketplace });
			// Assert
			await assertRevert(result);
		});

		it('constructor Should properly set owner account When valid arguments are passed', async function () {
			// Arrange
			sut = await DestructibleStore.new(owner, { from: marketplace });
			// Act
			const result = await sut.owner.call();
			// Assert
			assert.equal(result, owner);
		});

		it('constructor Should properly set marketplace account When valid arguments are passed', async function () {
			// Arrange
			sut = await DestructibleStore.new(owner, { from: marketplace });
			// Act
			const result = await sut.marketplace.call();
			// Assert
			assert.equal(result, marketplace);
		});

		it('requestOwnershipTransfer Should revert When invoked from non-owner', async function () {
			// Arrange
			sut = await DestructibleStore.new(owner, { from: marketplace });
			// Act
			const result = sut.requestOwnershipTransfer(another, 0, { from: another });
			// Assert
			await assertRevert(result);
		});

		it('requestOwnershipTransfer Should raise OwnershipTransferRequested event When invoked from owner', async function () {
			// Arrange
			sut = await DestructibleStore.new(owner, { from: marketplace });
			// Act
			const { logs } = await sut.requestOwnershipTransfer(another, 0);
			// Assert
			await inLogs(logs, 'OwnershipTransferRequested', { currentOwner: owner, ownerCandidate: another, storeIndex: new BigNumber(0) });
		});

		it('requestOwnershipTransfer Should set ownerCandidate to the passed value When invoked from owner', async function () {
			// Arrange
			sut = await DestructibleStore.new(owner, { from: marketplace });
			// Act
			await sut.requestOwnershipTransfer(another, 0);
			const result = await sut.ownerCandidate.call();
			// Assert
			assert.equal(result, another);
		});

		it('requestOwnershipTransfer Should set storeIndex to the passed value When invoked from owner', async function () {
			// Arrange
			sut = await DestructibleStore.new(owner, { from: marketplace });
			// Act
			await sut.requestOwnershipTransfer(another, 1);
			const result = await sut.storeIndex.call();
			// Assert
			assert.equal(result, 1);
		});

		it('approveOwnershipTransfer Should revert When invoked from non-owner candidate', async function () {
			// Arrange
			sut = await DestructibleStore.new(owner, { from: marketplace });
			await sut.requestOwnershipTransfer(another, 1);
			// Act
			const result = sut.approveOwnershipTransfer(0);
			// Assert
			await assertRevert(result);
		});
	});
});
