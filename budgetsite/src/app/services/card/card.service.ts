import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiUrls } from 'src/app/common/api-urls'
import { Cards } from 'src/app/models/cards.model';
import { catchError, map } from 'rxjs/operators';
import { Messenger } from 'src/app/common/messenger';

@Injectable({
  providedIn: 'root'
})
export class CardService {

  constructor(private http: HttpClient, private messenger: Messenger) { }

  create(card: Cards): Observable<Cards> {
    return this.http.post<Cards>(ApiUrls.cards, card).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }

  read(): Observable<Cards[]> {

    return this.http.get<Cards[]>(ApiUrls.cards).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }

  readWithCardsInvoiceDate(reference?: string): Observable<Cards[]> {

    return this.http.get<Cards[]>(`${ApiUrls.cards}/WithCardsInvoiceDate?reference=${reference}`).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }


  update(card: Cards): Observable<Cards> {
    return this.http.put<Cards>(`${ApiUrls.cards}/${card.id}`, card).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }

  delete(id: number): Observable<Cards> {
    return this.http.delete<Cards>(`${ApiUrls.cards}/${id}`).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }
}
