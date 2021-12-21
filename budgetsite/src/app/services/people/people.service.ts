import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiUrls } from 'src/app/common/api-urls'
import { People } from 'src/app/models/people.model';
import { catchError, map } from 'rxjs/operators';
import { Messenger } from 'src/app/common/messenger';

@Injectable({
  providedIn: 'root'
})
export class PeopleService {

  constructor(private http: HttpClient, private messenger: Messenger) { }

  read(): Observable<People[]> {

    return this.http.get<People[]>(ApiUrls.people).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }
}
