// Импорт API-функции для оформления заказа
import { orderBurgerApi } from '../../../utils/burger-api';
// Импорт необходимых функций и типов из Redux Toolkit
import {
  PayloadAction,
  createAsyncThunk,
  createSlice,
  nanoid
} from '@reduxjs/toolkit';
// Импорт пользовательских типов
import { TConstructorIngredient, TIngredient, TOrder } from '@utils-types';

// Тип состояния конструктора бургера
export type TConsturctorState = {
  loading: boolean; // индикатор загрузки
  constructorItems: {
    bun: TConstructorIngredient | null; // выбранная булка
    ingredients: TConstructorIngredient[]; // выбранные начинки
  };
  orderRequest: boolean; // индикатор запроса на оформление заказа
  orderModalData: TOrder | null; // данные заказа для отображения в модальном окне
  error: string | null; // сообщение об ошибке
};

// Начальное состояние
export const initialState: TConsturctorState = {
  loading: false,
  constructorItems: {
    bun: null,
    ingredients: []
  },
  orderRequest: false,
  orderModalData: null,
  error: null
};

// Асинхронный thunk для оформления заказа
export const orderBurger = createAsyncThunk(
  'user/order', // тип действия
  async (
    data: string[] // payload — массив id ингредиентов
  ) => orderBurgerApi(data) // вызов API
);

// Создание слайса Redux Toolkit
export const constructorSlice = createSlice({
  name: 'constructorBurger', // имя слайса
  initialState, // начальное состояние
  selectors: {
    // Селектор для получения всего состояния конструктора
    getConstructorState: (state) => state
  },
  reducers: {
    // Добавление ингредиента
    addIngredient: {
      reducer: (state, action: PayloadAction<TConstructorIngredient>) => {
        if (action.payload.type === 'bun') {
          // Если тип ингредиента — булка, заменяем текущую
          state.constructorItems.bun = action.payload;
        } else {
          // Иначе добавляем как обычный ингредиент
          state.constructorItems.ingredients.push(action.payload);
        }
      },
      prepare: (ingredient: TIngredient) => {
        // Генерация уникального id при добавлении ингредиента
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
        action.payload, // позиция, куда вставляем
        0,
        state.constructorItems.ingredients.splice(action.payload - 1, 1)[0] // вырезаем и вставляем выше
      );
    },

    // Перемещение ингредиента вниз в списке
    moveIngredientDown: (state, action: PayloadAction<number>) => {
      state.constructorItems.ingredients.splice(
        action.payload, // позиция, куда вставляем
        0,
        state.constructorItems.ingredients.splice(action.payload + 1, 1)[0] // вырезаем и вставляем ниже
      );
    },

    // Установка флага запроса на оформление заказа вручную (если нужно)
    setRequest: (state, action) => {
      state.orderRequest = action.payload;
    },

    // Сброс данных модального окна после закрытия
    resetModal: (state) => {
      state.orderModalData = null;
    }
  },

  // Обработка состояний асинхронного экшена orderBurger
  extraReducers: (builder) => {
    builder
      // Заказ отправляется
      .addCase(orderBurger.pending, (state, action) => {
        state.loading = true;
        state.orderRequest = true;
        state.error = null;
      })
      // Ошибка при оформлении заказа
      .addCase(orderBurger.rejected, (state, action) => {
        state.loading = false;
        state.orderRequest = false;
        state.error = action.error.message as string;
      })
      // Заказ успешно оформлен
      .addCase(orderBurger.fulfilled, (state, action) => {
        state.loading = false;
        state.orderRequest = false;
        state.error = null;
        state.orderModalData = action.payload.order; // сохраняем данные заказа
        // Очищаем конструктор после успешного заказа
        state.constructorItems = {
          bun: null,
          ingredients: []
        };
        console.log(action.payload); // отладочный вывод
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
