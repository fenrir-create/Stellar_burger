import ingredientSlice, {
  getIngredients,
  initialState
} from './ingredientSlice';

describe('тестирование редьюсера ingredientSlice', () => {
  describe('тестирование асинхронного GET экшена getIngredients', () => {
    const actions = {
      pending: {
        type: getIngredients.pending.type,
        payload: null
      },
      rejected: {
        type: getIngredients.rejected.type,
        error: { message: 'Funny mock-error' }
      },
      fulfilled: {
        type: getIngredients.fulfilled.type,
        payload: ['ingr1', 'ingr2']
      }
    };

    test('getIngredients.pending', () => {
      const state = ingredientSlice(initialState, actions.pending);
      expect(state.isLoading).toBe(true);
      expect(state.errorMessage).toBeNull();
    });

    test('getIngredients.rejected', () => {
      const state = ingredientSlice(initialState, actions.rejected);
      expect(state.isLoading).toBe(false);
      expect(state.errorMessage).toBe('Funny mock-error');
    });

    test('getIngredients.fulfilled', () => {
      const state = ingredientSlice(initialState, actions.fulfilled);
      expect(state.isLoading).toBe(false);
      expect(state.errorMessage).toBeNull();
      expect(state.ingredients).toEqual(actions.fulfilled.payload);
    });
    test('getIngredients.pending не мутирует предыдущее состояние', () => {
      const prevState = { ...initialState, errorMessage: 'Old error' };
      const nextState = ingredientSlice(prevState, actions.pending);

      expect(nextState).not.toBe(prevState);
      expect(prevState.errorMessage).toBe('Old error');
    });
    test('getIngredients.fulfilled сбрасывает ошибку и меняет isLoading', () => {
      const prevState = {
        ...initialState,
        isLoading: true,
        errorMessage: 'Some error'
      };
      const nextState = ingredientSlice(prevState, actions.fulfilled);

      expect(nextState.isLoading).toBe(false);
      expect(nextState.errorMessage).toBeNull();
      expect(nextState.ingredients).toEqual(actions.fulfilled.payload);
    });
    test('getIngredients.fulfilled с пустым массивом ингредиентов', () => {
      const action = { ...actions.fulfilled, payload: [] };
      const state = ingredientSlice(initialState, action);
      expect(state.ingredients).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.errorMessage).toBeNull();
    });
  });
});
