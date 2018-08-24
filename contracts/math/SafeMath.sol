pragma solidity 0.4.24;


/**
 * @title SafeMath
 * @dev Math operations with safety checks that revert on error
 */
library SafeMath {
	/**
	* @dev Subtracts uint16 two numbers, reverts on overflow (i.e. if subtrahend is greater than minuend).
	*/
	function sub16(uint16 _a, uint16 _b) internal pure returns (uint16) {
		require(_b <= _a, 'Sub operation underflowed!');
		uint16 c = _a - _b;

		return c;
	}

	/**
	* @dev Adds two uint16 numbers, reverts on overflow.
	*/
	function add16(uint16 _a, uint16 _b) internal pure returns (uint16) {
		uint16 c = _a + _b;
		require(c >= _a, 'Add operation overflowed!');

		return c;
	}

	/**
	* @dev Multiplies two uint256 numbers, reverts on overflow.
	*/
	function mul(uint256 _a, uint256 _b) internal pure returns (uint256) {
		// Gas optimization: this is cheaper than requiring 'a' not being zero, but the
		// benefit is lost if 'b' is also tested.
		// See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
		if (_a == 0) {
			return 0;
		}

		uint256 c = _a * _b;
		require(c / _a == _b, 'Mul operation overflowed!');

		return c;
	}

	/**
	* @dev Subtracts two uint256 numbers, reverts on overflow (i.e. if subtrahend is greater than minuend).
	*/
	function sub(uint256 _a, uint256 _b) internal pure returns (uint256) {
		require(_b <= _a, 'Sub operation underflowed!');
		uint256 c = _a - _b;

		return c;
	}

	/**
	* @dev Adds two uint256 numbers, reverts on overflow.
	*/
	function add(uint256 _a, uint256 _b) internal pure returns (uint256) {
		uint256 c = _a + _b;
		require(c >= _a, 'Add operation overflowed!');

		return c;
	}
}