import { TestBed, inject } from '@angular/core/testing';
import Web3 from 'web3';

import { Web3Service } from './web3.service';

import core_artifacts from '../../../build/contracts/DDNSCore.json';

declare let window: any;

describe('Web3Service', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [Web3Service]
		});
	});

	it('should be created', inject([Web3Service], (service: Web3Service) => {
		expect(service).toBeTruthy();
	}));
});
