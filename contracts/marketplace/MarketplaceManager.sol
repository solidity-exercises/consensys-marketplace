pragma solidity 0.4.24;

import '../upgradeability/OwnableUpgradeableImplementation.sol';


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

	function () public payable {}
	
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
	
	function isStoreOwner(address _owner) public view returns (bool) {
		return stores[_owner].length != 0;
	}

	function getStoresByOwner(address _owner) public view returns (address[]) {
		return stores[_owner];
	}

	function getStoreOwners() public view returns (address[]) {
		return storeOwners;
	}
}