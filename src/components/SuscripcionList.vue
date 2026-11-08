<template>
  <div>
    <h2 class="mb-4 text-2xl font-bold">Gestión de Suscripciones</h2>

    <div class="mb-4 flex gap-2">
      <button
        @click="openCreateForm"
        class="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
      >
        + Agregar Suscripción
      </button>
      <button
        @click="showReporte = true"
        class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Reporte
      </button>
    </div>

    <!-- Modal de reporte -->
    <ReporteSuscripcionesModal v-if="showReporte" @cancel="showReporte = false" />

    <SuscripcionForm
      v-if="showForm"
      :key="editingSuscripcion?.id ?? 'new'"
      :suscripcion="editingSuscripcion"
      @saved="onSaved"
      @cancel="closeForm"
    />

    <div v-if="suscripcionStore.error" class="mb-4 rounded-lg bg-red-100 p-4 text-sm text-red-700">
      {{ suscripcionStore.error }}
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full rounded-lg bg-white shadow">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-6 py-3 text-left text-sm font-bold">#</th>
            <th class="px-6 py-3 text-left text-sm font-bold">Cliente</th>
            <th class="px-6 py-3 text-left text-sm font-bold">Plan</th>
            <th class="px-6 py-3 text-left text-sm font-bold">Servicio</th>
            <th class="px-6 py-3 text-left text-sm font-bold">Vigencia</th>
            <th class="px-6 py-3 text-left text-sm font-bold">Costo</th>
            <th class="px-6 py-3 text-left text-sm font-bold">Asociados</th>
            <th class="px-6 py-3 text-left text-sm font-bold">Estado</th>
            <th class="px-6 py-3 text-left text-sm font-bold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="suscripcionStore.loading && suscripcionStore.suscripciones.length === 0">
            <td colspan="9" class="px-6 py-4 text-center text-gray-500">Cargando...</td>
          </tr>
          <tr v-else-if="suscripcionStore.suscripciones.length === 0">
            <td colspan="9" class="px-6 py-4 text-center text-gray-500">
              No hay suscripciones registradas
            </td>
          </tr>
          <tr
            v-for="s in suscripcionStore.suscripciones"
            :key="s.id"
            class="border-b hover:bg-gray-50"
          >
            <td class="px-6 py-4 font-medium">{{ s.id }}</td>
            <td class="px-6 py-4 text-sm">
              <span class="block font-medium">{{ s.cliente?.nombre || '-' }}</span>
              <span class="block text-gray-500">{{ s.cliente?.numero_documento || '' }}</span>
            </td>
            <td class="px-6 py-4 text-sm">{{ s.plan?.nombre || '-' }}</td>
            <td class="px-6 py-4 text-sm">{{ s.tipo_servicio }}</td>
            <td class="px-6 py-4 text-sm">
              <span class="block">{{ s.fecha_inicio }}</span>
              <span class="block" :class="estaVigente(s) ? 'text-gray-500' : 'text-red-600'">
                {{ s.fecha_fin }}{{ estaVigente(s) ? '' : ' (vencida)' }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm">{{ s.costo }}</td>
            <td class="px-6 py-4 text-sm">
              <span class="block">{{ s.dominios_count ?? 0 }} dominio(s)</span>
              <span class="block text-gray-500">{{ s.pagos_count ?? 0 }} pago(s)</span>
            </td>
            <td class="px-6 py-4">
              <span
                :class="
                  s.estado === 'activo'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                "
                class="rounded px-2 py-1 text-xs"
              >
                {{ s.estado }}
              </span>
            </td>
            <td class="px-6 py-4">
              <button @click="editSuscripcion(s)" class="mr-3 text-blue-600 hover:text-blue-800">
                Editar
              </button>
              <button @click="confirmDelete(s)" class="text-red-600 hover:text-red-800">
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-6 flex items-center justify-between">
      <p class="text-sm text-gray-600">Total: {{ suscripcionStore.total }} suscripciones</p>
      <div class="space-x-2">
        <button
          @click="previousPage"
          :disabled="suscripcionStore.currentPage === 1"
          class="rounded bg-gray-300 px-3 py-1 disabled:bg-gray-100"
        >
          Anterior
        </button>
        <span class="px-3 py-1">
          Página {{ suscripcionStore.currentPage }} de {{ suscripcionStore.totalPages }}
        </span>
        <button
          @click="nextPage"
          :disabled="suscripcionStore.currentPage === suscripcionStore.totalPages"
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
import { useSuscripcionStore } from '@/stores/suscripcionStore';
import SuscripcionForm from './SuscripcionForm.vue';
import ReporteSuscripcionesModal from './ReporteSuscripcionesModal.vue';

const suscripcionStore = useSuscripcionStore();
const showForm = ref(false);
const showReporte = ref(false);
const editingSuscripcion = ref(null);

// fecha_fin llega como 'YYYY-MM-DD'; se compara con hoy en el mismo formato
// para no depender de husos horarios al construir un Date
const hoyIso = new Date().toISOString().slice(0, 10);
const estaVigente = (s) => !!s.fecha_fin && s.fecha_fin >= hoyIso;

onMounted(async () => {
  await suscripcionStore.fetchSuscripciones();
});

const openCreateForm = () => {
  editingSuscripcion.value = null;
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  editingSuscripcion.value = null;
};

const editSuscripcion = (s) => {
  editingSuscripcion.value = s;
  showForm.value = true;
};

const onSaved = async () => {
  closeForm();
  await suscripcionStore.fetchSuscripciones(suscripcionStore.currentPage);
};

const confirmDelete = async (s) => {
  const aviso = `¿Eliminar la suscripción #${s.id} de ${s.cliente?.nombre ?? 'este cliente'}?`;

  if (!confirm(aviso)) return;

  try {
    await suscripcionStore.deleteSuscripcion(s.id);
    await suscripcionStore.fetchSuscripciones(suscripcionStore.currentPage);
  } catch (err) {
    // El backend corta con 409 si tiene pagos o dominios: ese mensaje explica
    // qué hay que quitar antes, así que se muestra tal cual
    alert(suscripcionStore.error || 'No se pudo eliminar la suscripción');
  }
};

const previousPage = async () => {
  if (suscripcionStore.currentPage > 1) {
    await suscripcionStore.fetchSuscripciones(suscripcionStore.currentPage - 1);
  }
};

const nextPage = async () => {
  if (suscripcionStore.currentPage < suscripcionStore.totalPages) {
    await suscripcionStore.fetchSuscripciones(suscripcionStore.currentPage + 1);
  }
};
</script>
