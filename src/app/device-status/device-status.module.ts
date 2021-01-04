import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { DeviceStatusPageRoutingModule } from './device-status-routing.module';
import { DeviceStatusPage } from './device-status.page';
import { NgCircleProgressModule } from 'ng-circle-progress';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeviceStatusPageRoutingModule,
    NgCircleProgressModule
  ],
  declarations: [DeviceStatusPage],

})
export class DeviceStatusPageModule { }
