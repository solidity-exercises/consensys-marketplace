const TestProxy = artifacts.require("./UpgradeableProxy.sol");
const Implementation = artifacts.require("./Implementation.sol");
const Implementation2 = artifacts.require("./Implementation2.sol");
const IImplementation = artifacts.require("./IImplementation.sol");
const IUpgradeableImplementation = artifacts.require("./IOwnableUpgradeableImplementation.sol");
const assertRevert = require('../utils/test.util').assertRevert;

contract('UpgradeableProxy', function ([coinbase, another]) {

	let implementedContract;
	let proxy;
	let impl;
	let impl2;

	describe("First contract", () => {
		beforeEach(async function () {
			impl = await Implementation.new();
			proxy = await TestProxy.new(impl.address);
			implementedContract = await IImplementation.at(proxy.address);
			await implementedContract.init();
		});

		it("should be able to call getter method of the first contract", async function () {
			// Arrange
			// Act
			const num = await implementedContract.getNum.call();
			// Assert
			assert(num.eq(1000), "The getNum did not return correctly");
		});

		it("should be able to call setter method of the first contract", async function () {
			// Arrange
			await implementedContract.setRate(43);
			// Act
			const rate = await implementedContract.rate.call();
			// Assert
			assert(rate.eq(43), "The rate did not return correctly");
		});

		it("should set the owner of the first contract", async function () {
			// Arrange
			// Act
			const owner = await implementedContract.owner.call();
			// Assert
			assert.strictEqual(coinbase, owner, "Owner not set correctly");
		});
	});

	describe("Updated contract", () => {
		beforeEach(async function () {
			impl = await Implementation.new();
			impl2 = await Implementation2.new();
			proxy = await TestProxy.new(impl.address);
			implementedContract = await IImplementation.at(proxy.address);
			await implementedContract.init();
		});

		it("should be able to upgrade contract", async function () {
			// Arrange
			const firstNum = await implementedContract.getNum.call();
			const upgradeableContract = await IUpgradeableImplementation.at(proxy.address);
			// Act
			await upgradeableContract.upgradeImplementation(impl2.address);
			const secondNum = await implementedContract.getNum.call();
			// Assert
			assert(firstNum.eq(1000), "The firstNum did not return correctly");
			assert(secondNum.eq(2000), "The secondNum did not return correctly");
		});

		it("should be able to read from the upgraded contract", async function () {
			// Arrange
			await implementedContract.setRate(43);
			const rate = await implementedContract.rate.call();
			// Act
			assert(rate.eq(43), "The first rate was not set correctly");
			const upgradeableContract = await IUpgradeableImplementation.at(proxy.address);
			await upgradeableContract.upgradeImplementation(impl2.address);
			const rate2 = await implementedContract.rate.call();
			// Assert
			assert(rate2.eq(43), "The second rate was not set correctly");
		});

		it("should throw on upgrade contract from not owner", async function () {
			// Arrange
			// Act
			const upgradeableContract = await IUpgradeableImplementation.at(proxy.address);
			// Assert
			await assertRevert(upgradeableContract.upgradeImplementation(impl2.address, { from: another }));
		});
	});

});