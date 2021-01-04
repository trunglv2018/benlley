import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { delay, retryWhen, take } from 'rxjs/operators';
import { webSocket } from 'rxjs/webSocket';
import { environment } from 'src/environments/environment';
import { DeviceStatus } from '../models/device_status.model';
import { CustomerService } from '../services/customer.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  deviceStatus = <DeviceStatus>{}
  devices = []
  constructor(
    private customerService: CustomerService,
    private navCtrl: NavController,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadDevices()
    this.loadDeviceStatus()
  }

  loadDeviceStatus() {

  }

  loadDevices() {
    this.customerService.getDevices().subscribe(devices => {
      console.log(devices)
      this.devices = devices || []
    })
  }

  onLogout() {
    this.router.navigate(['/login'])
  }

  onRemote(actor: string) {

  }

  onNavigateToDeviceStatus(deviceID: string) {
    this.router.navigate(['device-status'], {
      state: {
        device_id: deviceID
      },
      queryParams: {
        device_id: deviceID
      },
    })
  }
}
