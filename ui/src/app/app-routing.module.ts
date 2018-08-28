import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AdminComponent } from './components/admin/admin.component';
import { OwnerComponent } from './components/owner/owner.component';
import { CustomerComponent } from './components/customer/customer.component';
import { StoreComponent } from './components/store/store.component';

export const routes: Routes = [
	{ path: '', redirectTo: 'home', pathMatch: 'full' },
	{ path: 'home', component: HomeComponent },
	{ path: 'admin', component: AdminComponent },
	{ path: 'owner', component: OwnerComponent },
	{ path: 'customer', component: CustomerComponent },
	{ path: 'store/:id', component: StoreComponent },
	{ path: '', redirectTo: 'home', pathMatch: 'full' },
	{ path: '**', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
	providers: []
})
export class AppRoutingModule { }
