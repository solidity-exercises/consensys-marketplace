pragma solidity 0.4.24;

import './Implementation.sol';

contract Implementation2 is Implementation {
    function getNum() public pure returns (uint) {
        return 2000;
    }
}