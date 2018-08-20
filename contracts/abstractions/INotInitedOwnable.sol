pragma solidity 0.4.24;


/**
 * @title INotInitedOwnable
 * @dev Interface of the NotInitedOwnable contract.
 */
interface INotInitedOwnable {
    function owner() external view returns (address);

    function init() external;

    function transferOwnership(address _newOwner) external;
}