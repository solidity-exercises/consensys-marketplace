import { Component, OnInit } from '@angular/core';
import { ContractService } from '../../services/contract.service';
import { Web3Service } from '../../services/web3.service';

@Component({
	selector: 'app-customer',
	templateUrl: './customer.component.html',
	styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {

	customer = '';

	owners = [];

	constructor(private _contractService: ContractService, private _web3Service: Web3Service) { }

	ngOnInit() {
		this._fillData();
		this._getFromAccount();
	}

	public async captureFile(event) {
		event.stopPropagation();
		event.preventDefault();
		const file = event.target.files[0];
		const reader = new FileReader();
		reader.onloadend = () => this._requestStore(reader.result);
		reader.readAsArrayBuffer(file);
	}

	public handleSubmit(event) {
		event.preventDefault();
	}

	private async _requestStore(reader) {
		this._contractService.requestStore(reader);
	}

	private async _getFromAccount() {
		this.customer = await this._web3Service.getFromAccount();
	}

	private async _fillData() {
		const owners = await this._contractService.getStoreOwners();

		const promises = [];

		owners.forEach((owner) => {
			promises.push(
				this._contractService
					.getStoresByOwner(owner)
					.then((stores) => {
						this.owners.push({
							address: owner,
							stores: stores
						});
					}));
		});

		return Promise.all(promises);
	}
}
