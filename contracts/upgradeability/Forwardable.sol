pragma solidity 0.4.24;


/**
 * @title Forwardable
 * @dev Contract responsible for delegating the calls.
 * @notice Inspired by https://medium.com/limechain/smart-contract-upgradeability-ee3d43dde96c
 */
contract Forwardable {
	/**
	* @dev Performs a delegatecall and returns whatever the delegatecall returned (entire context execution will return!)
	* @param _dst Destination address to perform the delegatecall
	*/
	function delegatedFwd(address _dst) internal {
		/* solium-disable-next-line security/no-inline-assembly */
		assembly {
			let ptr := mload(0x40)
			calldatacopy(ptr, 0, calldatasize)

			let result := delegatecall(gas, _dst, ptr, calldatasize, 0, 0)

			let size := returndatasize
			returndatacopy(ptr, 0, size)

			switch result
				case 0 {revert(ptr, size)}
				default {return (ptr, size)}
		}
	}
}