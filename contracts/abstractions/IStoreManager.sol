pragma solidity 0.4.24;


/**
 * @title IStoreManager
 * @dev Interface of the StoreManager contract.
 */
interface IStoreManager {
	function nextRequestIndex() external view returns (uint256);

	function storeRequests(uint256 _index) external view returns (bytes32, address);

	function transferStoreOwnership (address _storeOwner, uint16 _storeIndex, address _newStoreOwner, uint16 _newOwnerStoreIndex) external;

	function requestStore(bytes32 _proposal) external;

	function approveStore(bool _isApproved, uint16 _indexInStoresArray) external;

	function revokeStore(address _storeOwner, uint16 _storeIndex) external;

	function withdrawFromStore(address _storeOwner, uint16 _storeIndex, uint256 _amount) external;
}