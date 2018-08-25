pragma solidity 0.4.24;

import '../math/SafeMath.sol';
import '../lifecycle/Pausable.sol';


/**
 * @title Store
 * @dev Holds the main store-related
 * marketplace business logic.
 */
contract MarketplaceStore is Pausable {
	/**
	* @dev Using SafeMath's library 
	* operations with safety checks against
	* underflow and overflow.
	*/
	using SafeMath for uint256;

	event LogMarketplaceWithdrawal(uint256 amount);

	/**
	* @dev The marketplace will take 1/1000000 integer part
	* of every purchase.
	* @notice The customer has no incentive to accumulate only
	* low-value requests(less than 1Mwei), because they will
	* pay more for transaction gas costs.
	*/
	uint24 public constant MARKETPLACE_TAX_DENOMINATOR = 1000000;

	/**
	* @dev The accumulated balance of the marketplace which can
	* be withdrawed from it.
	*/
	uint256 public marketplaceBalance;

	modifier nonZeroAmount(uint256 _amount) {
		require(_amount > 0, 'Zero value transfers not allowed!');
		_;
	}

	/**
	* @dev Allows the marketplace to withdraw taxes from the store.
	* @param _amount The amount of the funds transferred.
	*/
	function marketplaceWithdraw
	(
		uint256 _amount
	) 
		public
		onlyMarketplace
		nonZeroAmount(_amount)
	{
		require(_amount <= marketplaceBalance, 'The marketplace balance is not sufficient!');

		emit LogMarketplaceWithdrawal(_amount);

		marketplaceBalance = marketplaceBalance.sub(_amount);

		marketplace.transfer(_amount);
	}
}