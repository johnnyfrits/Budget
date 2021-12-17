import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiUrls } from 'src/app/common/api-urls'
import { AccountsPostings } from 'src/app/models/accountspostings.model';
import { catchError, map } from 'rxjs/operators';
import { Messenger } from 'src/app/common/messenger';

@Injectable({
  providedIn: 'root'
})
export class AccountPostingsService {

  constructor(private http: HttpClient, private messenger: Messenger) { }

  read(accountId: number, reference: string): Observable<AccountsPostings[]> {

    return this.http.get<AccountsPostings[]>(`${ApiUrls.accountspostings}/${accountId}/${reference}`).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }
}
