pragma solidity 0.4.24;


/**
 * @title IOwnableUpgradeableImplementation
 * @dev Interface of the OwnableUpgradeableImplementation contract.
 */
interface IOwnableUpgradeableImplementation {
    function upgradeImplementation(address _newImplementation) external;
}