import { Injectable } from '@angular/core';
const ipfsAPI = require('ipfs-api');
const bs58 = require('bs58');

@Injectable()
export class IpfsService {
	private _ipfs;
	constructor() {
		this._ipfs = ipfsAPI();
	}

	public async add(files) {
		const buffer = Buffer.from(files);
		const response = await this._ipfs.add(buffer, {
			progress: (prog) => console.log(`received: ${prog}`),
			recursive: true,
			wrapWithDirectory: true
		}).catch((err) => { console.error(err); });

		const processedHash = this._getBytes32FromIpfsHash(response[0].hash);

		return processedHash;
	}

	// Return base58 encoded ipfs hash from bytes32 hex string,
	// E.g. "0x017dfd85d4f6cb4dcd715a88101f7b1f06cd1e009b2327a0809d01eb9c91f231"
	// --> "QmNSUYVKDSvPUnRLKmuxk9diJ6yS96r1TrAXzjTiBcCLAL"

	public getIpfsHashFromBytes32(bytes32Hex) {
		// Add our default ipfs values for first 2 bytes:
		// function:0x12=sha2, size:0x20=256 bits
		// and cut off leading "0x"
		const hashHex = `1220${bytes32Hex.slice(2)}`;
		const hashBytes = Buffer.from(hashHex, 'hex');
		const hashStr = bs58.encode(hashBytes);
		return hashStr;
	}

	// Return bytes32 hex string from base58 encoded ipfs hash,
	// stripping leading 2 bytes from 34 byte IPFS hash
	// Assume IPFS defaults: function:0x12=sha2, size:0x20=256 bits
	// E.g. "QmNSUYVKDSvPUnRLKmuxk9diJ6yS96r1TrAXzjTiBcCLAL" -->
	// "0x017dfd85d4f6cb4dcd715a88101f7b1f06cd1e009b2327a0809d01eb9c91f231"
	private _getBytes32FromIpfsHash(ipfsHash) {
		return `0x${bs58.decode(ipfsHash).slice(2).toString('hex')}`;
	}
}
