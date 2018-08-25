pragma solidity 0.4.24;

import './MarketplaceManager.sol';
import './StoreFactory.sol';

interface IStore {
	function destroy() external;

	function owner() external view returns (address);

	function marketplaceWithdraw(uint256 _amount) external;

	function marketplaceBalance() external view returns (uint256);
}


contract StoreManager is MarketplaceManager {
	struct StoreRequest {
		bytes32 proposal;
		address owner;
	}

	uint256 public nextRequestIndex;

	StoreRequest[] public storeRequests;

	uint24 public constant MAX_OWNER_STORES = 65536;

	modifier checkRequestIndex() {
		require(nextRequestIndex < storeRequests.length, 'Requests queue is empty!');
		_;
	}

	modifier storeIndexInRange(address _owner, uint16 _i) {
		require(_i < stores[_owner].length, 'Index out of range!');
		_;
	}

	modifier storeExists(address _owner, uint16 _i) {
		require(stores[_owner][_i] != address(0), 'Specified store does not exist anymore!');
		_;
	}
	
	function approveStore(bool _isApproved, uint16 _indexInStoresArray) public onlyOwner checkRequestIndex {
		// If not approved -> continue to next request
		if (!_isApproved) {
			nextRequestIndex++;
			return;
		}

		// Get the current request's store owner
		address requestOwner = storeRequests[nextRequestIndex].owner;

		// Get the current request store owner's stores
		address[] storage ownerStores = stores[requestOwner];

		uint256 len = ownerStores.length;

		require(_indexInStoresArray < len || (len == 0 && _indexInStoresArray == 0), 'Index in stores array out of range!');
		require(len <= MAX_OWNER_STORES, 'You have hit the stores per owner max limit!');

		// If the owner has specified index in the stores array
		// but it is non-empty -> revert
		if (_indexInStoresArray != 0 && ownerStores[_indexInStoresArray] != address(0)) {
			revert('The specified index in the stores array is taken!');
		}

		// Create the new store and assign it's owner.
		address newStore = StoreFactory.createStore(requestOwner);

		// Increment the request index pointer.
		nextRequestIndex++;

		if (_indexInStoresArray != 0) {
			// Index is specified
			// and it is already
			// checked that it is
			// empty -> add new store to index
			ownerStores[_indexInStoresArray] = newStore;
			return;
		}

		// The index in the stores
		// is 0 and the length of the
		// stores is 0 -> push new store
		if (len == 0) {
			ownerStores.push(newStore);
			return;
		}

		// The length of the stores
		// is not 0, but the store
		// at the 0 index has been
		// deleted(is empty) ->
		// add new store to index
		if (ownerStores[0] == address(0)) {
			ownerStores[0] = newStore;
			return;
		}

		// Length is not 0,
		// zero index is not empty
		// -> push new store
		// (interpret index as
		// optional parameter)
		ownerStores.push(newStore);
	}
	
	function revokeStore
	(
		address _storeOwner,
		uint16 _storeIndex
	)
		public
		onlyOwner
		nonZeroAddress(_storeOwner)
		storeIndexInRange(_storeOwner, _storeIndex)
		storeExists(_storeOwner, _storeIndex)
	{
		address storeAddress = stores[_storeOwner][_storeIndex];
		IStore store = IStore(storeAddress);

		store.destroy();

		address owner = store.owner();
		assert(owner == address(0));

		delete stores[_storeOwner][_storeIndex];
	}
	
	function withdrawFromStore
	(
		address _storeOwner,
		uint16 _storeIndex,
		uint256 _amount
	)
		public
		onlyOwner
		nonZeroAddress(_storeOwner)
		storeIndexInRange(_storeOwner, _storeIndex)
		storeExists(_storeOwner, _storeIndex)
		nonZeroAmount(_amount)
	{
		address storeAddress = stores[_storeOwner][_storeIndex];
		IStore store = IStore(storeAddress);

		// Get the current balances
		uint256 currentMarketplaceBalance = address(this).balance;
		uint256 currentStoreMarketplaceBalance = store.marketplaceBalance();

		require(_amount >= currentStoreMarketplaceBalance, 'Marketplace Store Balance too small to withdraw!');

		store.marketplaceWithdraw(_amount);

		uint256 newMarketplaceBalance = address(this).balance;
		uint256 newStoreMarketplaceBalance = store.marketplaceBalance();

		// Assert that the new balances 
		// have changed in the expected
		// direction after withdrawal
		assert(newMarketplaceBalance >= currentMarketplaceBalance + _amount);
		assert(newStoreMarketplaceBalance >= currentStoreMarketplaceBalance - _amount);
	}
}