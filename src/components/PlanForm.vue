<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="emit('cancel')"></div>

      <div
        class="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="plan-form-title"
      >
        <form @submit.prevent="handleSubmit" autocomplete="off" class="flex min-h-0 flex-col">
          <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h3 id="plan-form-title" class="text-lg font-bold">
              {{ editingId ? 'Editar Plan' : 'Nuevo Plan' }}
            </h3>
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
            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2">
                <label class="mb-1 block text-sm font-bold text-gray-700">Nombre *</label>
                <input
                  v-model="formData.nombre"
                  type="text"
                  autocomplete="off"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label class="mb-1 block text-sm font-bold text-gray-700">Vigencia (meses) *</label>
                <input
                  v-model.number="formData.vigencia"
                  type="number"
                  min="1"
                  max="120"
                  autocomplete="off"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div></div>

              <div>
                <label class="mb-1 block text-sm font-bold text-gray-700">Precio *</label>
                <input
                  v-model="formData.precio"
                  type="number"
                  step="0.01"
                  min="0"
                  autocomplete="off"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label class="mb-1 block text-sm font-bold text-gray-700">Precio de oferta</label>
                <input
                  v-model="formData.precio_oferta"
                  type="number"
                  step="0.01"
                  min="0"
                  autocomplete="off"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
                <p class="mt-1 text-xs text-gray-500">No puede superar al precio normal</p>
              </div>

              <div class="col-span-2">
                <label class="mb-1 block text-sm font-bold text-gray-700">Características</label>
                <textarea
                  v-model="caracteristicasTexto"
                  rows="5"
                  autocomplete="off"
                  placeholder="Una por línea&#10;Ej: SSL incluido&#10;5 GB de almacenamiento"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                ></textarea>
                <p class="mt-1 text-xs text-gray-500">Una característica por línea</p>
              </div>
            </div>

            <div v-if="error" class="mt-4 rounded-lg bg-red-100 p-4 text-sm text-red-700">
              {{ error }}
            </div>
          </div>

          <div class="flex justify-end space-x-2 border-t border-gray-200 px-6 py-4">
            <button
              type="button"
              @click="emit('cancel')"
              class="rounded-lg bg-gray-400 px-4 py-2 text-white hover:bg-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
              {{ loading ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { reactive, ref, onMounted, onUnmounted } from 'vue';
import { usePlanStore } from '@/stores/planStore';

const props = defineProps({
  plan: { type: Object, default: null },
});

const emit = defineEmits(['saved', 'cancel']);

const planStore = usePlanStore();

const editingId = ref(props.plan?.id ?? null);
const loading = ref(false);
const error = ref(null);

const formData = reactive({
  nombre: props.plan?.nombre ?? '',
  vigencia: props.plan?.vigencia ?? 12,
  precio: props.plan?.precio ?? '',
  precio_oferta: props.plan?.precio_oferta ?? '',
});

// La columna es JSON (lista de textos); en el formulario se edita como una por linea
const caracteristicasTexto = ref((props.plan?.caracteristicas ?? []).join('\n'));

const onKeydown = (e) => {
  if (e.key === 'Escape') emit('cancel');
};

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
  document.body.style.overflow = 'hidden';
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
  document.body.style.overflow = '';
});

const handleSubmit = async () => {
  loading.value = true;
  error.value = null;

  const payload = {
    ...formData,
    precio_oferta: formData.precio_oferta === '' ? null : formData.precio_oferta,
    caracteristicas: caracteristicasTexto.value
      .split('\n')
      .map((c) => c.trim())
      .filter(Boolean),
  };

  try {
    if (editingId.value) {
      await planStore.updatePlan(editingId.value, payload);
    } else {
      await planStore.createPlan(payload);
    }
    emit('saved');
  } catch (err) {
    error.value = planStore.error || 'Error al guardar plan';
  } finally {
    loading.value = false;
  }
};
</script>
