import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, tap } from 'rxjs';
import { ApiUrls } from 'src/app/common/api-urls';
import { Messenger } from 'src/app/common/messenger';
import { Users } from 'src/app/models/users';
import { UsersAuthenticateRequest } from 'src/app/models/usersauthenticaterequest';
import { UsersAuthenticateResponse } from 'src/app/models/usersauthenticateresponse';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient,
    private messenger: Messenger,
    private router: Router
  ) { }

  authenticate(userAuthenticateRequest: UsersAuthenticateRequest): Observable<UsersAuthenticateResponse> {
    return this.http.post<UsersAuthenticateResponse>(`${ApiUrls.users}/authenticate`, userAuthenticateRequest).pipe(
      map(obj => obj),
      catchError(e =>
        this.messenger.errorHandler(e))
    );
  }

  loginPage() {

    this.router.navigate(['login']);
  }

  login(userAuthenticateRequest: UsersAuthenticateRequest): Observable<UsersAuthenticateResponse> {
    return this.http.post<UsersAuthenticateResponse>(`${ApiUrls.users}/authenticate`, userAuthenticateRequest).pipe(
      tap(userAuthenticateResponse => {
        if (userAuthenticateResponse.token) {
          localStorage.setItem('token', userAuthenticateResponse.token);
          this.router.navigate(['']);
        }
      })
    );
  }

  create(user: Users): Observable<Users> {
    return this.http.post<Users>(ApiUrls.users, user).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }

  get userToken(): string | null {

    return localStorage.getItem('token') ? localStorage.getItem('token') : null;
  }

  get logged(): boolean {

    return localStorage.getItem('token') !== null;
  }

  logout() {

    localStorage.removeItem('token');

    this.router.navigate(['login'])
  }
}
