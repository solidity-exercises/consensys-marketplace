pragma solidity ^0.4.24;

import '../ownership/StoreOwnable.sol';


/**
 * @title Pausable
 * @dev Base contract which allows children to implement an emergency stop mechanism.
 */
contract Pausable is StoreOwnable {
	event Pause();
	event Unpause();

	bool public paused = false;

	/**
	* @dev Modifier to make a function callable only when the contract is not paused.
	*/
	modifier whenNotPaused() {
		require(!paused, "The contract must not be paused!");
		_;
	}

	/**
	* @dev called by the owner to pause, triggers stopped state
	*/
	function pause() public onlyOwner whenNotPaused {
		paused = true;
		emit Pause();
	}

	/**
	* @dev called by the owner to unpause, returns to normal state
	*/
	function unpause() public onlyOwner {
		paused = false;
		emit Unpause();
	}
}