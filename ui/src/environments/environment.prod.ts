import * as marketplaceAbi from '../../marketplace-abi.json';

export const environment = {
	production: true,
	provider: 'http://localhost:8545',
	Abi: marketplaceAbi['marketplace'],
	address: '' // TODO: Put the address from rinkeby deployment
};
