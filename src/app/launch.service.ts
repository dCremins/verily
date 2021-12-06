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

  // https://github.com/r-spacex/SpaceX-API/blob/master/docs/launches/v5/query.md
  private spaceXApi = 'https://api.spacexdata.com/v5/launches/query';

  private log(message: string) {
    // Not really necessary but we could loop in analytics and stuff here
    console.log({ log: message });
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
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
    // https://github.com/r-spacex/SpaceX-API/blob/master/docs/queries.md
    const body = {
      query: {},
      options: {
        sort: { [sort]: order },
        page: page + 1,
      },
    };
    return this.http.post<LaunchQueryResults | null>(this.spaceXApi, body).pipe(
      tap((_) => this.log('fetched launches')),
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
