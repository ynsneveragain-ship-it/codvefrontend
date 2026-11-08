<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="emit('cancel')"></div>

      <div
        class="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reporte-title"
      >
        <div class="flex items-start justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h3 id="reporte-title" class="text-lg font-bold">Reporte de Dominios</h3>
            <p v-if="reporte" class="mt-1 text-sm text-gray-600">
              Generado el {{ reporte.generado_en }}
            </p>
          </div>
          <button
            type="button"
            @click="emit('cancel')"
            aria-label="Cerrar"
            class="text-2xl leading-none text-gray-400 hover:text-gray-700"
          >
            &times;
          </button>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          <p v-if="cargando" class="py-10 text-center text-gray-500">Generando reporte...</p>
          <p v-else-if="error" class="rounded-lg bg-red-100 p-4 text-sm text-red-700">{{ error }}</p>

          <template v-else-if="reporte">
            <div class="mb-6 grid grid-cols-6 gap-3">
              <div class="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
                <span class="block text-2xl font-bold text-blue-700">{{ reporte.totales.dominios }}</span>
                <span class="block text-xs uppercase text-gray-500">Total</span>
              </div>
              <div class="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
                <span class="block text-2xl font-bold text-blue-700">{{ reporte.totales.vigentes }}</span>
                <span class="block text-xs uppercase text-gray-500">Vigentes</span>
              </div>
              <div class="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
                <span class="block text-2xl font-bold text-blue-700">{{ reporte.totales.por_vencer }}</span>
                <span class="block text-xs uppercase text-gray-500">Por vencer</span>
              </div>
              <div class="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
                <span class="block text-2xl font-bold text-blue-700">{{ reporte.totales.vencidos }}</span>
                <span class="block text-xs uppercase text-gray-500">Vencidos</span>
              </div>
              <div class="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
                <span class="block text-2xl font-bold text-blue-700">{{ reporte.totales.proveedores }}</span>
                <span class="block text-xs uppercase text-gray-500">Proveedores</span>
              </div>
              <div class="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
                <span class="block text-2xl font-bold text-blue-700">{{ reporte.totales.margen_total }}</span>
                <span class="block text-xs uppercase text-gray-500">Margen total</span>
              </div>
            </div>

            <h4 class="mb-2 font-bold text-gray-700">Detalle de dominios</h4>
            <div class="overflow-x-auto">
              <table class="min-w-full rounded-lg border border-gray-200">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="px-4 py-2 text-left text-sm font-bold">Dominio</th>
                    <th class="px-4 py-2 text-left text-sm font-bold">Proveedor</th>
                    <th class="px-4 py-2 text-left text-sm font-bold">Cliente</th>
                    <th class="px-4 py-2 text-left text-sm font-bold">Suscripción</th>
                    <th class="px-4 py-2 text-left text-sm font-bold">Precios</th>
                    <th class="px-4 py-2 text-left text-sm font-bold">Margen</th>
                    <th class="px-4 py-2 text-left text-sm font-bold">Vigencia</th>
                    <th class="px-4 py-2 text-left text-sm font-bold">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(d, i) in reporte.dominios" :key="i" class="border-t">
                    <td class="px-4 py-2 font-medium">{{ d.nombre }}</td>
                    <td class="px-4 py-2">{{ d.proveedor }}</td>
                    <td class="px-4 py-2">{{ d.cliente || '-' }}</td>
                    <td class="px-4 py-2">{{ d.suscripcion || '-' }}</td>
                    <td class="px-4 py-2 text-sm">
                      <span class="block">Cliente: {{ d.precio }}</span>
                      <span class="block text-gray-500">Costo: {{ d.precio_real }}</span>
                    </td>
                    <td class="px-4 py-2 font-medium text-green-700">{{ d.margen }}</td>
                    <td class="px-4 py-2 text-sm">
                      <span class="block">{{ d.fecha_inicio }}</span>
                      <span class="block text-gray-500">{{ d.fecha_fin }}</span>
                    </td>
                    <td class="px-4 py-2">
                      <span
                        :class="d.vigente ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                        class="rounded px-2 py-1 text-xs"
                      >
                        {{ d.vigente ? `Vigente (${d.dias_restantes} d)` : 'Vencido' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p v-if="errorDescarga" class="mt-4 rounded-lg bg-red-100 p-4 text-sm text-red-700">
              {{ errorDescarga }}
            </p>
          </template>
        </div>

        <div class="flex justify-end space-x-2 border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            @click="emit('cancel')"
            class="rounded-lg bg-gray-400 px-4 py-2 text-white hover:bg-gray-500"
          >
            Cerrar
          </button>
          <button
            type="button"
            :disabled="!reporte || descargando"
            @click="descargar"
            class="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:bg-gray-400"
          >
            {{ descargando ? 'Generando PDF...' : 'Descargar PDF' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useDominioStore } from '@/stores/dominioStore';

const emit = defineEmits(['cancel']);

const dominioStore = useDominioStore();

const reporte = ref(null);
const cargando = ref(true);
const error = ref(null);
const descargando = ref(false);
const errorDescarga = ref(null);

const onKeydown = (e) => {
  if (e.key === 'Escape') emit('cancel');
};

onMounted(async () => {
  window.addEventListener('keydown', onKeydown);
  document.body.style.overflow = 'hidden';

  try {
    reporte.value = await dominioStore.fetchReporte();
  } catch (err) {
    error.value = dominioStore.error || 'No se pudo generar el reporte';
  } finally {
    cargando.value = false;
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
  document.body.style.overflow = '';
});

const descargar = async () => {
  descargando.value = true;
  errorDescarga.value = null;

  try {
    await dominioStore.descargarReportePdf();
  } catch (err) {
    errorDescarga.value = 'No se pudo descargar el PDF';
  } finally {
    descargando.value = false;
  }
};
</script>
