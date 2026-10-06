// Contextos de cada tema (los structs tal y como están en soluciones-codigo) y
// funciones para construir los estados iniciales de los ejercicios.

import { Contexto, int, Memoria, memoriaVacia, NULO, nuevoObjeto, Valor } from './modelo';

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

/** Tema 3: pila_array.h (MAX 6) */
export const CTX_PILA_ARRAY: Contexto = {
  structs: [{ nombre: 'Pila', campos: [{ nombre: 'datos', tipo: { base: 'int', ptr: 0 }, arr: 6 }, { nombre: 'cima', tipo: { base: 'int', ptr: 0 } }] }],
  constantes: { MAX: 6 },
  preludio: `
int esVacia(Pila *p) { return p->cima == -1; }
int esLlena(Pila *p) { return p->cima == MAX - 1; }`,
};

/** Tema 3: pila_enlazada.h */
export const CTX_PILA_ENLAZADA: Contexto = {
  structs: [NODO, { nombre: 'Pila', campos: [{ nombre: 'cima', tipo: { base: 'Nodo', ptr: 1 } }, { nombre: 'n', tipo: { base: 'int', ptr: 0 } }] }],
  preludio: `
int esVacia(Pila *p) { return p->cima == NULL; }`,
};

/** Tema 4: cola_circular.h (MAX 5, con contador) */
export const CTX_COLA_CIRCULAR: Contexto = {
  structs: [
    {
      nombre: 'ColaCircular',
      campos: [
        { nombre: 'datos', tipo: { base: 'int', ptr: 0 }, arr: 5 },
        { nombre: 'frente', tipo: { base: 'int', ptr: 0 } },
        { nombre: 'final', tipo: { base: 'int', ptr: 0 } },
        { nombre: 'n', tipo: { base: 'int', ptr: 0 } },
      ],
    },
  ],
  constantes: { MAX: 5 },
  preludio: `
int estaVacia(ColaCircular *c) { return c->n == 0; }
int estaLlena(ColaCircular *c) { return c->n == MAX; }`,
};

/** Tema 4: cola_enlazada.h (el nodo se llama igual pero su dato es «dato») */
export const CTX_COLA_ENLAZADA: Contexto = {
  structs: [
    { nombre: 'Nodo', campos: [{ nombre: 'dato', tipo: { base: 'int', ptr: 0 } }, { nombre: 'siguiente', tipo: { base: 'Nodo', ptr: 1 } }] },
    {
      nombre: 'Cola',
      campos: [
        { nombre: 'frente', tipo: { base: 'Nodo', ptr: 1 } },
        { nombre: 'final', tipo: { base: 'Nodo', ptr: 1 } },
        { nombre: 'n', tipo: { base: 'int', ptr: 0 } },
      ],
    },
  ],
  preludio: `
int esVacia(Cola *c) { return c->frente == NULL; }`,
};

// ------------------------------------------------------------------ constructores

export type Constructor = (m: Memoria, ctx: Contexto) => void;

const ref = (id: number): Valor => ({ k: 'ref', r: { k: 'obj', id } });

function declarar(m: Memoria, nombre: string, base: string, ptr: number, valor: Valor) {
  m.marcos[0].vars.push({ nombre, tipo: { base, ptr }, valor });
}

/** Cadena de nodos en el montón; devuelve el puntero al primero. */
function nodos(m: Memoria, ctx: Contexto, valores: number[], campo = 'valor'): Valor {
  let sig: Valor = NULO;
  for (let i = valores.length - 1; i >= 0; i--) {
    const o = nuevoObjeto(m, ctx, 'Nodo', true);
    o.campos[campo] = int(valores[i]);
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

/** Pila con array: valores del fondo a la cima. */
export const pilaArray =
  (nombre: string, valores: number[], restos: number[] = []): Constructor =>
  (m, ctx) => {
    const o = nuevoObjeto(m, ctx, 'Pila', false, 'pila');
    const datos = o.campos.datos as Valor[];
    valores.forEach((v, i) => (datos[i] = int(v)));
    restos.forEach((v, i) => (datos[valores.length + i] = int(v)));
    o.campos.cima = int(valores.length - 1);
    declarar(m, nombre, 'Pila', 1, ref(o.id));
  };

/** Pila enlazada: valores del fondo a la cima. */
export const pilaEnlazada =
  (nombre: string, valores: number[]): Constructor =>
  (m, ctx) => {
    const o = nuevoObjeto(m, ctx, 'Pila', false, 'pila');
    o.campos.cima = nodos(m, ctx, [...valores].reverse());
    o.campos.n = int(valores.length);
    declarar(m, nombre, 'Pila', 1, ref(o.id));
  };

/** Cola circular: los elementos en orden desde frente, y restos que siguen escritos. */
export const colaCircular =
  (nombre: string, elems: number[], frente = 0, restos: Record<number, number> = {}): Constructor =>
  (m, ctx) => {
    const o = nuevoObjeto(m, ctx, 'ColaCircular', false, 'cola');
    const datos = o.campos.datos as Valor[];
    for (const [i, v] of Object.entries(restos)) datos[Number(i)] = int(v);
    elems.forEach((v, i) => (datos[(frente + i) % datos.length] = int(v)));
    o.campos.frente = int(frente);
    o.campos.final = int((frente + elems.length) % datos.length);
    o.campos.n = int(elems.length);
    declarar(m, nombre, 'ColaCircular', 1, ref(o.id));
  };

/** Cola enlazada: del frente al final. */
export const colaEnlazada =
  (nombre: string, valores: number[]): Constructor =>
  (m, ctx) => {
    const o = nuevoObjeto(m, ctx, 'Cola', false, 'cola');
    const primero = nodos(m, ctx, valores, 'dato');
    o.campos.frente = primero;
    let ultimo: Valor = NULO;
    let v = primero;
    while (v.k === 'ref' && v.r.k === 'obj') {
      ultimo = v;
      v = m.objetos[v.r.id].campos.siguiente as Valor;
    }
    o.campos.final = ultimo;
    o.campos.n = int(valores.length);
    declarar(m, nombre, 'Cola', 1, ref(o.id));
  };

export function construir(ctx: Contexto, partes: Constructor[]): Memoria {
  const m = memoriaVacia();
  partes.forEach((p) => p(m, ctx));
  return m;
}
