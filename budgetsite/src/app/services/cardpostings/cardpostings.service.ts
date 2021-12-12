import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable } from 'rxjs';
import { ApiUrls } from 'src/app/common/api-urls'
import { CardsPostings } from 'src/app/models/cardspostings.model';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CardPostingsService {

  constructor(private http: HttpClient) { }

  read(cardId: number, reference: string): Observable<CardsPostings[]> {

    return this.http.get<CardsPostings[]>(`${ApiUrls.cardspostings}/${cardId}/${reference}`).pipe(
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
