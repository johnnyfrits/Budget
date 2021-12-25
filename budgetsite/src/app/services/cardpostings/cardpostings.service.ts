import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiUrls } from 'src/app/common/api-urls'
import { CardsPostings } from 'src/app/models/cardspostings.model';
import { catchError, map } from 'rxjs/operators';
import { Messenger } from 'src/app/common/messenger';

@Injectable({
  providedIn: 'root'
})
export class CardPostingsService {

  constructor(private http: HttpClient, private messenger: Messenger) { }

  read(cardId: number, reference: string): Observable<CardsPostings[]> {

    return this.http.get<CardsPostings[]>(`${ApiUrls.cardspostings}/${cardId}/${reference}`).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }

  update(cardPosting: CardsPostings): Observable<CardsPostings> {

    let cp: CardsPostings = {
      id: cardPosting.id,
      cardId: cardPosting.cardId,
      reference: cardPosting.reference,
      date: cardPosting.date,
      description: cardPosting.description,
      amount: cardPosting.amount,
      peopleId: cardPosting.peopleId,
      others: cardPosting.peopleId ? true : false
    };

    return this.http.put<CardsPostings>(`${ApiUrls.cardspostings}/${cp.id}`, cp).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }
}
