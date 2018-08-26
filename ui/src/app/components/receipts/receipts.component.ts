import { Component, OnInit } from '@angular/core';
import { ContractService } from '../../services/contract.service';
import { Web3Service } from '../../services/web3.service';
import { GlobalsService } from '../../services/globals.service';

@Component({
	selector: 'app-receipts',
	templateUrl: './receipts.component.html',
	styleUrls: ['./receipts.component.css']
})
export class ReceiptsComponent implements OnInit {

	isContractDestroyed = false;

	report = {
		owner: '',
		receipts: []
	};

	constructor(private _contractService: ContractService, private _web3Service: Web3Service, private _globals: GlobalsService) { }

	ngOnInit() {
		this._checkContract();
		this._fillReportOwner();
	}

	public async getReceiptsReport() {
		this.report.receipts = [];
		let index = 0;
		while (true) {
			const currentReceipt = await this._contractService.getReceiptReport(this.report.owner, index);

			if (!currentReceipt) {
				break;
			}
			currentReceipt.domainName = this._web3Service.toUtf8(currentReceipt.domainName);
			currentReceipt.amountPaid = this._web3Service.fromWei(currentReceipt.amountPaid);
			currentReceipt.timeBought += '000';
			this.report.receipts.push(currentReceipt);
			index++;
		}
	}

	private async _checkContract() {
		this.isContractDestroyed = this._globals.isContractDestroyed;
	}

	private async _fillReportOwner() {
		this.report.owner = await this._web3Service.getFromAccount();
	}
}
