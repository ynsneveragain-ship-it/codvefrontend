import { defineStore } from 'pinia';
import { ref } from 'vue';
import planService from '@/services/planService';

export const usePlanStore = defineStore('plan', () => {
  const planes = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchPlanes = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await planService.getPlanes();
      planes.value = response.data.data;
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar planes';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createPlan = async (data) => {
    loading.value = true;
    error.value = null;
    try {
      return (await planService.createPlan(data)).data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al crear plan';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updatePlan = async (id, data) => {
    loading.value = true;
    error.value = null;
    try {
      return (await planService.updatePlan(id, data)).data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al actualizar plan';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deletePlan = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      await planService.deletePlan(id);
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al eliminar plan';
      throw err;
    } finally {
      loading.value = false;
    }
  };


  const fetchReporte = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await planService.getReporte();
      return response.data.reporte;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al generar el reporte';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const descargarReportePdf = async () => {
    const response = await planService.descargarReportePdf();
    const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-planes-${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return { planes, loading, error, fetchPlanes, createPlan, updatePlan, deletePlan, fetchReporte, descargarReportePdf };
});
