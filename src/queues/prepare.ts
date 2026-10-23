// Builds an example queue in memory and runs one operation of the Colas project on it.
// main has `cola` (the pointer that crear returns) and `x`, as in the project's main.c.
// Only the chosen function is shown step by step; every other function of its file and of
// the files it uses (the node TAD, ColaEnlazada for the priority array) runs as a single
// step. The mostrar functions are left out: the students do not print.

import { ejecutar, Resultado } from '../interprete/ejecutar';
import { BASURA, int, Memoria, memoriaVacia, NULO, nuevoObjeto, Objeto, Valor } from '../memoria/modelo';
import { trocear } from '../listas/trocear';
import { NUM_PRIORIDADES, QueueOp, QueueType } from './catalog';

const ref = (o: Objeto): Valor => ({ k: 'ref', r: { k: 'obj', id: o.id } });
const idObj = (v: Valor | undefined): number | null => (v && v.k === 'ref' && v.r.k === 'obj' ? v.r.id : null);
const num = (v: Valor | Valor[] | undefined) => (v && !Array.isArray(v) && v.k === 'int' ? v.v : null);

export interface QueueParams {
  valores: number[]; // from front to back
  prioridades: number[]; // priority of each value (priority queues)
  frente: number; // index of the front (array queues)
  x: number; // value to insert
  prioridad: number; // its priority
}

export const esArray = (t: QueueType) => !t.nodo;

/** Order in which a priority queue gives them back: by priority, and by arrival among equals. */
export function ordenPrioridad(valores: number[], prioridades: number[]): { valor: number; prioridad: number }[] {
  return valores.map((valor, i) => ({ valor, prioridad: prioridades[i] ?? 0 })).sort((a, b) => a.prioridad - b.prioridad); // sort is stable
}

/** A linked struct (inicio, final, tamano) with its chain of nodes. */
function cadena(m: Memoria, t: QueueType, tipo: string, elems: { valor: number; prioridad: number }[]): Objeto {
  const s = nuevoObjeto(m, t.ctx, tipo, true);
  const doble = t.nodo!.campos.includes('anterior');
  const nodos = elems.map((e) => {
    const o = nuevoObjeto(m, t.ctx, t.nodo!.tipo, true);
    o.campos.valor = int(e.valor);
    if ('prioridad' in o.campos) o.campos.prioridad = int(e.prioridad);
    return o;
  });
  nodos.forEach((o, i) => {
    o.campos.siguiente = i + 1 < nodos.length ? ref(nodos[i + 1]) : NULO;
    if (doble) o.campos.anterior = i > 0 ? ref(nodos[i - 1]) : NULO;
  });
  s.campos.inicio = nodos.length ? ref(nodos[0]) : NULO;
  if ('final' in s.campos) s.campos.final = nodos.length ? ref(nodos[nodos.length - 1]) : NULO;
  s.campos.tamano = int(nodos.length);
  return s;
}

/** The queue as crear + one insertion per value would leave it, plus main's `cola` and `x`. */
export function buildQueue(t: QueueType, p: Pick<QueueParams, 'valores' | 'prioridades' | 'frente'>, creada = true): Memoria {
  const m = memoriaVacia();
  let cola: Valor = BASURA;
  if (creada) {
    const elems = t.prioridades ? ordenPrioridad(p.valores, p.prioridades) : p.valores.map((valor) => ({ valor, prioridad: 0 }));
    if (esArray(t)) {
      const c = nuevoObjeto(m, t.ctx, t.struct, true);
      const arr = c.campos.array as Valor[];
      const n = arr.length;
      const f = ((p.frente % n) + n) % n;
      p.valores.forEach((v, i) => (arr[(f + i) % n] = int(v)));
      c.campos.frente = int(f);
      c.campos.final = int((f + p.valores.length) % n);
      c.campos.numElementos = int(p.valores.length);
      cola = ref(c);
    } else if (t.subcola) {
      const c = nuevoObjeto(m, t.ctx, t.struct, true);
      const colas = c.campos.colas as Valor[];
      for (let i = 0; i < NUM_PRIORIDADES; i++)
        colas[i] = ref(
          cadena(
            m,
            t,
            t.subcola,
            elems.filter((e) => e.prioridad === i),
          ),
        );
      c.campos.tamano = int(elems.length);
      cola = ref(c);
    } else cola = ref(cadena(m, t, t.struct, elems));
  }
  m.marcos[0].vars.push({ nombre: 'cola', tipo: { base: t.struct, ptr: 1 }, valor: cola });
  m.marcos[0].vars.push({ nombre: 'x', tipo: { base: 'int', ptr: 0 }, valor: int(0) });
  return m;
}

/** The struct main's `cola` points to (null if it does not exist or was freed). */
export function queueObj(m: Memoria): Objeto | null {
  const id = idObj(m.marcos[0].vars.find((v) => v.nombre === 'cola')?.valor);
  return id !== null && m.objetos[id] && !m.objetos[id].liberado ? m.objetos[id] : null;
}

/** Values of a linked struct, from inicio. */
function leerCadena(m: Memoria, s: Objeto): { valor: number; prioridad?: number }[] {
  const res: { valor: number; prioridad?: number }[] = [];
  let id = idObj(s.campos.inicio as Valor);
  const vistos = new Set<number>();
  while (id !== null && !vistos.has(id) && m.objetos[id] && !m.objetos[id].liberado) {
    vistos.add(id);
    const o = m.objetos[id];
    res.push({ valor: num(o.campos.valor) ?? 0, ...('prioridad' in o.campos ? { prioridad: num(o.campos.prioridad) ?? 0 } : {}) });
    id = idObj(o.campos.siguiente as Valor);
  }
  return res;
}

/** Values in the order they will come out (with their priorities for the priority queues); null if there is no queue. */
export function readQueue(t: QueueType, m: Memoria): { valor: number; prioridad?: number }[] | null {
  const c = queueObj(m);
  if (!c) return null;
  if (esArray(t)) {
    const arr = c.campos.array as Valor[];
    const f = num(c.campos.frente);
    const n = num(c.campos.numElementos);
    if (f === null || n === null) return [];
    return Array.from({ length: Math.max(0, Math.min(n, arr.length)) }, (_, k) => ({ valor: num(arr[(f + k) % arr.length]) ?? 0 }));
  }
  if (t.subcola)
    return (c.campos.colas as Valor[]).flatMap((v, prioridad) => {
      const id = idObj(v);
      return id !== null && !m.objetos[id].liberado ? leerCadena(m, m.objetos[id]).map((e) => ({ ...e, prioridad })) : [];
    });
  return leerCadena(m, c);
}

const cache = new Map<string, ReturnType<typeof trocear>>();
const archivo = (src: string) => {
  if (!cache.has(src)) cache.set(src, trocear(src));
  return cache.get(src)!;
};

/** The structs, with the #defines they use. */
export function structsOf(t: QueueType): string {
  const defines = (t.header ?? '').split('\n').filter((l) => /^#define\s/.test(l) && !/^#define\s+\w+_H\s*$/.test(l));
  const structs = [...t.otros].reverse().flatMap((s) => archivo(s).structs);
  return [...(defines.length ? [defines.join('\n')] : []), ...structs, ...archivo(t.src).structs].join('\n\n');
}

export function codeOf(t: QueueType, o: QueueOp): { visible: string; preludio: string } {
  const visible = archivo(t.src).funciones.get(o.fn)!.texto + '\n';
  const preludio = [t.src, ...t.otros]
    .flatMap((s) => [...archivo(s).funciones.values()])
    .filter((f) => f.nombre !== o.fn && !/^mostrar/.test(f.nombre))
    .map((f) => f.texto)
    .join('\n\n');
  return { visible, preludio };
}

export function callOf(o: QueueOp, p: QueueParams): string {
  if (o.crea) return `cola = ${o.fn}()`;
  const args = ['cola', ...o.args.map((a) => (a === 'x' ? String(p.x) : a === 'prioridad' ? String(p.prioridad) : a))];
  return `${o.fn}(${args.join(', ')})`;
}

export function runQueueOp(t: QueueType, o: QueueOp, p: QueueParams, inicial?: Memoria): Resultado & { codigo: string; llamada: string; inicial: Memoria } {
  const { visible, preludio } = codeOf(t, o);
  const llamada = callOf(o, p);
  const mem = inicial ?? buildQueue(t, p, !o.crea);
  const r = ejecutar(visible, { ...t.ctx, preludio }, mem, { llamada, maxPasos: 5000 });
  return { ...r, codigo: visible, llamada, inicial: mem };
}
