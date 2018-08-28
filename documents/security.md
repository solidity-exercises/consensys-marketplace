The contract is thoroughly tested and has achieved **~100% test coverage**. [SmartCheck](https://tool.smartdec.net/) security tool has been used to check the implementations and the `solium` linter uses `security` plugin. All of the implementations adhere to the `Checks, Effects, Interactions` pattern and `Circuit Breaker` pattern is implemented. Both Marketplace and Store implementations favor   `Pull(withdraw) over Push`, to avoid passing the call to external contract.
Arrange, Act, Assert pattern is used for the tests.
[source](https://fravoll.github.io/solidity-patterns/)
Behavioral Patterns implemented:
	- Guard Check: Ensure that the behavior of a smart contract and its input parameters are as expected.
Security patterns implemented:
	- Access Restriction: Restrict the access to contract functionality according to suitable criteria.
	- Checks Effects Interactions: Reduce the attack surface for malicious contracts trying to hijack control flow after an external call.
	- Pull over Push: Shift the risk associated with transferring ether to the user.
	- Emergency Stop: Add an option to disable critical contract functionality in case of an emergency.

Some more custom things to note: 
	- The `DestructibleStore` contract uses `marketplace.send()` instead of `.transfer()` to prevent DOS by revert from the marketplace contract.
	- In `Store` contract are implemented both `increaseQuantity` and `decreaseQuantity` functions, in order to prevent race conditions, if it was `setQuantity` instead.
	- In `StoreManager` the FIFO manner of request processing of the store requests guarantees that no copied/stolen proposal will be processed before the original one.
	- In `StoreManager` when making external calls there are assertions and the effects are checked in the current contract. 