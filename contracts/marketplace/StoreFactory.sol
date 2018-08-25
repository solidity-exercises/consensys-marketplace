pragma solidity 0.4.24;

import '../store/DestructibleStore.sol';


library StoreFactory {
	function createStore(address _storeOwner) internal returns (address) {
		DestructibleStore store = new DestructibleStore(_storeOwner);
		return store;
	}
}