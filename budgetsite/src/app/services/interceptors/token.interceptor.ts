import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { UserService } from '../user/user.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private userService: UserService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token = this.userService.userToken;
    const requestUrl: Array<any> = request.url.split('/');
    const apiUrl: Array<any> = environment.baseUrl.split('/');

    if (token && requestUrl[2] === apiUrl[2]) {

      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      return next.handle(request).pipe(catchError(err => {

        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            this.userService.logout();
          }
        }
        return throwError(err.message);
      }));
    }
    else {
      return next.handle(request);
    }
  }
}
