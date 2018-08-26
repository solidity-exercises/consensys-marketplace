import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Web3Service } from './web3.service';
import { ContractService } from './contract.service';
import { GlobalsService } from './globals.service';

@NgModule({
	imports: [
		CommonModule
	],
	providers: [
		Web3Service,
		ContractService,
		GlobalsService
	],
	declarations: []
})
export class ServicesModule {
}
