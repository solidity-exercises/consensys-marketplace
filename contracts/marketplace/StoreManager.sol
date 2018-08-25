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

	modifier onlySpecifiedStore(address _owner,
		uint16 _i) {
		require(msg.sender == stores[_owner][_i], 'The msg sender must be the specified store!');
		_;
	}

	function transferStoreOwnership
	(
		address _storeOwner,
		uint16 _storeIndex,
		address _newStoreOwner,
		uint16 _newOwnerStoreIndex
	)
		external
		nonZeroAddress(_storeOwner)
		storeIndexInRange(_storeOwner, _storeIndex)
		onlySpecifiedStore(_storeOwner, _storeIndex)
		nonZeroAddress(_newStoreOwner)
	{
		uint256 len = stores[_newStoreOwner].length;

		require(_newOwnerStoreIndex <= len, 'New owner store index out of range!');
		require(len <= MAX_OWNER_STORES, 'You have hit the stores per owner max limit!');

		delete stores[_storeOwner][_storeIndex];
		
		if (_newOwnerStoreIndex == len) {
			if (len == 0) {
				storeOwners.push(_newStoreOwner);
			}
			stores[_newStoreOwner].push(msg.sender);
			return;
		}

		require(stores[_newStoreOwner][_newOwnerStoreIndex] == address(0), 'The specified index in the stores array is taken!');

		stores[_newStoreOwner][_newOwnerStoreIndex] = msg.sender;
	}
	
	function approveStore(bool _isApproved, uint16 _indexInStoresArray) public onlyOwner checkRequestIndex {
		// If not approved -> continue to next request
		if (!_isApproved) {
			nextRequestIndex++;
			return;
		}

		// Get the current request's store owner
		address requestOwner = storeRequests[nextRequestIndex].owner;

		// Get reference to the current request store owner's stores
		address[] storage ownerStores = stores[requestOwner];

		uint256 len = ownerStores.length;

		require(_indexInStoresArray <= len, 'Index in stores array out of range!');
		require(len <= MAX_OWNER_STORES, 'You have hit the stores per owner max limit!');

		// Create the new store and assign it's owner.
		address newStore = StoreFactory.createStore(requestOwner);

		// Increment the request index pointer.
		nextRequestIndex++;

		// If the passed index is equal
		// to the length of the stores array
		// -> push the new store
		if (_indexInStoresArray == len) {
			ownerStores.push(newStore);
			return;
		}

		// If the owner has specified index in the stores array
		// lower than it's length, but it is non-empty -> revert
		require(ownerStores[_indexInStoresArray] != address(0), 'The specified index in the stores array is taken!');

		// If the owner has specified index in the stores array
		// lower than it's length and it is empty -> set the 
		// new store at the specified index.
		ownerStores[_indexInStoresArray] = newStore;
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
	{
		address storeAddress = stores[_storeOwner][_storeIndex];
		require(stores[_storeOwner][_storeIndex] != address(0), 'Specified store does not exist anymore!');

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
		nonZeroAmount(_amount)
	{
		address storeAddress = stores[_storeOwner][_storeIndex];
		require(stores[_storeOwner][_storeIndex] != address(0), 'Specified store does not exist anymore!');
		
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