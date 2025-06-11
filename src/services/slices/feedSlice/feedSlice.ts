import { getFeedsApi } from '../../../utils/burger-api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { TOrder } from '@utils-types';

type TFeedState = {
  items: TOrder[];
  totalCount: number;
  todayCount: number;
  isLoading: boolean;
  errorMessage: string | null;
};

export const initialState: TFeedState = {
  items: [],
  totalCount: 0,
  todayCount: 0,
  isLoading: false,
  errorMessage: null
};
// Явно указываем, какие данные вернёт thunk
type TFeedsResponse = {
  orders: TOrder[];
  total: number;
  totalToday: number;
};

export const getFeeds = createAsyncThunk<TFeedsResponse, void>(
  'feeds/all',
  async (_, thunkAPI) => {
    try {
      const response = await getFeedsApi();

      if (
        !response ||
        !Array.isArray(response.orders) ||
        typeof response.total !== 'number' ||
        typeof response.totalToday !== 'number'
      ) {
        return thunkAPI.rejectWithValue('Неверный формат ответа от API');
      }

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        (error as Error).message || 'Ошибка при получении ленты заказов'
      );
    }
  }
);
export const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {},
  selectors: {
    getFeedState: (state) => state
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFeeds.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = null;
      })
      .addCase(getFeeds.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage = action.error.message as string;
      })
      .addCase(getFeeds.fulfilled, (state, action) => {
        state.isLoading = false;
        state.errorMessage = null;
        state.items = action.payload.orders;
        state.totalCount = action.payload.total;
        state.todayCount = action.payload.totalToday;
      });
  }
});

export const { getFeedState } = feedSlice.selectors;
export default feedSlice.reducer;
