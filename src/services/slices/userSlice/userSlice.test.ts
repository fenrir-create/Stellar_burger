import userReducer, {
  getUser,
  getOrdersAll,
  initialState,
  registerUser,
  loginUser,
  updateUser,
  logoutUser
} from './userSlice';

describe('userSlice reducer', () => {
  describe('getUser async thunk', () => {
    test('pending', () => {
      const action = { type: getUser.pending.type };
      const state = userReducer(initialState, action);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isAuthChecked).toBe(true);
      expect(state.loginUserRequest).toBe(true);
    });

    test('fulfilled', () => {
      const user = { name: 'TestUser', email: 'test@example.com' };
      const action = { type: getUser.fulfilled.type, payload: { user } };
      const state = userReducer(initialState, action);
      expect(state.isAuthenticated).toBe(true);
      expect(state.loginUserRequest).toBe(false);
      expect(state.userData).toEqual(user);
      expect(state.isAuthChecked).toBe(false);
    });

    test('rejected', () => {
      const action = {
        type: getUser.rejected.type,
        error: { message: 'Fail' }
      };
      const state = userReducer(initialState, action);
      expect(state.isAuthenticated).toBe(false);
      expect(state.isAuthChecked).toBe(false);
      expect(state.loginUserRequest).toBe(false);
    });
  });

  describe('getOrdersAll async thunk', () => {
    test('pending', () => {
      const action = { type: getOrdersAll.pending.type };
      const state = userReducer(initialState, action);
      expect(state.isLoading).toBe(true);
      expect(state.errorMessage).toBeNull();
    });

    test('fulfilled', () => {
      const orders = [{ id: 1 }, { id: 2 }];
      const action = { type: getOrdersAll.fulfilled.type, payload: orders };
      const state = userReducer(initialState, action);
      expect(state.isLoading).toBe(false);
      expect(state.userOrders).toEqual(orders);
      expect(state.errorMessage).toBeNull();
    });

    test('rejected', () => {
      const action = {
        type: getOrdersAll.rejected.type,
        error: { message: 'Error' }
      };
      const state = userReducer(initialState, action);
      expect(state.isLoading).toBe(false);
      expect(state.errorMessage).toBe('Error');
    });
  });

  describe('registerUser async thunk', () => {
    test('pending', () => {
      const action = { type: registerUser.pending.type };
      const state = userReducer(initialState, action);
      expect(state.isLoading).toBe(true);
      expect(state.errorMessage).toBeNull();
      expect(state.isAuthChecked).toBe(true);
      expect(state.isAuthenticated).toBe(false);
    });

    test('fulfilled', () => {
      const user = { name: 'NewUser', email: 'new@example.com' };
      const action = { type: registerUser.fulfilled.type, payload: { user } };
      const state = userReducer(initialState, action);
      expect(state.isLoading).toBe(false);
      expect(state.errorMessage).toBeNull();
      expect(state.userResponse).toEqual(user);
      expect(state.userData).toEqual(user);
      expect(state.isAuthChecked).toBe(false);
      expect(state.isAuthenticated).toBe(true);
    });

    test('rejected', () => {
      const action = {
        type: registerUser.rejected.type,
        error: { message: 'Register failed' }
      };
      const state = userReducer(initialState, action);
      expect(state.isLoading).toBe(false);
      expect(state.errorMessage).toBe('Register failed');
      expect(state.isAuthChecked).toBe(false);
    });
  });

  describe('loginUser async thunk', () => {
    test('pending', () => {
      const action = { type: loginUser.pending.type };
      const state = userReducer(initialState, action);
      expect(state.loginUserRequest).toBe(true);
      expect(state.isAuthChecked).toBe(true);
      expect(state.isAuthenticated).toBe(false);
      expect(state.errorMessage).toBeNull();
    });

    test('fulfilled', () => {
      const user = { name: 'LoggedUser', email: 'logged@example.com' };
      const action = { type: loginUser.fulfilled.type, payload: { user } };
      const state = userReducer(initialState, action);
      expect(state.loginUserRequest).toBe(false);
      expect(state.isAuthChecked).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.errorMessage).toBeNull();
      expect(state.userData).toEqual(user);
    });

    test('rejected', () => {
      const action = {
        type: loginUser.rejected.type,
        error: { message: 'Login failed' }
      };
      const state = userReducer(initialState, action);
      expect(state.loginUserRequest).toBe(false);
      expect(state.isAuthChecked).toBe(false);
      expect(state.errorMessage).toBe('Login failed');
    });
  });

  describe('updateUser async thunk', () => {
    test('pending', () => {
      const action = { type: updateUser.pending.type };
      const state = userReducer(initialState, action);
      expect(state.isLoading).toBe(true);
      expect(state.errorMessage).toBeNull();
    });

    test('fulfilled', () => {
      const user = { name: 'UpdatedUser', email: 'updated@example.com' };
      const action = { type: updateUser.fulfilled.type, payload: { user } };
      const state = userReducer(initialState, action);
      expect(state.isLoading).toBe(false);
      expect(state.errorMessage).toBeNull();
      expect(state.userResponse).toEqual(user);
    });

    test('rejected', () => {
      const action = {
        type: updateUser.rejected.type,
        error: { message: 'Update error' }
      };
      const state = userReducer(initialState, action);
      expect(state.isLoading).toBe(false);
      expect(state.errorMessage).toBe('Update error');
    });
  });

  describe('logoutUser async thunk', () => {
    test('pending', () => {
      const action = { type: logoutUser.pending.type };
      const state = userReducer(initialState, action);
      expect(state.isLoading).toBe(true);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isAuthChecked).toBe(true);
      expect(state.errorMessage).toBeNull();
    });

    test('fulfilled', () => {
      const action = { type: logoutUser.fulfilled.type };
      const state = userReducer(initialState, action);
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.isAuthChecked).toBe(false);
      expect(state.errorMessage).toBeNull();
      expect(state.userData).toBeNull();
    });

    test('rejected', () => {
      const action = {
        type: logoutUser.rejected.type,
        error: { message: 'Logout error' }
      };
      const state = userReducer(initialState, action);
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isAuthChecked).toBe(false);
      expect(state.errorMessage).toBe('Logout error');
    });
  });
});
