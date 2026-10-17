// Builds an example stack in memory and runs one operation of the Pilas code on it.
// Only the chosen function is shown step by step; every other function of the file
// (esVacia, limpiar inside destruir...) runs as a single step. The print functions are
// left out: the students do not print.

import { ejecutar, Resultado } from '../interprete/ejecutar';
import { BASURA, int, Memoria, memoriaVacia, NULO, nuevoObjeto, Objeto, Valor } from '../memoria/modelo';
import { trocear } from '../listas/trocear';
import { StackOp, StackType } from './catalog';

const ref = (o: Objeto): Valor => ({ k: 'ref', r: { k: 'obj', id: o.id } });

export interface StackParams {
  valores: number[]; // bottom to top, as they were pushed
  valor: number; // value to push
}

/** The stack as CrearPila + one push per value would leave it, plus main's `pila` and `valor`. */
export function buildStack(t: StackType, valores: number[], conPila = true): Memoria {
  const m = memoriaVacia();
  if (conPila) {
    const pila = nuevoObjeto(m, t.ctx, t.struct, true);
    if (t.enlazada) {
      let cima: Valor = NULO;
      for (const v of valores) {
        const n = nuevoObjeto(m, t.ctx, 'Nodo', true);
        n.campos.valor = int(v);
        n.campos.siguiente = cima;
        cima = ref(n);
      }
      pila.campos.cima = cima;
      pila.campos.tamano = int(valores.length);
    } else {
      const arr = pila.campos.array as Valor[];
      valores.forEach((v, i) => (arr[i] = int(v)));
      pila.campos.cima = int(valores.length - 1);
    }
    m.marcos[0].vars.push({ nombre: 'pila', tipo: { base: t.struct, ptr: 1 }, valor: ref(pila) });
  } else {
    m.marcos[0].vars.push({ nombre: 'pila', tipo: { base: t.struct, ptr: 1 }, valor: BASURA });
  }
  m.marcos[0].vars.push({ nombre: 'valor', tipo: { base: 'int', ptr: 0 }, valor: int(0) });
  return m;
}

/** Values from top to bottom, reading the memory (null if the stack no longer exists). */
export function readStack(t: StackType, m: Memoria, nombre = 'pila'): number[] | null {
  const v = m.marcos[0].vars.find((x) => x.nombre === nombre)?.valor;
  if (!v || v.k !== 'ref' || v.r.k !== 'obj') return null;
  const p = m.objetos[v.r.id];
  if (p.liberado) return null;
  if (!t.enlazada) {
    const cima = p.campos.cima as Valor;
    if (cima.k !== 'int') return null;
    const arr = p.campos.array as Valor[];
    return arr
      .slice(0, cima.v + 1)
      .map((x) => (x.k === 'int' ? x.v : 0))
      .reverse();
  }
  const res: number[] = [];
  let c = p.campos.cima as Valor;
  const vistos = new Set<number>();
  while (c.k === 'ref' && c.r.k === 'obj' && !vistos.has(c.r.id)) {
    vistos.add(c.r.id);
    const n = m.objetos[c.r.id];
    res.push((n.campos.valor as { v: number }).v);
    c = n.campos.siguiente as Valor;
  }
  return res;
}

const cache = new Map<string, ReturnType<typeof trocear>>();
const archivo = (src: string) => {
  if (!cache.has(src)) cache.set(src, trocear(src));
  return cache.get(src)!;
};

export const structsOf = (t: StackType) => archivo(t.src).structs.join('\n\n');

export function codeOf(t: StackType, o: StackOp): { visible: string; preludio: string } {
  const fns = archivo(t.src).funciones;
  const visible = fns.get(o.fn)!.texto + '\n';
  const preludio = [...fns.values()]
    .filter((f) => f.nombre !== o.fn && !/^imprimir/.test(f.nombre))
    .map((f) => f.texto)
    .join('\n\n');
  return { visible, preludio };
}

export function callOf(o: StackOp, p: StackParams): string {
  if (o.crea) return `pila = ${o.fn}()`;
  const args = ['pila', ...o.args.map((a) => (a === 'valor' ? String(p.valor) : '&valor'))];
  return `${o.fn}(${args.join(', ')})`;
}

export function runStackOp(t: StackType, o: StackOp, p: StackParams, inicial?: Memoria): Resultado & { codigo: string; llamada: string; inicial: Memoria } {
  const { visible, preludio } = codeOf(t, o);
  const llamada = callOf(o, p);
  const mem = inicial ?? buildStack(t, p.valores, !o.crea);
  const r = ejecutar(visible, { ...t.ctx, preludio }, mem, { llamada, maxPasos: 5000 });
  return { ...r, codigo: visible, llamada, inicial: mem };
}
