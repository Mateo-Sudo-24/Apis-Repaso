import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApiMenuPage } from './api-menu.page';

const routes: Routes = [
  {
    path: '',
    component: ApiMenuPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApiMenuPageRoutingModule {}
