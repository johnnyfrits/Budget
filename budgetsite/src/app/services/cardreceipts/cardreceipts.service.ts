import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { ApiUrls } from 'src/app/common/api-urls';
import { Messenger } from 'src/app/common/messenger';
import { CardsReceipts } from 'src/app/models/cardsreceipts.model';

@Injectable({
  providedIn: 'root'
})
export class CardReceiptsService {

  constructor(private http: HttpClient, private messenger: Messenger) { }

  create(cardReceipt: CardsReceipts): Observable<CardsReceipts> {

    return this.http.post<CardsReceipts>(`${ApiUrls.cardsreceipts}`, cardReceipt).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }

  // read(cardId: number, reference: string, peopleId: string): Observable<CardsReceipts[]> {

  //   return this.http.get<CardsReceipts[]>(`${ApiUrls.cardspostings}/${cardId}/${reference}/${peopleId}`).pipe(
  //     map(obj => obj),
  //     catchError(e => this.messenger.errorHandler(e))
  //   );
  // }

  // update(cardPosting: CardsReceipts): Observable<CardsReceipts> {

  //   let cr: CardsReceipts = {
  //     id: cardPosting.id,
  //     date: cardPosting.date,
  //     reference: cardPosting.reference,
  //     cardId: cardPosting.cardId,
  //     peopleId: cardPosting.peopleId,
  //     accountId: cardPosting.accountId,
  //     amount: cardPosting.amount,
  //     note: cardPosting.note
  //   };

  //   return this.http.put<CardsReceipts>(`${ApiUrls.cardsreceipts}/${cr.id}`, cr).pipe(
  //     map(obj => obj),
  //     catchError(e => this.messenger.errorHandler(e))
  //   );
  // }

  // delete(id: number): Observable<CardsReceipts> {

  //   return this.http.delete<CardsReceipts>(`${ApiUrls.cardsreceipts}/${id}`).pipe(
  //     map(obj => obj),
  //     catchError(e => this.messenger.errorHandler(e))
  //   );
  // }
}
