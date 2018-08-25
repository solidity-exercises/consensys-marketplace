pragma solidity 0.4.24;


interface IMarketplace {
	function transferStoreOwnership(address _storeOwner, uint16 _storeIndex, address _newStoreOwner, uint16 _newOwnerStoreIndex) external;
}


/**
 * @title StoreOwnable
 * @dev The StoreOwnable contract holds owner and marketplace addresses, and provides basic authorization control
 * functions, which simplifies the implementation of "user permissions".
 */
contract StoreOwnable {

	event OwnershipTransferRequested(address indexed currentOwner, address indexed ownerCandidate, uint256 storeIndex);
	event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

	address public owner;
	address public marketplace;
	
	address public ownerCandidate;
	uint256 public storeIndex;

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
	* @dev Throws if called by any account other than
	* the owner or the marketplace.
	*/
	modifier onlyOwnerOrMarketplace() {
		require(msg.sender == owner || msg.sender == marketplace, 'The msg sender must be the owner or the marketplace');
		_;
	}

	/**
	* @dev Allows the current owner to transfer control of the contract to a new owner, who has to approve the ownership.
	* @notice The requirement for non-zero address of the `_ownerCandidate`
	* is intentionally omitted due to the two-staged implementation.
	* @param _ownerCandidate The address to transfer ownership to.
	*/
	function requestOwnershipTransfer(address _ownerCandidate, uint256 _storeIndex) public onlyOwner {
		emit OwnershipTransferRequested(owner, _ownerCandidate, _storeIndex);
		ownerCandidate = _ownerCandidate;
		storeIndex = _storeIndex;
	}

	/**
	* @dev Allows owner candidate to approve the ownership of the contract.
	*/
	function approveOwnershipTransfer(uint16 _newStoreIndex) public onlyOwnerCandidate {
		emit OwnershipTransferred(owner, ownerCandidate);

		IMarketplace m = IMarketplace(marketplace);

		m.transferStoreOwnership(owner, uint16(storeIndex), ownerCandidate, _newStoreIndex);

		owner = ownerCandidate;
	}
}