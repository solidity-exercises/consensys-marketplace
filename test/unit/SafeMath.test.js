const SafeMathMock = artifacts.require('./SafeMathMock.sol');

const BigNumber = web3.BigNumber;

const assertRevert = require('../utils/test.util').assertRevert;

require('chai')
	.use(require('chai-bignumber')(BigNumber))
	.should();

contract('SafeMath', function () {
	const MAX_UINT256 = new BigNumber(2).pow(256).minus(1);
	const MAX_UINT16 = new BigNumber(2).pow(16).minus(1);

	let sut;

	beforeEach(async function () {
		sut = await SafeMathMock.new();
	});

	describe('sub16', function () {
		it('subtracts correctly', async function () {
			const a = new BigNumber(5678);
			const b = new BigNumber(1234);

			(await sut.sub16(a, b)).should.be.bignumber.equal(a.minus(b));
		});

		it('throws a revert error if subtraction result would be negative', async function () {
			const a = new BigNumber(1234);
			const b = new BigNumber(5678);

			await assertRevert(sut.sub16(a, b));
		});
	});

	describe('add16', function () {
		it('adds correctly', async function () {
			const a = new BigNumber(5678);
			const b = new BigNumber(1234);

			(await sut.add16(a, b)).should.be.bignumber.equal(a.plus(b));
		});

		it('throws a revert error on addition overflow', async function () {
			const a = MAX_UINT16;
			const b = new BigNumber(1);

			await assertRevert(sut.add16(a, b));
		});
	});

	describe('mul', function () {
		it('multiplies correctly', async function () {
			const a = new BigNumber(1234);
			const b = new BigNumber(5678);

			(await sut.mul(a, b)).should.be.bignumber.equal(a.times(b));
		});

		it('handles a zero product correctly', async function () {
			const a = new BigNumber(0);
			const b = new BigNumber(5678);

			(await sut.mul(a, b)).should.be.bignumber.equal(a.times(b));
		});

		it('throws a revert error on multiplication overflow', async function () {
			const a = MAX_UINT256;
			const b = new BigNumber(2);

			await assertRevert(sut.mul(a, b));
		});
	});

	describe('sub', function () {
		it('subtracts correctly', async function () {
			const a = new BigNumber(5678);
			const b = new BigNumber(1234);

			(await sut.sub(a, b)).should.be.bignumber.equal(a.minus(b));
		});

		it('throws a revert error if subtraction result would be negative', async function () {
			const a = new BigNumber(1234);
			const b = new BigNumber(5678);

			await assertRevert(sut.sub(a, b));
		});
	});

	describe('add', function () {
		it('adds correctly', async function () {
			const a = new BigNumber(5678);
			const b = new BigNumber(1234);

			(await sut.add(a, b)).should.be.bignumber.equal(a.plus(b));
		});

		it('throws a revert error on addition overflow', async function () {
			const a = MAX_UINT256;
			const b = new BigNumber(1);

			await assertRevert(sut.add(a, b));
		});
	});

});