pragma solidity 0.4.24;

import './ISharedStorage.sol';
import './INotInitedOwnable.sol';
import './IOwnableUpgradeableImplementation.sol';
import './IMarketplaceManager.sol';
import './IStoreManager.sol';


/**
 * @title Aggregated
 * @dev Represents the aggregated abstraction
 * in the form of abstract contract
 * to communicate with the marketlace.
 */
/* solium-disable-next-line no-empty-blocks */
contract Aggregated is ISharedStorage, INotInitedOwnable, IOwnableUpgradeableImplementation, IMarketplaceManager, IStoreManager {}