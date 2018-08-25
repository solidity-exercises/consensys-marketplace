pragma solidity 0.4.24;

import './MarketplaceManager.sol';
import './StoreFactory.sol';


/**
 * @title IStore
 * @dev Interface to the stores marketplace-related
 * functionality which is used by the StoreManager contract
 */
interface IStore {
	function destroy() external;

	function owner() external view returns (address);

	function marketplaceWithdraw(uint256 _amount) external;

	function marketplaceBalance() external view returns (uint256);
}


/**
 * @title StoreManager
 * @dev Holds the main marketpace store-managing related business logic.
 * @notice All contracts on this inheritance chain are upgradeable.
 */
contract StoreManager is MarketplaceManager {
	/**
	* @dev StoreRequest structure holding
	* the bytes32 IPFS hash of the proposal file or folder
	* and the owner to be set if the store is approved.
	* @notice The FIFO manner of request processing
	* guarantees that no copied/stolen proposal will 
	* be processed before the original one.
	*/
	struct StoreRequest {
		bytes32 proposal;
		address owner;
	}

	uint256 public nextRequestIndex;

	StoreRequest[] public storeRequests;

	/**
	* @dev Artificial upper limit of the
	* owner's stores array size.
	*/
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

	/**
	* @dev Provides with transferring store ownership functionality.
	* @param _storeOwner The current store owner.
	* @param _storeIndex The current store index in the
	* store owner's stores array.
	* @param _newStoreOwner The address to recieve ownership.
	* @param _newOwnerStoreIndex The index at which to put the new store
	* in the new store owner's stores array.
	* @notice Allows the owners to specify an empty index at which to push
	* the new store in order to fill the deleted stores blank spaces
	*/
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

		// Remove the store from the current
		// owner stores array.
		delete stores[_storeOwner][_storeIndex];
		
		// If the specified index is equal to the length of
		// the new owner's stores array -> push the new store
		if (_newOwnerStoreIndex == len) {
			// If new owner's stores array length == 0 ->
			// push new owner to the store owners array
			if (len == 0) {
				storeOwners.push(_newStoreOwner);
			}
			stores[_newStoreOwner].push(msg.sender);
			return;
		}

		// If the new owner has specified index in the stores array
		// lower than it's length, but it is non-empty -> revert
		require(stores[_newStoreOwner][_newOwnerStoreIndex] == address(0), 'The specified index in the stores array is taken!');

		// If the new owner has specified index in the stores array
		// lower than it's length and it is empty -> set the 
		// new store at the specified index.
		stores[_newStoreOwner][_newOwnerStoreIndex] = msg.sender;
	}

	/**
	* @dev Allows users to request a store.
	* @param _proposal Hexadecimal representation of an IPFS hash of
	* file or folder holding the proposal materials.
	* @notice The proposal argument is a processed hexadecimal
	* representation of the default IPFS SHA-256 hash with removed prefix.
	*/
	function requestStore(bytes32 _proposal) public {
		require(_proposal != 0x0, 'Store request proposal can not be empty!');

		storeRequests.push(StoreRequest({ proposal: _proposal, owner: msg.sender }));
	}

	/**
	* @dev Allows marketpalce owner to approve store proposals.
	* @param _isApproved Specifies whether the
	* current store proposal is approved.
	* @param _indexInStoresArray The index at which to put the
	* new store in the store proposal owner's stores array if approved.
	* @notice The store requests are processed in FIFO manner.
	*/
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
	
	/**
	* @dev Allows the marketplace to delete store and
	* call it's `destruct` function.
	* @param _storeOwner The store owner of whom
	* to revoke store.
	* @param _storeIndex The store index in the
	* store owner's stores array.
	*/
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

		// Check whether the store is destructed.
		address owner = store.owner();
		assert(owner == address(0));

		delete stores[_storeOwner][_storeIndex];
	}
	
	/**
	* @dev Allows the marketplace to withdraw funds
	* from stores back to the marketplace.
	* @param _storeOwner The store owner of whom's
	* store to withdraw.
	* @param _storeIndex The store index in the
	* store owner's stores array.
	* @param _amount The amount of the funds
	* to be withdrawed.
	*/
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