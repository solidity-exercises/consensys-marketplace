pragma solidity 0.4.24;

import '../upgradeability/OwnableUpgradeableImplementation.sol';


/**
 * @title MarketplaceManager
 * @dev Holds the main marketpace managing related business logic.
 * @notice All contracts on this inheritance chain are upgradeable.
 */
contract MarketplaceManager is OwnableUpgradeableImplementation {

	event LogOwnerWithdrawal(address to, uint256 amount);

	address[] public storeOwners;

	mapping (address=>address[]) public stores;

	modifier nonZeroAddress(address _a) {
		require(_a != address(0), 'Specified address must not be empty!');
		_;
	}

	modifier nonZeroAmount(uint256 _amount) {
		require(_amount > 0, 'Zero value transfers not allowed!');
		_;
	}

	/**
	* @dev Payable fallback function
	*/
	function() public payable {}
	
	/**
	* @dev Allows the current owner to withdraw funds from the marketplace.
	* @param _recipient The address to transfer the funds to.
	* @param _amount The amount of the funds transferred.
	*/
	function ownerWithdraw
	(
		address _recipient,
		uint256 _amount
	) 
		public
		onlyOwner
		nonZeroAddress(_recipient)
		nonZeroAmount(_amount)
	{
		require(_amount <= address(this).balance, 'Your balance is not sufficient!');

		emit LogOwnerWithdrawal(_recipient, _amount);

		_recipient.transfer(_amount);
	}
	
	/**
	* @dev Allows verifying whether the specified address
	* is a store owner.
	* @param _owner The address to be verified.
	* @return Boolean variable specifying whether the address
	* is owner's or not.
	*/
	function isStoreOwner(address _owner) public view returns (bool) {
		return stores[_owner].length != 0;
	}

	/**
	* @dev Allows returning the according stores
	* to the specified address.
	* @param _owner The address of which stores to get.
	* @return Array of addresses of stores.
	*/
	function getStoresByOwner(address _owner) public view returns (address[]) {
		return stores[_owner];
	}

	/**
	* @dev Allows returning all current store owners.
	* @return Array of addresses of store owners.
	*/
	function getStoreOwners() public view returns (address[]) {
		return storeOwners;
	}
}