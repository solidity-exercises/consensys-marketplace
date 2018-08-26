pragma solidity 0.4.24;

import './MarketplaceStore.sol';


/**
 * @title Store
 * @dev Holds the main store-related
 * business logic.
 */
contract Store is MarketplaceStore {
	/**
	* @dev Using SafeMath's library 
	* operations with safety checks against
	* underflow and overflow.
	*/
	using SafeMath for uint16;
	
	/**
	* @dev Artificial upper limit of the
	* products array size.
	*/
	uint24 public constant MAX_STORE_PRODUCTS = 65536;

	event LogProductAdded(uint256 index, bytes30 description);
	event LogProductUpdated
	(
		uint256 index,
		bytes30 description,
		uint16 quantity,
		uint256 price
	);
	event LogProductRemoved(uint256 index);
	event LogProductPriceSet(uint256 index, uint256 newPrice);
	event LogOwnerWithdrawal(address to, uint256 amount);
	event LogPurchase
	(
		uint256 index,
		uint256 quantitySold,
		uint256 salePrice
	);

	/**
	* @dev Product structure designed
	* to pack tightly into 2 storage slots.
	* @notice The price supports 18 decimals ETH-like.
	* @notice The price is per 1 quantity of the product.
	*/
	struct Product {
		bytes30 description;
		uint16 quantity;
		uint256 price;
	}

	/**
	* @dev Array with auto-getter
	* holding all the products of the store.
	* @notice The products array is limited
	* to holding 2^16 products total.
	*/
	Product[] public products;

	/**
	* @dev The storefront encoded in 16x16 bits,
	* ocuppying exactly one storage slot,
	* representing up to 16 products using their
	* indices in the products array.
	*/
	uint16[16] public storefront;

	modifier productIndexInRange(uint16 _i) {
		require(_i < products.length, 'Index out of range!');
		_;
	}

	modifier hasDescription(bytes30 _description) {
		require(_description != 0x0, 'Description can not be blank!');
		_;
	}
	
	modifier nonEmptyRecipient(address _recipient) {
		require(_recipient != address(0), 'Withdraw recipient must not be empty!');
		_;
	}

	/**
	* @dev Constructor of the Store contract
	* which sets the owner and marketplace addresses.
	* @param _owner Address which will become owner of the contract.
	*/
	constructor(address _owner) public {
		require(_owner != address(0), 'Shop owner must be set!');

		owner = _owner;
		marketplace = msg.sender;
	}

	/**
	* @dev Payable fallback function
	*/
	function() public payable {}

	/**
	* @dev Allows the current owner to encode the storefront of the store.
	* @notice The storefront represents up to 16 products using their
	* indices in the products array.
	* @param _storefrontIndex The new encoded storefront.
	* @param _productIndex The new encoded storefront.
	*/
	function setStorefront(uint8 _storefrontIndex, uint16 _productIndex) public onlyOwner productIndexInRange(_productIndex) {
		require(_storefrontIndex < 16, 'Storefront index out of range!');
		storefront[_storefrontIndex] = _productIndex;
	}

	/**
	* @dev Allows the current owner to add a product to the array of products.
	* @param _description The bytes30 representation
	* of the description of the product .
	* @param _quantity The _quantity of the product.
	* @param _price The _price of the product.
	* @notice Zero price and quantity are intentionally
	* not forbidden as there might be
	* some business use cases using it (eg. pre-stock marketing).
	*/
	function addProduct
	(
		bytes30 _description,
		uint16 _quantity,
		uint256 _price
	)
		public
		onlyOwner
		hasDescription(_description)
	{
		uint256 len = products.length;

		require(len <= MAX_STORE_PRODUCTS, 'You have hit the products per store max limit!');

		emit LogProductAdded(len, _description);

		products.push(Product({description: _description, quantity: _quantity, price: _price}));
	}

	/**
	* @dev Allows the current owner to update a product at a given index of the array of products, including previously deleted products(empty indices).
	* @param _productIndex The index of the product in the products array.
	* @param _description The bytes30 representation
	* of the description of the product .
	* @param _quantity The _quantity of the product.
	* @param _price The _price of the product.
	* @notice Zero price and quantity are intentionally
	* not forbidden as there might be
	* some business use cases using it (eg. pre-stock marketing).
	*/
	function updateProduct
	(
		uint16 _productIndex,
		bytes30 _description,
		uint16 _quantity,
		uint256 _price
	) 
		public
		onlyOwner
		productIndexInRange(_productIndex)
		hasDescription(_description)
	{
		emit LogProductUpdated(_productIndex, _description, _quantity, _price);

		products[_productIndex] = Product({description: _description, quantity: _quantity, price: _price});
	}

	/**
	* @dev Allows the current owner to delete a product at a given index of the array of products.
	* @param _productIndex The index of the product in the products array.
	*/
	function removeProduct(uint16 _productIndex) public onlyOwner productIndexInRange(_productIndex) {
		emit LogProductRemoved(_productIndex);
		delete products[_productIndex];
	}

	/**
	* @dev Allows the current owner to set a price of a product.
	* @param _productIndex The index of the product in the products array.
	* @param _newPrice The new price of the product.
	* @notice Zero price is intentionally not forbidden as there might be
	* some business use cases using it (eg. sale).
	*/
	function setPrice(uint16 _productIndex, uint256 _newPrice) public onlyOwner productIndexInRange(_productIndex) {
		emit LogProductPriceSet(_productIndex, _newPrice);
		products[_productIndex].price = _newPrice;
	}

	/**
	* @dev Allows the current owner to increase the quantity of a product.
	* @param _productIndex The index of the product in the products array.
	* @param _increasement The amount to increase with.
	*/
	function increaseQuantity
	(
		uint16 _productIndex,
		uint16 _increasement
	)
		public
		onlyOwner
		productIndexInRange(_productIndex)
	{
		require(_increasement > 0, 'Increasement must be greater than 0!');
		products[_productIndex].quantity = products[_productIndex].quantity.add16(_increasement);
	}

	/**
	* @dev Allows the current owner to decrease the quantity of a product.
	* @param _productIndex The index of the product in the products array.
	* @param _decreasement The amount to decrease with.
	*/
	function decreaseQuantity
	(
		uint16 _productIndex,
		uint16 _decreasement
	)
		public
		onlyOwner
		productIndexInRange(_productIndex)
	{
		require(_decreasement > 0, 'Decreasement must be greater than 0!');
		products[_productIndex].quantity = products[_productIndex].quantity.sub16(_decreasement);
	}

	/**
	* @dev Allows the current owner to withdraw funds from the store.
	* @param _recipient The address to transfer the funds to.
	* @param _amount The amount of the funds transferred.
	*/
	function ownerWithdraw
	(
		address _recipient,
		uint256 _amount
	) 
		public
		onlyOwner
		nonEmptyRecipient(_recipient)
		nonZeroAmount(_amount)
	{
		require(_amount <= address(this).balance.sub(marketplaceBalance), 'Your balance is not sufficient!');

		emit LogOwnerWithdrawal(_recipient, _amount);

		_recipient.transfer(_amount);
	}

	/**
	* @dev Allows the customers to buy given quantity of a specific product.
	* @param _productIndex The index of the product in the products array.
	* @param _quantity The _quantity of the product.
	* @notice If there is a tip from the msg value it is not returned.
	*/
	function buy
	(
		uint16 _productIndex,
		uint16 _quantity
	)
		public
		payable
		whenNotPaused
		productIndexInRange(_productIndex)
	{
		require(_quantity > 0, 'Zero quantity purchase not allowed!');

		require(msg.value >= products[_productIndex].price.mul(_quantity), 'You have sent insufficient amount of funds!');

		emit LogPurchase(_productIndex, _quantity, msg.value);

		products[_productIndex].quantity = products[_productIndex].quantity.sub16(_quantity);

		marketplaceBalance = marketplaceBalance.add(msg.value / (MARKETPLACE_TAX_DENOMINATOR));
	}
}