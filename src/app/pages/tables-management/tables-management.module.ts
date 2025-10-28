import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TablesManagementPageRoutingModule } from './tables-management-routing.module';

import { TablesManagementPage } from './tables-management.page';
import { SharedModule } from 'src/app/shared/shared-module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TablesManagementPageRoutingModule,
    SharedModule
  ],
  declarations: [TablesManagementPage]
})
export class TablesManagementPageModule {}
