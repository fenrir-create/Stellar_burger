// Импорт типов и API-функций
import {
  TRegisterData,
  loginUserApi,
  TLoginData,
  getUserApi,
  TAuthResponse,
  getOrdersApi,
  logoutApi,
  updateUserApi,
  registerUserApi
} from '../../../utils/burger-api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { deleteCookie, setCookie } from '../../../utils/cookie';
import { TOrder, TUser } from '@utils-types';

// Тип состояния пользователя
type TUserState = {
  request: boolean; // Индикатор общего запроса
  error: string | null; // Сообщение об ошибке
  response: TUser | null; // Ответ от API (например, после регистрации/обновления)
  registerData: TRegisterData | null; // Зарегистрированные данные (не используется напрямую)
  userData: TUser | null; // Данные текущего пользователя
  isAuthChecked: boolean; // Проверена ли авторизация
  isAuthenticated: boolean; // Пользователь аутентифицирован?
  loginUserRequest: boolean; // Флаг, что идёт запрос логина
  userOrders: TOrder[]; // Список заказов пользователя
};

// Начальное состояние
export const initialState: TUserState = {
  request: false,
  error: null,
  response: null,
  registerData: null,
  userData: null,
  isAuthChecked: false,
  isAuthenticated: false,
  loginUserRequest: false,
  userOrders: []
};

// AsyncThunk для регистрации
export const registerUser = createAsyncThunk(
  'user/regUser',
  async (registerData: TRegisterData) => await registerUserApi(registerData)
);

// AsyncThunk для логина
export const loginUser = createAsyncThunk(
  'user/loginUser',
  async ({ email, password }: TLoginData) => {
    const data = await loginUserApi({ email, password });
    if (!data.success) {
      return data; // Вернётся в fulfilled, но с success = false
    }
    // Устанавливаем токены
    setCookie('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data;
  }
);

// AsyncThunk для получения пользователя
export const getUser = createAsyncThunk('user/getUser', getUserApi);

// AsyncThunk для получения заказов пользователя
export const getOrdersAll = createAsyncThunk('user/ordersUser', getOrdersApi);

// AsyncThunk для обновления данных пользователя
export const updateUser = createAsyncThunk(
  'user/updateUser',
  async (data: Partial<TRegisterData>) => updateUserApi(data)
);

// AsyncThunk для выхода пользователя
export const logoutUser = createAsyncThunk('user/logoutUser', async () => {
  // Очищаем данные при логауте
  await logoutApi();
  localStorage.clear();
  deleteCookie('accessToken');
});

// Создание userSlice
export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Сброс данных при выходе
    userLogout: (state) => {
      state.userData = null;
    },
    // Сброс ошибки
    resetError: (state) => {
      state.error = null;
    }
  },
  selectors: {
    // Селектор всего состояния пользователя
    getUserState: (state) => state,
    // Селектор ошибки
    getError: (state) => state.error
  },
  extraReducers: (builder) => {
    builder
      // Регистрация
      .addCase(registerUser.pending, (state) => {
        state.request = true;
        state.error = null;
        state.isAuthChecked = true;
        state.isAuthenticated = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.request = false;
        state.error = action.error.message as string;
        state.isAuthChecked = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.request = false;
        state.error = null;
        state.response = action.payload.user;
        state.userData = action.payload.user;
        state.isAuthChecked = false;
        state.isAuthenticated = true;
      })

      // Логин
      .addCase(loginUser.pending, (state) => {
        state.loginUserRequest = true;
        state.error = null;
        state.isAuthChecked = true;
        state.isAuthenticated = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginUserRequest = false;
        state.isAuthChecked = false;
        state.error = action.error.message as string;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.error = null;
        state.loginUserRequest = false;
        state.isAuthChecked = false;
        state.isAuthenticated = true;
        state.userData = action.payload.user;
      })

      // Получение пользователя
      .addCase(getUser.pending, (state) => {
        state.isAuthenticated = true;
        state.isAuthChecked = true;
        state.loginUserRequest = true;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.isAuthChecked = false;
        state.loginUserRequest = false;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.loginUserRequest = false;
        state.userData = action.payload.user;
        state.isAuthChecked = false;
      })

      // Обновление пользователя
      .addCase(updateUser.pending, (state) => {
        state.request = true;
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.request = false;
        state.error = action.error.message as string;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.request = false;
        state.error = null;
        state.response = action.payload.user;
      })

      // Логаут
      .addCase(logoutUser.pending, (state) => {
        state.isAuthenticated = true;
        state.isAuthChecked = true;
        state.error = null;
        state.request = true;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isAuthenticated = true;
        state.isAuthChecked = false;
        state.error = action.error.message as string;
        state.request = false;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.isAuthChecked = false;
        state.error = null;
        state.request = false;
        state.userData = null;
        // Данные уже очищаются в thunk
      })

      // Заказы пользователя
      .addCase(getOrdersAll.pending, (state) => {
        state.error = null;
        state.request = true;
      })
      .addCase(getOrdersAll.rejected, (state, action) => {
        state.error = action.error.message as string;
        state.request = false;
      })
      .addCase(getOrdersAll.fulfilled, (state, action) => {
        state.error = null;
        state.request = false;
        state.userOrders = action.payload;
      });
  }
});

// Экспортируем actions и селекторы
export const { userLogout, resetError } = userSlice.actions;
export const { getUserState, getError } = userSlice.selectors;

// Экспорт редьюсера
export default userSlice.reducer;
