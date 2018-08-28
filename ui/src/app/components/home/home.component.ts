import { Component, OnInit } from '@angular/core';
import { ContractService } from '../../services/contract.service';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

	contractInfo = {
		owner: '',
		registrationCost: '0',
	};

	constructor(private _contractService: ContractService) { }

	ngOnInit() {
		this._getContractInfo();
	}

	private async _getContractInfo() {
		this.contractInfo.owner = await this._contractService.getMarketplaceOwner();
	}
}
