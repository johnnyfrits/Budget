import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiUrls } from 'src/app/common/api-urls'
import { catchError, map } from 'rxjs/operators';
import { Messenger } from 'src/app/common/messenger';
import { Expenses } from 'src/app/models/expenses.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  constructor(private http: HttpClient, private messenger: Messenger) { }

  create(expense: Expenses): Observable<Expenses> {

    return this.http.post<Expenses>(`${ApiUrls.expenses}`, expense).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }

  read(reference: string): Observable<Expenses[]> {

    return this.http.get<Expenses[]>(`${ApiUrls.expenses}/reference/${reference}`).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }

  update(expense: Expenses): Observable<Expenses> {

    return this.http.put<Expenses>(`${ApiUrls.expenses}/${expense.id}`, expense).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }

  delete(id: number): Observable<Expenses> {

    return this.http.delete<Expenses>(`${ApiUrls.expenses}/${id}`).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }
}
