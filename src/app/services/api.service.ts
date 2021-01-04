import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
    constructor(
        private http: HttpClient,
    ) { }

    private formatErrors(error: any) {
        return throwError(error.error);
    }

    get(path: string, params = {}): Observable<any> {
        return this.http.get(`${environment.apiUrl}${path}`, { params: params })
            .pipe(map(res => res['data']));
    }

    put(path: string, body: Object = {}): Observable<any> {
        return this.http.put(
            `${environment.apiUrl}${path}`,
            body
        ).pipe(map(res => res['data']));
    }

    post(path: string, body: Object = {}): Observable<any> {
        return this.http.post(
            `${environment.apiUrl}${path}`,
            body
        ).pipe(map(res => res['data']));
    }

    delete(path, param): Observable<any> {
        return this.http.delete(
            `${environment.apiUrl}${path}`,
            { params: param }
        ).pipe(map(res => res['data']));
    }
}

export interface IServiceResponse<T> {
    status: string;
    data: T;
}
