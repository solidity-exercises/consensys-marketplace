import { Component, OnInit } from '@angular/core';
import { ContractService } from '../../services/contract.service';
import { GlobalsService } from '../../services/globals.service';

@Component({
	selector: 'app-owner',
	templateUrl: './owner.component.html',
	styleUrls: ['./owner.component.css']
})
export class OwnerComponent implements OnInit {
	contractInfo = {
		wallet: '',
		owner: ''
	};

	newRegistrationCost = '';

	newExpiryPeriod = '';

	newWallet = '';

	withdrawAmount = '';

	newOwner = '';

	recipient = '';

	isContractDestroyed = false;

	constructor(private _contractService: ContractService, private _globals: GlobalsService) { }

	ngOnInit() {
		this._getContractInfo();
	}

	public async changeRegistrationCost() {
		await this._contractService.changeRegistrationCost(this.newRegistrationCost);
		this.newRegistrationCost = '';
	}

	public async changeExpiryPeriod() {
		await this._contractService.changeExpiryPeriodInDays(this.newExpiryPeriod);
		this.newExpiryPeriod = '';
	}

	public async changeWallet() {
		await this._contractService.changeWallet(this.newWallet);
		this.newWallet = '';
		await this._getContractInfo();
	}

	public async withdrawEthers() {
		await this._contractService.withdrawEthers(this.withdrawAmount);
		this.withdrawAmount = '';
	}

	public async setNewOwner() {
		await this._contractService.setOwner(this.newOwner);
		this.newOwner = '';
		await this._getContractInfo();
	}

	public async destroy() {
		await this._contractService.destroy();
		await this._getContractInfo();
	}

	public async destroyAndSend() {
		await this._contractService.destroyAndSend(this.recipient);
		this.recipient = '';
		await this._getContractInfo();
	}

	private async _getContractInfo() {
		this.isContractDestroyed = this._globals.isContractDestroyed;
		if (!this.isContractDestroyed) {
			const oldWallet = this.contractInfo.wallet;
			const oldOwner = this.contractInfo.owner;
			this.contractInfo.wallet = await this._contractService.getWallet();
			this.contractInfo.owner = await this._contractService.getOwner();

			if (oldWallet === this.contractInfo.wallet && oldOwner === this.contractInfo.owner) {
				const delay = new Promise(resolve => setTimeout(resolve, 500));
				await delay;
				await this._getContractInfo();
			}
		}
	}
}
