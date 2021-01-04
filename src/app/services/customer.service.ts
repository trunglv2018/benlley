import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DeviceStatus } from '../models/device_status.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class CustomerService {
    constructor(private apiService: ApiService) { }

    getDevices() {
        return this.apiService.get('/customer/device/list')
    }

    remoteVan(body) {
        return this.apiService.post('/customer/device/van/remote', body)
    }

    controlDevice(status: DeviceStatus) {
        return this.apiService.post('/customer/device/control', status)
    }
}