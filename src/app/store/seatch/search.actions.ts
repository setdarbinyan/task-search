import { createAction, props } from '@ngrx/store';

export const saveSearchResult = createAction(
  '[Search] Save Search Result',
  props<{ query: any; results: any[] }>()
);

export const loadSearchHistory = createAction('[Search] Load Search History');
