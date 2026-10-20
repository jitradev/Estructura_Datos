// Builds an example queue in memory and runs one operation of the Tema 4 project on it.
// main has the queue by value, as in the project's mains («ColaCircular c;»), plus `x`
// (and `prio` for the priority queue); the calls go with &c. Only the chosen function is
// shown step by step; every other function of the file runs as a single step. mostrar and
// implementacion are left out: they only print.

import { ejecutar, Resultado } from '../interprete/ejecutar';
import { int, Memoria, memoriaVacia, NULO, nuevoObjeto, Objeto, Valor } from '../memoria/modelo';
import { trocear } from '../listas/trocear';
import { QueueOp, QueueType } from './catalog';

const ref = (o: Objeto): Valor => ({ k: 'ref', r: { k: 'obj', id: o.id } });
const idObj = (v: Valor | undefined): number | null => (v && v.k === 'ref' && v.r.k === 'obj' ? v.r.id : null);

export interface QueueParams {
  valores: number[]; // from front to back
  prios: number[]; // priority of each value (priority queue)
  frente: number; // index of the front (array queues)
  x: number; // value to insert
  prio: number; // its priority
}

export const esArray = (t: QueueType) => !t.nodo;

/** Order in which the priority queue keeps them: by priority, and by arrival among equals. */
export function ordenPrio(valores: number[], prios: number[]): { dato: number; prio: number }[] {
  return valores.map((dato, i) => ({ dato, prio: prios[i] ?? 0 })).sort((a, b) => a.prio - b.prio); // sort is stable
}

/** The queue as crear + one insertion per value would leave it, plus main's `x` (and `prio`). */
export function buildQueue(t: QueueType, p: Pick<QueueParams, 'valores' | 'prios' | 'frente'>, creada = true): Memoria {
  const m = memoriaVacia();
  const c = nuevoObjeto(m, t.ctx, t.struct, false, 'c');
  if (creada) {
    if (esArray(t)) {
      const datos = c.campos.datos as Valor[];
      const n = datos.length;
      const f = ((p.frente % n) + n) % n;
      p.valores.forEach((v, i) => (datos[(f + i) % n] = int(v)));
      c.campos.frente = int(f);
      if ('final' in c.campos) c.campos.final = int((f + p.valores.length) % n);
      c.campos.n = int(p.valores.length);
    } else {
      const nodo = t.nodo!.tipo;
      const doble = t.nodo!.campos.includes('ant');
      const elems = t.prioridades ? ordenPrio(p.valores, p.prios) : p.valores.map((dato) => ({ dato, prio: 0 }));
      const nodos = elems.map((e) => {
        const o = nuevoObjeto(m, t.ctx, nodo, true);
        o.campos.dato = int(e.dato);
        if (t.prioridades) o.campos.prio = int(e.prio);
        return o;
      });
      nodos.forEach((o, i) => {
        o.campos.sig = i + 1 < nodos.length ? ref(nodos[i + 1]) : NULO;
        if (doble) o.campos.ant = i > 0 ? ref(nodos[i - 1]) : NULO;
      });
      const primero = nodos.length ? ref(nodos[0]) : NULO;
      if (t.prioridades) c.campos.cabeza = primero;
      else {
        c.campos.frente = primero;
        c.campos.final = nodos.length ? ref(nodos[nodos.length - 1]) : NULO;
      }
      c.campos.n = int(nodos.length);
    }
  }
  m.marcos[0].vars.push({ nombre: 'x', tipo: { base: 'int', ptr: 0 }, valor: int(0) });
  if (t.prioridades) m.marcos[0].vars.push({ nombre: 'prio', tipo: { base: 'int', ptr: 0 }, valor: int(0) });
  return m;
}

/** The main struct `c`. */
export const queueObj = (m: Memoria) => Object.values(m.objetos).find((o) => !o.heap && o.nombre === 'c')!;

/** Values from front to back, reading the memory (with their priorities for the priority queue). */
export function readQueue(t: QueueType, m: Memoria): { dato: number; prio?: number }[] {
  const c = queueObj(m);
  const num = (v: Valor | Valor[] | undefined) => (v && !Array.isArray(v) && v.k === 'int' ? v.v : null);
  if (esArray(t)) {
    const datos = c.campos.datos as Valor[];
    const f = num(c.campos.frente);
    const n = num(c.campos.n);
    if (f === null || n === null) return [];
    return Array.from({ length: Math.max(0, Math.min(n, datos.length)) }, (_, k) => ({ dato: num(datos[(f + k) % datos.length]) ?? 0 }));
  }
  const res: { dato: number; prio?: number }[] = [];
  let id = idObj((c.campos.frente ?? c.campos.cabeza) as Valor);
  const vistos = new Set<number>();
  while (id !== null && !vistos.has(id) && m.objetos[id] && !m.objetos[id].liberado) {
    vistos.add(id);
    const o = m.objetos[id];
    res.push({ dato: num(o.campos.dato) ?? 0, ...(t.prioridades ? { prio: num(o.campos.prio) ?? 0 } : {}) });
    id = idObj(o.campos.sig as Valor);
  }
  return res;
}

const cache = new Map<string, ReturnType<typeof trocear>>();
const archivo = (src: string) => {
  if (!cache.has(src)) cache.set(src, trocear(src));
  return cache.get(src)!;
};

/** The structs of the header, with the #defines they use. */
export function structsOf(t: QueueType): string {
  const defines = t.header.split('\n').filter((l) => /^#define\s+(MAX|NPRIO)\b/.test(l));
  return [...(defines.length ? [defines.join('\n')] : []), ...archivo(t.header).structs].join('\n\n');
}

export function codeOf(t: QueueType, o: QueueOp): { visible: string; preludio: string } {
  const fns = archivo(t.src).funciones;
  const visible = fns.get(o.fn)!.texto + '\n';
  const preludio = [...fns.values()]
    .filter((f) => f.nombre !== o.fn && !/^(mostrar|implementacion)/.test(f.nombre))
    .map((f) => f.texto)
    .join('\n\n');
  return { visible, preludio };
}

export function callOf(o: QueueOp, p: QueueParams): string {
  const args = ['&c', ...o.args.map((a) => (a === 'x' ? String(p.x) : a === 'prio' ? String(p.prio) : a))];
  return `${o.fn}(${args.join(', ')})`;
}

export function runQueueOp(t: QueueType, o: QueueOp, p: QueueParams, inicial?: Memoria): Resultado & { codigo: string; llamada: string; inicial: Memoria } {
  const { visible, preludio } = codeOf(t, o);
  const llamada = callOf(o, p);
  const mem = inicial ?? buildQueue(t, p, !o.crea);
  const r = ejecutar(visible, { ...t.ctx, preludio }, mem, { llamada, maxPasos: 5000 });
  return { ...r, codigo: visible, llamada, inicial: mem };
}
