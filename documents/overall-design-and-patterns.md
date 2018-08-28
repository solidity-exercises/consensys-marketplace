The whole implementation adheres to the security principles known, **~100% test coverage** is achieved.
The Marketplace is an **Upgradable** implementation using the **Proxy Delegate** pattern.
The Store contracts use Mortal(Destructible design pattern).
Libraries are used for `SafeMath` operations and for instantiation of new store contracts - `SafeMath` and `StoreFactory`.
There is upper limit on all dynamic arrays.
The pragmas are locked to specific compiler version.
The approve/upgrade/transferOwnership operations in the contracts get additional index param, which can put the product/owner/store at already used, but deleted/revoked index, in this manner the empty spaces are filled, instead of pushing new elements to the arrays.
For store proposal IPFS is used, and only the processed hash to bytes32 is saved, so this is a great optimization in the means of storage/space.
Factory pattern is used for new Stores.
Product structure designed to pack tightly exactly into 2 storage slots.
The storefront of the Stores contracts is encoded in 16x16 bits, ocuppying exactly one storage slot, representing up to 16 products using their indices in the products array.
The code is well documented.
The project uses git-flow, CI with travis, and code coverage with coveralls/solidity-coverage.

[source](https://fravoll.github.io/solidity-patterns/)
Behavioral Patterns implemented:
	- Guard Check: Ensure that the behavior of a smart contract and its input parameters are as expected.
	- State Machine: Enable a contract to go through different stages with different corresponding functionality exposed.
Security patterns implemented:
	- Access Restriction: Restrict the access to contract functionality according to suitable criteria.
	- Checks Effects Interactions: Reduce the attack surface for malicious contracts trying to hijack control flow after an external call.
	- Pull over Push: Shift the risk associated with transferring ether to the user.
	- Emergency Stop: Add an option to disable critical contract functionality in case of an emergency.
Upgradeability Patterns:
	- Proxy Delegate: Introduce the possibility to upgrade smart contracts without breaking any dependencies.
Economy patterns implemented:
	- String Equality Comparison: Check for the equality of two provided strings in a way that minimizes average gas consumption for a large number of different inputs.
	- Tight Variable Packing: Optimize gas consumption when storing or loading statically-sized variables.