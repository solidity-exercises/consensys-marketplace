pragma solidity 0.4.24;

import '../ownership/StoreOwnable.sol';


/**
 * @title Pausable
 * @dev Base contract which allows children to implement an emergency stop mechanism.
 */
contract Pausable is StoreOwnable {
	event LogPause();
	event LogUnpause();

	bool public paused = false;

	/**
	* @dev Modifier to make a function callable only when the contract is not paused.
	*/
	modifier whenNotPaused() {
		require(!paused, 'The contract must not be paused!');
		_;
	}

	/**
	* @dev called by the owner to pause, triggers stopped state
	*/
	function pause() public onlyOwner {
		emit LogPause();
		paused = true;
	}

	/**
	* @dev called by the owner to unpause, returns to normal state
	*/
	function unpause() public onlyOwner {
		emit LogUnpause();
		paused = false;
	}
}