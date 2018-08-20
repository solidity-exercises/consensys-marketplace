pragma solidity 0.4.24;


/**
 * @title NotInitedOwnable
 * @dev The NotInitedOwnable contract has an owner address,
 * and provides basic authorization control functions,
 * which simplifies the implementation of "user permissions".
 * @notice This contract needs to be inited after deployment for proper use.
 */
contract NotInitedOwnable {
	address public owner;

	event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

	/**
	 * @dev Reverts if called by any account other than the owner's.
	 */
	modifier onlyOwner() {
		require(msg.sender == owner, 'Sender is not an owner');
		_;
	}

	/**
	* @dev Initializes the msg sender as an owner account.
	*/
	function init() public {
		require(owner == address(0), 'Contract already has owner');
		owner = msg.sender;
	}

	/**
	 * @dev Allows the current owner to transfer control of the contract to a new owner.
	 * @param _newOwner The address to transfer ownership to.
	 */
	function transferOwnership(address _newOwner) public onlyOwner {
		require(_newOwner != address(0), '_newOwner address can not be 0');
		emit OwnershipTransferred(owner, _newOwner);
		owner = _newOwner;
	}
}