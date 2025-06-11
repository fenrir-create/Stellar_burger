import { getIngredientsApi } from '../../../utils/burger-api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { TIngredient } from '@utils-types';

export type TIngredientState = {
  ingredients: TIngredient[];
  isLoading: boolean;
  errorMessage: string | null;
};

export const initialState: TIngredientState = {
  ingredients: [],
  isLoading: false,
  errorMessage: null
};

// Создание асинхронного экшена для получения ингредиентов
export const getIngredients = createAsyncThunk<
  TIngredient[],
  void,
  { rejectValue: string }
>('ingredient/get', async (_, thunkAPI) => {
  try {
    const response = await getIngredientsApi();

    if (!Array.isArray(response)) {
      return thunkAPI.rejectWithValue('Некорректные данные от API');
    }

    return response;
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message);
  }
});

// Создание слайса Redux Toolkit для управления состоянием ингредиентов
export const ingredientSlice = createSlice({
  name: 'ingredient',
  initialState,
  reducers: {},
  selectors: {
    // Селектор для получения всего состояния слайса
    getIngredientState: (state) => state
  },
  extraReducers: (builder) => {
    builder
      // Состояние, когда запрос начался
      .addCase(getIngredients.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = null;
      })
      // Состояние, когда запрос завершился ошибкой
      .addCase(getIngredients.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage = action.error.message as string;
      })
      // Состояние, когда запрос завершился успешно
      .addCase(getIngredients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.errorMessage = null;
        state.ingredients = action.payload;
      });
  }
});

// Экспорт селектора для доступа к состоянию из компонентов
export const { getIngredientState } = ingredientSlice.selectors;

// Экспорт редьюсера по умолчанию — используется при подключении к store
export default ingredientSlice.reducer;
