import {
  TRegisterData,
  loginUserApi,
  TLoginData,
  getUserApi,
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
  isLoading: boolean;
  errorMessage: string | null;
  userResponse: TUser | null;
  registerData: TRegisterData | null;
  userData: TUser | null;
  isAuthChecked: boolean;
  isAuthenticated: boolean;
  loginUserRequest: boolean;
  userOrders: TOrder[];
};

// Начальное состояние
export const initialState: TUserState = {
  isLoading: false,
  errorMessage: null,
  userResponse: null,
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
      return data;
    }
    // Устанавливаем токены
    setCookie('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data;
  }
);

export const getUser = createAsyncThunk('user/getUser', getUserApi);

export const getOrdersAll = createAsyncThunk('user/ordersUser', getOrdersApi);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async (data: Partial<TRegisterData>) => updateUserApi(data)
);

// AsyncThunk для выхода пользователя
export const logoutUser = createAsyncThunk('user/logoutUser', async () => {
  await logoutApi();
  localStorage.clear();
  deleteCookie('accessToken');
});

// Создание userSlice
export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    userLogout: (state) => {
      state.userData = null;
    },
    resetError: (state) => {
      state.errorMessage = null;
    }
  },
  selectors: {
    getUserState: (state) => state,
    getError: (state) => state.errorMessage
  },
  extraReducers: (builder) => {
    builder
      // Регистрация
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = null;
        state.isAuthChecked = true;
        state.isAuthenticated = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage = action.error.message as string;
        state.isAuthChecked = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.errorMessage = null;
        state.userResponse = action.payload.user;
        state.userData = action.payload.user;
        state.isAuthChecked = false;
        state.isAuthenticated = true;
      })

      // Логин
      .addCase(loginUser.pending, (state) => {
        state.loginUserRequest = true;
        state.errorMessage = null;
        state.isAuthChecked = true;
        state.isAuthenticated = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginUserRequest = false;
        state.isAuthChecked = false;
        state.errorMessage = action.error.message as string;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.errorMessage = null;
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
        state.isLoading = true;
        state.errorMessage = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage = action.error.message as string;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.errorMessage = null;
        state.userResponse = action.payload.user;
      })

      // Логаут
      .addCase(logoutUser.pending, (state) => {
        state.isAuthenticated = true;
        state.isAuthChecked = true;
        state.errorMessage = null;
        state.isLoading = true;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isAuthenticated = true;
        state.isAuthChecked = false;
        state.errorMessage = action.error.message as string;
        state.isLoading = false;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.isAuthChecked = false;
        state.errorMessage = null;
        state.isLoading = false;
        state.userData = null;
      })

      // Заказы пользователя
      .addCase(getOrdersAll.pending, (state) => {
        state.errorMessage = null;
        state.isLoading = true;
      })
      .addCase(getOrdersAll.rejected, (state, action) => {
        state.errorMessage = action.error.message as string;
        state.isLoading = false;
      })
      .addCase(getOrdersAll.fulfilled, (state, action) => {
        state.errorMessage = null;
        state.isLoading = false;
        state.userOrders = action.payload;
      });
  }
});

// Экспортируем actions и селекторы
export const { userLogout, resetError } = userSlice.actions;
export const { getUserState, getError } = userSlice.selectors;

// Экспорт редьюсера
export default userSlice.reducer;
