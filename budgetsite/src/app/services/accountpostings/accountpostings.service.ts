import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable } from 'rxjs';
import { ApiUrls } from 'src/app/common/api-urls'
import { AccountsPostings } from 'src/app/models/accountspostings.model';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AccountPostingsService {

  constructor(private http: HttpClient) { }

  read(accountId: number, reference: string): Observable<AccountsPostings[]> {

    return this.http.get<AccountsPostings[]>(`${ApiUrls.accountspostings}/${accountId}/${reference}`).pipe(
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
