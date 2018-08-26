pragma solidity 0.4.24;


/**
 * @title IOwnableUpgradeableImplementation
 * @dev Interface of the OwnableUpgradeableImplementation contract.
 */
interface IOwnableUpgradeableImplementation {
	event LogUpgradedContract(address indexed newImplementation);

    function upgradeImplementation(address _newImplementation) external;
}