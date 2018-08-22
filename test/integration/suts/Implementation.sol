pragma solidity 0.4.24;

import "../../../contracts/upgradeability/OwnableUpgradeableImplementation.sol";


contract Implementation is OwnableUpgradeableImplementation {

    uint public rate;

    function setRate(uint r) public {
        rate = r;
    }

    function getNum() public pure returns (uint) {
        return 1000;
    }
}