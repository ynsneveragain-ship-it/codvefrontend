<template>
  <!--
    Apartado del dashboard, no un emergente: ocupa su sitio en la página y
    empuja lo de abajo. Se cierra solo con su botón, a propósito (un bloque
    de la página no debería cerrarse al pulsar en cualquier otro sitio).
  -->
  <section
    id="panel-vencimientos"
    class="mb-6 rounded-lg border border-borde bg-superficie"
    aria-label="Próximos vencimientos"
  >
    <div class="flex items-start justify-between border-b border-borde px-5 py-3">
      <div>
        <h3 class="font-titulo font-bold text-primario">Próximos vencimientos</h3>
        <p class="mt-0.5 text-xs text-texto-suave">
          Próximos {{ store.parametros.dias_aviso }} días
          <span v-if="store.totales.urgentes > 0" class="font-semibold text-peligro">
            · {{ store.totales.urgentes }} urgente(s)
          </span>
        </p>
      </div>
      <button
        type="button"
        @click="emit('cerrar')"
        aria-label="Cerrar"
        class="rounded-lg px-2 text-2xl leading-none text-texto-tenue hover:bg-primario-tenue hover:text-texto"
      >
        &times;
      </button>
    </div>

    <div class="px-5 py-4">
      <p v-if="store.loading" class="py-6 text-center text-sm text-texto-suave">Cargando...</p>

      <p v-else-if="store.error" class="rounded-lg bg-peligro-tenue p-3 text-sm text-peligro-oscuro">
        {{ store.error }}
      </p>

      <!-- Nada a la vista -->
      <p
        v-else-if="!store.hayCasos"
        class="rounded-lg bg-acento-tenue px-3 py-6 text-center text-sm font-medium text-acento-oscuro"
      >
        Sin casos a vencer
      </p>

      <template v-else>
        <!-- Primero los dominios, luego las suscripciones. Cada bloque solo
             aparece si tiene algo. -->
        <section v-if="store.dominios.length" class="mb-5">
          <h4 class="mb-2 text-xs font-bold uppercase tracking-wide text-texto-suave">
            Dominios ({{ store.dominios.length }})
          </h4>
          <ul class="space-y-2">
            <li
              v-for="d in store.dominios"
              :key="`dom-${d.id}`"
              class="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-2.5"
              :class="claseItem(d.dias_restantes)"
            >
              <div class="min-w-0">
                <p class="text-sm font-bold text-texto">{{ d.nombre }}</p>
                <p class="text-xs text-texto-suave">
                  {{ d.cliente || 'sin cliente' }} · {{ d.proveedor }} ·
                  suscripción #{{ d.suscripcion_id }}
                </p>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-right">
                  <p class="text-sm font-bold" :class="claseTexto(d.dias_restantes)">
                    {{ cuando(d.dias_restantes) }}
                  </p>
                  <p class="text-xs text-texto-tenue">{{ d.fecha_fin }}</p>
                </div>

                <!-- Avisar al cliente por correo. Se le oculta al rol visita,
                     que además lo tiene prohibido en el backend. -->
                <div v-if="!authStore.esVisita" class="w-32 text-right">
                  <!-- Ya notificado: no hay botón, solo la constancia -->
                  <template v-if="yaNotificado(d)">
                    <p class="text-xs font-bold text-acento-oscuro">&check; Notificado</p>
                    <p v-if="d.fecha_notificacion" class="text-[11px] leading-tight text-texto-tenue">
                      {{ d.fecha_notificacion }}
                    </p>
                  </template>

                  <template v-else>
                    <button
                      type="button"
                      @click="notificar('dom', d)"
                      :disabled="estadoDe('dom', d.id) === 'enviando'"
                      class="rounded-lg border border-primario px-3 py-1.5 text-xs font-bold text-primario transition-colors hover:bg-primario hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {{ textoBoton('dom', d.id) }}
                    </button>
                    <p
                      v-if="mensajeDe('dom', d.id)"
                      class="mt-1 text-[11px] leading-tight text-peligro-oscuro"
                    >
                      {{ mensajeDe('dom', d.id) }}
                    </p>
                  </template>
                </div>
              </div>
            </li>
          </ul>
        </section>

        <section v-if="store.suscripciones.length">
          <h4 class="mb-2 text-xs font-bold uppercase tracking-wide text-texto-suave">
            Suscripciones ({{ store.suscripciones.length }})
          </h4>
          <ul class="space-y-2">
            <li
              v-for="s in store.suscripciones"
              :key="`sus-${s.id}`"
              class="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-2.5"
              :class="claseItem(s.dias_restantes)"
            >
              <div class="min-w-0">
                <p class="text-sm font-bold text-texto">
                  #{{ s.id }} · {{ s.cliente || 'sin cliente' }}
                </p>
                <p class="text-xs text-texto-suave">
                  {{ s.tipo_servicio }} · {{ s.plan || 'sin plan' }} · {{ s.estado }} ·
                  {{ s.costo }}
                </p>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-right">
                  <p class="text-sm font-bold" :class="claseTexto(s.dias_restantes)">
                    {{ cuando(s.dias_restantes) }}
                  </p>
                  <p class="text-xs text-texto-tenue">{{ s.fecha_fin }}</p>
                </div>

                <div v-if="!authStore.esVisita" class="w-32 text-right">
                  <template v-if="yaNotificado(s)">
                    <p class="text-xs font-bold text-acento-oscuro">&check; Notificado</p>
                    <p v-if="s.fecha_notificacion" class="text-[11px] leading-tight text-texto-tenue">
                      {{ s.fecha_notificacion }}
                    </p>
                  </template>

                  <template v-else>
                    <button
                      type="button"
                      @click="notificar('sus', s)"
                      :disabled="estadoDe('sus', s.id) === 'enviando'"
                      class="rounded-lg border border-primario px-3 py-1.5 text-xs font-bold text-primario transition-colors hover:bg-primario hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {{ textoBoton('sus', s.id) }}
                    </button>
                    <p
                      v-if="mensajeDe('sus', s.id)"
                      class="mt-1 text-[11px] leading-tight text-peligro-oscuro"
                    >
                      {{ mensajeDe('sus', s.id) }}
                    </p>
                  </template>
                </div>
              </div>
            </li>
          </ul>
        </section>
      </template>
    </div>
  </section>
</template>

<script setup>
import { onMounted, reactive } from 'vue';
import { useVencimientoStore } from '@/stores/vencimientoStore';
import { useAuthStore } from '@/stores/authStore';

const emit = defineEmits(['cerrar']);

const store = useVencimientoStore();
const authStore = useAuthStore();

// Quien manda es la BASE DE DATOS, no la pantalla: estado_notificacion viene
// en cada fila (null = nunca se aviso) y es lo que decide si se pinta el boton
// o el "Notificado". Asi, al cerrar y volver a abrir el panel, o al entrar otro
// usuario, se sigue viendo lo mismo.
const yaNotificado = (fila) => Boolean(fila.estado_notificacion);

// Lo unico que vive en la pantalla es el "enviando..." y el error del ultimo
// intento de cada fila, que no son datos del negocio. La clave lleva el tipo
// porque un dominio y una suscripcion pueden tener el mismo id ('dom-1' y
// 'sus-1' son filas distintas). Mientras una manda, las demas siguen pulsables.
const avisos = reactive({});

const clave = (tipo, id) => `${tipo}-${id}`;

const estadoDe = (tipo, id) => avisos[clave(tipo, id)]?.estado ?? null;
const mensajeDe = (tipo, id) => avisos[clave(tipo, id)]?.mensaje ?? null;

// No hay "Enviado": en cuanto sale el correo, la fila pasa a ser una fila
// notificada y el boton desaparece.
const textoBoton = (tipo, id) => {
  const estado = estadoDe(tipo, id);
  if (estado === 'enviando') return 'Enviando...';
  if (estado === 'error') return 'Reintentar';

  return 'Notificar';
};

// Se le pasa la FILA, no el id, para poder marcarla al volver: las listas del
// store son reactivas, asi que escribir ahi lo que acaba de responder el
// backend cambia el boton por el "Notificado" sin tener que recargar el panel
// (recargarlo pediria otra vez las dos listas enteras para cambiar una fila).
const notificar = async (tipo, fila) => {
  const k = clave(tipo, fila.id);
  avisos[k] = { estado: 'enviando', mensaje: null };

  try {
    const data =
      tipo === 'dom'
        ? await store.notificarDominio(fila.id)
        : await store.notificarSuscripcion(fila.id);

    fila.estado_notificacion = data.estado_notificacion;
    fila.fecha_notificacion = data.fecha_notificacion;
    delete avisos[k];
  } catch (err) {
    // Un 409 es "alguien ya la notifico mientras el panel estaba abierto": la
    // respuesta trae el estado real, asi que la fila se corrige en vez de
    // quedarse ofreciendo un boton que ya no vale.
    const datos = err.response?.data;

    if (err.response?.status === 409 && datos?.estado_notificacion) {
      fila.estado_notificacion = datos.estado_notificacion;
      fila.fecha_notificacion = datos.fecha_notificacion;
      delete avisos[k];

      return;
    }

    avisos[k] = {
      estado: 'error',
      mensaje: datos?.message || 'No se pudo enviar el aviso',
    };
  }
};

// dias_restantes viene con signo del backend: negativo = ya pasó
const cuando = (dias) => {
  if (dias === null || dias === undefined) return 'sin fecha';
  if (dias < 0) return `venció hace ${Math.abs(dias)} día(s)`;
  if (dias === 0) return 'vence hoy';
  if (dias === 1) return 'vence mañana';

  return `vence en ${dias} días`;
};

const esUrgente = (dias) =>
  dias !== null && dias !== undefined && dias < store.parametros.dias_urgente;

const claseItem = (dias) =>
  esUrgente(dias) ? 'border-peligro/40 bg-peligro-tenue' : 'border-borde bg-lienzo';

const claseTexto = (dias) => (esUrgente(dias) ? 'text-peligro-oscuro' : 'text-texto');

onMounted(async () => {
  // El panel se monta al abrirlo (v-if en el dashboard), asi que esto es
  // "recargar al abrir": puede llevar horas en pantalla desde la ultima vez
  try {
    await store.fetchVencimientos();
  } catch {
    // El store guarda el error y el bloque de arriba lo muestra
  }
});
</script>
