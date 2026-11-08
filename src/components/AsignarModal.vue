<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Fondo -->
      <div class="absolute inset-0 bg-black/50" @click="emit('cancel')"></div>

      <!-- Dialogo -->
      <div
        class="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-lg bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="asignar-title"
      >
        <!-- Encabezado -->
        <div class="flex items-start justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h3 id="asignar-title" class="text-lg font-bold">{{ titulo }}</h3>
            <p v-if="subtitulo" class="mt-1 text-sm text-gray-600">{{ subtitulo }}</p>
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

        <!-- Cuerpo -->
        <div class="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          <p v-if="items.length === 0" class="py-6 text-center text-gray-500">
            {{ vacioTexto }}
          </p>

          <template v-else>
            <div class="mb-3 flex items-center justify-between">
              <span class="text-sm text-gray-600">{{ marcados.length }} de {{ items.length }}</span>
              <button
                type="button"
                @click="alternarTodos"
                class="text-sm text-blue-600 hover:text-blue-800"
              >
                {{ marcados.length === items.length ? 'Quitar todos' : 'Seleccionar todos' }}
              </button>
            </div>

            <ul class="divide-y divide-gray-200 rounded-lg border border-gray-200">
              <li v-for="item in items" :key="item.id">
                <label class="flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    :value="item.id"
                    v-model="marcados"
                    class="mt-1 rounded"
                  />
                  <span>
                    <span class="block font-medium">{{ item.nombre }}</span>
                    <span v-if="item.descripcion" class="block text-sm text-gray-600">
                      {{ item.descripcion }}
                    </span>
                  </span>
                </label>
              </li>
            </ul>
          </template>

          <div v-if="error" class="mt-4 rounded-lg bg-red-100 p-4 text-sm text-red-700">
            {{ error }}
          </div>
        </div>

        <!-- Pie -->
        <div class="flex justify-end space-x-2 border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            @click="emit('cancel')"
            class="rounded-lg bg-gray-400 px-4 py-2 text-white hover:bg-gray-500"
          >
            Cancelar
          </button>
          <button
            type="button"
            :disabled="guardando"
            @click="emit('guardar', [...marcados])"
            class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            {{ guardando ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  titulo: { type: String, required: true },
  subtitulo: { type: String, default: '' },
  items: { type: Array, required: true },
  seleccionados: { type: Array, default: () => [] },
  guardando: { type: Boolean, default: false },
  error: { type: String, default: null },
  vacioTexto: { type: String, default: 'No hay nada que asignar todavía' },
});

const emit = defineEmits(['guardar', 'cancel']);

const marcados = ref([...props.seleccionados]);

const alternarTodos = () => {
  marcados.value = marcados.value.length === props.items.length ? [] : props.items.map((i) => i.id);
};

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
</script>
