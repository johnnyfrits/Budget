import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiUrls } from 'src/app/common/api-urls'
import { catchError, map } from 'rxjs/operators';
import { Messenger } from 'src/app/common/messenger';
import { Incomes } from 'src/app/models/incomes.model';

@Injectable({
  providedIn: 'root'
})
export class IncomeService {

  constructor(private http: HttpClient, private messenger: Messenger) { }

  create(income: Incomes): Observable<Incomes> {

    return this.http.post<Incomes>(`${ApiUrls.incomes}${income.repeatIncome ? `/repeat?qtyMonths=${income.monthsToRepeat}` : ''}`, income).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }

  read(reference: string, justMyValues: boolean): Observable<Incomes[]> {

    return this.http.get<Incomes[]>(`${ApiUrls.incomes}/reference${justMyValues ? '2' : ''}/${reference}`).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }

  readComboList(reference: string): Observable<Incomes[]> {

    return this.http.get<Incomes[]>(`${ApiUrls.incomes}/combolist/${reference}`).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }

  update(income: Incomes): Observable<Incomes> {

    return this.http.put<Incomes>(`${ApiUrls.incomes}${income.repeatIncome ? "/repeat" : ""}/${income.id}${income.repeatIncome ? `?qtyMonths=${income.monthsToRepeat}` : ""}`, income).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }

  updateValue(id: number, value: number): Observable<Incomes> {

    return this.http.put<Incomes>(`${ApiUrls.incomes}/AddValue/${id}?value=${value}`, null).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }

  delete(id: number): Observable<Incomes> {

    return this.http.delete<Incomes>(`${ApiUrls.incomes}/${id}`).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }
}
