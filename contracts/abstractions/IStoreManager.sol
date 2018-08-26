pragma solidity 0.4.24;


/**
 * @title IStoreManager
 * @dev Interface of the StoreManager contract.
 */
interface IStoreManager {
	event LogStoreRequested(uint256 requestIndex);
	
	event LogStoreApproved(uint256 requestIndex, address indexed owner, address store);

	event LogStoreRevoked(address indexed owner, address indexed store);

	event LogStoreWithdrawal(address indexed store, uint256 amount);

	function nextRequestIndex() external view returns (uint256);

	function storeRequests(uint256 _index) external view returns (bytes32, address);
	/* solium-disable-next-line mixedcase */
	function MAX_OWNER_STORES() external view returns (uint24);

	function transferStoreOwnership (address _storeOwner, uint16 _storeIndex, address _newStoreOwner, uint16 _newOwnerStoreIndex) external;

	function requestStore(bytes32 _proposal) external;

	function approveStore(bool _isApproved, uint16 _indexInStoresArray) external;

	function revokeStore(address _storeOwner, uint16 _storeIndex) external;

	function withdrawFromStore(address _storeAddress, uint256 _amount) external;
}