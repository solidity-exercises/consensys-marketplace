pragma solidity 0.4.24;


/**
 * @title IMarketplaceManager
 * @dev Interface of the MarketplaceManager contract.
 */
interface IMarketplaceManager {
	function storeOwners(uint256 index) external view returns (address);

	function stores(address owner, uint256 index) external view returns (address);

    function() external payable;

	function ownerWithdraw(address _recipient, uint256 _amount) external;

    function isStoreOwner(address _owner) external view returns (bool);

	function getStoresByOwner(address _owner) external view returns (address[]);

	function getStoreOwners() external view returns (address[]);
}