const SafeMathMock = artifacts.require('./SafeMathMock.sol');

const BigNumber = web3.BigNumber;

const assertRevert = require('../utils/test.util').assertRevert;

contract('SafeMath', function () {
	const MAX_UINT256 = new BigNumber(2).pow(256).minus(1);
	const MAX_UINT16 = new BigNumber(2).pow(16).minus(1);

	let sut;

	beforeEach(async function () {
		sut = await SafeMathMock.new();
	});

	describe('sub16', function () {
		it('subtracts correctly', async function () {
			// Arrange
			const a = new BigNumber(5678);
			const b = new BigNumber(1234);
			// Act
			const result = await sut.sub16(a, b);
			// Assert
			assert.deepEqual(result, a.minus(b));
		});

		it('throws a revert error if subtraction result would be negative', async function () {
			// Arrange
			const a = new BigNumber(1234);
			const b = new BigNumber(5678);
			// Act
			// Assert
			await assertRevert(sut.sub16(a, b));
		});
	});

	describe('add16', function () {
		it('adds correctly', async function () {
			// Arrange
			const a = new BigNumber(5678);
			const b = new BigNumber(1234);
			// Act
			const result = await sut.add16(a, b);
			// Assert
			assert.deepEqual(result, a.plus(b));
		});

		it('throws a revert error on addition overflow', async function () {
			// Arrange
			const a = MAX_UINT16;
			const b = new BigNumber(1);
			// Act
			// Assert
			await assertRevert(sut.add16(a, b));
		});
	});

	describe('mul', function () {
		it('multiplies correctly', async function () {
			// Arrange
			const a = new BigNumber(1234);
			const b = new BigNumber(5678);
			// Act
			const result = await sut.mul(a, b);
			// Assert
			assert.deepEqual(result, a.times(b));
		});

		it('handles a zero product correctly', async function () {
			// Arrange
			const a = new BigNumber(0);
			const b = new BigNumber(5678);
			// Act
			const result = await sut.mul(a, b);
			// Assert
			assert.deepEqual(result, a.times(b));
		});

		it('throws a revert error on multiplication overflow', async function () {
			// Arrange
			const a = MAX_UINT256;
			const b = new BigNumber(2);
			// Act
			// Assert
			await assertRevert(sut.mul(a, b));
		});
	});

	describe('sub', function () {
		it('subtracts correctly', async function () {
			// Arrange
			const a = new BigNumber(5678);
			const b = new BigNumber(1234);
			// Act
			const result = await sut.sub(a, b);
			// Assert
			assert.deepEqual(result, a.minus(b));
		});

		it('throws a revert error if subtraction result would be negative', async function () {
			// Arrange
			const a = new BigNumber(1234);
			const b = new BigNumber(5678);
			// Act
			// Assert
			await assertRevert(sut.sub(a, b));
		});
	});

	describe('add', function () {
		it('adds correctly', async function () {
			// Arrange
			const a = new BigNumber(5678);
			const b = new BigNumber(1234);
			// Act
			const result = await sut.add(a, b);
			// Assert
			assert.deepEqual(result, a.plus(b));
		});

		it('throws a revert error on addition overflow', async function () {
			// Arrange
			const a = MAX_UINT256;
			const b = new BigNumber(1);
			// Act
			// Assert
			await assertRevert(sut.add(a, b));
		});
	});
});
