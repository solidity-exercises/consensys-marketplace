pragma solidity 0.4.24;


/**
 * @title SharedStorage
 * @dev Base contract holding the address of the contract implementation.
 * @notice Inspired by https://medium.com/limechain/smart-contract-upgradeability-ee3d43dde96c
 */
contract SharedStorage {
	address public contractImplementation;
}