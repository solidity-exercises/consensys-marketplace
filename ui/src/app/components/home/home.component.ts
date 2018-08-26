import { Component, OnInit } from '@angular/core';
import { ContractService } from '../../services/contract.service';
import { Web3Service } from '../../services/web3.service';
import { GlobalsService } from '../../services/globals.service';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

	contractInfo = {
		wallet: '',
		owner: '',
		registrationCost: '',
		expiryPeriod: ''
	};

	isContractDestroyed = false;

	constructor(private _contractService: ContractService,  private _globals: GlobalsService) { }

	ngOnInit() {
		this._getContractInfo();
	}

	private async _getContractInfo() {
		this.isContractDestroyed = this._globals.isContractDestroyed;
		if (!this.isContractDestroyed) {
			this.contractInfo.wallet = await this._contractService.getWallet();
			this.contractInfo.owner = await this._contractService.getOwner();
			this.contractInfo.registrationCost = await this._contractService.getRegistrationCost();
			this.contractInfo.expiryPeriod = await this._contractService.getExpiryPeriodInDays();
		}
	}
}
