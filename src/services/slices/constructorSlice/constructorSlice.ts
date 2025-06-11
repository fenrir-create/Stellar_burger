import { orderBurgerApi } from '../../../utils/burger-api';
import {
  PayloadAction,
  createAsyncThunk,
  createSlice,
  nanoid
} from '@reduxjs/toolkit';
import { TConstructorIngredient, TIngredient, TOrder } from '@utils-types';

export type TConsturctorState = {
  isLoading: boolean;
  constructorItems: {
    bun: TConstructorIngredient | null;
    ingredients: TConstructorIngredient[];
  };
  orderRequest: boolean;
  orderData: TOrder | null;
  errorMessage: string | null;
};

// Начальное состояние
export const initialState: TConsturctorState = {
  isLoading: false,
  constructorItems: {
    bun: null,
    ingredients: []
  },
  orderRequest: false,
  orderData: null,
  errorMessage: null
};

// Асинхронный thunk для оформления заказа
export const orderBurger = createAsyncThunk(
  'user/order',
  async (data: string[], thunkAPI) => {
    try {
      // Проверка: data должен быть массивом непустых строк
      if (
        !Array.isArray(data) ||
        data.length === 0 ||
        !data.every((id) => typeof id === 'string' && id.trim() !== '')
      ) {
        return thunkAPI.rejectWithValue(
          'Некорректные данные для оформления заказа'
        );
      }

      const response = await orderBurgerApi(data);

      // Проверка ответа API
      if (!response || !response.success) {
        return thunkAPI.rejectWithValue(
          'Не удалось оформить заказ. Попробуйте позже.'
        );
      }

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        (error as Error).message || 'Произошла ошибка при оформлении заказа'
      );
    }
  }
);

export const constructorSlice = createSlice({
  name: 'constructorBurger',
  initialState,
  selectors: {
    getConstructorState: (state) => state
  },
  reducers: {
    // Добавление ингредиента
    addIngredient: {
      reducer: (state, action: PayloadAction<TConstructorIngredient>) => {
        if (action.payload.type === 'bun') {
          state.constructorItems.bun = action.payload;
        } else {
          state.constructorItems.ingredients.push(action.payload);
        }
      },
      prepare: (ingredient: TIngredient) => {
        const id = nanoid();
        return { payload: { ...ingredient, id } };
      }
    },

    // Удаление ингредиента по id
    removeIngredient: (state, action: PayloadAction<string>) => {
      state.constructorItems.ingredients =
        state.constructorItems.ingredients.filter(
          (i) => i.id !== action.payload
        );
    },

    // Перемещение ингредиента вверх в списке
    moveIngredientUp: (state, action: PayloadAction<number>) => {
      state.constructorItems.ingredients.splice(
        action.payload,
        0,
        state.constructorItems.ingredients.splice(action.payload - 1, 1)[0]
      );
    },

    // Перемещение ингредиента вниз в списке
    moveIngredientDown: (state, action: PayloadAction<number>) => {
      state.constructorItems.ingredients.splice(
        action.payload,
        0,
        state.constructorItems.ingredients.splice(action.payload + 1, 1)[0]
      );
    },

    setRequest: (state, action) => {
      state.orderRequest = action.payload;
    },

    resetModal: (state) => {
      state.orderData = null;
    }
  },

  // Обработка состояний асинхронного экшена orderBurger
  extraReducers: (builder) => {
    builder
      .addCase(orderBurger.pending, (state, action) => {
        state.isLoading = true;
        state.orderRequest = true;
        state.errorMessage = null;
      })
      .addCase(orderBurger.rejected, (state, action) => {
        state.isLoading = false;
        state.orderRequest = false;
        state.errorMessage = action.error.message as string;
      })
      .addCase(orderBurger.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderRequest = false;
        state.errorMessage = null;
        state.orderData = action.payload.order;
        state.constructorItems = {
          bun: null,
          ingredients: []
        };
        console.log(action.payload);
      });
  }
});

// Экспорт экшенов
export const {
  addIngredient,
  removeIngredient,
  moveIngredientUp,
  moveIngredientDown,
  setRequest,
  resetModal
} = constructorSlice.actions;

// Экспорт селектора
export const { getConstructorState } = constructorSlice.selectors;

// Экспорт редьюсера по умолчанию
export default constructorSlice.reducer;
