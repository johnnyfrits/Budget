import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { ApiUrls } from 'src/app/common/api-urls';
import { Messenger } from 'src/app/common/messenger';
import { BudgetTotals } from 'src/app/models/budgettotals';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {

  constructor(private http: HttpClient, private messenger: Messenger) { }

  getBudgetTotals(reference: string | undefined): Observable<BudgetTotals> {
    return this.http.get<BudgetTotals>(`${ApiUrls.budgetTotals}reference=${reference}`).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }
}
