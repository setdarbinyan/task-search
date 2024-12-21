import { Component, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  filter,
  catchError,
} from 'rxjs/operators';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { CountryService } from '../../services/country.service';
import { saveSearchResult } from '../../store/seatch/search.actions';
import { selectSearchHistory } from '../../store/seatch/search.selector';
import { ScrollingModule } from '@angular/cdk/scrolling';
// import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, ScrollingModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent {
  searchControl = new FormControl('');
  results: any[] = [];
  searchHistory: { query: string; results: any[] }[] = [];
  error: string | null = null;
  private countryService = inject(CountryService);
  private store = inject(Store);

  constructor() {
    this.store.select(selectSearchHistory).subscribe((history) => {
      this.searchHistory = history;
    });

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        filter((query: any) => query.length > 2),
        switchMap((query) => {
          const cachedEntry = this.searchHistory.find(
            (entry) => entry.query === query
          );
          if (cachedEntry) {
            this.results = cachedEntry.results;
            return of(null);
          }
          return this.countryService.searchCountries(query).pipe(
            catchError((error) => {
              this.error = 'Something went wrong. Please try again.';
              console.error(error);
              return of([]);
            })
          );
        })
      )
      .subscribe((response) => {
        if (response) {
          this.results = response;
          this.error = null;
          this.store.dispatch(
            saveSearchResult({
              query: this.searchControl.value,
              results: response,
            })
          );
        }
      });
  }

  loadPreviousSearch(entry: { query: string; results: any[] }) {
    this.searchControl.setValue(entry.query);
    this.results = entry.results;
  }
}
