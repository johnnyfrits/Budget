import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable } from 'rxjs';
import { ApiUrls } from 'src/app/common/api-urls'
import { Cards } from 'src/app/models/cards.model';
import { catchError, map } from 'rxjs/operators';
import { Messenger } from 'src/app/common/messenger';

@Injectable({
  providedIn: 'root'
})
export class CardService {

  constructor(private http: HttpClient, private messenger: Messenger) { }

  read(): Observable<Cards[]> {

    return this.http.get<Cards[]>(ApiUrls.cards).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }
}
