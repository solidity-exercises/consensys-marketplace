import { Component, OnInit } from '@angular/core';
import { ContractService } from '../../services/contract.service';
import { Web3Service } from '../../services/web3.service';

@Component({
	selector: 'app-admin',
	templateUrl: './admin.component.html',
	styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

	registration = {
		domainName: '',
		topLevelDomain: '',
		ipAddress: ''
	};

	renew = {
		domainName: '',
		topLevelDomain: ''
	};

	editIp = {
		domainName: '',
		topLevelDomain: '',
		newIp: ''
	};

	transfer = {
		domainName: '',
		topLevelDomain: '',
		newOwner: ''
	};

	domainDetails = {
		domainName: '',
		topLevelDomain: '',
		ipAddress: '',
		validUntil: '',
		owner: ''
	};

	domainPrice = {
		domainName: '',
		price: ''
	};

	isContractDestroyed = false;

	constructor(private _contractService: ContractService, private _web3Service: Web3Service, private _globals: GlobalsService) { }

	ngOnInit(): void {
		this._checkContract();
	}

	public async registerDomain() {
		await this._contractService.registerDomain(this.registration.domainName, this.registration.ipAddress, this.registration.topLevelDomain);
	}

	public async renewDomainRegistration() {
		await this._contractService.renewDomainRegistration(this.renew.domainName, this.renew.topLevelDomain);
	}

	public async editDomainIp() {
		await this._contractService.editDomainIp(this.editIp.domainName, this.editIp.topLevelDomain, this.editIp.newIp);
	}

	public async transferOwnership() {
		await this._contractService.transferOwnership(this.transfer.domainName, this.transfer.topLevelDomain, this.transfer.newOwner);
	}

	public async getDomainDetails() {
		const details = await this._contractService.getDomainDetails(this.domainDetails.domainName, this.domainDetails.topLevelDomain);

		this.domainDetails.ipAddress = this._web3Service.toUtf8(details[1]);
		this.domainDetails.validUntil = this._transferToDateString(details[2]);
		this.domainDetails.owner = details[3];
	}

	public async getDomainPrice() {
		this.domainPrice.price = await this._contractService.getDomainPriceInEther(this.domainPrice.domainName);
	}

	clearRegistration() {
		this.registration = {
			domainName: '',
			topLevelDomain: '',
			ipAddress: '',
		};
	}

	clearRenew() {
		this.renew = {
			domainName: '',
			topLevelDomain: '',
		};
	}

	clearEditIp() {
		this.editIp = {
			domainName: '',
			topLevelDomain: '',
			newIp: ''
		};
	}

	clearTransfer() {
		this.transfer = {
			domainName: '',
			topLevelDomain: '',
			newOwner: ''
		};
	}

	clearDomainDetails(event?) {
		if (event) {
			const key = event.key;
			if (key === 'Backspace' || key === 'Delete') {
				this.domainDetails = {
					domainName: '',
					topLevelDomain: '',
					ipAddress: '',
					validUntil: '',
					owner: ''
				};
			}
		} else {
			this.domainDetails = {
				domainName: '',
				topLevelDomain: '',
				ipAddress: '',
				validUntil: '',
				owner: ''
			};
		}
	}

	clearDomainPrice(event?) {
		if (event) {
			const key = event.key;
			if (key === 'Backspace' || key === 'Delete') {
				this.domainPrice = {
					domainName: '',
					price: ''
				};
			}
		} else {
			this.domainPrice = {
				domainName: '',
				price: ''
			};
		}
	}

	private _transferToDateString(date) {
		const convertedDate = new Date(Number(date.toString(10) + '000'));
		return convertedDate.toISOString();
	}

	private async _checkContract() {
		this.isContractDestroyed = this._globals.isContractDestroyed;
	}
}
