// Импорт API-функции для получения ингредиентов
import { getIngredientsApi } from '../../../utils/burger-api';
// Импорт функций из Redux Toolkit для создания асинхронных экшенов и слайса
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// Импорт типа данных для ингредиента
import { TIngredient } from '@utils-types';

// Определение типа состояния для ингредиентов
export type TIngredientState = {
  ingredients: TIngredient[]; // список ингредиентов
  loading: boolean; // индикатор загрузки
  error: string | null; // сообщение об ошибке, если есть
};

// Начальное состояние для ингредиентов
export const initialState: TIngredientState = {
  ingredients: [], // по умолчанию ингредиенты не загружены
  loading: false, // загрузка не происходит
  error: null // ошибки нет
};

// Создание асинхронного экшена для получения ингредиентов
// Thunk автоматически обрабатывает состояния: pending, fulfilled и rejected
export const getIngredients = createAsyncThunk(
  'ingredient/get', // тип экшена
  getIngredientsApi // функция, возвращающая Promise (наш API-запрос)
);

// Создание слайса Redux Toolkit для управления состоянием ингредиентов
export const ingredientSlice = createSlice({
  name: 'ingredient', // имя слайса
  initialState, // начальное состояние
  reducers: {}, // в данном случае не определены обычные редьюсеры
  selectors: {
    // Селектор для получения всего состояния слайса
    getIngredientState: (state) => state
  },
  extraReducers: (builder) => {
    // Обработка состояний асинхронного экшена getIngredients
    builder
      // Состояние, когда запрос начался
      .addCase(getIngredients.pending, (state) => {
        state.loading = true; // включаем индикатор загрузки
        state.error = null; // очищаем предыдущие ошибки
      })
      // Состояние, когда запрос завершился ошибкой
      .addCase(getIngredients.rejected, (state, action) => {
        state.loading = false; // отключаем загрузку
        state.error = action.error.message as string; // сохраняем сообщение об ошибке
      })
      // Состояние, когда запрос завершился успешно
      .addCase(getIngredients.fulfilled, (state, action) => {
        state.loading = false; // отключаем индикатор загрузки
        state.error = null; // очищаем ошибки
        state.ingredients = action.payload; // сохраняем полученные ингредиенты
      });
  }
});

// Экспорт селектора для доступа к состоянию из компонентов
export const { getIngredientState } = ingredientSlice.selectors;

// Экспорт редьюсера по умолчанию — используется при подключении к store
export default ingredientSlice.reducer;
