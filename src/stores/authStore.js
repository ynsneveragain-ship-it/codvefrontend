import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import authService from '@/services/authService';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Cargar datos guardados del localStorage
  const initializeAuth = () => {
    const savedUser = localStorage.getItem('authUser');
    const savedToken = localStorage.getItem('authToken');

    if (savedUser && savedToken) {
      user.value = JSON.parse(savedUser);
      token.value = savedToken;
    }
  };

  const isAuthenticated = computed(() => !!token.value);

  // El rol visita es de solo lectura: solo ve el dashboard (y su propio perfil)
  const esVisita = computed(() => user.value?.rol?.nombre === 'visita');

  const register = async (userData) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await authService.register(userData);
      const { user: newUser, token: newToken } = response.data;

      user.value = newUser;
      token.value = newToken;

      localStorage.setItem('authUser', JSON.stringify(newUser));
      localStorage.setItem('authToken', newToken);

      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error en el registro';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const login = async (credentials) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await authService.login(credentials);
      const { user: loggedUser, token: newToken } = response.data;

      user.value = loggedUser;
      token.value = newToken;

      localStorage.setItem('authUser', JSON.stringify(loggedUser));
      localStorage.setItem('authToken', newToken);

      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error en el login';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Relee el usuario autenticado desde la API, para que el perfil no dependa
  // de lo que quedo guardado en localStorage al iniciar sesion
  const fetchMe = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await authService.me();
      user.value = response.data.user;
      localStorage.setItem('authUser', JSON.stringify(response.data.user));
      return response.data.user;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar el perfil';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    loading.value = true;

    try {
      await authService.logout();
    } catch (err) {
      console.error('Error al logout:', err);
    } finally {
      user.value = null;
      token.value = null;
      error.value = null;

      localStorage.removeItem('authUser');
      localStorage.removeItem('authToken');

      loading.value = false;
    }
  };

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    esVisita,
    initializeAuth,
    register,
    login,
    logout,
    fetchMe,
  };
});
