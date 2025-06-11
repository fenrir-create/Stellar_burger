import feedSlice, { getFeeds, initialState } from './feedSlice';

describe('тестирование редьюсера feedSlice', () => {
  describe('тестирование асинхронного GET экшена getFeeds', () => {
    const actions = {
      pending: {
        type: getFeeds.pending.type,
        payload: null
      },
      rejected: {
        type: getFeeds.rejected.type,
        error: { message: 'Funny mock-error' }
      },
      fulfilled: {
        type: getFeeds.fulfilled.type,
        payload: {
          orders: ['order1', 'order2'],
          total: 123,
          totalToday: 10
        }
      }
    };

    test('getFeeds.pending устанавливает isLoading в true и сбрасывает ошибку', () => {
      const state = feedSlice(initialState, actions.pending);
      expect(state.isLoading).toBe(true);
      expect(state.errorMessage).toBeNull();
    });

    test('getFeeds.rejected устанавливает ошибку и isLoading в false', () => {
      const state = feedSlice(initialState, actions.rejected);
      expect(state.isLoading).toBe(false);
      expect(state.errorMessage).toBe(actions.rejected.error.message);
    });

    test('getFeeds.fulfilled корректно обновляет состояние', () => {
      const nextState = feedSlice(initialState, actions.fulfilled);
      expect(nextState.isLoading).toBe(false);
      expect(nextState.errorMessage).toBeNull();
      expect(nextState.items).toEqual(actions.fulfilled.payload.orders);
      expect(nextState.totalCount).toBe(actions.fulfilled.payload.total);
      expect(nextState.todayCount).toBe(actions.fulfilled.payload.totalToday);
    });

    test('getFeeds.fulfilled с пустым списком заказов', () => {
      const action = {
        ...actions.fulfilled,
        payload: {
          orders: [],
          total: 0,
          totalToday: 0
        }
      };
      const state = feedSlice(initialState, action);
      expect(state.items).toEqual([]);
      expect(state.totalCount).toBe(0);
      expect(state.todayCount).toBe(0);
      expect(state.isLoading).toBe(false);
      expect(state.errorMessage).toBeNull();
    });

    test('getFeeds.pending не мутирует предыдущий state', () => {
      const prevState = { ...initialState, errorMessage: 'Ошибка' };
      const nextState = feedSlice(prevState, actions.pending);
      expect(nextState).not.toBe(prevState);
      expect(prevState.errorMessage).toBe('Ошибка');
    });
  });
});
