import * as marketplaceAbi from '../../marketplace-abi.json';

export const environment = {
	production: true,
	provider: 'http://localhost:8545',
	Abi: marketplaceAbi['marketplace'],
	address: '0xb42d3214eeC65D3E6A6257a778823aD093cbD7Fd'
};
