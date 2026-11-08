<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="emit('cancel')"></div>

      <div
        class="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dominio-form-title"
      >
        <form @submit.prevent="handleSubmit" autocomplete="off" class="flex min-h-0 flex-col">
          <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h3 id="dominio-form-title" class="text-lg font-bold">
              {{ editingId ? 'Editar Dominio' : 'Nuevo Dominio' }}
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
                <label class="mb-1 block text-sm font-bold text-gray-700">Proveedor *</label>
                <input
                  v-model="formData.proveedor"
                  type="text"
                  autocomplete="off"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div class="col-span-2">
                <label class="mb-1 block text-sm font-bold text-gray-700">
                  Nombre del dominio *
                  <!-- Porkbun no vende los ccTLD bolivianos: devuelve INVALID_TLD -->
                  <span class="ml-1 font-normal text-xs text-gray-500">
                    (.bo y .com.bo no disponibles)
                  </span>
                </label>
                <div class="flex gap-2">
                  <input
                    v-model="formData.nombre"
                    type="text"
                    placeholder="ejemplo.com"
                    autocomplete="off"
                    class="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    required
                  />
                  <!-- type="button": sin esto el Enter del formulario lo tomaria
                       como envio y guardaria el dominio sin querer -->
                  <button
                    type="button"
                    :disabled="!formData.nombre.trim() || verificando"
                    @click="verificarDominio"
                    class="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:bg-gray-400"
                  >
                    {{ verificando ? 'Verificando...' : 'Verificar' }}
                  </button>
                </div>

                <!-- Resultado de la consulta a Porkbun -->
                <p
                  v-if="verificando || mensajeDisponibilidad"
                  :class="colorDisponibilidad"
                  class="mt-1.5 text-sm font-medium"
                  role="status"
                  aria-live="polite"
                >
                  {{ verificando ? 'Consultando disponibilidad en Porkbun...' : mensajeDisponibilidad }}
                </p>

                <!-- Alternativas libres, cuando el dominio pedido esta ocupado -->
                <div v-if="alternativas.length" class="mt-2">
                  <p class="mb-1.5 text-xs text-gray-600">
                    Estas alternativas sí están libres:
                  </p>
                  <div class="flex flex-wrap gap-1.5">
                    <button
                      v-for="alt in alternativas"
                      :key="alt.dominio"
                      type="button"
                      @click="elegirAlternativa(alt)"
                      class="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
                      :class="
                        alt.dominio === formData.nombre
                          ? 'border-green-600 bg-green-600 text-white'
                          : 'border-green-300 bg-green-50 text-green-800 hover:bg-green-100'
                      "
                    >
                      {{ alt.dominio }}
                    </button>
                  </div>
                </div>

                <!-- Se buscaron alternativas y no habia ninguna libre -->
                <p
                  v-else-if="alternativasBuscadas"
                  class="mt-2 rounded-lg bg-gray-100 px-3 py-2 text-xs text-gray-700"
                >
                  Tampoco hay alternativas libres con ese nombre en las otras extensiones.
                </p>

              </div>

              <!-- Lo que cobra Porkbun, en USD. Mismo formato que los dos de
                   abajo: casilla gris de solo lectura. -->
              <div>
                <label class="mb-1 block text-sm font-bold text-gray-700">Precio dominio</label>
                <input
                  :value="precio?.primer_anio ?? ''"
                  type="text"
                  readonly
                  tabindex="-1"
                  class="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-gray-600"
                />
                <p class="mt-1 text-xs text-gray-500">
                  Primer año en Porkbun (USD)
                  <span v-if="precio?.en_oferta" class="font-medium text-amber-700">
                    · oferta, normal {{ precio.precio_regular }}
                  </span>
                  <span v-if="precio?.premium" class="font-medium text-amber-700">· premium</span>
                </p>
              </div>

              <!-- La renovacion importa: en .io o .online es varias veces el
                   precio del primer año -->
              <div>
                <label class="mb-1 block text-sm font-bold text-gray-700">Precio renovación</label>
                <input
                  :value="precio?.renovacion ?? ''"
                  type="text"
                  readonly
                  tabindex="-1"
                  class="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-gray-600"
                />
                <p class="mt-1 text-xs text-gray-500">Cada año a partir del segundo (USD)</p>
              </div>

              <!-- Los dos precios se calculan solos a partir del de Porkbun.
                   readonly (no disabled) para que el valor siga enviandose. -->
              <div>
                <label class="mb-1 block text-sm font-bold text-gray-700">Precio real</label>
                <input
                  :value="formData.precio_real"
                  type="text"
                  readonly
                  tabindex="-1"
                  class="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-gray-600"
                />
                <p class="mt-1 text-xs text-gray-500">
                  Lo que le cuesta a la empresa<span v-if="parametros.tipo_de_cambio">
                    · USD × {{ parametros.tipo_de_cambio.toFixed(2) }}</span>
                </p>
              </div>

              <div>
                <label class="mb-1 block text-sm font-bold text-gray-700">Precio</label>
                <input
                  :value="formData.precio"
                  type="text"
                  readonly
                  tabindex="-1"
                  class="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-gray-600"
                />
                <p class="mt-1 text-xs text-gray-500">
                  Lo que paga el cliente<span v-if="parametros.margen">
                    · precio real + {{ parametros.margen }}</span>
                </p>
              </div>

              <p
                v-if="!formData.precio_real"
                class="col-span-2 -mt-1 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800"
              >
                Los precios se calculan solos al verificar un dominio disponible.
              </p>

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
              </div>

              <div class="col-span-2">
                <label class="mb-1 block text-sm font-bold text-gray-700">Suscripción *</label>
                <select
                  v-model="formData.suscripcion_id"
                  autocomplete="off"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option :value="null" disabled>-- Selecciona la suscripción --</option>
                  <option v-for="s in suscripcionStore.todas" :key="s.id" :value="s.id">
                    #{{ s.id }} · {{ s.cliente?.nombre || 'sin cliente' }} ·
                    {{ s.tipo_servicio }} ({{ s.estado }})
                  </option>
                </select>
                <p class="mt-1 text-xs text-gray-500">
                  El dominio queda colgado de ella: si se elimina la suscripción, se elimina con
                  ella.
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
import { reactive, ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useDominioStore } from '@/stores/dominioStore';
import { useSuscripcionStore } from '@/stores/suscripcionStore';

// Proveedor sugerido al crear. Se puede cambiar a mano: es solo el valor inicial.
const PROVEEDOR_POR_DEFECTO = 'Porkbun';

const props = defineProps({
  dominio: { type: Object, default: null },
});

const emit = defineEmits(['saved', 'cancel']);

const dominioStore = useDominioStore();
const suscripcionStore = useSuscripcionStore();

const editingId = ref(props.dominio?.id ?? null);
const loading = ref(false);
const error = ref(null);

// Fechas por defecto al crear: hoy y hoy + 1 año (el backend exige que
// fecha_fin sea posterior a fecha_inicio)
const aIso = (d) =>
  [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');

const hoy = new Date();
const enUnAnio = new Date(hoy.getFullYear() + 1, hoy.getMonth(), hoy.getDate());

const formData = reactive({
  // Ya no hay suscripcion por defecto: se elige, y el backend la exige
  suscripcion_id: props.dominio?.suscripcion_id ?? null,
  nombre: props.dominio?.nombre ?? '',
  proveedor: props.dominio?.proveedor ?? PROVEEDOR_POR_DEFECTO,
  precio_real: props.dominio?.precio_real ?? '',
  precio: props.dominio?.precio ?? '',
  fecha_inicio: props.dominio?.fecha_inicio ?? aIso(hoy),
  fecha_fin: props.dominio?.fecha_fin ?? aIso(enUnAnio),
});

// --- Verificacion de disponibilidad en Porkbun ---
// estado: null (sin consultar) | 'libre' | 'ocupado' | 'indeterminado' | 'error'
const verificando = ref(false);
const estadoDisponibilidad = ref(null);
const mensajeDisponibilidad = ref('');
const precio = ref(null);
const alternativas = ref([]);
// Distingue "aun no se ha buscado" de "se busco y no habia ninguna"
const alternativasBuscadas = ref(false);
// Tipo de cambio y margen los manda el backend junto a la verificacion: aqui
// solo se rotulan. El calculo ya NO se hace en el navegador (config/precios.php).
const parametros = ref({ tipo_de_cambio: null, margen: null });

// Al pulsar una alternativa se cambia formData.nombre desde el propio codigo.
// Ese cambio NO debe limpiar el resultado como lo hace una edicion a mano.
let cambioInterno = false;

const colorDisponibilidad = computed(() => {
  if (verificando.value) return 'text-gray-500';

  return {
    libre: 'text-green-600',
    ocupado: 'text-red-600',
    indeterminado: 'text-amber-600',
    error: 'text-red-600',
  }[estadoDisponibilidad.value] ?? 'text-gray-500';
});

/**
 * Rellena los dos precios a partir del que devolvio Porkbun (en USD).
 *   precio real = USD * tipo de cambio
 *   precio      = precio real + margen
 * Si no hay precio (todavia no se ha verificado, o se cambio el nombre) se
 * vuelve a lo que habia al abrir el modal: los valores guardados si se esta
 * editando, o vacio si es un alta. Asi no quedan cifras de otro dominio.
 */
const aplicarPrecios = () => {
  const real = precio.value?.precio_real;
  const venta = precio.value?.precio;

  if (!real || !venta) {
    formData.precio_real = props.dominio?.precio_real ?? '';
    formData.precio = props.dominio?.precio ?? '';
    return;
  }

  formData.precio_real = real;
  formData.precio = venta;
};

const limpiarDisponibilidad = () => {
  estadoDisponibilidad.value = null;
  mensajeDisponibilidad.value = '';
  precio.value = null;
  alternativas.value = [];
  alternativasBuscadas.value = false;
  aplicarPrecios();
};

// Si se edita el nombre a mano, el resultado anterior deja de valer: mantenerlo
// en pantalla diria que "otro.com" esta libre cuando lo consultado fue "uno.com"
watch(
  () => formData.nombre,
  () => {
    if (cambioInterno) {
      cambioInterno = false;
      return;
    }
    limpiarDisponibilidad();
  },
);

// Marca un dominio como libre y muestra su precio, sin volver a consultar
const marcarLibre = (dominio, datosPrecio) => {
  estadoDisponibilidad.value = 'libre';
  mensajeDisponibilidad.value = `${dominio} está disponible`;
  precio.value = datosPrecio ?? null;
  aplicarPrecios();
};

/**
 * Elegir una alternativa la pasa a la casilla y muestra su precio. No hace
 * falta otra consulta: el precio vino junto a la alternativa en la misma
 * respuesta. La lista se deja visible para poder cambiar de opinion.
 */
const elegirAlternativa = (alt) => {
  const listaActual = alternativas.value;

  cambioInterno = true;
  formData.nombre = alt.dominio;

  marcarLibre(alt.dominio, alt.precio);
  alternativas.value = listaActual;
};

const verificarDominio = async () => {
  const nombre = formData.nombre.trim();
  if (!nombre) return;

  verificando.value = true;
  limpiarDisponibilidad();

  try {
    const r = await dominioStore.verificarDisponibilidad(nombre);

    if (r.parametros_precio) parametros.value = r.parametros_precio;

    if (r.disponible === true) {
      marcarLibre(r.dominio, r.precio);
    } else if (r.disponible === false) {
      estadoDisponibilidad.value = 'ocupado';
      // El backend distingue 'no se puede comprar porque esta tomado' de
      // 'no se puede comprar porque Porkbun no vende esa extension'
      mensajeDisponibilidad.value =
        r.motivo === 'tld_no_soportado'
          ? `${r.dominio} no está disponible: Porkbun no vende esta extensión`
          : `${r.dominio} ya está registrado, no está disponible`;
      alternativas.value = r.alternativas ?? [];
      alternativasBuscadas.value = true;
    } else {
      // El backend devuelve null cuando Porkbun responde algo que no sabe leer
      estadoDisponibilidad.value = 'indeterminado';
      mensajeDisponibilidad.value = 'No se pudo determinar la disponibilidad de este dominio';
    }
  } catch (err) {
    estadoDisponibilidad.value = 'error';
    const errores = err.response?.data?.errors;
    mensajeDisponibilidad.value =
      (errores ? Object.values(errores).flat().join(' · ') : null) ||
      err.response?.data?.message ||
      'No se pudo verificar la disponibilidad';
  } finally {
    verificando.value = false;
  }
};

const onKeydown = (e) => {
  if (e.key === 'Escape') emit('cancel');
};

onMounted(async () => {
  window.addEventListener('keydown', onKeydown);
  // Evita que la pagina de atras se desplace mientras el modal esta abierto
  document.body.style.overflow = 'hidden';

  try {
    // Sin paginar: hay que poder colgar el dominio de cualquier suscripcion
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

  try {
    if (editingId.value) {
      await dominioStore.updateDominio(editingId.value, formData);
    } else {
      await dominioStore.createDominio(formData);
    }
    emit('saved');
  } catch (err) {
    // 422: el backend devuelve los mensajes de validacion campo por campo
    const errores = err.response?.data?.errors;
    error.value = errores
      ? Object.values(errores).flat().join(' · ')
      : dominioStore.error || 'Error al guardar dominio';
  } finally {
    loading.value = false;
  }
};
</script>
