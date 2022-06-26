import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Messenger } from 'src/app/common/messenger';
import { UsersAuthenticateRequest } from 'src/app/models/usersauthenticaterequest';
import { UsersRegisterRequest } from 'src/app/models/usersregisterrequest';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-userregister',
  templateUrl: './userregister.component.html',
  styleUrls: ['./userregister.component.scss']
})
export class UserRegisterComponent implements OnInit {

  _name!: string;
  _login!: string;
  _password!: string;

  hide = true;
  hideProgress: boolean = true;

  theme = localStorage.getItem('theme') ?? 'light-theme';

  userRegisterFormGroup = new FormGroup(
    {
      nameFormControl: new FormControl('', Validators.required),
      loginFormControl: new FormControl('', Validators.required),
      passwordFormControl: new FormControl('', Validators.required)
    });

  constructor(private userService: UserService, private messenger: Messenger) { }

  ngOnInit(): void {

    document.documentElement.className = this.theme;
  }

  register() {

    if (this.userRegisterFormGroup.invalid)
      return;

    this.hideProgress = false;

    let userRegisterRequest: UsersRegisterRequest =
    {
      name: this._name,
      login: this._login,
      password: this._password
    };

    this.userService.create(userRegisterRequest).subscribe(
      {
        next: () => {

          debugger;

          let userAuthenticateRequest: UsersAuthenticateRequest =
          {
            login: this._login,
            password: this._password
          };

          this.userService.login(userAuthenticateRequest).subscribe(
            {
              next: () => {

                this.hideProgress = true;
              },
              error: (err) => {

                this.hideProgress = true;

                this.messenger.message(err.error.detail);
              }
            }
          );
        },
        error: (err) => {

          this.hideProgress = true;

          this.messenger.message(err.error.detail);
        }
      }
    );
  }
}
