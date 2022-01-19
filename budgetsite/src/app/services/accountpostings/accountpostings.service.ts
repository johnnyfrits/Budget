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

  create(accountPosting: AccountsPostings): Observable<AccountsPostings> {

    return this.http.post<AccountsPostings>(`${ApiUrls.accountspostings}`, accountPosting).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }

  read(accountId: number, reference: string): Observable<AccountsPostings[]> {

    return this.http.get<AccountsPostings[]>(`${ApiUrls.accountspostings}/${accountId}/${reference}`).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }

  update(accountPosting: AccountsPostings): Observable<AccountsPostings> {

    return this.http.put<AccountsPostings>(`${ApiUrls.accountspostings}/${accountPosting.id}`, accountPosting).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }

  updatePositions(accountPostings: AccountsPostings[]): Observable<AccountsPostings> {

    return this.http.put<any>(`${ApiUrls.accountspostings}/setpositions`, accountPostings).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }

  delete(id: number): Observable<AccountsPostings> {

    return this.http.delete<AccountsPostings>(`${ApiUrls.accountspostings}/${id}`).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }
}
