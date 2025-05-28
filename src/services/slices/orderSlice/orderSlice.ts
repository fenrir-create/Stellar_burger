// Импорт API-функции для получения заказа по номеру
import { getOrderByNumberApi } from '../../../utils/burger-api';
// Импорт функций для создания async-thunk и среза (slice) Redux Toolkit
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// Тип данных заказа
import { TOrder } from '@utils-types';

// Тип состояния для работы с заказами
type TOrderState = {
  orders: TOrder[]; // массив заказов (не используется в этом слайсе, но зарезервировано)
  orderByNumberResponse: TOrder | null; // результат запроса заказа по номеру
  request: boolean; // индикатор выполнения запроса
  responseOrder: null; // устаревшее/неиспользуемое поле, можно удалить
  error: string | null; // сообщение об ошибке
};

// Начальное состояние среза
export const initialState: TOrderState = {
  orders: [],
  orderByNumberResponse: null,
  request: false,
  responseOrder: null,
  error: null
};

// AsyncThunk для запроса заказа по его номеру
export const getOrderByNumber = createAsyncThunk(
  'order/byNumber', // имя action
  async (number: number) => getOrderByNumberApi(number) // функция запроса к API
);

// Создание Redux-среза для заказов
export const orderSlice = createSlice({
  name: 'order', // имя среза
  initialState, // начальное состояние
  reducers: {}, // обычные редьюсеры не используются

  // Селектор состояния для использования в компонентах
  selectors: {
    getOrderState: (state) => state // возвращает весь state среза
  },

  // Обработка дополнительных action (в т.ч. asyncThunk)
  extraReducers: (builder) => {
    builder
      // При отправке запроса: сбрасываем ошибку, отмечаем что идёт загрузка
      .addCase(getOrderByNumber.pending, (state) => {
        state.error = null;
        state.request = true;
      })
      // При ошибке запроса: сохраняем ошибку, сбрасываем индикатор загрузки
      .addCase(getOrderByNumber.rejected, (state, action) => {
        state.error = action.error.message as string;
        state.request = false;
      })
      // При успешном ответе: сохраняем заказ, сбрасываем флаг загрузки
      .addCase(getOrderByNumber.fulfilled, (state, action) => {
        state.error = null;
        state.request = false;
        state.orderByNumberResponse = action.payload.orders[0]; // получаем первый заказ из массива
      });
  }
});

// Экспорт селектора состояния среза
export const { getOrderState } = orderSlice.selectors;
// Экспорт редьюсера по умолчанию для подключения в store
export default orderSlice.reducer;
