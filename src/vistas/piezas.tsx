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

/** Chuleta de sentencias según las estructuras del ejercicio. */
export function Chuleta({ ctx }: { ctx: Contexto }) {
  const nombres = ctx.structs.map((s) => s.nombre);
  const nodo = ctx.structs.find((s) => s.nombre === 'Nodo');
  const dato = nodo?.campos.find((c) => c.tipo.base === 'int')?.nombre ?? 'valor';
  const filas: [string, string][] = [];
  if (nodo) {
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
  if (nombres.includes('Pila') && ctx.structs.find((s) => s.nombre === 'Pila')!.campos.some((c) => c.arr))
    filas.push(['Cima', 'p->datos[p->cima]'], ['Subir la cima', 'p->cima++;'], ['¿Vacía? ¿Llena?', 'esVacia(p)  esLlena(p)']);
  if (nombres.includes('Pila') && !ctx.structs.find((s) => s.nombre === 'Pila')!.campos.some((c) => c.arr))
    filas.push(['Nodo de la cima', 'p->cima'], ['Contador', 'p->n++;'], ['¿Vacía?', 'esVacia(p)']);
  if (nombres.includes('ColaCircular'))
    filas.push(['Escribir al final', 'c->datos[c->final] = x;'], ['Avanzar con vuelta', 'c->final = (c->final + 1) % MAX;'], ['¿Vacía? ¿Llena?', 'estaVacia(c)  estaLlena(c)']);
  if (nombres.includes('Cola')) filas.push(['Primero y último', 'c->frente  c->final'], ['¿Vacía?', 'esVacia(c)']);
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
