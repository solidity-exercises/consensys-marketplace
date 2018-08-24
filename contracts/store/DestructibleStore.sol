pragma solidity 0.4.24;


import './Store.sol';


/**
 * @title DestructibleStore
 * @dev Contract that can be destroyed either 
 * by the owner or the marketplace.
 * All funds in contract will be sent to the owner,
 * except the taxes collected by the marketplace.
 */
contract DestructibleStore is Store {
	/**
	* @dev Transfers the current marketplace balance to the marketplace
	* and all other funds to the owner.
	* @notice Using send to prevent DoS by revert from the marketplace address.
	*/
	function destroy() public onlyOwnerOrMarketplace {
		/* solium-disable-next-line security/no-send */
		marketplace.send(marketplaceBalance);
		selfdestruct(owner);
	}
}