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

  read(reference: string): Observable<Incomes[]> {

    return this.http.get<Incomes[]>(`${ApiUrls.incomes}/${reference}`).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }
}