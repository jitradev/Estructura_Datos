import { Paso } from '../interprete/ejecutar';
import { Contexto } from '../memoria/modelo';
import { EstadoLinea } from './EditorCodigo';

/** Estado de cada línea del editor en el paso idx de la ejecución. */
export function estadosLineas(pasos: Paso[] | null, idx: number): Record<number, EstadoLinea> {
  const r: Record<number, EstadoLinea> = {};
  if (!pasos) return r;
  for (let i = 1; i < idx && i < pasos.length; i++) if (pasos[i].linea > 0) r[pasos[i].linea] = 'hecha';
  const p = pasos[idx];
  if (p && p.linea > 0) r[p.linea] = p.error ? 'error' : 'actual';
  return r;
}

/** Statements of the exercises on the double and circular lists. */
function filasLista(t: NonNullable<Contexto['tipoLista']>): [string, string][] {
  const doble = t === 'doble' || t === 'circular-doble';
  const circular = t === 'circular' || t === 'circular-doble';
  const nodo = doble ? 'NodoDoble' : 'Nodo';
  const primero = t === 'circular' ? 'lista->acceso->siguiente' : circular ? 'lista->acceso' : 'lista->cabeza';
  const ultimo = t === 'circular' ? 'lista->acceso' : circular ? 'lista->acceso->anterior' : 'lista->cola';
  return [
    ['Crear un nodo', `${nodo} *a = malloc(sizeof(${nodo}));`],
    ['El primero', primero],
    ['El último', ultimo],
    ['Avanzar', 'aux = aux->siguiente;'],
    ...(doble ? ([['Retroceder', 'aux = aux->anterior;']] as [string, string][]) : []),
    ['Enlazar', doble ? 'a->siguiente = b;  b->anterior = a;' : 'a->siguiente = b;'],
    ...(circular ? ([['Dar la vuelta', 'do { ... } while (aux != inicio);']] as [string, string][]) : []),
    ['Dar valor', 'a->valor = 5;'],
    ['Liberar', 'free(a);'],
  ];
}

/** Chuleta de sentencias según las estructuras del ejercicio. */
export function Chuleta({ ctx }: { ctx: Contexto }) {
  const nombres = ctx.structs.map((s) => s.nombre);
  const nodo = ctx.structs.find((s) => s.nombre === 'Nodo');
  const dato = nodo?.campos.find((c) => c.tipo.base === 'int')?.nombre ?? 'valor';
  const filas: [string, string][] = [];
  if (ctx.tipoLista) filas.push(...filasLista(ctx.tipoLista));
  else if (nodo) {
    filas.push(
      ['Crear un nodo', 'Nodo *a = malloc(sizeof(Nodo));'],
      ['Puntero auxiliar', 'Nodo *aux = cab;'],
      ['Avanzar', 'aux = aux->siguiente;'],
      ['Enlazar', 'a->siguiente = b;'],
      ['Dar valor', `a->${dato} = 5;`],
      ['Liberar', 'free(a);'],
      ['Puntero doble', 'Nodo **p = &cab;  p = &(*p)->siguiente;'],
    );
  }
  if (nombres.includes('PilaArray')) filas.push(['Cima', 'pila->array[pila->cima]'], ['Subir la cima', 'pila->cima++;'], ['¿Vacía? ¿Llena?', 'esVaciaArray(pila)  esLLenaArray(pila)']);
  if (nombres.includes('PilaEnlazada')) filas.push(['Nodo de la cima', 'pila->cima'], ['Contador', 'pila->tamano++;'], ['¿Vacía?', 'esVaciaEnlazada(pila)']);
  if (nombres.includes('ColaArray'))
    filas.push(
      ['Escribir al final', 'cola->array[cola->final] = x;'],
      ['Avanzar con vuelta', 'cola->final = (cola->final + 1) % TAM_COLA_ARRAY;'],
      ['¿Vacía? ¿Llena?', 'estaVaciaColaArray(cola)  estaLLenaColaArray(cola)'],
    );
  if (nombres.includes('ColaEnlazada'))
    filas.push(
      ['Primero y último', 'cola->inicio  cola->final'],
      ['Crear un nodo', 'NodoSimple *aux = crearNodoSimple(5);'],
      ['Enlazar', 'establecerSiguienteNodoSimple(a, b);'],
      ['Leer', 'obtenerValorNodoSimple(a)  obtenerSiguienteNodoSimple(a)'],
      ['Liberar', 'eliminarNodoSimple(a);'],
      ['¿Vacía?', 'estaVaciaColaEnlazada(cola)'],
    );
  filas.push(['Bucles y condiciones', 'while (…) { … }   if (…) … else …']);
  return (
    <details className="chuleta">
      <summary>Chuleta de sentencias</summary>
      <dl>
        {filas.map(([a, b]) => (
          <div key={a}>
            <dt>{a}</dt>
            <dd>
              <code>{b}</code>
            </dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

/** Colour key shared by the Visualizar pages. */
export function Leyenda() {
  return (
    <ul className="leyenda">
      <li>
        <span className="muestra rojo" /> lo que cambia en este paso
      </li>
      <li>
        <span className="muestra gris" /> el enlace que deja de valer
      </li>
      <li>
        <span className="muestra liberado" /> nodo liberado con free
      </li>
      <li>
        <span className="muestra local" /> variable de la función en curso
      </li>
    </ul>
  );
}
