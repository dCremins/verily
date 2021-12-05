import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Launch } from './types';
import { SortDirection } from '@angular/material/sort';

@Injectable({
  providedIn: 'root',
})
export class LaunchService {
  constructor(private http: HttpClient) {}

  private spaceXApi = 'https://api.spacexdata.com/v5/launches/query'; // URL to web api

  private log(message: string) {
    console.log({ message });
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  getLaunches(
    sort: string,
    order: SortDirection,
    page: number,
  ): Observable<LaunchQueryResults | null> {
    console.log({ sort, order, page });
    const body = {
      query: {},
      options: {
        sort: { [sort]: order },
        page,
      },
    };
    return this.http.post<LaunchQueryResults | null>(this.spaceXApi, body).pipe(
      tap((_) => this.log('fetched launches')),
      tap((stuff) => console.log({ stuff })),
      catchError(
        this.handleError<LaunchQueryResults | null>('getLaunches', null),
      ),
    );
  }
}

interface LaunchQueryResults {
  docs: Launch[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
  nextPage: number | null;
  page: number;
  pagingCounter: number;
  prevPage: number | null;
  totalDocs: number;
  totalPages: number;
}
