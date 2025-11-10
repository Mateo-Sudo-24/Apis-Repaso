import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ApiMenuPageRoutingModule } from './api-menu-routing.module';

import { ApiMenuPage } from './api-menu.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ApiMenuPageRoutingModule
  ],
  declarations: [ApiMenuPage]
})
export class ApiMenuPageModule {}
