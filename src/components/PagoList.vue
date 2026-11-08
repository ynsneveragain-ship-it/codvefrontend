<template>
  <div>
    <h2 class="mb-4 text-2xl font-bold">Gestión de Pagos</h2>

    <div class="mb-4 flex gap-2">
      <button
        @click="openCreateForm"
        class="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
      >
        + Agregar Pago
      </button>
      <button
        @click="showReporte = true"
        class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Reporte
      </button>
    </div>

    <!-- Modal de reporte -->
    <ReportePagosModal v-if="showReporte" @cancel="showReporte = false" />

    <PagoForm
      v-if="showForm"
      :key="editingPago?.id ?? 'new'"
      :pago="editingPago"
      @saved="onSaved"
      @cancel="closeForm"
    />

    <div v-if="pagoStore.error" class="mb-4 rounded-lg bg-red-100 p-4 text-sm text-red-700">
      {{ pagoStore.error }}
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full rounded-lg bg-white shadow">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-6 py-3 text-left text-sm font-bold">#</th>
            <th class="px-6 py-3 text-left text-sm font-bold">Cliente</th>
            <th class="px-6 py-3 text-left text-sm font-bold">Suscripción</th>
            <th class="px-6 py-3 text-left text-sm font-bold">Monto</th>
            <th class="px-6 py-3 text-left text-sm font-bold">Fecha</th>
            <th class="px-6 py-3 text-left text-sm font-bold">Método</th>
            <th class="px-6 py-3 text-left text-sm font-bold">Estado</th>
            <th class="px-6 py-3 text-left text-sm font-bold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="pagoStore.loading && pagoStore.pagos.length === 0">
            <td colspan="8" class="px-6 py-4 text-center text-gray-500">Cargando...</td>
          </tr>
          <tr v-else-if="pagoStore.pagos.length === 0">
            <td colspan="8" class="px-6 py-4 text-center text-gray-500">
              No hay pagos registrados
            </td>
          </tr>
          <tr v-for="p in pagoStore.pagos" :key="p.id" class="border-b hover:bg-gray-50">
            <td class="px-6 py-4 font-medium">{{ p.id }}</td>
            <td class="px-6 py-4 text-sm">{{ p.cliente?.nombre || '-' }}</td>
            <td class="px-6 py-4 text-sm">
              <span class="block">#{{ p.suscripcion_id }}</span>
              <span class="block text-gray-500">{{ p.suscripcion?.tipo_servicio || '' }}</span>
            </td>
            <td class="px-6 py-4 font-medium">{{ p.monto }}</td>
            <td class="px-6 py-4 text-sm">{{ p.fecha_pago }}</td>
            <td class="px-6 py-4 text-sm">
              <span class="block">{{ p.metodo_pago }}</span>
              <span v-if="p.qr_id" class="block text-xs text-gray-500">QR {{ p.qr_id }}</span>
            </td>
            <td class="px-6 py-4">
              <span
                :class="
                  p.estado === 'pagado'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                "
                class="rounded px-2 py-1 text-xs"
              >
                {{ p.estado }}
              </span>
            </td>
            <td class="px-6 py-4">
              <button @click="editPago(p)" class="mr-3 text-blue-600 hover:text-blue-800">
                Editar
              </button>
              <button @click="confirmDelete(p)" class="text-red-600 hover:text-red-800">
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-6 flex items-center justify-between">
      <p class="text-sm text-gray-600">Total: {{ pagoStore.total }} pagos</p>
      <div class="space-x-2">
        <button
          @click="previousPage"
          :disabled="pagoStore.currentPage === 1"
          class="rounded bg-gray-300 px-3 py-1 disabled:bg-gray-100"
        >
          Anterior
        </button>
        <span class="px-3 py-1">
          Página {{ pagoStore.currentPage }} de {{ pagoStore.totalPages }}
        </span>
        <button
          @click="nextPage"
          :disabled="pagoStore.currentPage === pagoStore.totalPages"
          class="rounded bg-gray-300 px-3 py-1 disabled:bg-gray-100"
        >
          Siguiente
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { usePagoStore } from '@/stores/pagoStore';
import PagoForm from './PagoForm.vue';
import ReportePagosModal from './ReportePagosModal.vue';

const pagoStore = usePagoStore();
const showForm = ref(false);
const showReporte = ref(false);
const editingPago = ref(null);

onMounted(async () => {
  await pagoStore.fetchPagos();
});

const openCreateForm = () => {
  editingPago.value = null;
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  editingPago.value = null;
};

const editPago = (p) => {
  editingPago.value = p;
  showForm.value = true;
};

const onSaved = async () => {
  closeForm();
  await pagoStore.fetchPagos(pagoStore.currentPage);
};

const confirmDelete = async (p) => {
  // Se avisa de lo que no es evidente: borrar la fila no deshace el cobro en
  // el banco, y si el QR sigue vivo nadie lo anula al borrarla
  const extra = p.qr_id
    ? '\n\nTiene un QR del banco asociado; borrarlo aquí no lo anula allí.'
    : '';

  if (!confirm(`¿Eliminar el pago #${p.id} de ${p.monto}?${extra}`)) return;

  try {
    await pagoStore.deletePago(p.id);
    await pagoStore.fetchPagos(pagoStore.currentPage);
  } catch (err) {
    alert(pagoStore.error || 'No se pudo eliminar el pago');
  }
};

const previousPage = async () => {
  if (pagoStore.currentPage > 1) await pagoStore.fetchPagos(pagoStore.currentPage - 1);
};

const nextPage = async () => {
  if (pagoStore.currentPage < pagoStore.totalPages) {
    await pagoStore.fetchPagos(pagoStore.currentPage + 1);
  }
};
</script>
