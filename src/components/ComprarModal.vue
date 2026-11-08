<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="cerrar"></div>

      <div
        class="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="comprar-title"
      >
        <div class="border-b border-gray-200 px-6 py-4">
          <div class="relative">
            <h3 id="comprar-title" class="text-center text-lg font-bold">
              {{ pasos[paso - 1].titulo }}
            </h3>
            <button
              type="button"
              @click="cerrar"
              :disabled="enviando"
              aria-label="Cerrar"
              class="absolute right-0 top-0 text-2xl leading-none text-gray-400 hover:text-gray-700"
            >
              &times;
            </button>
          </div>

          <!-- Iconos de cada paso: al completarlo, el icono pasa a ser un check verde -->
          <div class="mt-4 grid grid-cols-5 gap-2">
            <div v-for="(p, i) in pasos" :key="p.clave" class="flex flex-col items-center">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full border-2"
                :class="
                  estadoPaso(i + 1) === 'completado'
                    ? 'border-green-500 bg-green-50 text-green-600'
                    : estadoPaso(i + 1) === 'actual'
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-200 bg-white text-gray-400'
                "
              >
                <!-- Check (paso completado) -->
                <svg
                  v-if="estadoPaso(i + 1) === 'completado'"
                  class="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>

                <!-- Recibo (pedido: el resumen de lo que se va a cobrar) -->
                <svg
                  v-else-if="p.clave === 'pedido'"
                  class="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
                  <path d="M9.5 8h5M9.5 12h5" />
                </svg>

                <!-- Lista (plan) -->
                <svg
                  v-else-if="p.clave === 'plan'"
                  class="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <line x1="9" y1="7" x2="19" y2="7" />
                  <line x1="9" y1="12" x2="19" y2="12" />
                  <line x1="9" y1="17" x2="19" y2="17" />
                  <circle cx="5" cy="7" r="1.3" fill="currentColor" stroke="none" />
                  <circle cx="5" cy="12" r="1.3" fill="currentColor" stroke="none" />
                  <circle cx="5" cy="17" r="1.3" fill="currentColor" stroke="none" />
                </svg>

                <!-- Navegador (dominio) -->
                <svg
                  v-else-if="p.clave === 'dominio'"
                  class="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <rect x="2.5" y="4" width="19" height="16" rx="2" />
                  <line x1="2.5" y1="9" x2="21.5" y2="9" />
                  <circle cx="6" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
                  <circle cx="9" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
                  <circle cx="12" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
                </svg>

                <!-- Persona (datos personales) -->
                <svg
                  v-else-if="p.clave === 'datos'"
                  class="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
                </svg>

                <!-- QR (pago: es el ultimo paso, cobrar con el banco) -->
                <svg
                  v-else
                  class="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <path d="M14 14h3v3h-3z" />
                  <path d="M20 14h1M14 20h1M19.5 18v3h-2" />
                </svg>
              </div>

              <span
                class="mt-1 text-center text-xs"
                :class="
                  estadoPaso(i + 1) === 'completado'
                    ? 'font-bold text-green-600'
                    : estadoPaso(i + 1) === 'actual'
                      ? 'font-bold text-blue-600'
                      : 'text-gray-400'
                "
              >
                {{ p.etiqueta }}
              </span>
            </div>
          </div>

          <div class="mt-2 grid grid-cols-5 gap-2">
            <div
              v-for="n in pasos.length"
              :key="n"
              class="h-1.5 rounded-full"
              :class="
                estadoPaso(n) === 'completado'
                  ? 'bg-green-500'
                  : estadoPaso(n) === 'actual'
                    ? 'bg-blue-600'
                    : 'bg-gray-200'
              "
            ></div>
          </div>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <!-- VENTANA 1: eleccion del plan -->
          <div v-if="paso === 1">
            <p class="mb-3 text-sm text-gray-600">Elige el plan que va a contratar el cliente:</p>

            <p v-if="planStore.loading" class="text-sm text-gray-500">Cargando planes...</p>
            <p v-else-if="planStore.planes.length === 0" class="text-sm text-gray-500">
              No hay planes disponibles.
            </p>

            <!-- Una tarjeta por plan. Sustituye al desplegable: el contenido es
                 el mismo que antes mostraba el recuadro de detalle. -->
            <div v-else class="grid gap-3" :class="planStore.planes.length > 1 ? 'grid-cols-2' : ''">
              <button
                v-for="plan in planStore.planes"
                :key="plan.id"
                type="button"
                @click="compra.planId = plan.id"
                :aria-pressed="compra.planId === plan.id"
                class="flex flex-col rounded-lg border-2 p-4 text-left transition-colors"
                :class="
                  compra.planId === plan.id
                    ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/40'
                "
              >
                <div class="flex items-start justify-between gap-2">
                  <span
                    class="font-bold"
                    :class="compra.planId === plan.id ? 'text-blue-900' : 'text-gray-800'"
                  >
                    {{ plan.nombre }}
                  </span>
                  <span
                    v-if="compra.planId === plan.id"
                    class="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white"
                  >
                    Elegido
                  </span>
                </div>

                <p class="mt-1 text-xs text-gray-600">{{ plan.vigencia }} meses de vigencia</p>

                <p class="mt-2">
                  <span class="text-xl font-bold text-blue-700">
                    {{ plan.precio_oferta ?? plan.precio }}
                  </span>
                  <span
                    v-if="plan.precio_oferta"
                    class="ml-1.5 text-xs text-gray-400 line-through"
                  >
                    {{ plan.precio }}
                  </span>
                </p>
                <p v-if="plan.precio_oferta" class="text-[11px] font-medium text-amber-700">
                  En oferta
                </p>

                <ul
                  v-if="plan.caracteristicas?.length"
                  class="mt-2 list-inside list-disc text-xs text-gray-600"
                >
                  <li v-for="(c, i) in plan.caracteristicas" :key="i">{{ c }}</li>
                </ul>
              </button>
            </div>
          </div>

          <!-- VENTANA 2: dominio, con verificación real contra Porkbun -->
          <div v-else-if="paso === 2">
            <label class="mb-1 block text-sm font-bold text-gray-700">
              Dominio *
              <span class="ml-1 text-xs font-normal text-gray-500">
                (.bo y .com.bo no disponibles)
              </span>
            </label>

            <div class="flex gap-2">
              <input
                v-model.trim="compra.dominio"
                type="text"
                placeholder="miempresa.com"
                autocomplete="off"
                class="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
              <button
                type="button"
                :disabled="!compra.dominio.trim() || verificando"
                @click="verificarDominio"
                class="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {{ verificando ? 'Verificando...' : 'Verificar' }}
              </button>
            </div>

            <p
              v-if="verificando || mensajeDisponibilidad"
              :class="colorDisponibilidad"
              class="mt-1.5 text-sm font-medium"
              role="status"
              aria-live="polite"
            >
              {{ verificando ? 'Consultando disponibilidad en Porkbun...' : mensajeDisponibilidad }}
            </p>

            <div v-if="alternativas.length" class="mt-2">
              <p class="mb-1.5 text-xs text-gray-600">Estas alternativas sí están libres:</p>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="alt in alternativas"
                  :key="alt.dominio"
                  type="button"
                  @click="elegirAlternativa(alt)"
                  class="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
                  :class="
                    alt.dominio === compra.dominio
                      ? 'border-green-600 bg-green-600 text-white'
                      : 'border-green-300 bg-green-50 text-green-800 hover:bg-green-100'
                  "
                >
                  {{ alt.dominio }}
                </button>
              </div>
            </div>

            <!-- Se buscaron alternativas y no habia ninguna libre. Sin este
                 aviso la pantalla se queda vacia y parece que no se busco. -->
            <p
              v-else-if="alternativasBuscadas"
              class="mt-2 rounded-lg bg-gray-100 px-3 py-2 text-xs text-gray-700"
            >
              Tampoco hay alternativas libres con ese nombre en las otras extensiones. Prueba con
              otro nombre.
            </p>

            <!-- Solo el precio que paga el cliente: este asistente lo ve el
                 comprador, y el costo para la empresa no debe salir de aqui -->
            <div
              v-if="compra.precioDominio"
              class="mt-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5"
            >
              <span class="text-xs font-bold uppercase tracking-wide text-green-800">
                Precio del dominio
              </span>
              <p class="mt-1 text-xl font-bold text-green-700">{{ compra.precioDominio }}</p>
              <p class="mt-0.5 text-xs text-gray-600">Por el primer año</p>
            </div>

            <p
              v-else-if="!estadoDisponibilidad && !verificando"
              class="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800"
            >
              Escribe un dominio y pulsa Verificar para ver si está libre y cuánto cuesta.
            </p>

            <!-- Aviso al intentar avanzar con el dominio en blanco -->
            <div
              v-if="confirmandoSinDominio"
              class="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3"
              role="alertdialog"
              aria-labelledby="aviso-sin-dominio"
            >
              <p id="aviso-sin-dominio" class="text-sm font-bold text-amber-900">
                ¿Continuar sin dominio?
              </p>
              <p class="mt-1 text-xs text-amber-800">
                La venta se registrará como «{{ TIPO_SIN_DOMINIO }}», sin ningún dominio asociado.
              </p>
              <div class="mt-3 flex gap-2">
                <button
                  type="button"
                  @click="continuarSinDominio"
                  class="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700"
                >
                  Continuar
                </button>
                <button
                  type="button"
                  @click="confirmandoSinDominio = false"
                  class="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-amber-800 ring-1 ring-amber-300 hover:bg-amber-100"
                >
                  Añadir dominio
                </button>
              </div>
            </div>
          </div>

          <!-- VENTANA 3: datos personales -->
          <div v-else-if="paso === 3" class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="mb-1 block text-sm font-bold text-gray-700">Nombre *</label>
              <input
                v-model.trim="compra.nombre"
                type="text"
                autocomplete="off"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label class="mb-1 block text-sm font-bold text-gray-700">CI / NIT *</label>
              <input
                v-model.trim="compra.ci"
                type="text"
                autocomplete="off"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
              <p class="mt-1 text-xs text-gray-500">
                Si ya existe un cliente con este CI / NIT, la compra se añade a su ficha.
              </p>
            </div>

            <div>
              <label class="mb-1 block text-sm font-bold text-gray-700">Celular *</label>
              <input
                v-model.trim="compra.celular"
                type="tel"
                autocomplete="off"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label class="mb-1 block text-sm font-bold text-gray-700">Correo *</label>
              <input
                v-model.trim="compra.correo"
                type="email"
                autocomplete="off"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <!-- VENTANA 4: confirmacion de lo que se va a cobrar -->
          <div v-else-if="paso === 4">
            <h4 class="mb-2 text-sm font-bold uppercase text-gray-500">Plan</h4>
            <table class="mb-5 w-full text-sm">
              <tbody>
                <tr class="border-b border-gray-100">
                  <td class="py-1.5 pr-4 text-gray-500">Nombre</td>
                  <td class="py-1.5 font-bold">{{ planElegido?.nombre || '—' }}</td>
                </tr>
                <tr class="border-b border-gray-100">
                  <td class="py-1.5 pr-4 text-gray-500">Vigencia</td>
                  <td class="py-1.5 font-bold">{{ planElegido?.vigencia }} meses</td>
                </tr>
                <tr class="border-b border-gray-100">
                  <td class="py-1.5 pr-4 text-gray-500">Precio</td>
                  <td class="py-1.5 font-bold">{{ planElegido?.precio }}</td>
                </tr>
                <tr v-if="planElegido?.precio_oferta" class="border-b border-gray-100">
                  <td class="py-1.5 pr-4 text-gray-500">Precio de oferta</td>
                  <td class="py-1.5 font-bold">{{ planElegido.precio_oferta }}</td>
                </tr>
                <tr class="border-b border-gray-100">
                  <td class="py-1.5 pr-4 text-gray-500">Tipo de servicio</td>
                  <td class="py-1.5 font-bold">{{ tipoServicio }}</td>
                </tr>
              </tbody>
            </table>

            <h4 v-if="llevaDominio" class="mb-2 text-sm font-bold uppercase text-gray-500">
              Dominio
            </h4>
            <table v-if="llevaDominio" class="mb-5 w-full text-sm">
              <tbody>
                <tr class="border-b border-gray-100">
                  <td class="py-1.5 pr-4 text-gray-500">Dominio solicitado</td>
                  <td class="py-1.5 font-bold">{{ compra.dominio || '—' }}</td>
                </tr>
                <tr class="border-b border-gray-100">
                  <td class="py-1.5 pr-4 text-gray-500">Disponibilidad</td>
                  <td class="py-1.5 font-bold text-green-700">Verificado y disponible</td>
                </tr>
                <tr class="border-b border-gray-100">
                  <td class="py-1.5 pr-4 text-gray-500">Precio del dominio</td>
                  <td class="py-1.5 font-bold">{{ compra.precioDominio || '—' }}</td>
                </tr>
              </tbody>
            </table>

            <h4 class="mb-2 text-sm font-bold uppercase text-gray-500">Datos personales</h4>
            <table class="w-full text-sm">
              <tbody>
                <tr class="border-b border-gray-100">
                  <td class="py-1.5 pr-4 text-gray-500">Nombre</td>
                  <td class="py-1.5 font-bold">{{ compra.nombre || '—' }}</td>
                </tr>
                <tr class="border-b border-gray-100">
                  <td class="py-1.5 pr-4 text-gray-500">CI / NIT</td>
                  <td class="py-1.5 font-bold">{{ compra.ci || '—' }}</td>
                </tr>
                <tr class="border-b border-gray-100">
                  <td class="py-1.5 pr-4 text-gray-500">Celular</td>
                  <td class="py-1.5 font-bold">{{ compra.celular || '—' }}</td>
                </tr>
                <tr class="border-b border-gray-100">
                  <td class="py-1.5 pr-4 text-gray-500">Correo</td>
                  <td class="py-1.5 font-bold">{{ compra.correo || '—' }}</td>
                </tr>
              </tbody>
            </table>

            <h4 class="mb-2 mt-5 text-sm font-bold uppercase text-gray-500">Cobro</h4>
            <table class="w-full text-sm">
              <tbody>
                <tr class="border-b border-gray-100">
                  <td class="py-1.5 pr-4 text-gray-500">Forma de cobro</td>
                  <td class="py-1.5 font-bold">QR del BNB</td>
                </tr>
                <tr class="border-b border-gray-100">
                  <td class="py-1.5 pr-4 text-gray-500">Plan {{ planElegido?.nombre }}</td>
                  <td class="py-1.5 font-bold">{{ costoPlan || '—' }}</td>
                </tr>
                <tr v-if="compra.precioDominio" class="border-b border-gray-100">
                  <td class="py-1.5 pr-4 text-gray-500">Dominio {{ compra.dominio }}</td>
                  <td class="py-1.5 font-bold">{{ compra.precioDominio }}</td>
                </tr>
                <tr class="border-b border-gray-100">
                  <td class="py-1.5 pr-4 text-gray-500">Total a cobrar</td>
                  <td class="py-1.5 text-base font-bold text-green-700">{{ total }}</td>
                </tr>
              </tbody>
            </table>

            <p class="mt-5 rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
              Al pulsar «Generar QR» se registra la venta (cliente, suscripción, dominio y el pago
              pendiente) y el banco emite el QR del cobro. La suscripción se activa sola en cuanto
              el banco confirme el pago. El registro del dominio en Porkbun sigue siendo un trámite
              manual aparte.
            </p>
          </div>

          <!-- VENTANA 5: cobro con el QR del BNB.
               Al llegar aqui la venta YA esta registrada y pendiente de cobro,
               asi que no se puede volver atras: se registraria dos veces. -->
          <div v-else>
            <p v-if="estadoQr === 'generando'" class="py-12 text-center text-sm text-gray-600">
              Registrando la venta y pidiendo el QR al banco...
            </p>

            <!-- Cobrado -->
            <div
              v-else-if="estadoQr === 'pagado'"
              class="rounded-lg border border-green-300 bg-green-50 p-6 text-center"
              role="status"
              aria-live="polite"
            >
              <svg
                class="mx-auto h-12 w-12 text-green-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M8 12.5l2.5 2.5L16 9.5" />
              </svg>
              <p class="mt-3 text-lg font-bold text-green-900">Pago confirmado</p>
              <p class="mt-1 text-sm text-green-800">
                El banco confirmó el cobro de {{ montoCobrado }}. La suscripción queda activa.
              </p>
              <p v-if="voucher" class="mt-2 text-xs text-green-700">
                Comprobante del banco: <strong>{{ voucher }}</strong>
              </p>
            </div>

            <!-- QR en pantalla, esperando que el cliente pague -->
            <div v-else-if="estadoQr === 'esperando' && qr">
              <p class="text-center text-sm text-gray-600">
                El cliente escanea este QR con la aplicación de su banco.
              </p>

              <img
                :src="`data:image/png;base64,${qr.imagen}`"
                alt="Código QR para pagar"
                class="mx-auto my-4 h-60 w-60 rounded-lg border border-gray-200 bg-white p-2"
              />

              <p class="text-center text-2xl font-bold text-gray-800">{{ montoCobrado }}</p>
              <p class="mt-1 text-center text-xs text-gray-500">
                {{ qr.glosa }} · válido hasta el {{ fechaLegible(qr.expiracion) }}
              </p>

              <p
                class="mt-4 rounded-lg px-3 py-2 text-center text-sm font-medium"
                :class="sondeoActivo ? 'bg-blue-50 text-blue-800' : 'bg-gray-100 text-gray-700'"
                role="status"
                aria-live="polite"
              >
                {{ mensajeEspera }}
              </p>

              <div class="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  @click="comprobarPago(true)"
                  :disabled="comprobando"
                  class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {{ comprobando ? 'Comprobando...' : 'Comprobar ahora' }}
                </button>
                <button
                  type="button"
                  @click="anularQr"
                  :disabled="pagoStore.loading"
                  class="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50 disabled:text-gray-400"
                >
                  Anular este QR
                </button>
              </div>
            </div>

            <!-- Expirado, anulado, o el banco no dio el QR -->
            <div v-else class="rounded-lg border border-amber-300 bg-amber-50 p-5 text-center">
              <p class="text-sm font-bold text-amber-900">{{ tituloSinQr }}</p>
              <p class="mt-1 text-xs text-amber-800">
                La venta está registrada y pendiente de cobro<span v-if="suscripcionId">
                  (suscripción #{{ suscripcionId }})</span
                >. Puedes generar otro QR ahora, o cobrarla más adelante.
              </p>
              <button
                type="button"
                @click="regenerarQr"
                :disabled="pagoStore.loading"
                class="mt-3 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:bg-gray-400"
              >
                {{ pagoStore.loading ? 'Pidiendo el QR...' : 'Generar otro QR' }}
              </button>
            </div>
          </div>

          <p v-if="error" class="mt-4 rounded-lg bg-red-100 p-4 text-sm text-red-700">
            {{ error }}
          </p>
        </div>

        <div class="flex justify-between border-t border-gray-200 px-6 py-4">
          <!-- En el paso del cobro no se vuelve atras: la venta ya esta
               registrada y volver a pulsar «Generar QR» la duplicaria -->
          <button
            type="button"
            @click="anterior"
            :disabled="paso === 1 || enviando || ventaRegistrada"
            class="rounded-lg bg-gray-400 px-4 py-2 text-white hover:bg-gray-500 disabled:bg-gray-200 disabled:text-gray-400"
          >
            Anterior
          </button>

          <button
            v-if="paso < 4"
            type="button"
            @click="siguiente"
            class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Siguiente
          </button>

          <button
            v-else-if="paso === 4"
            type="button"
            @click="registrarYCobrar"
            :disabled="enviando"
            class="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:bg-gray-400"
          >
            {{ enviando ? 'Registrando...' : 'Generar QR' }}
          </button>

          <button
            v-else
            type="button"
            @click="cerrar"
            :disabled="estadoQr === 'generando'"
            class="rounded-lg px-4 py-2 text-white disabled:bg-gray-400"
            :class="estadoQr === 'pagado' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'"
          >
            {{ estadoQr === 'pagado' ? 'Listo' : 'Cerrar' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { usePlanStore } from '@/stores/planStore';
import { useDominioStore } from '@/stores/dominioStore';
import { useCompraStore } from '@/stores/compraStore';
import { usePagoStore } from '@/stores/pagoStore';

const emit = defineEmits(['cancel', 'finalizado']);

const planStore = usePlanStore();
const dominioStore = useDominioStore();
const compraStore = useCompraStore();
const pagoStore = usePagoStore();

// El tipo de servicio NO se elige: lo decide el servidor segun la venta lleve
// dominio o no. Aqui solo se nombran para poder anticiparlo en pantalla.
const TIPO_SIN_DOMINIO = 'Hosting';
const TIPO_CON_DOMINIO = 'Hosting + Dominio';

// El metodo de cobro tampoco se elige: va siempre por QR del BNB
// (backend/config/venta.php, metodo_bnb_qr). Este paso preguntaba antes el
// metodo y si el cliente ya habia pagado; ahora eso lo dice el banco, y el
// cobro es lo ultimo del asistente en vez de un dato mas del formulario.

// Cada cuanto se le pregunta al banco si ya pagaron, y durante cuanto rato.
// Pasado ese tiempo se deja de preguntar solo y queda el boton de comprobar:
// esta pantalla puede quedarse abierta y olvidada, y no tiene sentido llamar
// al banco indefinidamente.
const SEGUNDOS_ENTRE_CONSULTAS = 5;
const MINUTOS_DE_ESPERA = 10;

const pasos = [
  { clave: 'plan', etiqueta: 'Plan', titulo: 'Escoge tu plan' },
  { clave: 'dominio', etiqueta: 'Dominio', titulo: 'Escribe tu dominio' },
  { clave: 'datos', etiqueta: 'Datos pers.', titulo: 'Datos personales' },
  { clave: 'pedido', etiqueta: 'Pedido', titulo: 'Confirmación' },
  { clave: 'pago', etiqueta: 'Pago', titulo: 'Pago con QR' },
];

const paso = ref(1);
const error = ref(null);

const enviando = ref(false);

// Aviso de "¿seguro que sigues sin dominio?" en el paso 2
const confirmandoSinDominio = ref(false);

const compra = reactive({
  planId: null,
  dominio: '',
  // Lo que pagara el cliente por el dominio, ya calculado. Se rellena al
  // verificar; vacio mientras no haya un dominio libre confirmado.
  precioDominio: '',
  nombre: '',
  ci: '',
  celular: '',
  correo: '',
});

const planElegido = computed(() => planStore.planes.find((p) => p.id === compra.planId) ?? null);

// ¿Esta venta lleva dominio? Es lo que determina el tipo de servicio, y el
// servidor aplica exactamente el mismo criterio.
const llevaDominio = computed(
  () => estadoDisponibilidad.value === 'libre' && !!compra.dominio.trim(),
);

const tipoServicio = computed(() =>
  llevaDominio.value ? TIPO_CON_DOMINIO : TIPO_SIN_DOMINIO,
);

// precio_oferta es decimal:2, asi que un 0.00 legitimo es "falsy": hay que
// preguntar por null, igual que hace el backend, o la pantalla y la base de
// datos no coincidirian.
const costoPlan = computed(() => {
  const p = planElegido.value;
  if (!p) return '';
  return p.precio_oferta === null || p.precio_oferta === undefined ? p.precio : p.precio_oferta;
});

const total = computed(() => {
  const plan = Number.parseFloat(costoPlan.value || 0);
  const dom = Number.parseFloat(compra.precioDominio || 0);
  if (!Number.isFinite(plan)) return '—';
  return (plan + (Number.isFinite(dom) ? dom : 0)).toFixed(2);
});

// --- Verificacion de disponibilidad (paso 2) ---
// Comparte la llamada a la API con el formulario de Dominios a traves del
// store; el estado de pantalla es propio, como el resto de modales.
const verificando = ref(false);
const estadoDisponibilidad = ref(null);
const mensajeDisponibilidad = ref('');
const alternativas = ref([]);
// Distingue "aun no se ha buscado" de "se busco y no habia ninguna"
const alternativasBuscadas = ref(false);

// Elegir una alternativa cambia compra.dominio desde el codigo: ese cambio no
// debe borrar el resultado como si se hubiera escrito a mano
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

const limpiarDisponibilidad = () => {
  estadoDisponibilidad.value = null;
  mensajeDisponibilidad.value = '';
  alternativas.value = [];
  alternativasBuscadas.value = false;
  compra.precioDominio = '';
};

watch(
  () => compra.dominio,
  () => {
    confirmandoSinDominio.value = false;

    if (cambioInterno) {
      cambioInterno = false;
      return;
    }
    limpiarDisponibilidad();
  },
);

const marcarLibre = (dominio, datosPrecio) => {
  estadoDisponibilidad.value = 'libre';
  mensajeDisponibilidad.value = `${dominio} está disponible`;
  // El precio en moneda local ya viene calculado por el backend
  compra.precioDominio = datosPrecio?.precio ?? '';
};

const elegirAlternativa = (alt) => {
  const listaActual = alternativas.value;

  cambioInterno = true;
  compra.dominio = alt.dominio;

  marcarLibre(alt.dominio, alt.precio);
  alternativas.value = listaActual;
};

const verificarDominio = async () => {
  const nombre = compra.dominio.trim();
  if (!nombre) return;

  verificando.value = true;
  limpiarDisponibilidad();
  error.value = null;

  try {
    const r = await dominioStore.verificarDisponibilidad(nombre);

    if (r.disponible === true) {
      marcarLibre(r.dominio, r.precio);
    } else if (r.disponible === false) {
      estadoDisponibilidad.value = 'ocupado';
      mensajeDisponibilidad.value =
        r.motivo === 'tld_no_soportado'
          ? `${r.dominio} no está disponible: no se vende esta extensión`
          : `${r.dominio} ya está registrado, no está disponible`;
      alternativas.value = r.alternativas ?? [];
      alternativasBuscadas.value = true;
    } else {
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

// --- Cobro con el QR del BNB (paso 5) ---
// Al llegar al paso 5 la venta YA esta registrada: 'respuesta' guarda lo que
// devolvio el backend, y es lo que se le entrega al dashboard al cerrar, con
// o sin pago confirmado.
const respuesta = ref(null);
const qr = ref(null);
// null | 'generando' | 'esperando' | 'pagado' | 'expirado' | 'anulado' | 'error'
const estadoQr = ref(null);
const errorQr = ref(null);
const voucher = ref(null);
const comprobando = ref(false);
const sondeoActivo = ref(false);

let temporizadorSondeo = null;
let consultasRestantes = 0;

const ventaRegistrada = computed(() => !!respuesta.value);
const pagoId = computed(() => respuesta.value?.venta?.pago?.id ?? null);
const suscripcionId = computed(() => respuesta.value?.venta?.suscripcion?.id ?? null);

const montoCobrado = computed(() => {
  const monto = qr.value?.monto ?? respuesta.value?.venta?.pago?.monto ?? total.value;

  return `${qr.value?.moneda ?? ''} ${monto}`.trim();
});

const mensajeEspera = computed(() =>
  sondeoActivo.value
    ? 'Esperando el pago... se comprueba solo cada pocos segundos.'
    : 'Ya no se comprueba solo. Pulsa «Comprobar ahora» cuando el cliente haya pagado.',
);

const tituloSinQr = computed(() => {
  if (estadoQr.value === 'expirado') return 'El QR caducó sin usarse';
  if (estadoQr.value === 'anulado') return 'QR anulado';

  return errorQr.value || 'No se pudo generar el QR de cobro';
});

// 2026-11-09 -> 09/11/2026. Se parte la cadena en vez de usar new Date():
// el banco manda una FECHA, y new Date('2026-11-09') la interpreta en UTC y
// puede mostrar el dia anterior.
const fechaLegible = (iso) => {
  if (!iso) return '—';

  const [a, m, d] = String(iso).split('-');

  return d && m && a ? `${d}/${m}/${a}` : iso;
};

const detenerSondeo = () => {
  clearTimeout(temporizadorSondeo);
  temporizadorSondeo = null;
  sondeoActivo.value = false;
};

const programarConsulta = () => {
  // setTimeout en cadena, no setInterval: asi nunca se solapan dos consultas
  // si una tarda mas de lo previsto
  temporizadorSondeo = setTimeout(async () => {
    await comprobarPago();

    // comprobarPago puede haber parado el sondeo (pago hecho, QR caducado...)
    if (!sondeoActivo.value) return;

    consultasRestantes -= 1;

    if (consultasRestantes <= 0) {
      detenerSondeo();
      return;
    }

    programarConsulta();
  }, SEGUNDOS_ENTRE_CONSULTAS * 1000);
};

const iniciarSondeo = () => {
  detenerSondeo();
  consultasRestantes = Math.ceil((MINUTOS_DE_ESPERA * 60) / SEGUNDOS_ENTRE_CONSULTAS);
  sondeoActivo.value = true;
  programarConsulta();
};

/**
 * Pasa el cobro a 'pagado' y actualiza lo que se le dara al dashboard: si no,
 * su aviso mostraria el estado con el que se registro la venta (pendiente).
 * El pago y la suscripcion vienen del backend, que es quien los cambio.
 */
const marcarPagado = (datos) => {
  estadoQr.value = 'pagado';
  voucher.value = datos?.voucher_id ?? datos?.pago?.additional_data?.bnb_voucher_id ?? null;
  detenerSondeo();

  if (!respuesta.value?.venta) return;

  if (datos?.pago) respuesta.value.venta.pago = datos.pago;
  if (datos?.suscripcion) respuesta.value.venta.suscripcion = datos.suscripcion;
};

const comprobarPago = async (manual = false) => {
  if (!pagoId.value || comprobando.value || estadoQr.value === 'pagado') return;

  comprobando.value = true;
  if (manual) error.value = null;

  try {
    const r = await pagoStore.consultarEstado(pagoId.value);

    if (r.estado === 'pagado') {
      marcarPagado(r);
      return;
    }

    if (r.estado === 'expirado') {
      estadoQr.value = 'expirado';
      detenerSondeo();
      return;
    }

    if (r.estado === 'error') {
      estadoQr.value = 'error';
      errorQr.value = 'El banco marcó este QR con un error. Genera otro.';
      detenerSondeo();
    }
    // 'no_usado' (y el null de un estado que el banco no documenta): se sigue
    // esperando sin tocar la pantalla
  } catch (err) {
    // Que falle una consulta suelta no cambia el estado del cobro. Solo se
    // avisa si la pidio la persona; el sondeo sigue intentandolo.
    if (manual) {
      error.value =
        err.response?.data?.message || 'No se pudo comprobar el pago. Inténtalo de nuevo.';
    }
  } finally {
    comprobando.value = false;
  }
};

// Pide el QR de un pago YA registrado. Es lo que se usa para volver a
// mostrarlo: el banco solo entrega la imagen al generarla (el backend anula
// el QR anterior por su cuenta).
const regenerarQr = async () => {
  if (!pagoId.value) return;

  detenerSondeo();
  estadoQr.value = 'generando';
  errorQr.value = null;
  error.value = null;

  try {
    const r = await pagoStore.generarQr(pagoId.value);
    qr.value = r.qr;
    estadoQr.value = 'esperando';
    iniciarSondeo();
  } catch (err) {
    estadoQr.value = 'error';
    errorQr.value = err.response?.data?.message || pagoStore.error;
  }
};

const anularQr = async () => {
  if (!pagoId.value) return;

  detenerSondeo();

  try {
    await pagoStore.anularQr(pagoId.value);
    qr.value = null;
    estadoQr.value = 'anulado';
  } catch (err) {
    error.value = err.response?.data?.message || pagoStore.error;

    // No se pudo anular: el QR sigue vivo, asi que se vuelve a esperar el pago
    if (estadoQr.value === 'esperando') iniciarSondeo();
  }
};

// Un paso solo cuenta como completado cuando ya se ha avanzado mas alla de el
const estadoPaso = (n) => {
  if (n < paso.value) return 'completado';
  if (n === paso.value) return 'actual';
  return 'pendiente';
};

// No se puede cerrar mientras se escribe la venta ni mientras el banco emite
// el QR: en ese hueco todavia no se sabe si la venta quedo registrada.
const cerrar = () => {
  if (enviando.value || estadoQr.value === 'generando') return;

  detenerSondeo();

  // Cerrar NO deshace nada. Si la venta ya esta registrada se avisa al
  // dashboard igual, aunque el cobro haya quedado pendiente: asi la persona
  // ve que la venta existe y en que estado quedo.
  if (respuesta.value) {
    emit('finalizado', respuesta.value);
    return;
  }

  emit('cancel');
};

const onKeydown = (e) => {
  if (e.key === 'Escape') cerrar();
};

onMounted(async () => {
  window.addEventListener('keydown', onKeydown);
  document.body.style.overflow = 'hidden';

  // Los planes llegan sin paginar, asi que la lista entera alimenta el desplegable
  if (planStore.planes.length === 0) {
    try {
      await planStore.fetchPlanes();
    } catch {
      error.value = planStore.error || 'Error al cargar los planes';
    }
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
  document.body.style.overflow = '';
  // Sin esto, el sondeo del pago seguiria llamando al banco tras cerrar
  detenerSondeo();
});

// Cada paso valida solo lo suyo, para no bloquear al volver atras
const validarPaso = (n = paso.value) => {
  if (n === 1) {
    if (!compra.planId) return 'Selecciona un plan para continuar.';
  }
  // El dominio es opcional. Si se escribio uno, no basta con teclearlo: hay
  // que haber comprobado que esta libre, o se avanzaria pidiendo un dominio
  // que ya tiene dueño. Dejarlo en blanco se confirma aparte (siguiente()).
  if (n === 2 && compra.dominio.trim() && estadoDisponibilidad.value !== 'libre') {
    return 'Verifica el dominio y elige uno que esté disponible, o déjalo en blanco.';
  }
  if (n === 3) {
    if (!compra.nombre) return 'El nombre es obligatorio.';
    if (!compra.ci) return 'El CI / NIT es obligatorio.';
    if (!compra.celular) return 'El celular es obligatorio.';
    if (!compra.correo) return 'El correo es obligatorio.';
  }
  // El paso 4 solo resume, y el 5 es el cobro: no tienen nada que validar
  return null;
};

// Antes de registrar se repasan TODOS los pasos con datos: si alguien volvio
// atras y vacio un campo, no debe colarse por haber validado solo el ultimo
const validarTodo = () => {
  for (let n = 1; n <= 3; n += 1) {
    const fallo = validarPaso(n);
    if (fallo) return fallo;
  }
  return null;
};

const siguiente = () => {
  const fallo = validarPaso();
  if (fallo) {
    error.value = fallo;
    return;
  }

  // Salir del paso del dominio con la casilla vacía se confirma antes: es
  // facil dejarselo sin querer, y la venta cambiaria de tipo de servicio
  if (paso.value === 2 && !compra.dominio.trim() && !confirmandoSinDominio.value) {
    error.value = null;
    confirmandoSinDominio.value = true;
    return;
  }

  error.value = null;
  confirmandoSinDominio.value = false;
  paso.value += 1;
};

const continuarSinDominio = () => {
  confirmandoSinDominio.value = false;
  limpiarDisponibilidad();
  error.value = null;
  paso.value = 3;
};

const anterior = () => {
  error.value = null;
  if (paso.value > 1) paso.value -= 1;
};

/**
 * Registra la venta y pide el QR de cobro. Es la accion del paso 4.
 *
 * La venta se registra PENDIENTE y el banco emite el QR en la misma respuesta.
 * Desde aqui ya no se vuelve atras: si se pudiera, pulsar otra vez registraria
 * una segunda venta.
 */
const registrarYCobrar = async () => {
  // Guardia contra el doble clic: sin esto, dos pulsaciones rapidas crearian
  // dos ventas (el indice unico del dominio solo frena las que llevan dominio)
  if (enviando.value || ventaRegistrada.value) return;

  const fallo = validarTodo();
  if (fallo) {
    error.value = fallo;
    return;
  }

  enviando.value = true;
  error.value = null;
  errorQr.value = null;
  // Se pasa ya al paso del cobro para que se vea que esta trabajando
  estadoQr.value = 'generando';
  paso.value = 5;

  try {
    // No se envia ningun importe: los calcula el backend, y los de esta
    // pantalla son solo para mostrar (ver backend/config/precios.php).
    // Tampoco el metodo de pago ni si esta cobrado: es siempre QR del BNB, y
    // quien dice que esta pagado es el banco.
    const r = await compraStore.crearCompra({
      plan_id: compra.planId,
      nombre: compra.nombre,
      numero_documento: compra.ci,
      telefono: compra.celular,
      correo: compra.correo,
      // El tipo_servicio no se manda: lo deduce el servidor de este campo
      dominio: llevaDominio.value ? compra.dominio : null,
    });

    respuesta.value = r;

    if (r.qr) {
      qr.value = r.qr;
      estadoQr.value = 'esperando';
      iniciarSondeo();
    } else {
      // La venta SI quedo registrada y pendiente de cobro; lo que fallo fue
      // el banco. Desde el paso 5 se puede volver a pedir el QR sin registrar
      // la venta otra vez.
      estadoQr.value = 'error';
      errorQr.value = r.qr_error || 'El banco no devolvió el QR de cobro';
    }
  } catch (err) {
    // La venta no se registro: se vuelve al resumen para poder reintentar
    estadoQr.value = null;
    paso.value = 4;

    const errores = err.response?.data?.errors;
    error.value =
      (errores ? Object.values(errores).flat().join(' · ') : null) ||
      err.response?.data?.message ||
      'No se pudo registrar la venta';

    // Si el dominio dejo de estar libre entre el paso 2 y ahora, se devuelve
    // al usuario a ese paso y se le obliga a verificar de nuevo
    if (err.response?.status === 409 && /dominio/i.test(error.value)) {
      limpiarDisponibilidad();
      paso.value = 2;
    }
  } finally {
    enviando.value = false;
  }
};
</script>
