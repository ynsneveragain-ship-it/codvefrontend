<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="emit('cancel')"></div>

      <div
        class="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cliente-form-title"
      >
        <form @submit.prevent="handleSubmit" autocomplete="off" class="flex min-h-0 flex-col">
          <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h3 id="cliente-form-title" class="text-lg font-bold">
              {{ editingId ? 'Editar Cliente' : 'Nuevo Cliente' }}
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

              <div class="col-span-2">
                <label class="mb-1 block text-sm font-bold text-gray-700">Razón Social</label>
                <input
                  v-model="formData.razon_social"
                  type="text"
                  autocomplete="off"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label class="mb-1 block text-sm font-bold text-gray-700">CI / NIT *</label>
                <input
                  v-model="formData.numero_documento"
                  type="text"
                  autocomplete="off"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label class="mb-1 block text-sm font-bold text-gray-700">Teléfono</label>
                <input
                  v-model="formData.telefono"
                  type="text"
                  autocomplete="off"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div class="col-span-2">
                <label class="mb-1 block text-sm font-bold text-gray-700">Correo</label>
                <input
                  v-model="formData.correo"
                  type="email"
                  autocomplete="off"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
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
import { useClienteStore } from '@/stores/clienteStore';

const props = defineProps({
  cliente: { type: Object, default: null },
});

const emit = defineEmits(['saved', 'cancel']);

const clienteStore = useClienteStore();

const editingId = ref(props.cliente?.id ?? null);
const loading = ref(false);
const error = ref(null);

const formData = reactive({
  nombre: props.cliente?.nombre ?? '',
  razon_social: props.cliente?.razon_social ?? '',
  numero_documento: props.cliente?.numero_documento ?? '',
  telefono: props.cliente?.telefono ?? '',
  correo: props.cliente?.correo ?? '',
});

const onKeydown = (e) => {
  if (e.key === 'Escape') emit('cancel');
};

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
  // Evita que la pagina de atras se desplace mientras el modal esta abierto
  document.body.style.overflow = 'hidden';
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
  document.body.style.overflow = '';
});

const handleSubmit = async () => {
  loading.value = true;
  error.value = null;

  try {
    if (editingId.value) {
      await clienteStore.updateCliente(editingId.value, formData);
    } else {
      await clienteStore.createCliente(formData);
    }
    emit('saved');
  } catch (err) {
    error.value = clienteStore.error || 'Error al guardar cliente';
  } finally {
    loading.value = false;
  }
};
</script>
