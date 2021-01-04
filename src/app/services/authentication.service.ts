import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TokenInfo } from '../models/token-info.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private currentUserSubject: BehaviorSubject<TokenInfo>;
  public currentUser: Observable<TokenInfo>;

  constructor(private apiService: ApiService) {
    this.currentUserSubject = new BehaviorSubject<TokenInfo>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): TokenInfo {
    return this.currentUserSubject.value;
  }

  login(loginInfo: { email: string, password: string }) {
    return this.apiService.post(`/auth/customer/login`, loginInfo)
      .pipe(map(user => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        return user;
      }));
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}
