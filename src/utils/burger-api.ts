// Импорт вспомогательных функций работы с куками и типов данных
import { setCookie, getCookie } from './cookie';
import { TIngredient, TOrder, TOrdersData, TUser } from './types';

// URL для API из переменной окружения
const URL = process.env.BURGER_API_URL;

// Универсальная функция проверки ответа от сервера
const checkResponse = <T>(res: Response): Promise<T> =>
  res.ok ? res.json() : res.json().then((err) => Promise.reject(err));

// Тип-обёртка для серверного ответа с полем success
type TServerResponse<T> = {
  success: boolean;
} & T;

// Тип ответа от API при обновлении токена
type TRefreshResponse = TServerResponse<{
  refreshToken: string;
  accessToken: string;
}>;

/*
  Функция для обновления access токена по refresh токену
*/
export const refreshToken = (): Promise<TRefreshResponse> =>
  fetch(`${URL}/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify({
      token: localStorage.getItem('refreshToken') // получаем refresh токен из localStorage
    })
  })
    .then((res) => checkResponse<TRefreshResponse>(res))
    .then((refreshData) => {
      if (!refreshData.success) {
        return Promise.reject(refreshData);
      }
      // Сохраняем новые токены
      localStorage.setItem('refreshToken', refreshData.refreshToken);
      setCookie('accessToken', refreshData.accessToken);
      return refreshData;
    });

/*
  Обёртка над fetch с автоматическим обновлением токена при истечении срока действия
*/
export const fetchWithRefresh = async <T>(
  url: RequestInfo,
  options: RequestInit
) => {
  try {
    const res = await fetch(url, options);
    return await checkResponse<T>(res);
  } catch (err) {
    // Если ошибка связана с истекшим JWT
    if ((err as { message: string }).message === 'jwt expired') {
      const refreshData = await refreshToken();
      // Обновляем токен в заголовках и повторяем запрос
      if (options.headers) {
        (options.headers as { [key: string]: string }).authorization =
          refreshData.accessToken;
      }
      const res = await fetch(url, options);
      return await checkResponse<T>(res);
    } else {
      return Promise.reject(err);
    }
  }
};

// Тип ответа с ингредиентами
type TIngredientsResponse = TServerResponse<{
  data: TIngredient[];
}>;

// Тип ответа с лентой заказов
type TFeedsResponse = TServerResponse<{
  orders: TOrder[];
  total: number;
  totalToday: number;
}>;

// Тип ответа с заказами пользователя
type TOrdersResponse = TServerResponse<{
  data: TOrder[];
}>;

/*
  Получение всех доступных ингредиентов
*/
export const getIngredientsApi = () =>
  fetch(`${URL}/ingredients`)
    .then((res) => checkResponse<TIngredientsResponse>(res))
    .then((data) => {
      if (data?.success) return data.data;
      return Promise.reject(data);
    });

/*
  Получение всех заказов (общая лента)
*/
export const getFeedsApi = () =>
  fetch(`${URL}/orders/all`)
    .then((res) => checkResponse<TFeedsResponse>(res))
    .then((data) => {
      if (data?.success) return data;
      return Promise.reject(data);
    });

/*
  Получение заказов авторизованного пользователя
*/
export const getOrdersApi = () =>
  fetchWithRefresh<TFeedsResponse>(`${URL}/orders`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      authorization: getCookie('accessToken')
    } as HeadersInit
  }).then((data) => {
    if (data?.success) return data.orders;
    return Promise.reject(data);
  });

// Тип ответа при создании нового заказа
type TNewOrderResponse = TServerResponse<{
  order: TOrder;
  name: string;
}>;

/*
  Оформление нового заказа
*/
export const orderBurgerApi = (data: string[]) =>
  fetchWithRefresh<TNewOrderResponse>(`${URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      authorization: getCookie('accessToken')
    } as HeadersInit,
    body: JSON.stringify({
      ingredients: data
    })
  }).then((data) => {
    if (data?.success) return data;
    return Promise.reject(data);
  });

// Тип ответа с заказом по номеру
type TOrderResponse = TServerResponse<{
  orders: TOrder[];
}>;

/*
  Получение заказа по номеру
*/
export const getOrderByNumberApi = (number: number) =>
  fetch(`${URL}/orders/${number}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((res) => checkResponse<TOrderResponse>(res));

// Типы данных для регистрации и авторизации
export type TRegisterData = {
  email: string;
  name: string;
  password: string;
};

export type TAuthResponse = TServerResponse<{
  refreshToken: string;
  accessToken: string;
  user: TUser;
}>;

/*
  Регистрация нового пользователя
*/
export const registerUserApi = (data: TRegisterData) =>
  fetch(`${URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(data)
  })
    .then((res) => checkResponse<TAuthResponse>(res))
    .then((data) => {
      if (data?.success) return data;
      return Promise.reject(data);
    });

export type TLoginData = {
  email: string;
  password: string;
};

/*
  Авторизация пользователя
*/
export const loginUserApi = (data: TLoginData) =>
  fetch(`${URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(data)
  })
    .then((res) => checkResponse<TAuthResponse>(res))
    .then((data) => {
      if (data?.success) return data;
      return Promise.reject(data);
    });

/*
  Запрос на восстановление пароля (отправка письма)
*/
export const forgotPasswordApi = (data: { email: string }) =>
  fetch(`${URL}/password-reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(data)
  })
    .then((res) => checkResponse<TServerResponse<{}>>(res))
    .then((data) => {
      if (data?.success) return data;
      return Promise.reject(data);
    });

/*
  Сброс пароля с новым значением и токеном
*/
export const resetPasswordApi = (data: { password: string; token: string }) =>
  fetch(`${URL}/password-reset/reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(data)
  })
    .then((res) => checkResponse<TServerResponse<{}>>(res))
    .then((data) => {
      if (data?.success) return data;
      return Promise.reject(data);
    });

// Тип ответа с информацией о пользователе
type TUserResponse = TServerResponse<{ user: TUser }>;

/*
  Получение информации о текущем пользователе
*/
export const getUserApi = () =>
  fetchWithRefresh<TUserResponse>(`${URL}/auth/user`, {
    headers: {
      authorization: getCookie('accessToken')
    } as HeadersInit
  });

/*
  Обновление данных пользователя
*/
export const updateUserApi = (user: Partial<TRegisterData>) =>
  fetchWithRefresh<TUserResponse>(`${URL}/auth/user`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      authorization: getCookie('accessToken')
    } as HeadersInit,
    body: JSON.stringify(user)
  });

/*
  Выход пользователя (удаление refresh токена на сервере)
*/
export const logoutApi = () =>
  fetch(`${URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify({
      token: localStorage.getItem('refreshToken')
    })
  }).then((res) => checkResponse<TServerResponse<{}>>(res));
