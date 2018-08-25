pragma solidity 0.4.24;

import '../store/DestructibleStore.sol';


/**
 * @title StoreFactory
 * @dev Library used to create new store instances.
 */
library StoreFactory {
	/**
	* @dev Creates new store instance.
	* @param _storeOwner The owner of the new store instance.
	* @return Address of the new store.
	*/
	function createStore(address _storeOwner) internal returns (address) {
		DestructibleStore store = new DestructibleStore(_storeOwner);
		return store;
	}
}