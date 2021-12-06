import {
  Component,
  ViewEncapsulation,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, SortDirection } from '@angular/material/sort';
import { Router } from '@angular/router';
import { LaunchService } from 'src/app/launch.service';
import { Launch } from 'src/app/types';
import { merge, Observable, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-launches',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.sass'],
  encapsulation: ViewEncapsulation.None,
})
export class TableComponent implements AfterViewInit {
  title = 'SpaceX Launch Schedule';
  displayedColumns: string[] = [
    'flight_number',
    'date_local',
    'name',
    'details',
  ];
  launches: MatTableDataSource<Launch> = new MatTableDataSource();

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private launchService: LaunchService, private router: Router) {}

  getLaunches(): void {
    merge(this.sort?.sortChange, this.paginator?.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.launchService
            .getLaunches(
              this.sort.active,
              this.sort.direction,
              this.paginator.pageIndex,
            )
            .pipe(catchError(() => observableOf(null)));
        }),
        map((data) => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.isRateLimitReached = data === null;

          if (data === null) {
            return [];
          }

          // Only refresh the result length if there is new data. In case of rate
          // limit errors, we do not want to reset the paginator to zero, as that
          // would prevent users from re-triggering requests.
          this.resultsLength = data.totalDocs;
          return data.docs;
        }),
      )
      .subscribe(
        (launches) => (this.launches = new MatTableDataSource(launches)),
      );
  }

  openPressKit(launch: Launch) {
    // Not all launches have presskit links
    // SpaceX Hosted Press Kit Links currently redirect to the main website
    // https://github.com/r-spacex/SpaceX-API/issues/810
    if (launch.links && launch.links.presskit) {
      window.open(launch.links.presskit, '_blank');
    }
  }

  ngAfterViewInit() {
    // If the user changes the sort order, reset back to the first page.
    this.sort?.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    this.getLaunches();
    this.launches.sort = this.sort;
    this.launches.paginator = this.paginator;
  }
}
