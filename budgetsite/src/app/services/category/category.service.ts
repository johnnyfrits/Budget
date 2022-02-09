import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { ApiUrls } from 'src/app/common/api-urls';
import { Messenger } from 'src/app/common/messenger';
import { Categories } from 'src/app/models/categories.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private http: HttpClient, private messenger: Messenger) { }

  create(category: Categories): Observable<Categories> {

    return this.http.post<Categories>(`${ApiUrls.categories}`, category).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }

  read(): Observable<Categories[]> {

    return this.http.get<Categories[]>(`${ApiUrls.categories}`).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }

  update(category: Categories): Observable<Categories> {

    return this.http.put<Categories>(`${ApiUrls.categories}/${category.id}`, category).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }

  delete(id: number): Observable<Categories> {

    return this.http.delete<Categories>(`${ApiUrls.categories}/${id}`).pipe(
      map(obj => obj),
      catchError(e => this.messenger.errorHandler(e))
    );
  }
}
