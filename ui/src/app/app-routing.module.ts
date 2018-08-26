import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DomainComponent } from './components/domain/domain.component';
import { OwnerComponent } from './components/owner/owner.component';
import { ReceiptsComponent } from './components/receipts/receipts.component';

export const routes: Routes = [
	{ path: '', redirectTo: 'home', pathMatch: 'full' },
	{ path: 'home', component: HomeComponent },
	{ path: 'domain', component: DomainComponent },
	{ path: 'owner', component: OwnerComponent },
	{ path: 'receipts', component: ReceiptsComponent },
	{ path: '', redirectTo: 'home', pathMatch: 'full' },
	{ path: '**', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
	providers: []
})
export class AppRoutingModule { }
