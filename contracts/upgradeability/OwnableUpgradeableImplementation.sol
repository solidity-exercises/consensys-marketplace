pragma solidity 0.4.24;

import './SharedStorage.sol';
import '../ownership/NotInitedOwnable.sol';


/**
 * @title OwnableUpgradeableImplementation
 * @dev Assembling contract of the ownable upgradeable funcionality.
 * @notice Inspired by https://medium.com/limechain/smart-contract-upgradeability-ee3d43dde96c
 */
contract OwnableUpgradeableImplementation is SharedStorage, NotInitedOwnable {
	
	event LogUpgradedContract(address indexed newImplementation);

	/**
	 * @dev Allows the current owner to upgrade the implementation
	 * to which the `Forwardable` contract delegates calls.
	 * @param _newImplementation The address of the new implementation.
	 */
	function upgradeImplementation(address _newImplementation) public onlyOwner {
		require(_newImplementation != address(0), '_newImplementation can not be 0');
		emit LogUpgradedContract(_newImplementation);
		contractImplementation = _newImplementation;
	}
}