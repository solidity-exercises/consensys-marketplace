import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment';
// import Web3 from 'web3'; /* https://github.com/ethereum/web3.js/issues/1155 */
const Web3 = require('web3');

declare let window: any;

@Injectable()
export class Web3Service {
	private _web3: any;

	constructor(private _toastr: ToastrService) {
		window.addEventListener('load', (event) => {
			this._bootstrapWeb3();
		});
	}

	public async getContract(ABI, address) {
		if (!this._web3) {
			this._bootstrapWeb3();
		}

		return new this._web3.eth.Contract(ABI, address);
	}

	public async getFromAccount() {
		const accounts = await this._web3.eth.getAccounts();
		return accounts[0];
	}

	public isValidAddress(address: string) {
		return this._web3.utils.isAddress(address);
	}

	public getChecksumAddress(address: string) {
		if (this._web3.utils.checkAddressChecksum(address)) {
			return this._web3.utils.toChecksumAddress(address);
		}

		return '';
	}

	public fromWei(amount: (number | string)) {
		return this._web3.utils.fromWei(amount, 'ether');
	}

	public toWei(amount: (number | string)) {
		return this._web3.utils.toWei(amount, 'ether');
	}

	public fromUtf8(text) {
		return this._web3.utils.fromUtf8(text);
	}

	public toUtf8(bytes) {
		return this._web3.utils.toUtf8(bytes);
	}

	private _bootstrapWeb3() {
		// Checking if Web3 has been injected by the browser (Mist/MetaMask)
		if (typeof window.web3 !== 'undefined') {
			// Use Mist/MetaMask's provider
			this._web3 = new Web3(window.web3.currentProvider);
		} else {
			this._toastr.info('No web3? You should consider trying MetaMask!');

			// Hack to provide backwards compatibility for Truffle, which uses web3js 0.20.x
			Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
			// fallback - use your fallback strategy (local node / hosted node)
			this._web3 = new Web3(new Web3.providers.HttpProvider(environment.provider));
		}
	}
}
