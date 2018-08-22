pragma solidity 0.4.24;


/**
 * @title StoreOwnable
 * @dev The StoreOwnable contract holds owner and marketplace addresses, and provides basic authorization control
 * functions, which simplifies the implementation of "user permissions".
 */
contract StoreOwnable {
	address public owner;
	address public ownerCandidate;
	address public marketplace;

	event OwnershipTransferRequested(address indexed currentOwner, address indexed ownerCandidate);
	event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

	/**
	* @dev Throws if called by any account other than the current owner.
	*/
	modifier onlyOwner() {
		require(msg.sender == owner, 'The msg sender must be the owner');
		_;
	}

	/**
	* @dev Throws if called by any account other than the owner candidate.
	*/
	modifier onlyOwnerCandidate() {
		require(msg.sender == ownerCandidate, 'The msg sender must be the owner candidate');
		_;
	}

	/**
	* @dev Throws if called by any account other than the marketplace.
	*/
	modifier onlyMarketplace() {
		require(msg.sender == marketplace, 'The msg sender must be the marketplace');
		_;
	}

	/**
	* @dev Allows the current owner to transfer control of the contract to a new owner, who has to approve the ownership.
	* @notice The requirement for non-zero address of the `_ownerCandidate`
	* is intentionally omitted due to the two-staged implementation.
	* @param _ownerCandidate The address to transfer ownership to.
	*/
	function requestOwnershipTransfer(address _ownerCandidate) public onlyOwner {
		emit OwnershipTransferRequested(owner, _ownerCandidate);
		ownerCandidate = _ownerCandidate;
	}

	/**
	* @dev Allows owner candidate to approve the ownership of the contract.
	*/
	function approveOwnershipTransfer() public onlyOwnerCandidate {
		emit OwnershipTransferred(owner, ownerCandidate);
		owner = ownerCandidate;
	}
}