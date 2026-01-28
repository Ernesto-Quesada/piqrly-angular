import { ActionReducer, INIT, UPDATE } from '@ngrx/store';
import { AppState } from '../../models/app-state';

export function localStorageMetaReducer(
  reducer: ActionReducer<AppState>,
): ActionReducer<AppState> {
  return function (state, action) {
    if (action.type === INIT || action.type === UPDATE) {
      const savedState = localStorage.getItem('appState');
      if (savedState) {
        return JSON.parse(savedState);
      }
    }

    const nextState = reducer(state, action);

    const stateToSave = {
      landingData: nextState['landingData'],
      shopCart: nextState['shopCart'],
    };

    localStorage.setItem('appState', JSON.stringify(stateToSave));

    return nextState;
  };
}
