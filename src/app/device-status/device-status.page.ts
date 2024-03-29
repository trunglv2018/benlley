import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, ToastController } from '@ionic/angular';
import { delay, retryWhen, take } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from 'src/environments/environment';
import { DeviceStatus } from '../models/device_status.model';
import { CustomerService } from '../services/customer.service';
import { SocketService } from '../services/socket.service';

// interface CurrentState {
//   V1: boolean
//   V2: boolean
//   L1: boolean
//   L2: boolean
// }

interface CurrentState {
  V1: number
  V2: number
  L1: number
  L2: number
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
    V1: 0,
    V2: 0,
    L1: 0,
    L2: 0,
  }
  ws: WebSocketSubject<any>
  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private socket: SocketService,
    private customerService: CustomerService,
    private toastCtrl: ToastController,
    public actionSheetController: ActionSheetController
  ) {
    this.socket.connect(`${environment.baseWS}?device_id`)
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.deviceID = params['device_id']
      this.connectWs(params['device_id'])
    });
    this.getDeviceSetting('SETUP_RECOVER_COLDWATER')
    this.getValveSetting()
    this.getBuNhietSetting()
  }

  deviceSetting = <any>{}
  valveSetting = <any>{}
  getDeviceSetting(command) {
    this.customerService.getSetting(this.deviceID, command).subscribe(setting => {
      if (setting) {
        this.deviceSetting = setting
        console.log(this.deviceSetting)
      } else {
        this.deviceSetting = defaultDeviceStatus
      }
    })
  }

  getValveSetting() {
    this.customerService.getSetting(this.deviceID, 'VALVE').subscribe(setting => {
      if (setting) {
        this.valveSetting = setting
      } else {
        this.valveSetting = defaultValveDeviceStatus
      }
    })
  }

  buNhietSetting = <any>{}
  getBuNhietSetting() {
    this.customerService.getSetting(this.deviceID, 'SETUP_COMP_HEATER').subscribe(setting => {
      if (setting) {
        this.buNhietSetting = setting
      } else {
        this.buNhietSetting = defaultBuNhietStatus
      }
    })
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Switch Server',
      cssClass: 'my-custom-class',
      buttons: [{
        text: 'Off',
        role: 'selected',
        icon: 'radio-button-off',
        handler: () => {
          this.switchServer(1)
        }
      }, {
        text: 'Auto',
        icon: 'aperture',
        handler: () => {
          console.log('Share clicked');
          this.switchServer(2)
        }
      }, {
        text: 'Timeframe & Forced',
        icon: 'alarm',
        handler: () => {
          this.switchServer(3)
        }
      }, {
        text: 'Force',
        icon: 'cube',
        handler: () => {
          this.switchServer(4)
        }
      }, {
        text: 'Đóng',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    await actionSheet.present();

    const { role } = await actionSheet.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

  switchServer(st) {
    this.deviceSetting.Command = 'MODE'
    this.deviceSetting.ST = st
    this.customerService.commandToDevice(this.deviceSetting).subscribe(_ => {
      this.toastCtrl.create({ message: 'Cài đặt thành công!' })
    })
  }


  openValveByPass() {
    this.valveSetting.Command = 'VALVE'
    this.valveSetting.ST = (this.valveSetting.ST == 1 ? 0 : 1)
    this.customerService.commandToDevice(this.valveSetting).subscribe(_ => {
      this.toastCtrl.create({ message: 'Cài đặt thành công!' })
    })
  }

  buNhietCuongBuc() {
    this.buNhietSetting.Command = 'SETUP_COMP_HEATER'
    this.buNhietSetting.ST = (this.buNhietSetting.ST == 1 ? 0 : 1)
    this.customerService.commandToDevice(this.buNhietSetting).subscribe(_ => {
      this.toastCtrl.create({ message: 'Cài đặt thành công!' })
    })
  }

  ngOnDestroy(): void {
    if (this.ws) {
      this.ws.unsubscribe()
    }
  }

  onControl() {
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
    // this.currentState.V1 = this.deviceStatus.V1 == 1 ? true : false
    // this.currentState.V2 = this.deviceStatus.V2 == 1 ? true : false
    // this.currentState.L1 = this.deviceStatus.L1 == 1 ? true : false
    // this.currentState.L2 = this.deviceStatus.L2 == 1 ? true : false

    this.currentState.V1 = this.deviceStatus.V1
    this.currentState.V2 = this.deviceStatus.V2
  }

  setDeviceStatus() {
    console.log('before ', this.currentState)

    console.log('after ', this.currentState)

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

  }

  onControlVan1() {
    this.currentState.V1 = (this.currentState.V1 == 1 ? 0 : 1)
    this.deviceStatus.V1 = this.currentState.V1
    this.deviceStatus.L1 = this.currentState.V1

  }

  onControlVan2() {
    this.currentState.V2 = (this.currentState.V2 == 1 ? 0 : 1)
    this.deviceStatus.V2 = this.currentState.V2
    this.deviceStatus.L2 = this.currentState.V2
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

const defaultDeviceStatus = <any>{
  S1: 42,
  S2: 42,
  S33: 38,
  D1: 1.6,
  D2: 1.6,
  D33: 0.8,
  C1: 2,
  C2: 2,
  C3: 2,
  ST: 0,
}

const defaultValveDeviceStatus = <any>{
  ST: 0,
}

const defaultBuNhietStatus = <any>{
  D38: 1.3,
  S38: 46.6,
  ST: 0,
}