<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="emit('cancel')"></div>

      <div
        class="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="suscripcion-form-title"
      >
        <form @submit.prevent="handleSubmit" autocomplete="off" class="flex min-h-0 flex-col">
          <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h3 id="suscripcion-form-title" class="text-lg font-bold">
              {{ editingId ? `Editar suscripción #${editingId}` : 'Nueva suscripción' }}
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
              <div>
                <label class="mb-1 block text-sm font-bold text-gray-700">Cliente *</label>
                <select
                  v-model="formData.cliente_id"
                  autocomplete="off"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option :value="null" disabled>-- Selecciona el cliente --</option>
                  <option v-for="c in clienteStore.todos" :key="c.id" :value="c.id">
                    {{ c.nombre }}{{ c.numero_documento ? ` (${c.numero_documento})` : '' }}
                  </option>
                </select>
              </div>

              <div>
                <label class="mb-1 block text-sm font-bold text-gray-700">Plan *</label>
                <select
                  v-model="formData.plan_id"
                  autocomplete="off"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option :value="null" disabled>-- Selecciona el plan --</option>
                  <option v-for="p in planStore.planes" :key="p.id" :value="p.id">
                    {{ p.nombre }} · {{ p.vigencia }} meses · {{ p.precio_oferta ?? p.precio }}
                  </option>
                </select>
              </div>

              <div>
                <label class="mb-1 block text-sm font-bold text-gray-700">Tipo de servicio *</label>
                <select
                  v-model="formData.tipo_servicio"
                  autocomplete="off"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option v-for="t in TIPOS_SERVICIO" :key="t" :value="t">{{ t }}</option>
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

              <div>
                <label class="mb-1 block text-sm font-bold text-gray-700">Fecha de inicio *</label>
                <input
                  v-model="formData.fecha_inicio"
                  type="date"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label class="mb-1 block text-sm font-bold text-gray-700">Fecha de fin *</label>
                <input
                  v-model="formData.fecha_fin"
                  type="date"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  required
                />
                <p v-if="finSugerido" class="mt-1 text-xs text-gray-500">
                  Según el plan terminaría el {{ finSugerido }}.
                  <button
                    type="button"
                    @click="formData.fecha_fin = finSugerido"
                    class="font-medium text-blue-600 hover:underline"
                  >
                    Usar
                  </button>
                </p>
              </div>

              <div>
                <label class="mb-1 block text-sm font-bold text-gray-700">Costo *</label>
                <input
                  v-model="formData.costo"
                  type="number"
                  step="0.01"
                  min="0"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  required
                />
                <p class="mt-1 text-xs text-gray-500">
                  Solo el plan; los dominios se cobran aparte.
                </p>
              </div>

              <div class="col-span-2 border-t border-gray-200 pt-4">
                <h4 class="text-sm font-bold text-gray-700">Credenciales del hosting</h4>
                <p class="mt-0.5 text-xs text-gray-500">
                  Son las del servicio contratado por el cliente, no las de acceso al sistema.
                </p>
              </div>

              <div>
                <label class="mb-1 block text-sm font-bold text-gray-700">Usuario</label>
                <input
                  v-model="formData.usuario"
                  type="text"
                  autocomplete="off"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label class="mb-1 block text-sm font-bold text-gray-700">Contraseña</label>
                <input
                  v-model="formData.password"
                  type="text"
                  autocomplete="new-password"
                  :placeholder="editingId ? 'Déjala en blanco para no cambiarla' : ''"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
                <p v-if="editingId" class="mt-1 text-xs text-gray-500">
                  No se muestra la guardada: el sistema nunca la devuelve.
                </p>
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
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { useSuscripcionStore } from '@/stores/suscripcionStore';
import { useClienteStore } from '@/stores/clienteStore';
import { usePlanStore } from '@/stores/planStore';

const props = defineProps({
  suscripcion: { type: Object, default: null },
});

const emit = defineEmits(['saved', 'cancel']);

const suscripcionStore = useSuscripcionStore();
const clienteStore = useClienteStore();
const planStore = usePlanStore();

// Espejo de backend/config/venta.php, como en ComprarModal: el backend valida
// con una regla 'in', asi que la base nunca acepta otro valor
const TIPOS_SERVICIO = ['Hosting', 'Hosting + Dominio'];
const ESTADOS = ['activo', 'pendiente'];

const editingId = ref(props.suscripcion?.id ?? null);
const loading = ref(false);
const error = ref(null);

const formData = reactive({
  cliente_id: props.suscripcion?.cliente_id ?? null,
  plan_id: props.suscripcion?.plan_id ?? null,
  tipo_servicio: props.suscripcion?.tipo_servicio ?? TIPOS_SERVICIO[0],
  estado: props.suscripcion?.estado ?? ESTADOS[1],
  fecha_inicio: props.suscripcion?.fecha_inicio ?? new Date().toISOString().slice(0, 10),
  fecha_fin: props.suscripcion?.fecha_fin ?? '',
  costo: props.suscripcion?.costo ?? '',
  usuario: props.suscripcion?.usuario ?? '',
  // Nunca llega rellena: el Resource no devuelve la contraseña del hosting
  password: '',
});

const planElegido = computed(() => planStore.planes.find((p) => p.id === formData.plan_id) ?? null);

// Fecha de fin que saldria de la vigencia del plan, como la calcula el
// backend al vender (inicio + N meses). Se SUGIERE, no se impone: una
// suscripcion cargada a mano puede tener cualquier periodo.
const finSugerido = computed(() => {
  const plan = planElegido.value;
  if (!plan || !formData.fecha_inicio) return null;

  const [a, m, d] = formData.fecha_inicio.split('-').map(Number);
  if (!a || !m || !d) return null;

  // Date normaliza el desbordamiento de mes (31/01 + 1 mes -> 03/03), asi que
  // se recorta al ultimo dia del mes destino, igual que addMonthsNoOverflow
  const destino = new Date(Date.UTC(a, m - 1 + Number(plan.vigencia), 1));
  const ultimoDia = new Date(Date.UTC(destino.getUTCFullYear(), destino.getUTCMonth() + 1, 0)).getUTCDate();
  destino.setUTCDate(Math.min(d, ultimoDia));

  return destino.toISOString().slice(0, 10);
});

// Al crear, el costo y la fecha de fin siguen al plan mientras no se toquen
watch(planElegido, (plan) => {
  if (!plan || editingId.value) return;

  if (!formData.costo) {
    formData.costo = plan.precio_oferta ?? plan.precio;
  }
  if (!formData.fecha_fin && finSugerido.value) {
    formData.fecha_fin = finSugerido.value;
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
    // Los clientes se piden sin paginar: hay que poder elegir cualquiera
    if (clienteStore.todos.length === 0) await clienteStore.fetchTodos();
    if (planStore.planes.length === 0) await planStore.fetchPlanes();
  } catch {
    error.value = 'No se pudieron cargar los clientes o los planes';
  }
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
      await suscripcionStore.updateSuscripcion(editingId.value, formData);
    } else {
      await suscripcionStore.createSuscripcion(formData);
    }
    emit('saved');
  } catch (err) {
    const errores = err.response?.data?.errors;
    error.value =
      (errores ? Object.values(errores).flat().join(' · ') : null) ||
      suscripcionStore.error ||
      'Error al guardar la suscripción';
  } finally {
    loading.value = false;
  }
};
</script>
