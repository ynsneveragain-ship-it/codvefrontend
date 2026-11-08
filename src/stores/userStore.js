import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import userService from '@/services/userService';

export const useUserStore = defineStore('user', () => {
  const users = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const totalUsers = ref(0);

  const userCount = computed(() => users.value.length);

  const fetchUsers = async (page = 1) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await userService.getUsers(page);
      const { data, pagination } = response.data;

      users.value = data;
      currentPage.value = pagination.current_page;
      totalPages.value = pagination.last_page;
      totalUsers.value = pagination.total;

      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar usuarios';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createUser = async (userData) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await userService.createUser(userData);
      users.value.unshift(response.data.user);
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al crear usuario';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateUser = async (id, userData) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await userService.updateUser(id, userData);
      const index = users.value.findIndex(u => u.id === id);
      if (index !== -1) {
        users.value[index] = response.data.user;
      }
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al actualizar usuario';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteUser = async (id) => {
    loading.value = true;
    error.value = null;

    try {
      await userService.deleteUser(id);
      users.value = users.value.filter(u => u.id !== id);
      return { message: 'Usuario eliminado correctamente' };
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al eliminar usuario';
      throw err;
    } finally {
      loading.value = false;
    }
  };




  const fetchReporte = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await userService.getReporte();
      return response.data.reporte;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al generar el reporte';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const descargarReportePdf = async () => {
    const response = await userService.descargarReportePdf();
    const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-usuarios-${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return {
    users,
    loading,
    error,
    currentPage,
    totalPages,
    totalUsers,
    userCount,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
      fetchReporte,
    descargarReportePdf,
};
});
