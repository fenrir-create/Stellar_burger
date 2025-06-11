import orderSlice, { initialState, getOrderByNumber } from './orderSlice';

describe('тестирование редьюсера orderSlice', () => {
  describe('тестирование асинхронного POST экшена getOrderByNumber', () => {
    const actions = {
      pending: {
        type: getOrderByNumber.pending.type,
        payload: null
      },
      rejected: {
        type: getOrderByNumber.rejected.type,
        error: { message: 'Funny mock-error' }
      },
      fulfilled: {
        type: getOrderByNumber.fulfilled.type,
        payload: { orders: ['someOrder'] }
      }
    };

    test('getOrderByNumber.pending', () => {
      const state = orderSlice(initialState, actions.pending);
      expect(state.request).toBe(true);
      expect(state.errorMessage).toBeNull();
    });

    test('getOrderByNumber.rejected', () => {
      const state = orderSlice(initialState, actions.rejected);
      expect(state.request).toBe(false);
      expect(state.errorMessage).toBe('Funny mock-error');
    });

    test('getOrderByNumber.fulfilled', () => {
      const state = orderSlice(initialState, actions.fulfilled);
      expect(state.request).toBe(false);
      expect(state.errorMessage).toBeNull();
      expect(state.orderByNumberResponse).toBe(
        actions.fulfilled.payload.orders[0]
      );
    });
  });
});
