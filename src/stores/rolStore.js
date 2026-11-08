import { defineStore } from 'pinia';
import { ref } from 'vue';
import rolService from '@/services/rolService';

export const useRolStore = defineStore('rol', () => {
  const roles = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchRoles = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await rolService.getRoles();
      roles.value = response.data.data;
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar roles';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createRol = async (data) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await rolService.createRol(data);
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al crear rol';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateRol = async (id, data) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await rolService.updateRol(id, data);
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al actualizar rol';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteRol = async (id) => {
    loading.value = true;
    error.value = null;

    try {
      await rolService.deleteRol(id);
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al eliminar rol';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchRol = async (id) => {
    const response = await rolService.getRol(id);
    return response.data.rol;
  };

  const syncPermisos = async (id, permisos) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await rolService.syncPermisos(id, permisos);
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al asignar permisos';
      throw err;
    } finally {
      loading.value = false;
    }
  };


  const fetchReporte = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await rolService.getReporte();
      return response.data.reporte;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al generar el reporte';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const descargarReportePdf = async () => {
    const response = await rolService.descargarReportePdf();
    const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-roles-${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return { roles, loading, error, fetchRoles, fetchRol, createRol, updateRol, deleteRol, syncPermisos, fetchReporte, descargarReportePdf };
});
