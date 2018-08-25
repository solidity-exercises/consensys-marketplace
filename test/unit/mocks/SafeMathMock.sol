pragma solidity ^0.4.24;

import '../../../contracts/math/SafeMath.sol';


contract SafeMathMock {
	function sub16(uint16 _a, uint16 _b) public pure returns (uint16) {
		return SafeMath.sub16(_a, _b);
	}

	function add16(uint16 _a, uint16 _b) public pure returns (uint16) {
		return SafeMath.add16(_a, _b);
	}

	function mul(uint256 _a, uint256 _b) public pure returns (uint256) {
		return SafeMath.mul(_a, _b);
	}

	function sub(uint256 _a, uint256 _b) public pure returns (uint256) {
		return SafeMath.sub(_a, _b);
	}

	function add(uint256 _a, uint256 _b) public pure returns (uint256) {
		return SafeMath.add(_a, _b);
	}
}