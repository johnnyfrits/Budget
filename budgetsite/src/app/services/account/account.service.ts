import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiUrls } from 'src/app/common/api-urls'
import { Accounts } from 'src/app/models/accounts.model';
import { catchError, map } from 'rxjs/operators';
import { Messenger } from 'src/app/common/messenger';
import { AccountsSummary } from 'src/app/models/accountssummary';
import { AccountsSummaryTotals } from 'src/app/models/accountssummarytotals';

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

  getAccountsSummary(reference: string | undefined): Observable<AccountsSummary[]> {
    return this.http.get<AccountsSummary[]>(`${ApiUrls.accountssummary}reference=${reference}`).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }

  getTotalsAccountsSummary(reference: string | undefined): Observable<AccountsSummaryTotals> {
    return this.http.get<AccountsSummaryTotals>(`${ApiUrls.totalsaccountssummary}reference=${reference}`).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }
}
