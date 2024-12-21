import { createReducer, on } from '@ngrx/store';
import * as SearchActions from './search.actions';

export interface SearchState {
  history: { query: string; results: any[] }[];
}

export const initialState: SearchState = {
  history: []
};

export const searchReducer = createReducer(
  initialState,
  on(SearchActions.saveSearchResult, (state, { query, results }) => ({
    ...state,
    history: [
      ...state.history.filter(entry => entry.query !== query),
      { query, results }
    ]
  }))
);
