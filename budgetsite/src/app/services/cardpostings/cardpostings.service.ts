import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiUrls } from 'src/app/common/api-urls'
import { CardsPostings } from 'src/app/models/cardspostings.model';
import { catchError, map } from 'rxjs/operators';
import { Messenger } from 'src/app/common/messenger';
import { CardsPostingsDTO } from 'src/app/models/cardspostingsdto.model';

@Injectable({
  providedIn: 'root'
})
export class CardPostingsService {

  constructor(private http: HttpClient, private messenger: Messenger) { }

  create(cardPosting: CardsPostings): Observable<CardsPostings> {

    cardPosting.others = cardPosting.peopleId ? true : false;

    return this.http.post<CardsPostings>(`${ApiUrls.cardspostings}${cardPosting.generateParcels ? '/allparcels' : ''}`, cardPosting).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }

  read(cardId: number, reference: string): Observable<CardsPostings[]> {

    return this.http.get<CardsPostings[]>(`${ApiUrls.cardspostings}/${cardId}/${reference}`).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }

  readCardsPostingsByPeople(peopleId: string, reference?: string): Observable<CardsPostings[]> {

    return this.http.get<CardsPostings[]>(`${ApiUrls.cardspostings}/people/${peopleId}/${reference}`).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }

  readCardsPostingsPeople(cardId?: number, reference?: string): Observable<CardsPostingsDTO[]> {

    return this.http.get<CardsPostingsDTO[]>(`${ApiUrls.cardspostingspeople}cardId=${cardId}&reference=${reference}`).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }

  readByPeopleId(peopleId?: string, reference?: string, cardId?: number,): Observable<CardsPostingsDTO> {

    return this.http.get<CardsPostingsDTO>(`${ApiUrls.cardspostings}/PeopleById?peopleId=${peopleId}&reference=${reference}&cardId=${cardId}`).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }

  update(cardPosting: CardsPostings): Observable<CardsPostings> {

    cardPosting.others = cardPosting.peopleId ? true : false;

    return this.http.put<CardsPostings>(`${ApiUrls.cardspostings}${cardPosting.generateParcels ? '/allparcels' : ''}/${cardPosting.id}`, cardPosting).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }

  updatePositions(cardPostings: CardsPostings[]): Observable<CardsPostings> {

    return this.http.put<any>(`${ApiUrls.cardspostings}/setpositions`, cardPostings).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }

  delete(id: number): Observable<CardsPostings> {

    return this.http.delete<CardsPostings>(`${ApiUrls.cardspostings}/${id}`).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }
}
