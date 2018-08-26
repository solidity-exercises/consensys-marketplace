import * as contractAbi from '../contract-abi.json';

export const environment = {
	production: true,
	provider: 'http://localhost:8545',
	ABI: contractAbi['abi'],
	address: '0x8cb4b10e9659aAB8E80bee9608F16c2Ad5BBCdaF'
};
