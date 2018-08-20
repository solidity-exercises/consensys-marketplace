pragma solidity 0.4.24;

import './SharedStorage.sol';
import './Forwardable.sol';


/**
 * @title UpgradeableProxy
 * @dev Contract holding the state which serves as a proxy to
 * the current contract implementation.
 * @notice Inspired by https://medium.com/limechain/smart-contract-upgradeability-ee3d43dde96c
 */
contract UpgradeableProxy is SharedStorage, Forwardable {
	/**
	* @dev UpgradeableProxy is a proxy contract to a contract implementation. 
	* The implementation can update the reference, 
	* which effectively upgrades the contract.
	* @param _implementation Address of the contract used as implementation.
	*/
	constructor(address _implementation) public {
		contractImplementation = _implementation;
	}

	/**
	* @dev All calls made to the proxy are forwarded to
	* the contract implementation via a delegatecall.
	* @return Any bytes32 value the implementation returns.
	*/
	function() public payable {
		delegatedFwd(contractImplementation);
	}
}