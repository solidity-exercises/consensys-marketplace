pragma solidity 0.4.24;

/**
 * @title IMarketplace
 * @dev Interface to the marketplace's transferStoreOwnership
 * function used for transferring stores ownership
 */
interface IMarketplace {
	function transferStoreOwnership(address _storeOwner, uint16 _storeIndex, address _newStoreOwner, uint16 _newOwnerStoreIndex) external;
}


/**
 * @title StoreOwnable
 * @dev The StoreOwnable contract holds owner and marketplace addresses,
 * and provides basic authorization control and control transferring
 * functionality.
 */
contract StoreOwnable {

	event LogOwnershipTransferRequested(address indexed currentOwner, address indexed ownerCandidate, uint256 storeIndex);
	event LogOwnershipTransferred(address indexed previousOwner, address indexed newOwner);

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
	* @param _storeIndex The index of the current store to be transferred.
	*/
	function requestOwnershipTransfer(address _ownerCandidate, uint256 _storeIndex) public onlyOwner {
		emit LogOwnershipTransferRequested(owner, _ownerCandidate, _storeIndex);
		ownerCandidate = _ownerCandidate;
		storeIndex = _storeIndex;
	}

	/**
	* @dev Allows owner candidate to approve the ownership of the contract.
	* @param _newStoreIndex The index at which the new store to be set
	* in the new owner's stores array.
	*/
	function approveOwnershipTransfer(uint16 _newStoreIndex) public onlyOwnerCandidate {
		emit LogOwnershipTransferred(owner, ownerCandidate);

		IMarketplace m = IMarketplace(marketplace);
		m.transferStoreOwnership(owner, uint16(storeIndex), ownerCandidate, _newStoreIndex);

		owner = ownerCandidate;
	}
}