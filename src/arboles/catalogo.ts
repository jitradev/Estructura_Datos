// Topics 8 and 9: the binary tree of the Arboles project (Nodo.c with valor, derecha and
// izquierda behind accessor functions, and Arbol.c with the struct Arbol that keeps the root).
// What a tree looks like in memory, how an example one is built and which operations can be
// watched step by step. The code that runs is the one in src/arboles/c, untouched.

import { ejecutar, Resultado } from '../interprete/ejecutar';
import { trocear } from '../listas/trocear';
import { Contexto, int, Memoria, memoriaVacia, NULO, nuevoObjeto, Valor } from '../memoria/modelo';
import srcNodo from './c/Nodo.c?raw';
import srcArbol from './c/Arbol.c?raw';

export { srcNodo, srcArbol };

const ptr = (base: string) => ({ base, ptr: 1 });
const entero = { base: 'int', ptr: 0 };

/** The structs of Nodo.c and Arbol.c, in the same order. */
export const STRUCTS_ARBOL: Contexto['structs'] = [
  {
    nombre: 'Nodo',
    campos: [
      { nombre: 'valor', tipo: entero },
      { nombre: 'derecha', tipo: ptr('Nodo') },
      { nombre: 'izquierda', tipo: ptr('Nodo') },
    ],
  },
  { nombre: 'Arbol', campos: [{ nombre: 'raiz', tipo: ptr('Nodo') }] },
];

const cache = new Map<string, ReturnType<typeof trocear>>();
const archivo = (src: string) => {
  if (!cache.has(src)) cache.set(src, trocear(src));
  return cache.get(src)!;
};

/** Every function of Nodo.c and Arbol.c but the ones in `menos`. */
export function funcionesArbol(menos: string[] = []): string {
  return [...archivo(srcNodo).funciones.values(), ...archivo(srcArbol).funciones.values()]
    .filter((f) => !menos.includes(f.nombre))
    .map((f) => f.texto)
    .join('\n\n');
}

/** Topics 8 and 9: Nodo.c and Arbol.c, with all their functions available. */
export const CTX_ARBOL: Contexto = { structs: STRUCTS_ARBOL, tipoArbol: true, preludio: '\n' + funcionesArbol() };

export const structsArbol = () => [...archivo(srcNodo).structs, ...archivo(srcArbol).structs].join('\n\n');

// ---------------------------------------------------------------- building trees

const ref = (id: number): Valor => ({ k: 'ref', r: { k: 'obj', id } });

/** Inserts the values in that order as insertar does (smaller to the left, repeated ones are skipped) and returns the root. */
export function nodosArbol(m: Memoria, valores: number[]): Valor {
  let raiz: Valor = NULO;
  for (const x of valores) {
    const nuevo = () => {
      const o = nuevoObjeto(m, { structs: STRUCTS_ARBOL }, 'Nodo', true);
      o.campos.valor = int(x);
      o.campos.izquierda = NULO;
      o.campos.derecha = NULO;
      return ref(o.id);
    };
    if (raiz.k !== 'ref') {
      raiz = nuevo();
      continue;
    }
    let actual = m.objetos[(raiz.r as { id: number }).id];
    for (;;) {
      const v = (actual.campos.valor as { v: number }).v;
      if (x === v) break;
      const lado = x < v ? 'izquierda' : 'derecha';
      const h = actual.campos[lado] as Valor;
      if (h.k !== 'ref') {
        actual.campos[lado] = nuevo();
        break;
      }
      actual = m.objetos[(h.r as { id: number }).id];
    }
  }
  return raiz;
}

/**
 * A tree with any shape (not only a search tree), written as «8(3(1,6),10(,14))»: a value,
 * and between brackets its left and right subtrees, either of them possibly empty.
 */
export function nodosForma(m: Memoria, forma: string): Valor {
  let i = 0;
  const s = forma.replace(/\s+/g, '');
  const leer = (): Valor => {
    const n = /^-?\d+/.exec(s.slice(i));
    if (!n) return NULO;
    i += n[0].length;
    const o = nuevoObjeto(m, { structs: STRUCTS_ARBOL }, 'Nodo', true);
    o.campos.valor = int(Number(n[0]));
    o.campos.izquierda = NULO;
    o.campos.derecha = NULO;
    if (s[i] === '(') {
      i++;
      o.campos.izquierda = leer();
      if (s[i] !== ',') throw new Error(`Forma de árbol mal escrita: ${forma}`);
      i++;
      o.campos.derecha = leer();
      if (s[i] !== ')') throw new Error(`Forma de árbol mal escrita: ${forma}`);
      i++;
    }
    return ref(o.id);
  };
  const r = leer();
  if (i !== s.length) throw new Error(`Forma de árbol mal escrita: ${forma}`);
  return r;
}

/** main with `Arbol *arbol` (as crearArbol and one insertar per value leave it) and `int valor`. */
export function construirArbol(valores: number[], conArbol = true): Memoria {
  const m = memoriaVacia();
  if (conArbol) {
    const a = nuevoObjeto(m, { structs: STRUCTS_ARBOL }, 'Arbol', true);
    a.campos.raiz = nodosArbol(m, valores);
    m.marcos[0].vars.push({ nombre: 'arbol', tipo: ptr('Arbol'), valor: ref(a.id) });
  } else m.marcos[0].vars.push({ nombre: 'arbol', tipo: ptr('Arbol'), valor: { k: 'basura' } });
  return m;
}

/** The values of the tree in order (left, root, right), reading the memory. */
export function enOrden(m: Memoria, v: Valor): number[] {
  const out: number[] = [];
  const vistos = new Set<number>();
  const ir = (x: Valor) => {
    if (x.k !== 'ref' || x.r.k !== 'obj' || vistos.has(x.r.id) || out.length > 60) return;
    vistos.add(x.r.id);
    const o = m.objetos[x.r.id];
    if (!o || o.tipo !== 'Nodo') return;
    ir(o.campos.izquierda as Valor);
    const d = o.campos.valor as Valor;
    out.push(d.k === 'int' ? d.v : NaN);
    ir(o.campos.derecha as Valor);
  };
  ir(v);
  return out;
}

/** «8(3(1,6),10(,14))»: the shape of a tree, as the exercises write it. */
export function formaDe(m: Memoria, v: Valor, vistos = new Set<number>()): string {
  if (v.k !== 'ref' || v.r.k !== 'obj') return '';
  const o = m.objetos[v.r.id];
  if (!o || vistos.has(o.id)) return '…';
  vistos.add(o.id);
  const d = o.campos.valor as Valor;
  const t = d.k === 'int' ? String(d.v) : '?';
  const i = o.campos.izquierda as Valor;
  const r = o.campos.derecha as Valor;
  if (i.k !== 'ref' && r.k !== 'ref') return o.liberado ? `${t}(liberado)` : t;
  return `${t}(${formaDe(m, i, vistos)},${formaDe(m, r, vistos)})`;
}

// ---------------------------------------------------------------- operations of Visualizar

export type ArgArbol = 'valor';

export interface OpArbol {
  /** The function called from main. */
  fn: string;
  /** Functions shown and run line by line (the rest run as a single step). */
  visibles: string[];
  titulo: string;
  descripcion: string;
  grupo: string;
  args: ArgArbol[];
  /** The call from main, given the value typed. */
  llamada: (valor: number) => string;
  crea?: boolean;
}

export interface TipoArbol {
  id: 'arbol-binario' | 'abb';
  nombre: string;
  corto: string;
  resumen: string[];
  ejemplo: number[];
  operaciones: OpArbol[];
}

const op = (fn: string, titulo: string, descripcion: string, grupo: string, llamada: OpArbol['llamada'], extra: Partial<OpArbol> = {}): OpArbol => ({
  fn,
  visibles: [fn],
  titulo,
  descripcion,
  grupo,
  args: [],
  llamada,
  ...extra,
});

export const ARBOLES: TipoArbol[] = [
  {
    id: 'arbol-binario',
    nombre: 'Árbol binario',
    corto: 'Binario',
    resumen: [
      'Cada **nodo** guarda un valor y dos punteros: a su hijo `izquierda` y a su hijo `derecha` (`NULL` si no lo tiene). El struct `Arbol` solo guarda la `raiz`.',
      'Un nodo sin hijos es una **hoja**. Cada hijo es a su vez la raíz de un **subárbol**, así que casi todo se escribe con **recursión**: el caso base es el árbol vacío (`raiz == NULL`).',
      'Recorrerlo es visitar la raíz y sus dos subárboles: en **preorden** la raíz va primero, en **inorden** en medio y en **postorden** al final.',
    ],
    ejemplo: [8, 3, 10, 1, 6, 14, 4],
    operaciones: [
      op('preOrden', 'Recorrido en preorden', 'Escribe la raíz, después todo el subárbol izquierdo y después todo el derecho.', 'Recorridos', () => 'preOrden(arbol->raiz)'),
      op('inOrden', 'Recorrido en inorden', 'Escribe el subárbol izquierdo, la raíz y el derecho: en un ABB sale ordenado.', 'Recorridos', () => 'inOrden(arbol->raiz)'),
      op('postOrden', 'Recorrido en postorden', 'Escribe los dos subárboles y la raíz al final: es el orden para liberar.', 'Recorridos', () => 'postOrden(arbol->raiz)'),
      op('contarNodos', 'Contar los nodos', 'Uno por la raíz más los de cada subárbol.', 'Consultas', () => 'contarNodos(arbol->raiz)'),
      op('contarHojas', 'Contar las hojas', 'Una hoja cuenta 1; si no, se suman las hojas de los dos subárboles.', 'Consultas', () => 'contarHojas(arbol->raiz)'),
      op('altura', 'Altura', 'Uno más la altura del subárbol más alto. El árbol vacío tiene altura 0.', 'Consultas', () => 'altura(arbol->raiz)'),
      op('liberarArbol', 'Liberar el árbol', 'Libera los nodos en postorden (los hijos antes que el padre) y después el struct.', 'Crear y liberar', () => 'liberarArbol(arbol)', { visibles: ['liberarArbol', 'liberarNodos'] }),
    ],
  },
  {
    id: 'abb',
    nombre: 'Árbol binario de búsqueda',
    corto: 'ABB',
    resumen: [
      'Es un árbol binario con una regla en **cada** nodo: todo lo de su subárbol izquierdo es **menor** y todo lo del derecho, **mayor**. No hay repetidos.',
      'Buscar, insertar y eliminar bajan por **un solo camino** desde la raíz: a la izquierda si el valor es menor y a la derecha si es mayor. Cuestan lo que la altura: O(log n) si está equilibrado y O(n) si degenera en una lista.',
      'Su recorrido en **inorden** sale ordenado de menor a mayor.',
    ],
    ejemplo: [8, 3, 10, 1, 6, 14, 4],
    operaciones: [
      op('buscar', 'Buscar', 'Baja desde la raíz: a la izquierda si el valor es menor, a la derecha si es mayor. Devuelve 1 si lo encuentra.', 'Búsqueda', (v) => `buscar(arbol->raiz, ${v})`, { args: ['valor'] }),
      op('minimo', 'Mínimo', 'Baja siempre por la izquierda hasta el nodo que no tiene hijo izquierdo.', 'Búsqueda', () => 'minimo(arbol->raiz)'),
      op('maximo', 'Máximo', 'Baja siempre por la derecha.', 'Búsqueda', () => 'maximo(arbol->raiz)'),
      op('insertar', 'Insertar', 'Busca el sitio como una búsqueda que falla y cuelga ahí el nodo nuevo: siempre entra como hoja.', 'Insertar y eliminar', (v) => `insertar(arbol, ${v})`, {
        args: ['valor'],
        visibles: ['insertar', 'insertarNodo'],
      }),
      op('eliminar', 'Eliminar', 'Una hoja se quita sin más; con un hijo, el hijo ocupa su sitio; con dos, se copia el sucesor (el menor de la derecha) y se elimina ese.', 'Insertar y eliminar', (v) => `eliminar(arbol, ${v})`, {
        args: ['valor'],
        visibles: ['eliminar', 'eliminarNodo'],
      }),
      op('crearArbol', 'Crear el árbol', 'Reserva el struct con malloc y deja la raíz a NULL.', 'Crear y liberar', () => 'arbol = crearArbol()', { crea: true }),
    ],
  },
];

export const buscarArbol = (id: string) => ARBOLES.find((t) => t.id === id);

/** The visible code of an operation (its functions, in the file's order) and the rest as preludio. */
export function codigoOp(o: OpArbol): { visible: string; preludio: string } {
  const todas = [...archivo(srcNodo).funciones.values(), ...archivo(srcArbol).funciones.values()];
  const visible = todas
    .filter((f) => o.visibles.includes(f.nombre))
    .map((f) => f.texto)
    .join('\n\n');
  return { visible: visible + '\n', preludio: '\n' + funcionesArbol(o.visibles) };
}

export function ejecutarOpArbol(o: OpArbol, valores: number[], valor: number): Resultado & { codigo: string; llamada: string; inicial: Memoria } {
  const { visible, preludio } = codigoOp(o);
  const llamada = o.llamada(valor);
  const inicial = construirArbol(valores, !o.crea);
  const r = ejecutar(visible, { ...CTX_ARBOL, preludio }, inicial, { llamada, maxPasos: 6000 });
  return { ...r, codigo: visible, llamada, inicial };
}

// ---------------------------------------------------------------- constructors for the exercises

type Ctor = (m: Memoria, ctx: Contexto) => void;
const declarar = (m: Memoria, nombre: string, base: string, valor: Valor) => m.marcos[0].vars.push({ nombre, tipo: ptr(base), valor });

/** `Arbol *nombre` with the search tree that inserting the values in that order leaves. */
export const arbolABB =
  (nombre: string, valores: number[]): Ctor =>
  (m) => {
    const a = nuevoObjeto(m, { structs: STRUCTS_ARBOL }, 'Arbol', true);
    a.campos.raiz = nodosArbol(m, valores);
    declarar(m, nombre, 'Arbol', ref(a.id));
  };

/** `Nodo *nombre` pointing to the root of the search tree of those values (NULL if there are none). */
export const raizABB =
  (nombre: string, valores: number[]): Ctor =>
  (m) =>
    declarar(m, nombre, 'Nodo', nodosArbol(m, valores));

/** `Nodo *nombre` pointing to a tree of any shape: «8(3(1,6),10(,14))». */
export const raizForma =
  (nombre: string, forma: string): Ctor =>
  (m) =>
    declarar(m, nombre, 'Nodo', forma ? nodosForma(m, forma) : NULO);
