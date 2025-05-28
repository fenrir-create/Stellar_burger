import appStore, { rootReducer as combinedReducer } from '../services/store';

test('root reducer should return initial state for unknown action', () => {
  const initialState = combinedReducer(undefined, { type: 'UNKNOWN_ACTION' });
  expect(initialState).toEqual(appStore.getState());
});
