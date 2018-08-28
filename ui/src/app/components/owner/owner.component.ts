import { Component, OnInit } from '@angular/core';
import { ContractService } from '../../services/contract.service';
import { Web3Service } from '../../services/web3.service';

@Component({
	selector: 'app-owner',
	templateUrl: './owner.component.html',
	styleUrls: ['./owner.component.css']
})
export class OwnerComponent implements OnInit {

	constructor(private _contractService: ContractService, private _web3Service: Web3Service) { }

	add = {
		address: '',
		description: '',
		quantity: '',
		price: ''
	};

	remove = {
		address: '',
		index: ''
	};

	price = {
		address: '',
		index: '',
		price: ''
	};

	increase = {
		address: '',
		index: '',
		increase: ''
	};

	decrease = {
		address: '',
		index: '',
		decrease: ''
	};

	storefront = {
		address: '',
		index: '',
		productIndex: ''
	};

	p = {
		address: '',
	};

	u = {
		address: '',
	};

	owner;
	stores = [];

	ngOnInit() {
		this._getStoresByOwner();
	}

	public async addProduct() {
		this._contractService.addProduct(this.add.address, this.add.description, this.add.quantity, this.add.price)
			.then(() => {
				this.add.address = '',
					this.add.description = '',
					this.add.quantity = '',
					this.add.price = '';
			});
	}

	public async removeProduct() {
		this._contractService.removeProduct(this.remove.address, this.remove.index)
			.then(() => {
				this.remove.address = '';
				this.remove.index = '';
			});
	}

	public async updatePrice() {
		this._contractService.setPrice(this.price.address, this.price.index, this.price.price)
			.then(() => {
				this.price.address = '';
				this.price.index = '';
				this.price.price = '';
			});
	}

	public async increaseQuantity() {
		this._contractService.increaseQuantity(this.increase.address, this.increase.index, this.increase.increase)
			.then(() => {
				this.increase.address = '';
				this.increase.index = '';
				this.increase.increase = '';
			});
	}

	public async decreaseQuantity() {
		this._contractService.decreaseQuantity(this.decrease.address, this.decrease.index, this.decrease.decrease)
			.then(() => {
				this.decrease.address = '';
				this.decrease.index = '';
				this.decrease.decrease = '';
			});
	}

	public async setStorefront() {
		this._contractService.setStorefront(this.storefront.address, this.storefront.index, this.storefront.productIndex)
			.then(() => {
				this.storefront.address = '';
				this.storefront.index = '';
				this.storefront.productIndex = '';
			});
	}

	public async pause() {
		this._contractService.pause(this.p.address)
			.then(() => {
				this.p.address = '';
			});
	}

	public async unpause() {
		this._contractService.unpause(this.u.address)
			.then(() => {
				this.u.address = '';
			});
	}

	private async _getStoresByOwner() {
		this.owner = await this._web3Service.getFromAccount();
		this.stores = await this._contractService.getStoresByOwner(this.owner);
	}

}
