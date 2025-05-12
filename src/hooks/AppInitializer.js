// AppInitializer.js
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../features/auth/authSlice';

const useAuthInitialization = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const adminUser = localStorage.getItem('adminUser');
        const googleUser = localStorage.getItem('googleUser');

        if (adminUser) {
          const { user, token } = JSON.parse(adminUser);
          dispatch(setCredentials({ user, token, role: 'admin' }));
        } else if (googleUser) {
          const user = JSON.parse(googleUser);
          dispatch(setCredentials({ user, token: user.token, role: 'user' }));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        dispatch(authLoaded());
      }
    };

    initializeAuth();
  }, [dispatch]);
};

export default useAuthInitialization;