import { getOrderByNumberApi } from '../../../utils/burger-api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { TOrder } from '@utils-types';

// Тип состояния для работы с заказами
type TOrderState = {
  orderList: TOrder[];
  orderByNumberResponse: TOrder | null;
  request: boolean;
  responseOrder: null;
  errorMessage: string | null;
};

// Начальное состояние среза
export const initialState: TOrderState = {
  orderList: [],
  orderByNumberResponse: null,
  request: false,
  responseOrder: null,
  errorMessage: null
};

// AsyncThunk для запроса заказа по его номеру
export const getOrderByNumber = createAsyncThunk(
  'order/byNumber',
  async (number: number, { rejectWithValue }) => {
    try {
      // Проверка входного значения
      if (typeof number !== 'number' || number <= 0) {
        return rejectWithValue('Некорректный номер заказа');
      }

      const response = await getOrderByNumberApi(number);

      // Проверка успешности ответа
      if (
        !response ||
        !Array.isArray(response.orders) ||
        response.orders.length === 0
      ) {
        return rejectWithValue('Заказ не найден');
      }

      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке заказа');
    }
  }
);

// Создание Redux-среза для заказов
export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {},

  // Селектор состояния для использования в компонентах
  selectors: {
    getOrderState: (state) => state
  },

  // Обработка дополнительных action (в т.ч. asyncThunk)
  extraReducers: (builder) => {
    builder
      .addCase(getOrderByNumber.pending, (state) => {
        state.errorMessage = null;
        state.request = true;
      })
      .addCase(getOrderByNumber.rejected, (state, action) => {
        state.errorMessage = action.error.message as string;
        state.request = false;
      })
      .addCase(getOrderByNumber.fulfilled, (state, action) => {
        state.errorMessage = null;
        state.request = false;
        state.orderByNumberResponse = action.payload.orders[0];
      });
  }
});

// Экспорт селектора состояния среза
export const { getOrderState } = orderSlice.selectors;
// Экспорт редьюсера по умолчанию для подключения в store
export default orderSlice.reducer;
