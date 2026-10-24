// Contextos de cada tema y funciones para construir los estados iniciales de los
// ejercicios. Las pilas y las colas usan los structs y las funciones de los proyectos
// Pilas y Colas (los mismos que se ejecutan en Visualizar).

import { Contexto, int, Memoria, memoriaVacia, NULO, nuevoObjeto, Valor } from './modelo';
import { trocear } from '../listas/trocear';
import srcPilaArray from '../stacks/c/PilaArray.c?raw';
import srcPilaEnlazada from '../stacks/c/PilaEnlazada.c?raw';
import srcColaArray from '../queues/c/ColaArray.c?raw';
import srcColaEnlazada from '../queues/c/ColaEnlazada.c?raw';
import srcNodoSimple from '../queues/c/NodoSimple.c?raw';

const NODO = { nombre: 'Nodo', campos: [{ nombre: 'valor', tipo: { base: 'int', ptr: 0 } }, { nombre: 'siguiente', tipo: { base: 'Nodo', ptr: 1 } }] };

/** Tema 2: lista.h */
export const CTX_LISTA: Contexto = {
  structs: [NODO],
  preludio: `
Nodo *crearNodo(int x) {
  Nodo *n = malloc(sizeof(Nodo));
  n->valor = x;
  n->siguiente = NULL;
  return n;
}`,
};

/** The functions of a project's .c files (without the print ones), for the preludio. */
const funcionesDe = (...srcs: string[]) =>
  '\n' +
  srcs
    .flatMap((s) => [...trocear(s).funciones.values()])
    .filter((f) => !/^(imprimir|mostrar)/.test(f.nombre))
    .map((f) => f.texto)
    .join('\n\n');

/** TAM is 1024 in PilaArray.c; in the exercises it is 8 so that the stack can fill up. */
export const TAM_PILA_EJERCICIOS = 8;

/** Tema 3: PilaArray.c, with all its functions available */
export const CTX_PILA_ARRAY: Contexto = {
  structs: [{ nombre: 'PilaArray', campos: [{ nombre: 'array', tipo: { base: 'int', ptr: 0 }, arr: TAM_PILA_EJERCICIOS }, { nombre: 'cima', tipo: { base: 'int', ptr: 0 } }] }],
  constantes: { TAM: TAM_PILA_EJERCICIOS },
  preludio: funcionesDe(srcPilaArray),
};

/** Tema 3: PilaEnlazada.c, with all its functions available */
export const CTX_PILA_ENLAZADA: Contexto = {
  structs: [NODO, { nombre: 'PilaEnlazada', campos: [{ nombre: 'cima', tipo: { base: 'Nodo', ptr: 1 } }, { nombre: 'tamano', tipo: { base: 'int', ptr: 0 } }] }],
  preludio: funcionesDe(srcPilaEnlazada),
};

/** Tema 4: ColaArray.c (TAM_COLA_ARRAY 10, with a counter), with all its functions available */
export const CTX_COLA_ARRAY: Contexto = {
  structs: [
    {
      nombre: 'ColaArray',
      campos: [
        { nombre: 'array', tipo: { base: 'int', ptr: 0 }, arr: 10 },
        { nombre: 'frente', tipo: { base: 'int', ptr: 0 } },
        { nombre: 'final', tipo: { base: 'int', ptr: 0 } },
        { nombre: 'numElementos', tipo: { base: 'int', ptr: 0 } },
      ],
    },
  ],
  constantes: { TAM_COLA_ARRAY: 10 },
  preludio: funcionesDe(srcColaArray),
};

/** Tema 4: ColaEnlazada.c over the NodoSimple TAD, with all their functions available */
export const CTX_COLA_ENLAZADA: Contexto = {
  structs: [
    { nombre: 'NodoSimple', campos: [{ nombre: 'valor', tipo: { base: 'int', ptr: 0 } }, { nombre: 'siguiente', tipo: { base: 'NodoSimple', ptr: 1 } }] },
    {
      nombre: 'ColaEnlazada',
      campos: [
        { nombre: 'inicio', tipo: { base: 'NodoSimple', ptr: 1 } },
        { nombre: 'final', tipo: { base: 'NodoSimple', ptr: 1 } },
        { nombre: 'tamano', tipo: { base: 'int', ptr: 0 } },
      ],
    },
  ],
  preludio: funcionesDe(srcNodoSimple, srcColaEnlazada),
};

// ------------------------------------------------------------------ constructores

export type Constructor = (m: Memoria, ctx: Contexto) => void;

const ref = (id: number): Valor => ({ k: 'ref', r: { k: 'obj', id } });

function declarar(m: Memoria, nombre: string, base: string, ptr: number, valor: Valor) {
  m.marcos[0].vars.push({ nombre, tipo: { base, ptr }, valor });
}

/** Cadena de nodos en el montón; devuelve el puntero al primero. */
function nodos(m: Memoria, ctx: Contexto, valores: number[], tipo = 'Nodo'): Valor {
  let sig: Valor = NULO;
  for (let i = valores.length - 1; i >= 0; i--) {
    const o = nuevoObjeto(m, ctx, tipo, true);
    o.campos.valor = int(valores[i]);
    o.campos.siguiente = sig;
    sig = ref(o.id);
  }
  // los ids quedan al revés; se renumeran para que el primero tenga el menor
  return sig;
}

export const lista =
  (nombre: string, valores: number[]): Constructor =>
  (m, ctx) =>
    declarar(m, nombre, 'Nodo', 1, nodos(m, ctx, valores));

export const entero =
  (nombre: string, v?: number): Constructor =>
  (m) =>
    declarar(m, nombre, 'int', 0, v === undefined ? { k: 'basura' } : int(v));

export const puntero =
  (nombre: string, base = 'Nodo'): Constructor =>
  (m) =>
    declarar(m, nombre, base, 1, NULO);

/** Pila con array, reservada con malloc como en CrearPilaArray: valores del fondo a la cima. */
export const pilaArray =
  (nombre: string, valores: number[], restos: number[] = []): Constructor =>
  (m, ctx) => {
    const o = nuevoObjeto(m, ctx, 'PilaArray', true);
    const arr = o.campos.array as Valor[];
    valores.forEach((v, i) => (arr[i] = int(v)));
    restos.forEach((v, i) => (arr[valores.length + i] = int(v)));
    o.campos.cima = int(valores.length - 1);
    declarar(m, nombre, 'PilaArray', 1, ref(o.id));
  };

/** Pila enlazada, reservada con malloc: valores del fondo a la cima. */
export const pilaEnlazada =
  (nombre: string, valores: number[]): Constructor =>
  (m, ctx) => {
    const o = nuevoObjeto(m, ctx, 'PilaEnlazada', true);
    o.campos.cima = nodos(m, ctx, [...valores].reverse());
    o.campos.tamano = int(valores.length);
    declarar(m, nombre, 'PilaEnlazada', 1, ref(o.id));
  };

/** Cola con array, reservada con malloc: los elementos en orden desde frente, y restos que siguen escritos. */
export const colaArray =
  (nombre: string, elems: number[], frente = 0, restos: Record<number, number> = {}): Constructor =>
  (m, ctx) => {
    const o = nuevoObjeto(m, ctx, 'ColaArray', true);
    const arr = o.campos.array as Valor[];
    for (const [i, v] of Object.entries(restos)) arr[Number(i)] = int(v);
    elems.forEach((v, i) => (arr[(frente + i) % arr.length] = int(v)));
    o.campos.frente = int(frente);
    o.campos.final = int((frente + elems.length) % arr.length);
    o.campos.numElementos = int(elems.length);
    declarar(m, nombre, 'ColaArray', 1, ref(o.id));
  };

/** Cola enlazada de NodoSimple, reservada con malloc: del inicio al final. */
export const colaEnlazada =
  (nombre: string, valores: number[]): Constructor =>
  (m, ctx) => {
    const o = nuevoObjeto(m, ctx, 'ColaEnlazada', true);
    const primero = nodos(m, ctx, valores, 'NodoSimple');
    o.campos.inicio = primero;
    let ultimo: Valor = NULO;
    let v = primero;
    while (v.k === 'ref' && v.r.k === 'obj') {
      ultimo = v;
      v = m.objetos[v.r.id].campos.siguiente as Valor;
    }
    o.campos.final = ultimo;
    o.campos.tamano = int(valores.length);
    declarar(m, nombre, 'ColaEnlazada', 1, ref(o.id));
  };

export function construir(ctx: Contexto, partes: Constructor[]): Memoria {
  const m = memoriaVacia();
  partes.forEach((p) => p(m, ctx));
  return m;
}
