// Las cuatro listas del TAD Lista (carpeta Listas): sus structs, cómo se construye una
// de ejemplo en memoria y qué operaciones se pueden ver paso a paso. El código que se
// ejecuta es el de los .c de src/listas/c, tal cual.

import { Contexto } from '../memoria/modelo';
import srcLista from './c/Lista.c?raw';
import srcListaCircular from './c/ListaCircular.c?raw';
import srcListaCircularDoble from './c/ListaCircularDoble.c?raw';
import srcListaDoble from './c/ListaDoble.c?raw';
import srcNodo from './c/Nodo.c?raw';
import srcNodoDoble from './c/NodoDoble.c?raw';
import hLista from './h/Lista.h?raw';
import hListaCircular from './h/ListaCircular.h?raw';
import hListaCircularDoble from './h/ListaCircularDoble.h?raw';
import hListaDoble from './h/ListaDoble.h?raw';

export type IdLista = 'simple' | 'doble' | 'circular' | 'circular-doble';

/** Qué recibe una operación, además de la lista. */
export type Arg =
  | 'nuevo' // un nodo recién creado con nuevoNodo(valor)
  | 'nodo' // un nodo que ya está en la lista (se elige por posición)
  | 'posicion'
  | 'valor';

export interface Operacion {
  base: string; // nombre sin el sufijo: insertarPrincipio, eliminarPorValor...
  titulo: string;
  args: Arg[];
  grupo: 'Inserción' | 'Eliminación' | 'Consulta';
}

export interface TipoLista {
  id: IdLista;
  nombre: string;
  corto: string;
  /** Dos o tres frases: cómo es y por dónde se entra. */
  resumen: string[];
  sufijo: string;
  nodo: 'Nodo' | 'NodoDoble';
  lista: string; // nombre del struct de la lista
  doble: boolean;
  circular: boolean;
  /** Campos del struct de la lista, en orden. */
  extremos: string[];
  ctx: Contexto;
  srcLista: string;
  srcNodo: string;
  /** El .h, de donde salen los comentarios de cada operación. */
  cabecera: string;
  operaciones: Operacion[];
  ejemplo: number[];
}

const NODO = { nombre: 'Nodo', campos: [{ nombre: 'valor', tipo: { base: 'int', ptr: 0 } }, { nombre: 'siguiente', tipo: { base: 'Nodo', ptr: 1 } }] };
const NODO_DOBLE = {
  nombre: 'NodoDoble',
  campos: [
    { nombre: 'valor', tipo: { base: 'int', ptr: 0 } },
    { nombre: 'siguiente', tipo: { base: 'NodoDoble', ptr: 1 } },
    { nombre: 'anterior', tipo: { base: 'NodoDoble', ptr: 1 } },
  ],
};
const lista = (nombre: string, nodo: string, campos: string[]) => ({ nombre, campos: campos.map((c) => ({ nombre: c, tipo: { base: nodo, ptr: 1 } })) });

const ins = (base: string, titulo: string, args: Arg[]): Operacion => ({ base, titulo, args, grupo: 'Inserción' });
const eli = (base: string, titulo: string, args: Arg[]): Operacion => ({ base, titulo, args, grupo: 'Eliminación' });
const con = (base: string, titulo: string, args: Arg[]): Operacion => ({ base, titulo, args, grupo: 'Consulta' });

const ELIMINAR = [
  eli('eliminarPorValor', 'Eliminar por valor', ['valor']),
  eli('eliminarNodoPosicion', 'Eliminar por posición', ['posicion']),
  eli('eliminarNodo', 'Eliminar un nodo (buscando su anterior)', ['nodo']),
  eli('eliminarPorReferencia', 'Eliminar un nodo (puntero doble)', ['nodo']),
  eli('eliminarLista', 'Eliminar la lista entera', []),
];
const CONSULTA = [
  con('obtenerLongitud', 'Longitud', []),
  con('obtenerPosicion', 'Posición de un valor', ['valor']),
  con('obtenerNodo', 'Nodo de una posición', ['posicion']),
];

export const LISTAS: TipoLista[] = [
  {
    id: 'simple',
    nombre: 'Lista simplemente enlazada',
    corto: 'Simple',
    resumen: [
      'Cada nodo guarda su valor y la dirección del **siguiente**; el último apunta a `NULL`.',
      'La lista es un único puntero, `cabeza`. Si `cabeza == NULL`, está vacía.',
      'Solo se puede avanzar hacia delante: para quitar un nodo hay que buscar antes a su **anterior**.',
    ],
    sufijo: '',
    nodo: 'Nodo',
    lista: 'Lista',
    doble: false,
    circular: false,
    extremos: ['cabeza'],
    ctx: { structs: [NODO, lista('Lista', 'Nodo', ['cabeza'])] },
    srcLista,
    srcNodo,
    cabecera: hLista,
    operaciones: [
      ins('insertarPrincipio', 'Insertar al principio', ['nuevo']),
      ins('insertarFinal', 'Insertar al final', ['nuevo']),
      ins('insertar', 'Insertar en una posición', ['nuevo', 'posicion']),
      ins('insertarTras', 'Insertar tras un valor', ['nuevo', 'valor']),
      ...ELIMINAR,
      ...CONSULTA,
    ],
    ejemplo: [10, 20, 30],
  },
  {
    id: 'doble',
    nombre: 'Lista doblemente enlazada',
    corto: 'Doble',
    resumen: [
      'Cada nodo apunta al **siguiente** y al **anterior**. El primero tiene `anterior = NULL` y el último `siguiente = NULL`.',
      'La lista guarda sus dos extremos, `cabeza` y `cola`: se entra por cualquiera y se recorre en los dos sentidos.',
      'Insertar en medio toca **cuatro** enlaces; quitar un nodo no obliga a buscar al anterior, porque lo lleva encima.',
    ],
    sufijo: 'ListaDoble',
    nodo: 'NodoDoble',
    lista: 'ListaDoble',
    doble: true,
    circular: false,
    extremos: ['cabeza', 'cola'],
    ctx: { structs: [NODO_DOBLE, lista('ListaDoble', 'NodoDoble', ['cabeza', 'cola'])] },
    srcLista: srcListaDoble,
    srcNodo: srcNodoDoble,
    cabecera: hListaDoble,
    operaciones: [
      ins('insertarPrincipio', 'Insertar al principio', ['nuevo']),
      ins('insertarFinal', 'Insertar al final', ['nuevo']),
      ins('insertar', 'Insertar en una posición', ['nuevo', 'posicion']),
      ins('insertarTras', 'Insertar tras un valor', ['nuevo', 'valor']),
      ...ELIMINAR,
      ...CONSULTA,
    ],
    ejemplo: [10, 20, 30],
  },
  {
    id: 'circular',
    nombre: 'Lista circular simple',
    corto: 'Circular',
    resumen: [
      'No hay `NULL` al final: el último nodo apunta otra vez al **primero**.',
      'El puntero `acceso` señala al **último**, así que el primero es `acceso->siguiente`: se inserta al principio y al final sin recorrer nada.',
      'Los recorridos van con `do … while`, parando al volver al nodo de partida.',
    ],
    sufijo: 'ListaCircular',
    nodo: 'Nodo',
    lista: 'ListaCircular',
    doble: false,
    circular: true,
    extremos: ['acceso'],
    ctx: { structs: [NODO, lista('ListaCircular', 'Nodo', ['acceso'])] },
    srcLista: srcListaCircular,
    srcNodo,
    cabecera: hListaCircular,
    operaciones: [
      ins('insertarPrincipio', 'Insertar al principio', ['nuevo']),
      ins('insertar', 'Insertar en una posición (o al final)', ['nuevo', 'posicion']),
      ins('insertarTras', 'Insertar tras un valor', ['nuevo', 'valor']),
      ...ELIMINAR,
      ...CONSULTA,
    ],
    ejemplo: [10, 20, 30],
  },
  {
    id: 'circular-doble',
    nombre: 'Lista circular doble',
    corto: 'Circular doble',
    resumen: [
      'El círculo en los dos sentidos: no hay ningún `NULL`. El último apunta hacia delante al primero y el primero hacia atrás al último.',
      'El puntero `acceso` señala al **primero**, y el último es siempre `acceso->anterior`.',
      'Todas las inserciones son el mismo enganche de cuatro enlaces; solo cambia si se mueve el acceso.',
    ],
    sufijo: 'ListaCircularDoble',
    nodo: 'NodoDoble',
    lista: 'ListaCircularDoble',
    doble: true,
    circular: true,
    extremos: ['acceso'],
    ctx: { structs: [NODO_DOBLE, lista('ListaCircularDoble', 'NodoDoble', ['acceso'])] },
    srcLista: srcListaCircularDoble,
    srcNodo: srcNodoDoble,
    cabecera: hListaCircularDoble,
    operaciones: [
      ins('insertarPrincipio', 'Insertar al principio', ['nuevo']),
      ins('insertarFinal', 'Insertar al final', ['nuevo']),
      ins('insertar', 'Insertar en una posición', ['nuevo', 'posicion']),
      ins('insertarTras', 'Insertar tras un valor', ['nuevo', 'valor']),
      ...ELIMINAR,
      ...CONSULTA,
    ],
    ejemplo: [10, 20, 30],
  },
];

export function buscarLista(id: string): TipoLista | undefined {
  return LISTAS.find((l) => l.id === id);
}

/** Nombre real de la función en el .c: base + sufijo. */
export const nombreFuncion = (t: TipoLista, base: string) => (base === 'eliminarLista' && t.sufijo ? 'eliminar' : base) + t.sufijo;

/** El comentario que lleva una función en el .h (las líneas // justo encima). */
export function comentarioDe(t: TipoLista, base: string): string {
  const lineas = t.cabecera.split('\n');
  const nombre = nombreFuncion(t, base);
  const i = lineas.findIndex((l) => new RegExp(`\\b${nombre}\\s*\\(`).test(l) && !/^\s*\/\//.test(l));
  if (i < 0) return '';
  const com: string[] = [];
  for (let j = i - 1; j >= 0 && /^\s*\/\/ /.test(lineas[j]); j--) com.unshift(lineas[j].replace(/^\s*\/\/\s?/, ''));
  return com.join(' ');
}
