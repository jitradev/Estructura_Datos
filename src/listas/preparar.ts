// Construye una lista de ejemplo en memoria, junta el código de una operación (con las
// funciones suyas a las que llama) y la ejecuta con el intérprete.

import { ejecutar, Resultado } from '../interprete/ejecutar';
import { int, Memoria, memoriaVacia, NULO, nuevoObjeto, Objeto, Valor } from '../memoria/modelo';
import { nombreFuncion, Operacion, TipoLista } from './catalogo';
import { llamadas, trocear } from './trocear';

const ref = (o: Objeto): Valor => ({ k: 'ref', r: { k: 'obj', id: o.id } });

/** Parámetros con los que se lanza una operación. */
export interface Parametros {
  valores: number[]; // la lista de partida
  nuevo: number; // valor del nodo que se inserta
  posicion: number;
  valor: number; // valor que se busca o se elimina
  nodo: number; // posición del nodo que se pasa a eliminarNodo / eliminarPorReferencia
}

/** La lista con esos valores, como la dejaría crearLista + insertarFinal, y `lista` en main. */
export function construirLista(t: TipoLista, valores: number[]): Memoria {
  const m = memoriaVacia();
  const cab = nuevoObjeto(m, t.ctx, t.lista, true);
  const nodos = valores.map((v) => {
    const o = nuevoObjeto(m, t.ctx, t.nodo, true);
    o.campos.valor = int(v);
    return o;
  });
  const n = nodos.length;
  nodos.forEach((o, i) => {
    const sig = i + 1 < n ? ref(nodos[i + 1]) : t.circular ? ref(nodos[0]) : NULO;
    o.campos.siguiente = sig;
    if (t.doble) o.campos.anterior = i > 0 ? ref(nodos[i - 1]) : t.circular ? ref(nodos[n - 1]) : NULO;
  });
  for (const c of t.extremos) cab.campos[c] = NULO;
  if (n) {
    if (t.id === 'simple') cab.campos.cabeza = ref(nodos[0]);
    if (t.id === 'doble') {
      cab.campos.cabeza = ref(nodos[0]);
      cab.campos.cola = ref(nodos[n - 1]);
    }
    if (t.id === 'circular') cab.campos.acceso = ref(nodos[n - 1]);
    if (t.id === 'circular-doble') cab.campos.acceso = ref(nodos[0]);
  }
  m.marcos[0].vars.push({ nombre: 'lista', tipo: { base: t.lista, ptr: 1 }, valor: ref(cab) });
  return m;
}

/** Los valores de la lista en orden, leyendo desde la memoria (para comprobar). */
export function leerLista(t: TipoLista, m: Memoria): number[] {
  const v = m.marcos[0].vars.find((x) => x.nombre === 'lista')?.valor;
  if (!v || v.k !== 'ref' || v.r.k !== 'obj') return [];
  const cab = m.objetos[v.r.id];
  const entrada = cab.campos[t.extremos[0]] as Valor;
  if (entrada.k !== 'ref' || entrada.r.k !== 'obj') return [];
  let id = entrada.r.id;
  if (t.id === 'circular') {
    const s = m.objetos[id].campos.siguiente as Valor;
    if (s.k !== 'ref' || s.r.k !== 'obj') return [];
    id = s.r.id;
  }
  const res: number[] = [];
  const vistos = new Set<number>();
  while (!vistos.has(id)) {
    vistos.add(id);
    const o = m.objetos[id];
    res.push((o.campos.valor as { v: number }).v);
    const s = o.campos.siguiente as Valor;
    if (s.k !== 'ref' || s.r.k !== 'obj') break;
    id = s.r.id;
  }
  return res;
}

// ------------------------------------------------------------------ código

const cache = new Map<string, ReturnType<typeof trocear>>();
const archivo = (src: string) => {
  if (!cache.has(src)) cache.set(src, trocear(src));
  return cache.get(src)!;
};

/** Las funciones de consulta se ejecutan sin pasos: lo que se mira son los enlaces. */
const esAuxiliar = (base: string) => /^(obtener|estaVacio|existe|primero|ultimo|buscarValor)/.test(base);

export function structsDe(t: TipoLista): string {
  return [...archivo(t.srcNodo).structs, ...archivo(t.srcLista).structs].join('\n\n');
}

export function cabeceraDe(t: TipoLista, op: Operacion): string {
  const f = archivo(t.srcLista).funciones.get(nombreFuncion(t, op.base));
  return f ? f.texto.split('\n').find((l) => /\w+\s*\(/.test(l) && !/^\s*\/\//.test(l))!.replace(/\s*\{\s*$/, '') : '';
}

/**
 * El código que se ve: la operación y las funciones de la lista a las que llama (sin las
 * de consulta). Y el preludio, que se ejecuta sin pasos: el TAD Nodo y las consultas.
 */
export function codigoDe(t: TipoLista, op: Operacion): { visible: string; preludio: string } {
  const lista = archivo(t.srcLista).funciones;
  const nodo = archivo(t.srcNodo).funciones;
  const principal = nombreFuncion(t, op.base);
  const orden: string[] = [];
  const pendientes = [principal];
  while (pendientes.length) {
    const n = pendientes.shift()!;
    if (orden.includes(n) || !lista.has(n)) continue;
    orden.push(n);
    for (const c of llamadas(lista.get(n)!.texto, lista.keys())) {
      const base = t.sufijo && c.endsWith(t.sufijo) ? c.slice(0, -t.sufijo.length) : c;
      if (!esAuxiliar(base)) pendientes.push(c);
    }
  }
  const visible = orden.map((n) => lista.get(n)!.texto).join('\n\n') + '\n';
  const resto = [...nodo.values(), ...[...lista.values()].filter((f) => !orden.includes(f.nombre) && !/^mostrar/.test(f.nombre))];
  return { visible, preludio: resto.map((f) => f.texto).join('\n\n') };
}

/** Memoria de partida de una operación: la lista y, si hace falta, el nodo nuevo o el elegido. */
export function memoriaDe(t: TipoLista, op: Operacion, p: Parametros): Memoria {
  const m = construirLista(t, p.valores);
  if (op.args.includes('nuevo')) {
    const o = nuevoObjeto(m, t.ctx, t.nodo, true);
    o.campos.valor = int(p.nuevo);
    o.campos.siguiente = NULO;
    if (t.doble) o.campos.anterior = NULO;
    m.marcos[0].vars.push({ nombre: 'nuevo', tipo: { base: t.nodo, ptr: 1 }, valor: ref(o) });
  }
  if (op.args.includes('nodo')) {
    const ids = Object.values(m.objetos).filter((o) => o.tipo === t.nodo);
    // en construirLista los nodos se crean en orden de posición
    const o = ids[Math.max(0, Math.min(p.nodo, ids.length - 1))];
    m.marcos[0].vars.push({ nombre: 'nodo', tipo: { base: t.nodo, ptr: 1 }, valor: o ? ref(o) : NULO });
  }
  return m;
}

export function llamadaDe(t: TipoLista, op: Operacion, p: Parametros): string {
  const args = ['lista', ...op.args.map((a) => (a === 'nuevo' ? 'nuevo' : a === 'nodo' ? 'nodo' : a === 'posicion' ? String(p.posicion) : String(p.valor)))];
  return `${nombreFuncion(t, op.base)}(${args.join(', ')})`;
}

export function ejecutarOperacion(t: TipoLista, op: Operacion, p: Parametros, inicial?: Memoria): Resultado & { codigo: string; llamada: string } {
  const { visible, preludio } = codigoDe(t, op);
  const llamada = llamadaDe(t, op, p);
  const r = ejecutar(visible, { ...t.ctx, preludio }, inicial ?? memoriaDe(t, op, p), { llamada, maxPasos: 5000 });
  return { ...r, codigo: visible, llamada };
}
