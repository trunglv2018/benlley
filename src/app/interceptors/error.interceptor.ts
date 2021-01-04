import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthenticationService } from '../services/authentication.service';
import { AlertController } from '@ionic/angular';


@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(
        private authenticationService: AuthenticationService,
        private alertCtrl: AlertController
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            if (err.status === 401 && !request.url.includes('/login')) {
                // auto logout if 401 response returned from api
                this.authenticationService.logout();
                location.reload();
            }
            const errMessage = err.error['error'] || err.statusText
            console.log(errMessage)
            this.showError(errMessage)
            return throwError(errMessage);
        }))
    }

    async showError(msg: string) {
        const alert = await this.alertCtrl.create({
            message: msg,
            buttons: ['OK']
        });

        await alert.present();
    }
}