import { UsersAuthenticateRequest } from './../../models/usersauthenticaterequest';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from './../../services/user/user.service';
import { Messenger } from 'src/app/common/messenger';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  _login!: string;
  _password!: string;
  hide = true;
  hideProgress: boolean = true;

  theme = localStorage.getItem('theme') ?? 'light-theme';

  loginFormGroup = new FormGroup(
    {
      loginFormControl: new FormControl('', Validators.required),
      passwordFormControl: new FormControl('', Validators.required)
    });

  constructor(private usuarioService: UserService,
    private messenger: Messenger,
  ) { }

  ngOnInit(): void {

    document.documentElement.className = this.theme;
  }

  login() {

    if (this.loginFormGroup.invalid)
      return;

    this.hideProgress = false;

    let userAuthenticateRequest: UsersAuthenticateRequest =
    {
      login: this._login,
      password: this._password
    };

    this.usuarioService.login(userAuthenticateRequest).subscribe(
      {
        next: () => {

          this.hideProgress = true;
        },
        error: (error) => {

          this.hideProgress = true;

          this.messenger.message(error.error.message);
        }
      }
    );
  }
}