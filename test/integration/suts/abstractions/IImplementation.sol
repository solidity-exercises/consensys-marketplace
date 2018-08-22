pragma solidity 0.4.24;

import '../../../../contracts/abstractions/ISharedStorage.sol';
import '../../../../contracts/abstractions/INotInitedOwnable.sol';
import '../../../../contracts/abstractions/IOwnableUpgradeableImplementation.sol';


contract IImplementation is ISharedStorage, INotInitedOwnable, IOwnableUpgradeableImplementation {
	function rate() public view returns (uint);

    function setRate(uint r) public;

    function getNum() public pure returns (uint);
}