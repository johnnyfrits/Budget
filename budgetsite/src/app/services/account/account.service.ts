import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ApiUrls } from 'src/app/common/api-urls'
import { Accounts } from 'src/app/models/accounts.model';
import { catchError, map } from 'rxjs/operators';
import { Messenger } from 'src/app/common/messenger';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(private http: HttpClient, private messenger: Messenger) { }

  read(): Observable<Accounts[]> {

    return this.http.get<Accounts[]>(ApiUrls.accounts).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }

  getAccountTotals(accountId: number | undefined, reference: string | undefined): Observable<Accounts> {
    return this.http.get<Accounts>(`${ApiUrls.accounttotals}account=${accountId}&reference=${reference}`).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }
}
