import { Component, OnInit } from '@angular/core';
import { ContractService } from '../../services/contract.service';

@Component({
	selector: 'app-admin',
	templateUrl: './admin.component.html',
	styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

	constructor(private _contractService: ContractService) { }

	storeRequest = {
		proposal: '',
		owner: ''
	};

	approveStore = {
		isApproved: '',
		index: ''
	};

	revokeStoreObject = {
		ownerAddress: '',
		index: ''
	};

	ngOnInit(): void {
		this.getNextStoreRequest();
	}

	public async getNextStoreRequest() {
		const request = await this._contractService.getNextStoreRequest();

		this.storeRequest.proposal = request[0];
		this.storeRequest.owner = request[1];
	}

	public async approveNextStore() {
		this._contractService.approveStore(this.approveStore.isApproved === '1', this.approveStore.index).then(() => {
			this.getNextStoreRequest();
			this.approveStore.isApproved = '';
			this.approveStore.index = '';
		});
	}

	public async revokeStore() {
		this._contractService.revokeStore(this.revokeStoreObject.ownerAddress, this.revokeStoreObject.index)
			.then(() => {
				this.revokeStoreObject.ownerAddress = '';
				this.revokeStoreObject.index = '';
			});
	}
}
