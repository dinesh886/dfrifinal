import { createSlice } from '@reduxjs/toolkit';

// Get initial auth state from sessionStorage
const getInitialAuthState = () => {
  const adminUser = sessionStorage.getItem('adminUser');
  const googleUser = sessionStorage.getItem('googleUser');

  if (adminUser) {
    const { user, token } = JSON.parse(adminUser);
    return {
      user,
      token,
      role: 'admin',
      isAuthenticated: true,
      loading: false,
    };
  }

  if (googleUser) {
    const data = JSON.parse(googleUser);
    return {
      user: {
        name: data.name,
        email: data.email,
        picture: data.picture, // ✅ correctly nested inside user
      },
      token: data.token,
      role: 'user',
      isAuthenticated: true,
      loading: false,
    };
  }

  return {
    user: null,
    token: null,
    role: null,
    isAuthenticated: false,
    loading: false,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialAuthState(),
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, role } = action.payload;

      state.user = user;
      state.token = token;
      state.role = role;
      state.isAuthenticated = true;
      state.loading = false;

      if (role === 'admin') {
        sessionStorage.setItem('adminUser', JSON.stringify({ user, token }));
        sessionStorage.removeItem('googleUser');
      } else {
        sessionStorage.setItem(
          'googleUser',
          JSON.stringify({
            name: user.name,
            email: user.email,
            picture: user.picture,
            token: token,
          })
        );
        sessionStorage.removeItem('adminUser');
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
      state.loading = false;
      sessionStorage.clear();
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

// Export actions
export const { setCredentials, logout, setLoading } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectCurrentRole = (state) => state.auth.role;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;

// Export reducer
export default authSlice.reducer;
