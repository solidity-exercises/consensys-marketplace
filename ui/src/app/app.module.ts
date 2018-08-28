import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { ServicesModule } from './services/services.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

import { AppComponent } from './app.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { HomeComponent } from './components/home/home.component';
import { OwnerComponent } from './components/owner/owner.component';
import { AdminComponent } from './components/admin/admin.component';
import { CustomerComponent } from './components/customer/customer.component';
import { AppRoutingModule } from './app-routing.module';
import { StoreComponent } from './components/store/store.component';

@NgModule({
	declarations: [
		AppComponent,
		NavbarComponent,
		FooterComponent,
		HomeComponent,
		OwnerComponent,
		AdminComponent,
		CustomerComponent,
		StoreComponent
	],
	imports: [
		BrowserModule,
		FormsModule,
		HttpModule,
		AppRoutingModule,
		BrowserAnimationsModule,
		ToastrModule.forRoot(),
		ServicesModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }
