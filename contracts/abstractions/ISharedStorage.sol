pragma solidity 0.4.24;


/**
 * @title ISharedStorage
 * @dev Interface of the SharedStorage contract.
 */
interface ISharedStorage {
    function contractImplementation() external view returns (address);
}