<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="emit('cancel')"></div>

      <div
        class="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pago-form-title"
      >
        <form @submit.prevent="handleSubmit" autocomplete="off" class="flex min-h-0 flex-col">
          <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h3 id="pago-form-title" class="text-lg font-bold">
              {{ editingId ? `Editar pago #${editingId}` : 'Nuevo pago' }}
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
              <!-- El cliente NO se elige: sale de la suscripción. La tabla
                   guarda los dos y el backend rechaza que se contradigan. -->
              <div class="col-span-2">
                <label class="mb-1 block text-sm font-bold text-gray-700">Suscripción *</label>
                <select
                  v-model="formData.suscripcion_id"
                  autocomplete="off"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option :value="null" disabled>-- Selecciona la suscripción que se paga --</option>
                  <option v-for="s in suscripcionStore.todas" :key="s.id" :value="s.id">
                    #{{ s.id }} · {{ s.cliente?.nombre || 'sin cliente' }} ·
                    {{ s.tipo_servicio }} · {{ s.costo }} ({{ s.estado }})
                  </option>
                </select>
                <p class="mt-1 text-xs text-gray-500">
                  Cliente: <strong>{{ clienteElegido || 'se toma de la suscripción' }}</strong>
                </p>
              </div>

              <div>
                <label class="mb-1 block text-sm font-bold text-gray-700">Monto *</label>
                <input
                  v-model="formData.monto"
                  type="number"
                  step="0.01"
                  min="0"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label class="mb-1 block text-sm font-bold text-gray-700">Fecha y hora *</label>
                <input
                  v-model="formData.fecha_pago"
                  type="datetime-local"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  required
                />
                <p class="mt-1 text-xs text-gray-500">
                  Si aún no se cobró, se lee como "registrado el".
                </p>
              </div>

              <div>
                <label class="mb-1 block text-sm font-bold text-gray-700">Método de pago *</label>
                <select
                  v-model="formData.metodo_pago"
                  autocomplete="off"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option v-for="m in METODOS_PAGO" :key="m" :value="m">{{ m }}</option>
                </select>
              </div>

              <div>
                <label class="mb-1 block text-sm font-bold text-gray-700">Estado *</label>
                <select
                  v-model="formData.estado"
                  autocomplete="off"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option v-for="e in ESTADOS" :key="e" :value="e">{{ e }}</option>
                </select>
              </div>

              <!-- Lo que escribe el cobro por QR. Solo de lectura: tocar el
                   qr_id a mano rompería la conciliación con el banco. -->
              <div v-if="pago?.qr_id || voucher" class="col-span-2 rounded-lg bg-gray-50 p-3">
                <h4 class="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Cobro por QR del banco
                </h4>
                <p class="mt-1 text-sm text-gray-700">
                  <span v-if="pago?.qr_id">QR <strong>{{ pago.qr_id }}</strong></span>
                  <span v-if="voucher"> · comprobante <strong>{{ voucher }}</strong></span>
                </p>
                <p class="mt-1 text-xs text-gray-500">
                  Esto lo escribe el banco; no se edita desde aquí.
                </p>
              </div>
            </div>

            <p class="mt-4 rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
              Cambiar aquí el estado NO activa ni desactiva la suscripción: eso solo lo hace el
              cobro confirmado por el banco. Si corriges un pago a mano, repasa también el estado
              de su suscripción.
            </p>

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
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { usePagoStore } from '@/stores/pagoStore';
import { useSuscripcionStore } from '@/stores/suscripcionStore';

const props = defineProps({
  pago: { type: Object, default: null },
});

const emit = defineEmits(['saved', 'cancel']);

const pagoStore = usePagoStore();
const suscripcionStore = useSuscripcionStore();

// Espejo de backend/config/venta.php; el backend valida con una regla 'in'
const METODOS_PAGO = ['Efectivo', 'Transferencia', 'QR', 'Tarjeta'];
const ESTADOS = ['pagado', 'pendiente'];

const editingId = ref(props.pago?.id ?? null);
const loading = ref(false);
const error = ref(null);

// El input datetime-local quiere 'YYYY-MM-DDTHH:mm' y el backend devuelve
// 'YYYY-MM-DD HH:mm': solo cambia el separador
const aInput = (valor) => (valor ? String(valor).replace(' ', 'T').slice(0, 16) : '');
const ahora = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const formData = reactive({
  suscripcion_id: props.pago?.suscripcion_id ?? null,
  cliente_id: props.pago?.cliente_id ?? null,
  monto: props.pago?.monto ?? '',
  fecha_pago: aInput(props.pago?.fecha_pago) || ahora(),
  metodo_pago: props.pago?.metodo_pago ?? METODOS_PAGO[0],
  estado: props.pago?.estado ?? ESTADOS[1],
});

const voucher = computed(() => props.pago?.additional_data?.bnb_voucher_id ?? null);

const suscripcionElegida = computed(
  () => suscripcionStore.todas.find((s) => s.id === formData.suscripcion_id) ?? null,
);

const clienteElegido = computed(
  () => suscripcionElegida.value?.cliente?.nombre ?? props.pago?.cliente?.nombre ?? null,
);

// El cliente va pegado a la suscripción elegida. Al crear, además, el monto
// arranca con el costo de esa suscripción (el dominio se cobra aparte, así
// que es una propuesta, no una imposición).
watch(suscripcionElegida, (s) => {
  if (!s) return;

  formData.cliente_id = s.cliente_id;

  if (!editingId.value && !formData.monto) {
    formData.monto = s.costo;
  }
});

const onKeydown = (e) => {
  if (e.key === 'Escape') emit('cancel');
};

onMounted(async () => {
  window.addEventListener('keydown', onKeydown);
  // Evita que la pagina de atras se desplace mientras el modal esta abierto
  document.body.style.overflow = 'hidden';

  try {
    // Sin paginar: hay que poder elegir cualquier suscripción
    if (suscripcionStore.todas.length === 0) await suscripcionStore.fetchTodas();
  } catch {
    error.value = 'No se pudieron cargar las suscripciones';
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
  document.body.style.overflow = '';
});

const handleSubmit = async () => {
  loading.value = true;
  error.value = null;

  // El backend espera 'YYYY-MM-DD HH:mm', no la T del input
  const datos = { ...formData, fecha_pago: formData.fecha_pago.replace('T', ' ') };

  try {
    if (editingId.value) {
      await pagoStore.updatePago(editingId.value, datos);
    } else {
      await pagoStore.createPago(datos);
    }
    emit('saved');
  } catch (err) {
    const errores = err.response?.data?.errors;
    error.value =
      (errores ? Object.values(errores).flat().join(' · ') : null) ||
      pagoStore.error ||
      'Error al guardar el pago';
  } finally {
    loading.value = false;
  }
};
</script>
