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
  async (registerData: TRegisterData, thunkAPI) => {
    try {
      const response = await registerUserApi(registerData);
      if (!response || !response.success) {
        return thunkAPI.rejectWithValue('Регистрация не удалась');
      }
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        (error as Error).message || 'Ошибка регистрации'
      );
    }
  }
);

// AsyncThunk для логина
export const loginUser = createAsyncThunk(
  'user/loginUser',
  async ({ email, password }: TLoginData, thunkAPI) => {
    try {
      const data = await loginUserApi({ email, password });

      if (!data.success) {
        return thunkAPI.rejectWithValue(
          'Ошибка авторизации: неверный логин или пароль'
        );
      }

      // установка токенов если они есть
      if (data.accessToken) setCookie('accessToken', data.accessToken);
      if (data.refreshToken)
        localStorage.setItem('refreshToken', data.refreshToken);

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error instanceof Error
          ? error.message
          : 'Неизвестная ошибка при авторизации'
      );
    }
  }
);

export const getUser = createAsyncThunk('user/getUser', async (_, thunkAPI) => {
  try {
    const user = await getUserApi();
    if (!user) {
      return thunkAPI.rejectWithValue(
        'Не удалось получить данные пользователя'
      );
    }
    return user;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      (error as Error).message || 'Ошибка получения данных пользователя'
    );
  }
});

export const getOrdersAll = createAsyncThunk(
  'user/ordersUser',
  async (_, thunkAPI) => {
    try {
      const orders = await getOrdersApi();
      if (!orders) {
        return thunkAPI.rejectWithValue(
          'Не удалось получить заказы пользователя'
        );
      }
      return orders;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        (error as Error).message || 'Ошибка получения заказов'
      );
    }
  }
);
export const updateUser = createAsyncThunk(
  'user/updateUser',
  async (data: Partial<TRegisterData>, thunkAPI) => {
    try {
      const updatedUser = await updateUserApi(data);
      if (!updatedUser) {
        return thunkAPI.rejectWithValue(
          'Не удалось обновить данные пользователя'
        );
      }
      return updatedUser;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        (error as Error).message || 'Ошибка обновления пользователя'
      );
    }
  }
);

// AsyncThunk для выхода пользователя
export const logoutUser = createAsyncThunk(
  'user/logoutUser',
  async (_, thunkAPI) => {
    try {
      await logoutApi();
      localStorage.clear();
      deleteCookie('accessToken');
      return true;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        (error as Error).message || 'Ошибка выхода'
      );
    }
  }
);

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
