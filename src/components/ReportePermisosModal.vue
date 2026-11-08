<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="emit('cancel')"></div>

      <div
        class="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reporte-title"
      >
        <div class="flex items-start justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h3 id="reporte-title" class="text-lg font-bold">Reporte de Permisos</h3>
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
            <div class="mb-6 grid grid-cols-3 gap-3">
              <div class="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
                <span class="block text-2xl font-bold text-blue-700">{{ reporte.totales.permisos }}</span>
                <span class="block text-xs uppercase text-gray-500">Total</span>
              </div>
              <div class="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
                <span class="block text-2xl font-bold text-blue-700">{{ reporte.totales.asignados }}</span>
                <span class="block text-xs uppercase text-gray-500">Asignados</span>
              </div>
              <div class="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
                <span class="block text-2xl font-bold text-blue-700">{{ reporte.totales.sin_asignar }}</span>
                <span class="block text-xs uppercase text-gray-500">Sin asignar</span>
              </div>
            </div>

            <h4 class="mb-2 font-bold text-gray-700">Detalle de permisos</h4>
            <div class="overflow-x-auto">
              <table class="min-w-full rounded-lg border border-gray-200">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="px-4 py-2 text-left text-sm font-bold">Permiso</th>
                    <th class="px-4 py-2 text-left text-sm font-bold">Descripción</th>
                    <th class="px-4 py-2 text-left text-sm font-bold">Estado</th>
                    <th class="px-4 py-2 text-left text-sm font-bold">N° roles</th>
                    <th class="px-4 py-2 text-left text-sm font-bold">Roles que lo tienen</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(p, i) in reporte.permisos" :key="i" class="border-t align-top">
                    <td class="px-4 py-2 font-medium">{{ p.nombre }}</td>
                    <td class="px-4 py-2">{{ p.descripcion || '-' }}</td>
                    <td class="px-4 py-2">
                      <span
                        :class="p.asignado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                        class="rounded px-2 py-1 text-xs"
                      >
                        {{ p.asignado ? 'Asignado' : 'Sin asignar' }}
                      </span>
                    </td>
                    <td class="px-4 py-2">{{ p.total_roles }}</td>
                    <td class="px-4 py-2">
                      <span
                        v-for="rol in p.roles"
                        :key="rol"
                        class="mb-1 mr-1 inline-block rounded bg-purple-100 px-2 py-1 text-xs text-purple-800"
                      >
                        {{ rol }}
                      </span>
                      <span v-if="!p.roles.length" class="text-xs text-gray-400">
                        Ningún rol lo tiene
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
import { usePermisoStore } from '@/stores/permisoStore';

const emit = defineEmits(['cancel']);

const permisoStore = usePermisoStore();

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
    reporte.value = await permisoStore.fetchReporte();
  } catch (err) {
    error.value = permisoStore.error || 'No se pudo generar el reporte';
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
    await permisoStore.descargarReportePdf();
  } catch (err) {
    errorDescarga.value = 'No se pudo descargar el PDF';
  } finally {
    descargando.value = false;
  }
};
</script>
