import { isStandalone, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { DashboardPage } from './dashboard.page';
import { ApiDisplayComponent } from '../../components/api-display/api-display.component';
import {HttpClientModule} from '@angular/common/http'


const routes: Routes = [
  { path: '', component: DashboardPage }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    HttpClientModule,
  ],
  declarations: [DashboardPage, ApiDisplayComponent]
})
export class DashboardPageModule {}