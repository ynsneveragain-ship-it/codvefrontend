import { defineStore } from 'pinia';
import { ref } from 'vue';
import permisoService from '@/services/permisoService';

export const usePermisoStore = defineStore('permiso', () => {
  const permisos = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchPermisos = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await permisoService.getPermisos();
      permisos.value = response.data.data;
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar permisos';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createPermiso = async (data) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await permisoService.createPermiso(data);
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al crear permiso';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updatePermiso = async (id, data) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await permisoService.updatePermiso(id, data);
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al actualizar permiso';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deletePermiso = async (id) => {
    loading.value = true;
    error.value = null;

    try {
      await permisoService.deletePermiso(id);
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al eliminar permiso';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchPermiso = async (id) => {
    const response = await permisoService.getPermiso(id);
    return response.data.permiso;
  };

  const syncRoles = async (id, roles) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await permisoService.syncRoles(id, roles);
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al asignar roles';
      throw err;
    } finally {
      loading.value = false;
    }
  };


  const fetchReporte = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await permisoService.getReporte();
      return response.data.reporte;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al generar el reporte';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const descargarReportePdf = async () => {
    const response = await permisoService.descargarReportePdf();
    const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-permisos-${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return { permisos, loading, error, fetchPermisos, fetchPermiso, createPermiso, updatePermiso, deletePermiso, syncRoles, fetchReporte, descargarReportePdf };
});
