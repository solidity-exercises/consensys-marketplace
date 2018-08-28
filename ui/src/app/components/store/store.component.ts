import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContractService } from '../../services/contract.service';
import { Web3Service } from '../../services/web3.service';

@Component({
	selector: 'app-store',
	templateUrl: './store.component.html',
	styleUrls: ['./store.component.css']
})
export class StoreComponent implements OnInit {

	constructor(_route: ActivatedRoute, private _contractService: ContractService, private _web3Service: Web3Service) {
		this.id = _route.snapshot.params['id'];
	}

	id;

	storefront = [];

	product = {
		index: 0,
		description: '',
		quantity: '',
		price: ''
	};

	buyQuantity: '';

	ngOnInit() {
		this._getStorefront();
		this._initProduct();
	}

	public async getProductAtNextIndex() {
		const product = await this._contractService.getProductAtIndex(this.id, ++this.product.index).catch(() => {
			--this.product.index;
		});

		if (product && product.description !== '0x000000000000000000000000000000000000000000000000000000000000') {
			this._processProduct(product);
		}
	}

	public async getProductAtPreviousIndex() {
		const product = await this._contractService.getProductAtIndex(this.id, --this.product.index).catch(() => {
			++this.product.index;
		});

		if (product && product.description !== '0x000000000000000000000000000000000000000000000000000000000000') {
			this._processProduct(product);
		}
	}

	public async buy() {
		const price = this._web3Service.toBN(this.product.price);
		const quantity = this._web3Service.toBN(this.buyQuantity);
		const value = price.mul(quantity);

		this._contractService.buy(this.id, value, this.product.index, this.buyQuantity)
			.then(() => { this.buyQuantity = ''; });
	}

	private async _getStorefront() {
		let index = 0;
		while (index < 16) {
			const currentProductIndex = await this._contractService.getStorefront(this.id, index);

			const currentProduct = await this._contractService.getProductAtIndex(this.id, currentProductIndex);

			index++;

			if (currentProduct.description === '0x000000000000000000000000000000000000000000000000000000000000') {
				continue;
			}

			currentProduct.description = this._web3Service.toUtf8(currentProduct.description);

			this.storefront.push(currentProduct);
		}
	}

	private async _initProduct() {
		let product = await this._contractService.getProductAtIndex(this.id, this.product.index++).catch(() => { });

		let i = 0;
		while ((!product || product.description === '0x000000000000000000000000000000000000000000000000000000000000') && i < 20) {
			product = await this._contractService.getProductAtIndex(this.id, this.product.index++).catch(() => { });
			i++;
		}

		this._processProduct(product);
	}

	private _processProduct(product) {
		this.product.description = this._web3Service.toUtf8(product[0]);
		this.product.quantity = product[1];
		this.product.price = product[2];
	}
}
