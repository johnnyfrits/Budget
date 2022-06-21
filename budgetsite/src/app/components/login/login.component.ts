import { Users } from './../../models/users';
import { UsersAuthenticateRequest } from './../../models/usersauthenticaterequest';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
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

    let userAuthenticateRequest: UsersAuthenticateRequest =
    {
      login: this._login,
      password: this._password
    };

    this.usuarioService.login(userAuthenticateRequest).subscribe();
  }
}