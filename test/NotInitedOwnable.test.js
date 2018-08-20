const NotInitedOwnable = artifacts.require('./NotInitedOwnable.sol');

const assertRevert = require('./utils/test.util').assertRevert;
const inLogs = require('./utils/test.util').inLogs;

contract('NotInitedOwnable', function ([coinbase, another]) {
	let sut;
	const ZERO_ADDRESS = '0x' + '0'.repeat(40);

	beforeEach(async function () {
		sut = await NotInitedOwnable.new();
	});

	it('Should not have owner When instantiated', async function () {
		// Arrange
		// Act
		const owner = await sut.owner.call();
		// Assert
		assert.equal(owner, ZERO_ADDRESS);
	});

	it('init Should set owner When called', async function () {
		// Arrange
		await sut.init();
		// Act
		const owner = await sut.owner.call();
		// Assert
		assert.equal(owner, coinbase);
	});

	it('init Should revert When called with already set owner', async function () {
		// Arrange
		await sut.init();
		// Act
		const result = sut.init();
		// Assert
		await assertRevert(result);
	});

	it('transferOwnership Should transfer the ownership When passed valid arguments', async function () {
		// Arrange
		await sut.init();
		const initialOwner = await sut.owner.call();
		assert.equal(initialOwner, coinbase);
		// Act
		await sut.transferOwnership(another);
		const owner = await sut.owner.call();
		// Assert
		assert.equal(owner, another);
	});

	it('transferOwnership Should raise OwnershipTransferred event When passed valid arguments', async function () {
		// Arrange
		await sut.init();
		// Act
		const { logs } = await sut.transferOwnership(another);
		// Assert
		await inLogs(logs, "OwnershipTransferred", { previousOwner: coinbase, newOwner: another });
	});

	it('transferOwnership Should revert When the passed `_newOwner` account equals 0', async function () {
		// Arrange
		await sut.init();
		// Act
		const result = sut.transferOwnership(ZERO_ADDRESS);
		// Assert
		await assertRevert(result);
	});

	it('transferOwnership Should revert When called from non-owner account', async function () {
		// Arrange
		await sut.init();
		// Act
		const result = sut.transferOwnership(another, { from: another });
		// Assert
		await assertRevert(result);
	});
});