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
            <h3 id="reporte-title" class="text-lg font-bold">Reporte de Pagos</h3>
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
                <span class="block text-2xl font-bold text-blue-700">{{ reporte.totales.pagos }}</span>
                <span class="block text-xs uppercase text-gray-500">Total</span>
              </div>
              <div class="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
                <span class="block text-2xl font-bold text-blue-700">{{ reporte.totales.cobrados }}</span>
                <span class="block text-xs uppercase text-gray-500">Cobrados</span>
              </div>
              <div class="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
                <span class="block text-2xl font-bold text-blue-700">{{ reporte.totales.pendientes }}</span>
                <span class="block text-xs uppercase text-gray-500">Pendientes</span>
              </div>
              <div class="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
                <span class="block text-2xl font-bold text-green-700">{{ reporte.totales.monto_cobrado }}</span>
                <span class="block text-xs uppercase text-gray-500">Monto cobrado</span>
              </div>
              <div class="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
                <span class="block text-2xl font-bold text-amber-700">{{ reporte.totales.monto_pendiente }}</span>
                <span class="block text-xs uppercase text-gray-500">Monto pendiente</span>
              </div>
              <div class="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
                <span class="block text-2xl font-bold text-blue-700">{{ reporte.totales.con_qr }}</span>
                <span class="block text-xs uppercase text-gray-500">Con QR</span>
              </div>
            </div>

            <h4 class="mb-2 font-bold text-gray-700">Por método de pago</h4>
            <div class="mb-6 overflow-x-auto">
              <table class="min-w-full rounded-lg border border-gray-200">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="px-4 py-2 text-left text-sm font-bold">Método</th>
                    <th class="px-4 py-2 text-left text-sm font-bold">Pagos</th>
                    <th class="px-4 py-2 text-left text-sm font-bold">Monto registrado</th>
                    <th class="px-4 py-2 text-left text-sm font-bold">Monto cobrado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(m, i) in reporte.por_metodo" :key="i" class="border-t">
                    <td class="px-4 py-2 font-medium">{{ m.metodo }}</td>
                    <td class="px-4 py-2">{{ m.pagos }}</td>
                    <td class="px-4 py-2">{{ m.monto }}</td>
                    <td class="px-4 py-2 font-medium text-green-700">{{ m.cobrado }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h4 class="mb-2 font-bold text-gray-700">Detalle de pagos</h4>
            <div class="overflow-x-auto">
              <table class="min-w-full rounded-lg border border-gray-200">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="px-4 py-2 text-left text-sm font-bold">#</th>
                    <th class="px-4 py-2 text-left text-sm font-bold">Cliente</th>
                    <th class="px-4 py-2 text-left text-sm font-bold">Suscripción</th>
                    <th class="px-4 py-2 text-left text-sm font-bold">Fecha</th>
                    <th class="px-4 py-2 text-left text-sm font-bold">Método</th>
                    <th class="px-4 py-2 text-left text-sm font-bold">Monto</th>
                    <th class="px-4 py-2 text-left text-sm font-bold">Comprobante</th>
                    <th class="px-4 py-2 text-left text-sm font-bold">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(p, i) in reporte.pagos" :key="i" class="border-t">
                    <td class="px-4 py-2 font-medium">{{ p.id }}</td>
                    <td class="px-4 py-2">{{ p.cliente || '-' }}</td>
                    <td class="px-4 py-2 text-sm">
                      <span class="block">#{{ p.suscripcion }}</span>
                      <span class="block text-gray-500">{{ p.tipo_servicio || '' }}</span>
                    </td>
                    <td class="px-4 py-2 text-sm">{{ p.fecha_pago }}</td>
                    <td class="px-4 py-2 text-sm">
                      <span class="block">{{ p.metodo_pago }}</span>
                      <span v-if="p.qr_id" class="block text-xs text-gray-500">QR {{ p.qr_id }}</span>
                    </td>
                    <td class="px-4 py-2 font-medium">{{ p.monto }}</td>
                    <td class="px-4 py-2 text-sm">{{ p.voucher || '-' }}</td>
                    <td class="px-4 py-2">
                      <span
                        :class="p.cobrado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
                        class="rounded px-2 py-1 text-xs"
                      >
                        {{ p.estado }}
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
import { usePagoStore } from '@/stores/pagoStore';

const emit = defineEmits(['cancel']);

const pagoStore = usePagoStore();

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
    reporte.value = await pagoStore.fetchReporte();
  } catch (err) {
    error.value = pagoStore.error || 'No se pudo generar el reporte';
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
    await pagoStore.descargarReportePdf();
  } catch (err) {
    errorDescarga.value = 'No se pudo descargar el PDF';
  } finally {
    descargando.value = false;
  }
};
</script>
