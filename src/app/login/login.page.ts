import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { UserData } from '../providers/user-data';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  login: UserOptions = { username: '', password: '' };
  submitted = false;

  constructor(
    public authenticationService: AuthenticationService,
    public router: Router
  ) { }

  ngOnInit(): void {

  }

  onLogin(form: NgForm) {
    this.submitted = true;
    if (form.valid) {
      this.authenticationService.login({ email: this.login.username, password: this.login.password }).subscribe(res => {
        this.router.navigateByUrl('/');
      });
    }
  }

  onSignup() {
    this.router.navigateByUrl('/signup');
  }

}

export interface UserOptions {
  username: string;
  password: string;
}
