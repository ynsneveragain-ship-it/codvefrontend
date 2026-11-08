<template>
  <div>
    <h2 class="font-titulo mb-1 text-2xl font-bold text-primario">Reportes</h2>
    <p class="mb-5 text-sm text-texto-suave">
      Los {{ reportes.length }} reportes que el sistema puede generar hoy. Cada uno se abre con su
      resumen en pantalla y desde ahí se descarga en PDF.
    </p>

    <!-- Cuatro por fila desde 1024 px, que es lo que mide una pantalla normal
         maximizada; baja a dos y a una segun estrecha. El corte estaba en
         1280 (xl) y en monitores mas justos nunca llegaban a ser cuatro.
         A este ancho cada tarjeta mide ~230 px: por eso todo va en vertical y
         los totales en una linea corrida en vez de etiquetas sueltas, que se
         partian en tres filas y descuadraban las alturas. -->
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="r in reportes"
        :key="r.clave"
        class="flex flex-col rounded-lg border border-borde bg-superficie p-4 shadow-sm"
      >
        <!-- flex-1 en el texto: deja los botones alineados abajo aunque las
             descripciones midan distinto -->
        <div class="flex-1">
          <h3 class="font-titulo text-base font-bold text-primario">{{ r.titulo }}</h3>
          <p class="mt-1 text-sm leading-snug text-texto-suave">{{ r.descripcion }}</p>

          <!-- Lo que resume el reporte, para no tener que abrirlo a ciegas -->
          <p class="mt-2.5 text-xs leading-relaxed text-texto-tenue">
            {{ r.resume.join(' · ') }}
          </p>
        </div>

        <button
          type="button"
          @click="abierto = r.clave"
          class="mt-4 w-full rounded-lg bg-primario px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primario-claro"
        >
          Ver reporte
        </button>
        <router-link
          :to="r.ruta"
          class="mt-2 block text-center text-xs font-medium text-texto-suave underline-offset-2 hover:text-primario hover:underline"
        >
          Ir a {{ r.titulo }}
        </router-link>
      </div>
    </div>

    <!-- Cada reporte abre SU propio modal, el mismo que ya usa su listado.
         No hay un modal generico: es la decision explicita del proyecto, para
         que cada reporte se pueda tocar por separado. Esta pantalla solo los
         reune en un sitio. -->
    <ReporteUsuariosModal v-if="abierto === 'usuarios'" @cancel="abierto = null" />
    <ReporteRolesModal v-else-if="abierto === 'roles'" @cancel="abierto = null" />
    <ReportePermisosModal v-else-if="abierto === 'permisos'" @cancel="abierto = null" />
    <ReporteClientesModal v-else-if="abierto === 'clientes'" @cancel="abierto = null" />
    <ReportePlanesModal v-else-if="abierto === 'planes'" @cancel="abierto = null" />
    <ReporteDominiosModal v-else-if="abierto === 'dominios'" @cancel="abierto = null" />
    <ReporteSuscripcionesModal v-else-if="abierto === 'suscripciones'" @cancel="abierto = null" />
    <ReportePagosModal v-else-if="abierto === 'pagos'" @cancel="abierto = null" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ReporteUsuariosModal from './ReporteUsuariosModal.vue';
import ReporteRolesModal from './ReporteRolesModal.vue';
import ReportePermisosModal from './ReportePermisosModal.vue';
import ReporteClientesModal from './ReporteClientesModal.vue';
import ReportePlanesModal from './ReportePlanesModal.vue';
import ReporteDominiosModal from './ReporteDominiosModal.vue';
import ReporteSuscripcionesModal from './ReporteSuscripcionesModal.vue';
import ReportePagosModal from './ReportePagosModal.vue';

// Clave del reporte abierto, o null si no hay ninguno
const abierto = ref(null);

// El catalogo. Al añadir un reporte nuevo (Suscripciones, Pagos...) hay que
// sumar aqui su entrada y su modal arriba, ademas del boton de su listado.
// 'resume' son los totales que muestra el reporte, tomados de su propio modal.
const reportes = [
  {
    clave: 'usuarios',
    titulo: 'Usuarios',
    ruta: '/users',
    descripcion: 'Cuentas del sistema, agrupadas por rol.',
    resume: ['Total', 'Activos', 'Inactivos', 'Con acceso', 'Sin ingresar'],
  },
  {
    clave: 'roles',
    titulo: 'Roles',
    ruta: '/roles',
    descripcion: 'Permisos y usuarios que tiene cada rol.',
    resume: ['Total', 'Con permisos', 'Sin permisos', 'Con usuarios', 'Sin usuarios'],
  },
  {
    clave: 'permisos',
    titulo: 'Permisos',
    ruta: '/permisos',
    descripcion: 'Permisos y los roles que los tienen.',
    resume: ['Total', 'Asignados', 'Sin asignar'],
  },
  {
    clave: 'clientes',
    titulo: 'Clientes',
    ruta: '/clientes',
    descripcion: 'Cartera de clientes y sus contactos.',
    resume: ['Total', 'Con suscripción', 'Sin suscripción', 'Con correo', 'Con teléfono'],
  },
  {
    clave: 'planes',
    titulo: 'Planes',
    ruta: '/planes',
    descripcion: 'Catálogo, precios y cuántos se contrataron.',
    resume: ['Total', 'Con oferta', 'Contratados', 'Sin contratar', 'Precio promedio'],
  },
  {
    clave: 'dominios',
    titulo: 'Dominios',
    ruta: '/dominios',
    descripcion: 'Dominios registrados, vigencia y margen.',
    resume: ['Total', 'Vigentes', 'Por vencer', 'Vencidos', 'Proveedores', 'Margen total'],
  },
  {
    clave: 'suscripciones',
    titulo: 'Suscripciones',
    ruta: '/suscripciones',
    descripcion: 'Servicios contratados, su vigencia y lo que cuestan.',
    resume: ['Total', 'Activas', 'Pendientes', 'Por vencer', 'Vencidas', 'Costo total'],
  },
  {
    clave: 'pagos',
    titulo: 'Pagos',
    ruta: '/pagos',
    descripcion: 'Cobros registrados, por estado y por método.',
    resume: ['Total', 'Cobrados', 'Pendientes', 'Monto cobrado', 'Monto pendiente', 'Con QR'],
  },
];
</script>
