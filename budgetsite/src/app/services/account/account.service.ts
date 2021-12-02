import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable } from 'rxjs';
import { ApiUrls } from 'src/app/common/api-urls'
import { Accounts } from 'src/app/models/accounts.model';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(private http: HttpClient) { }

  read(): Observable<Accounts[]> {

    return this.http.get<Accounts[]>(ApiUrls.accounts).pipe(
      map(obj => obj),
      catchError(e => this.errorHandler(e))
    );
  }

  getAccountTotals(account: number | undefined, reference: number): Observable<Accounts> {

    return this.http.get<Accounts>(`${ApiUrls.accounttotals}account=${account}&reference=${reference}`).pipe(
      map(obj => obj),
      catchError(e => this.errorHandler(e))
    );
  }

  errorHandler(err: any): Observable<any> {

    console.log(err);

    alert("Ocorreu um erro!");

    return EMPTY;
  }
}
