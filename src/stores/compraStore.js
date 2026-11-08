import { defineStore } from 'pinia';
import { ref } from 'vue';
import compraService from '@/services/compraService';

export const useCompraStore = defineStore('compra', () => {
  const loading = ref(false);
  const error = ref(null);

  const crearCompra = async (data) => {
    loading.value = true;
    error.value = null;
    try {
      return (await compraService.crearCompra(data)).data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al registrar la venta';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { loading, error, crearCompra };
});
