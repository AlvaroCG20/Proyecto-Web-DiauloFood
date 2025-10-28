import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TablesManagementPage } from './tables-management.page';

const routes: Routes = [
  {
    path: '',
    component: TablesManagementPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TablesManagementPageRoutingModule {}
