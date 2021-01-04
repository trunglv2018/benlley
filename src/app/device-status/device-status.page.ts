import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { delay, retryWhen, take } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from 'src/environments/environment';
import { DeviceStatus } from '../models/device_status.model';
import { CustomerService } from '../services/customer.service';
import { SocketService } from '../services/socket.service';

interface CurrentState {
  V1: boolean
  V2: boolean
  L1: boolean
  L2: boolean
}

@Component({
  selector: 'app-device-status',
  templateUrl: './device-status.page.html',
  styleUrls: ['./device-status.page.scss'],
})
export class DeviceStatusPage implements OnInit, OnDestroy {

  deviceStatus: DeviceStatus = <DeviceStatus>{}
  deviceID
  currentState = <CurrentState>{
    V1: false,
    V2: false,
    L1: false,
    L2: false,
  }
  ws: WebSocketSubject<any>
  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private socket: SocketService,
    private customerService: CustomerService,
    private toastCtrl: ToastController
  ) {
    this.socket.connect(`${environment.baseWS}?device_id`)
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.deviceID = params['device_id']
      this.connectWs(params['device_id'])
    });
  }

  ngOnDestroy(): void {
    if (this.ws) {
      this.ws.unsubscribe()
    }
  }

  onControl() {
    console.log(this.currentState)
    this.deviceStatus.Command = "CONTROL"
    this.setDeviceStatus()
    this.setDefaultTime()
    this.customerService.controlDevice(this.deviceStatus).subscribe(_ => {
      this.showToast('Cập nhật trạng thái thiết bị thành công')
    })
  }

  connectWs(deviceID) {
    this.ws = webSocket(`${environment.baseWS}?device_id=${deviceID}`);
    this.ws.pipe(
      retryWhen((errors) => errors.pipe(delay(3000), take(100)))
    ).subscribe(res => {
      if (res) {
        this.deviceStatus = <DeviceStatus>res
        // this.setCurrentState()
      }
    })
  }

  setCurrentState() {
    this.currentState.V1 = this.deviceStatus.V1 == 1 ? true : false
    this.currentState.V2 = this.deviceStatus.V2 == 1 ? true : false
    this.currentState.L1 = this.deviceStatus.L1 == 1 ? true : false
    this.currentState.L2 = this.deviceStatus.L2 == 1 ? true : false
  }

  setDeviceStatus() {
    this.deviceStatus.V1 = this.currentState.V1 ? 1 : 0
    this.deviceStatus.V2 = this.currentState.V2 ? 1 : 0
    this.deviceStatus.L1 = this.currentState.L1 ? 1 : 0
    this.deviceStatus.L2 = this.currentState.L2 ? 1 : 0

    // TH van 1 bật set đèn 1 bật luôn
    // if (this.currentState.V1) {
    //   this.currentState.L1 = true
    //   this.deviceStatus.L1 = 1
    // } else {
    //   this.currentState.L1 = false
    //   this.deviceStatus.L1 = 0
    // }

    // if (this.currentState.V2) {
    //   this.currentState.L2 = true
    //   this.deviceStatus.L2 = 1
    // } else {
    //   this.currentState.L2 = false
    //   this.deviceStatus.L2 = 0
    // }

    this.currentState.L1 = this.currentState.V1
    this.deviceStatus.L1 = this.currentState.V1 ? 1 : 0
    this.currentState.L2 = this.currentState.V2
    this.deviceStatus.L2 = this.currentState.V2 ? 1 : 0
  }

  setDefaultTime() {
    this.deviceStatus.Time = {
      Hours: 0,
      Minutes: 0
    }
  }

  onRemote(actor: string, currentState: number) {
    currentState = currentState == 1 ? 0 : 1
  }

  async showToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }
 
  
}
