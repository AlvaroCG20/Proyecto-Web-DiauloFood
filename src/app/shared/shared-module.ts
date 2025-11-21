import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { CustomInputComponent } from './components/custom-input/custom-input.component';
import { LogoComponent } from './components/logo/logo.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderLandingComponent } from './components/header-landing/header-landing.component';
import { HeaderRestaurantComponent } from './components/header-restaurant/header-restaurant.component';
import { FooterDashboardComponent } from './components/footer-dashboard/footer-dashboard.component';
import { RouterModule } from '@angular/router'; 


@NgModule({
  declarations: [
    HeaderComponent,CustomInputComponent,LogoComponent,HeaderLandingComponent,HeaderRestaurantComponent,FooterDashboardComponent
  ],
  exports: [
    HeaderComponent,CustomInputComponent,LogoComponent,HeaderLandingComponent,HeaderRestaurantComponent,FooterDashboardComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule
  ]
})
export class SharedModule { }
