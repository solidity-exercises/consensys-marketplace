import { Injectable } from '@angular/core';
import { Web3Service } from './web3.service';
import { Contract, TransactionReceipt } from 'web3/types';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment';
import { IpfsService } from './ipfs.service';

const storeAbi = require('../../../store-abi.json')['store'];
@Injectable()
export class ContractService {
	private _marketplace: Contract;

	constructor(private _web3Service: Web3Service, private _ipfsService: IpfsService, private _toastr: ToastrService) {
		this._initContract();
	}

	public async getMarketplaceOwner() {
		return await this._marketplace.methods.owner().call();
	}

	public async isMarketplaceOwnerOperating(fromAccount) {
		const owner = await this._marketplace.methods.owner().call();
		return owner === fromAccount;
	}

	public async isStoreOwnerOperating(fromAccount) {
		return this._marketplace.methods.isStoreOwner(fromAccount).call();
	}

	public async requestStore(proposal) {
		await this._checkContract();

		const from = await this._web3Service.getFromAccount();

		const isOwner = await this.isMarketplaceOwnerOperating(from);

		if (!isOwner) {
			this._toastr.error(`${from} account is not marketplace owner!`);
			return;
		}

		const processed = await this._ipfsService.add(proposal);

		const gas = await this._marketplace.methods
			.requestStore(processed)
			.estimateGas({ from: from });

		return this._marketplace.methods
			.requestStore(processed)
			.send({ from: from, gas: gas * 2 })
			.on('transactionHash', (hash: string) => {
				this._toastr.info(`Store request with proposal ${processed} transaction hash is ${hash}.`);
			})
			.on('confirmation', (confirmationNumber: number, receipt: TransactionReceipt) => {
				if (confirmationNumber === 12) {
					this._toastr.success(`Store request transaction ${receipt.transactionHash} has reached 12 confirmations!`);
				}
			})
			.on('error', (err: string) => {
				this._toastr.error(`Could not request store with proposal ${processed}`);
				console.error(err);
			});
	}

	public async approveStore(isApproved: boolean, indexInStoresArray) {
		await this._checkContract();

		const from = await this._web3Service.getFromAccount();

		const isOwner = await this.isMarketplaceOwnerOperating(from);

		if (!isOwner) {
			this._toastr.error(`${from} account is not marketplace owner!`);
			return;
		}

		const gas = await this._marketplace.methods
			.approveStore(isApproved, indexInStoresArray)
			.estimateGas({ from: from });

		return this._marketplace.methods
			.approveStore(isApproved, Number(indexInStoresArray))
			.send({ from: from, gas: gas * 2 })
			.on('transactionHash', (hash: string) => {
				this._toastr.info(`Store approval transaction hash is ${hash}.`);
			})
			.on('confirmation', (confirmationNumber: number, receipt: TransactionReceipt) => {
				if (confirmationNumber === 12) {
					this._toastr.success(`Store approval transaction ${receipt.transactionHash} has reached 12 confirmations!`);
				}
			})
			.on('error', (err: string) => {
				this._toastr.error(`Could not approve store!`);
				console.error(err);
			});
	}

	public async revokeStore(ownerAddress: string, storeIndex) {
		const owner = this._web3Service.getChecksumAddress(ownerAddress);

		if (!owner) {
			this._toastr.error(`${ownerAddress} account is not valid!`);
			return;
		}

		await this._checkContract();

		const from = await this._web3Service.getFromAccount();

		const isOwner = await this.isMarketplaceOwnerOperating(from);

		if (!isOwner) {
			this._toastr.error(`${from} account is not marketplace owner!`);
			return;
		}

		const gas = await this._marketplace.methods
			.revokeStore(owner, storeIndex)
			.estimateGas({ from: from });

		return this._marketplace.methods
			.revokeStore(owner, storeIndex)
			.send({ from: from, gas: gas * 2 })
			.on('transactionHash', (hash: string) => {
				this._toastr.info(`Store revocation from owner ${ownerAddress} transaction hash is ${hash}.`);
			})
			.on('confirmation', (confirmationNumber: number, receipt: TransactionReceipt) => {
				if (confirmationNumber === 12) {
					this._toastr.success(`Store revocation from owner ${ownerAddress} transaction ${receipt.transactionHash} has reached 12 confirmations!`);
				}
			})
			.on('error', (err: string) => {
				this._toastr.error(`Could not revoke store from owner ${ownerAddress}!`);
				console.error(err);
			});
	}

	public async getStoreOwners(): Promise<string[]> {
		await this._checkContract();

		return this._marketplace.methods.getStoreOwners().call();
	}

	public async getStoresByOwner(ownerAddress: string): Promise<string[]> {
		await this._checkContract();

		return this._marketplace.methods.getStoresByOwner(ownerAddress).call();
	}

	public async getStoreProducts(storeAddress, index) {
		const store = this._web3Service.getChecksumAddress(storeAddress);

		if (!store) {
			this._toastr.error(`${storeAddress} address is not valid!`);
			return;
		}

		const storeContract = await this._getStoreContract(storeAddress);


		return storeContract.methods.products.call(index).catch();
	}

	public async getStorefront(storeAddress, index) {
		const store = this._web3Service.getChecksumAddress(storeAddress);

		if (!store) {
			this._toastr.error(`${storeAddress} address is not valid!`);
			return;
		}

		if (Number(index) > 15) {
			this._toastr.error(`Storefront index out of range!`);
			return;
		}

		const storeContract = await this._getStoreContract(storeAddress);

		return storeContract.methods.storefront(index).call().catch();
	}

	public async setStorefront(storeAddress, storefrontIndex, productIndex) {
		const from = await this._web3Service.getFromAccount();

		const isStoreOwner = await this.isStoreOwnerOperating(from);

		if (!isStoreOwner) {
			this._toastr.error(`${from} account is not store owner!`);
			return;
		}

		const store = this._web3Service.getChecksumAddress(storeAddress);

		if (!store) {
			this._toastr.error(`${storeAddress} address is not valid!`);
			return;
		}

		if (Number(storefrontIndex) > 15) {
			this._toastr.error(`Storefront index out of range!`);
			return;
		}

		if (Number(productIndex) > 65535) {
			this._toastr.error(`Product index out of range!`);
			return;
		}

		const storeContract = await this._getStoreContract(storeAddress);

		const currentStoreOwner = await storeContract.methods.owner().call();

		if (from !== currentStoreOwner) {
			this._toastr.error(`Non-owner message sender!`);
			return;
		}

		const gas = await storeContract.methods
			.setStorefront(storefrontIndex, productIndex)
			.estimateGas({ from: from });

		return storeContract.methods
			.setStorefront(storefrontIndex, productIndex)
			.send({ from: from, gas: gas * 2 })
			.on('transactionHash', (hash: string) => {
				this._toastr.info(`Storefront setting transaction for store ${storeAddress} hash is ${hash}.`);
			})
			.on('confirmation', (confirmationNumber: number, receipt: TransactionReceipt) => {
				if (confirmationNumber === 12) {
					this._toastr.success(`Storefront setting transaction for store ${storeAddress} ${receipt.transactionHash} has reached 12 confirmations!`);
				}
			})
			.on('error', (err: string) => {
				this._toastr.error(`Could not set storefront for store ${storeAddress}!`);
				console.error(err);
			});
	}

	public async addProduct(storeAddress, description: string, quantity, price) {
		const from = await this._web3Service.getFromAccount();

		const isStoreOwner = await this.isStoreOwnerOperating(from);

		if (!isStoreOwner) {
			this._toastr.error(`${from} account is not store owner!`);
			return;
		}

		const store = this._web3Service.getChecksumAddress(storeAddress);

		if (!store) {
			this._toastr.error(`${storeAddress} address is not valid!`);
			return;
		}

		if (description.length > 30 || description.length === 0) {
			this._toastr.error(`Invalid product description length`);
			return;
		}

		const storeContract = await this._getStoreContract(storeAddress);

		const currentStoreOwner = await storeContract.methods.owner().call();

		if (from !== currentStoreOwner) {
			this._toastr.error(`Non-owner message sender!`);
			return;
		}

		const bytesDescription = this._web3Service.fromUtf8(description);

		const roundPrice = Math.round(+price);

		const gas = await storeContract.methods
			.addProduct(bytesDescription, quantity, roundPrice)
			.estimateGas({ from: from });

		return storeContract.methods
			.addProduct(bytesDescription, quantity, roundPrice)
			.send({ from: from, gas: gas * 2 })
			.on('transactionHash', (hash: string) => {
				this._toastr.info(`Add product transaction for store ${storeAddress} hash is ${hash}.`);
			})
			.on('confirmation', (confirmationNumber: number, receipt: TransactionReceipt) => {
				if (confirmationNumber === 12) {
					this._toastr.success(`Add product transaction for store ${storeAddress} ${receipt.transactionHash} has reached 12 confirmations!`);
				}
			})
			.on('error', (err: string) => {
				this._toastr.error(`Could not add product for store ${storeAddress}!`);
				console.error(err);
			});
	}

	public async removeProduct(storeAddress, index) {
		const from = await this._web3Service.getFromAccount();

		const isStoreOwner = await this.isStoreOwnerOperating(from);

		if (!isStoreOwner) {
			this._toastr.error(`${from} account is not store owner!`);
			return;
		}

		if (Number(index) > 65535) {
			this._toastr.error(`Product index out of range!`);
			return;
		}

		const store = this._web3Service.getChecksumAddress(storeAddress);

		if (!store) {
			this._toastr.error(`${storeAddress} address is not valid!`);
			return;
		}

		const storeContract = await this._getStoreContract(storeAddress);

		const currentStoreOwner = await storeContract.methods.owner().call();

		if (from !== currentStoreOwner) {
			this._toastr.error(`Non-owner message sender!`);
			return;
		}

		const gas = await storeContract.methods
			.removeProduct(index)
			.estimateGas({ from: from });

		return storeContract.methods
			.removeProduct(index)
			.send({ from: from, gas: gas * 2 })
			.on('transactionHash', (hash: string) => {
				this._toastr.info(`Remove product transaction for store ${storeAddress} hash is ${hash}.`);
			})
			.on('confirmation', (confirmationNumber: number, receipt: TransactionReceipt) => {
				if (confirmationNumber === 12) {
					this._toastr.success(`Remove product transaction for store ${storeAddress} ${receipt.transactionHash} has reached 12 confirmations!`);
				}
			})
			.on('error', (err: string) => {
				this._toastr.error(`Could not remove product for store ${storeAddress}!`);
				console.error(err);
			});
	}

	public async setPrice(storeAddress, index, newPrice) {
		if (Number(index) > 65535) {
			this._toastr.error(`Product index out of range!`);
			return;
		}

		const from = await this._web3Service.getFromAccount();

		const isStoreOwner = await this.isStoreOwnerOperating(from);

		if (!isStoreOwner) {
			this._toastr.error(`${from} account is not store owner!`);
			return;
		}

		const store = this._web3Service.getChecksumAddress(storeAddress);

		if (!store) {
			this._toastr.error(`${storeAddress} address is not valid!`);
			return;
		}

		const storeContract = await this._getStoreContract(storeAddress);

		const currentStoreOwner = await storeContract.methods.owner().call();

		if (from !== currentStoreOwner) {
			this._toastr.error(`Non-owner message sender!`);
			return;
		}

		const price = Math.round(+newPrice);

		const gas = await storeContract.methods
			.setPrice(index, price)
			.estimateGas({ from: from });

		return storeContract.methods
			.setPrice(index, price)
			.send({ from: from, gas: gas * 2 })
			.on('transactionHash', (hash: string) => {
				this._toastr.info(`Set price transaction for store ${storeAddress} hash is ${hash}.`);
			})
			.on('confirmation', (confirmationNumber: number, receipt: TransactionReceipt) => {
				if (confirmationNumber === 12) {
					this._toastr.success(`Set price transaction for store ${storeAddress} ${receipt.transactionHash} has reached 12 confirmations!`);
				}
			})
			.on('error', (err: string) => {
				this._toastr.error(`Could not set price for store ${storeAddress}!`);
				console.error(err);
			});
	}

	public async increaseQuantity(storeAddress, index, increase) {
		if (Number(index) > 65535) {
			this._toastr.error(`Product index out of range!`);
			return;
		}

		if (Number(increase) > 65535) {
			this._toastr.error(`Increase out of range!`);
			return;
		}

		const from = await this._web3Service.getFromAccount();

		const isStoreOwner = await this.isStoreOwnerOperating(from);

		if (!isStoreOwner) {
			this._toastr.error(`${from} account is not store owner!`);
			return;
		}

		const store = this._web3Service.getChecksumAddress(storeAddress);

		if (!store) {
			this._toastr.error(`${storeAddress} address is not valid!`);
			return;
		}

		const storeContract = await this._getStoreContract(storeAddress);

		const currentStoreOwner = await storeContract.methods.owner().call();

		if (from !== currentStoreOwner) {
			this._toastr.error(`Non-owner message sender!`);
			return;
		}

		const gas = await storeContract.methods
			.increaseQuantity(index, increase)
			.estimateGas({ from: from });

		return storeContract.methods
			.increaseQuantity(index, increase)
			.send({ from: from, gas: gas * 2 })
			.on('transactionHash', (hash: string) => {
				this._toastr.info(`Increase quantity transaction for store ${storeAddress} hash is ${hash}.`);
			})
			.on('confirmation', (confirmationNumber: number, receipt: TransactionReceipt) => {
				if (confirmationNumber === 12) {
					this._toastr.success(`Increase quantity transaction for store ${storeAddress} ${receipt.transactionHash} has reached 12 confirmations!`);
				}
			})
			.on('error', (err: string) => {
				this._toastr.error(`Could not increase quantity for store ${storeAddress}!`);
				console.error(err);
			});
	}

	public async decreaseQuantity(storeAddress, index, decrease) {
		if (Number(index) > 65535) {
			this._toastr.error(`Product index out of range!`);
			return;
		}

		if (Number(decrease) > 65535) {
			this._toastr.error(`Decrease out of range!`);
			return;
		}

		const from = await this._web3Service.getFromAccount();

		const isStoreOwner = await this.isStoreOwnerOperating(from);

		if (!isStoreOwner) {
			this._toastr.error(`${from} account is not store owner!`);
			return;
		}

		const store = this._web3Service.getChecksumAddress(storeAddress);

		if (!store) {
			this._toastr.error(`${storeAddress} address is not valid!`);
			return;
		}

		const storeContract = await this._getStoreContract(storeAddress);

		const currentStoreOwner = await storeContract.methods.owner().call();

		if (from !== currentStoreOwner) {
			this._toastr.error(`Non-owner message sender!`);
			return;
		}

		const gas = await storeContract.methods
			.decreaseQuantity(index, decrease)
			.estimateGas({ from: from });

		return storeContract.methods
			.decreaseQuantity(index, decrease)
			.send({ from: from, gas: gas * 2 })
			.on('transactionHash', (hash: string) => {
				this._toastr.info(`Decrease quantity transaction for store ${storeAddress} hash is ${hash}.`);
			})
			.on('confirmation', (confirmationNumber: number, receipt: TransactionReceipt) => {
				if (confirmationNumber === 12) {
					this._toastr.success(`Decrease quantity transaction for store ${storeAddress} ${receipt.transactionHash} has reached 12 confirmations!`);
				}
			})
			.on('error', (err: string) => {
				this._toastr.error(`Could not decrease quantity for store ${storeAddress}!`);
				console.error(err);
			});
	}

	public async pause(storeAddress) {
		const from = await this._web3Service.getFromAccount();

		const isStoreOwner = await this.isStoreOwnerOperating(from);

		if (!isStoreOwner) {
			this._toastr.error(`${from} account is not store owner!`);
			return;
		}

		const store = this._web3Service.getChecksumAddress(storeAddress);

		if (!store) {
			this._toastr.error(`${storeAddress} address is not valid!`);
			return;
		}

		const storeContract = await this._getStoreContract(storeAddress);

		const currentStoreOwner = await storeContract.methods.owner().call();

		if (from !== currentStoreOwner) {
			this._toastr.error(`Non-owner message sender!`);
			return;
		}

		const gas = await storeContract.methods
			.pause()
			.estimateGas({ from: from });

		return storeContract.methods
			.pause()
			.send({ from: from, gas: gas * 2 })
			.on('transactionHash', (hash: string) => {
				this._toastr.info(`Pausing transaction for store ${storeAddress} hash is ${hash}.`);
			})
			.on('confirmation', (confirmationNumber: number, receipt: TransactionReceipt) => {
				if (confirmationNumber === 12) {
					this._toastr.success(`Pausing transaction for store ${storeAddress} ${receipt.transactionHash} has reached 12 confirmations!`);
				}
			})
			.on('error', (err: string) => {
				this._toastr.error(`Could not pause for store ${storeAddress}!`);
				console.error(err);
			});
	}

	public async unpause(storeAddress) {
		const from = await this._web3Service.getFromAccount();

		const isStoreOwner = await this.isStoreOwnerOperating(from);

		if (!isStoreOwner) {
			this._toastr.error(`${from} account is not store owner!`);
			return;
		}

		const store = this._web3Service.getChecksumAddress(storeAddress);

		if (!store) {
			this._toastr.error(`${storeAddress} address is not valid!`);
			return;
		}

		const storeContract = await this._getStoreContract(storeAddress);

		const currentStoreOwner = await storeContract.methods.owner().call();

		if (from !== currentStoreOwner) {
			this._toastr.error(`Non-owner message sender!`);
			return;
		}

		const gas = await storeContract.methods
			.unpause()
			.estimateGas({ from: from });

		return storeContract.methods
			.unpause()
			.send({ from: from, gas: gas * 2 })
			.on('transactionHash', (hash: string) => {
				this._toastr.info(`Unpausing transaction for store ${storeAddress} hash is ${hash}.`);
			})
			.on('confirmation', (confirmationNumber: number, receipt: TransactionReceipt) => {
				if (confirmationNumber === 12) {
					this._toastr.success(`Unpausing transaction for store ${storeAddress} ${receipt.transactionHash} has reached 12 confirmations!`);
				}
			})
			.on('error', (err: string) => {
				this._toastr.error(`Could not unpause for store ${storeAddress}!`);
				console.error(err);
			});
	}

	public async buy(storeAddress, value, index, quantity) {
		if (Number(index) > 65535) {
			this._toastr.error(`Product index out of range!`);
			return;
		}

		if (!!quantity && Number(quantity) > 65535) {
			this._toastr.error(`Quantity out of range!`);
			return;
		}

		const from = await this._web3Service.getFromAccount();

		const store = this._web3Service.getChecksumAddress(storeAddress);

		if (!store) {
			this._toastr.error(`${storeAddress} address is not valid!`);
			return;
		}

		const storeContract = await this._getStoreContract(storeAddress);

		const gas = await storeContract.methods
			.buy(index, quantity)
			.estimateGas({ from: from, value: value });

		console.log(`gas: ${gas}`);

		return storeContract.methods
			.buy(index, quantity)
			.send({ from: from, value: value, gas: gas * 2 })
			.on('transactionHash', (hash: string) => {
				this._toastr.info(`Buy transaction for store ${storeAddress} hash is ${hash}.`);
			})
			.on('confirmation', (confirmationNumber: number, receipt: TransactionReceipt) => {
				if (confirmationNumber === 12) {
					this._toastr.success(`Buy transaction for store ${storeAddress} ${receipt.transactionHash} has reached 12 confirmations!`);
				}
			})
			.on('error', (err: string) => {
				this._toastr.error(`Could not buy from store ${storeAddress}!`);
				console.error(err);
			});
	}

	public async getNextStoreRequest() {
		const index = await this._getNextRequestIndex();

		const request = await this._marketplace.methods.storeRequests(index).call();


		if (!request) {
			return;
		}

		const processed = this._ipfsService.getIpfsHashFromBytes32(request[0]);

		return [processed, request[1]];
	}

	public async getProductAtIndex(storeAddress, index) {
		if (Number(index) > 65535) {
			this._toastr.error(`Product index out of range!`);
			return;
		}

		const store = this._web3Service.getChecksumAddress(storeAddress);

		if (!store) {
			this._toastr.error(`${storeAddress} address is not valid!`);
			return;
		}

		const storeContract = await this._getStoreContract(storeAddress);

		return storeContract.methods.products(index).call();
	}

	private async _initContract() {
		this._marketplace = await this._web3Service.getContract(environment.Abi, environment.address);
	}

	private async _checkContract() {
		if (!this._marketplace) {
			await this._initContract();
		}
	}

	private async _getStoreContract(address): Promise<Contract> {
		return this._web3Service.getContract(storeAbi, address);
	}

	private async _getNextRequestIndex() {
		return this._marketplace.methods.nextRequestIndex().call();
	}
}
