// The queues of the Tema 4 project (proyecto-TAD): the circular array and linked queue,
// the two deques and the priority queue as a sorted list. Their structs, how an example
// queue is laid out in memory and which operations can be watched step by step.
// The code that runs is the one in src/queues/c, untouched. cola_prioridad_array.c is
// left out on purpose: it is part of the second individual assignment.

import { Contexto } from '../memoria/modelo';
import srcColaArray from './c/cola_array.c?raw';
import srcColaEnlazada from './c/cola_enlazada.c?raw';
import srcBicolaArray from './c/bicola_array.c?raw';
import srcBicolaEnlazada from './c/bicola_enlazada.c?raw';
import srcPrioridad from './c/cola_prioridad_lista.c?raw';
import hColaArray from './h/cola_array.h?raw';
import hColaEnlazada from './h/cola_enlazada.h?raw';
import hBicolaArray from './h/bicola_array.h?raw';
import hBicolaEnlazada from './h/bicola_enlazada.h?raw';
import hPrioridad from './h/cola_prioridad_lista.h?raw';

export type QueueId = 'cola-array' | 'cola-enlazada' | 'bicola-array' | 'bicola-enlazada' | 'cola-prioridad';
export type QueueFamily = 'Cola' | 'Bicola' | 'Cola con prioridad';

/** Extra argument of an operation, besides &c. */
export type QueueArg =
  | 'x' // a number typed by the user (encolar, insertar...)
  | 'prio' // a priority typed by the user
  | '&x' // the address of main's `x`
  | '&prio'; // the address of main's `prio`

export interface QueueOp {
  fn: string; // real function name in the .c
  titulo: string;
  descripcion: string;
  args: QueueArg[];
  grupo: 'Insertar y extraer' | 'Consultar' | 'Crear y vaciar';
  /** Starts from an uninitialised struct (crearCola...). */
  crea?: boolean;
}

export interface QueueType {
  id: QueueId;
  familia: QueueFamily;
  nombre: string;
  corto: string;
  resumen: string[];
  struct: string; // ColaCircular, Cola, Bicola, ColaPrio
  /** Node type of the linked ones, with its fields in drawing order. */
  nodo?: { tipo: string; campos: string[] };
  ctx: Contexto;
  src: string;
  header: string;
  archivo: string;
  operaciones: QueueOp[];
  /** Most elements the page lets you start with. */
  max: number;
  /** Example queue, from front to back (with its priorities for the priority queue). */
  ejemplo: number[];
  prioridades?: number[];
  /** Index of the front in the example (array queues). */
  ejemploFrente?: number;
}

/** MAX in the array queues: 5, the one in the slides. */
export const MAX = 5;
export const NPRIO = 4;

const op = (fn: string, titulo: string, descripcion: string, args: QueueArg[], grupo: QueueOp['grupo'], crea = false): QueueOp => ({ fn, titulo, descripcion, args, grupo, crea });
const int = (nombre: string) => ({ nombre, tipo: { base: 'int', ptr: 0 } });
const ptr = (nombre: string, base: string) => ({ nombre, tipo: { base, ptr: 1 } });

export const COLAS: QueueType[] = [
  {
    id: 'cola-array',
    familia: 'Cola',
    nombre: 'Cola circular',
    corto: 'Circular',
    resumen: [
      'Los datos van en un **array circular**: `frente` es el índice del primero y `final` el del primer hueco libre.',
      'Los dos avanzan con `% MAX`, así que después de la última casilla viene la 0 y ningún elemento cambia de sitio.',
      'Llena y vacía tienen `frente == final`: lo que las distingue es el contador `n`.',
    ],
    struct: 'ColaCircular',
    ctx: {
      structs: [{ nombre: 'ColaCircular', campos: [{ ...int('datos'), arr: MAX }, int('frente'), int('final'), int('n')] }],
      constantes: { MAX },
    },
    src: srcColaArray,
    header: hColaArray,
    archivo: 'cola_array.c',
    max: MAX,
    ejemplo: [1, 2, 3],
    ejemploFrente: 3,
    operaciones: [
      op('encolar', 'Encolar', 'Escribe x en la casilla final y avanza final con % MAX. Devuelve 0 si la cola está llena.', ['x'], 'Insertar y extraer'),
      op('desencolar', 'Desencolar', 'Copia en *x el dato del frente y avanza frente con % MAX. Devuelve 0 si la cola está vacía.', ['&x'], 'Insertar y extraer'),
      op('frente', 'Consultar el frente', 'Copia en *x el dato del frente sin moverlo.', ['&x'], 'Consultar'),
      op('tamano', 'Tamaño', 'Devuelve el contador n.', [], 'Consultar'),
      op('estaVacia', '¿Está vacía?', 'Devuelve 1 si n vale 0.', [], 'Consultar'),
      op('estaLlena', '¿Está llena?', 'Devuelve 1 si n vale MAX.', [], 'Consultar'),
      op('crearCola', 'Crear la cola', 'Pone frente, final y n a 0. El array se queda como estaba.', [], 'Crear y vaciar', true),
      op('limpiar', 'Vaciar', 'Vuelve a llamar a crearCola: los datos siguen en el array, pero ya no cuentan.', [], 'Crear y vaciar'),
    ],
  },
  {
    id: 'cola-enlazada',
    familia: 'Cola',
    nombre: 'Cola enlazada',
    corto: 'Enlazada',
    resumen: [
      'Cada elemento es un **nodo** en el montón. La cola guarda **dos punteros**: `frente`, por donde se desencola, y `final`, por donde se encola.',
      'Con uno solo, encolar obligaría a recorrer hasta el último nodo.',
      'No se llena nunca: solo la limita la memoria. Desencolar tiene que hacer `free` del nodo, y si la cola se queda vacía, `final` vuelve a NULL.',
    ],
    struct: 'Cola',
    nodo: { tipo: 'Nodo', campos: ['dato', 'sig'] },
    ctx: {
      structs: [
        { nombre: 'Nodo', campos: [int('dato'), ptr('sig', 'Nodo')] },
        { nombre: 'Cola', campos: [ptr('frente', 'Nodo'), ptr('final', 'Nodo'), int('n')] },
      ],
    },
    src: srcColaEnlazada,
    header: hColaEnlazada,
    archivo: 'cola_enlazada.c',
    max: 6,
    ejemplo: [1, 2, 3],
    operaciones: [
      op('encolar', 'Encolar', 'Crea un nodo con malloc y lo engancha detrás del final. Si la cola estaba vacía, también es el frente.', ['x'], 'Insertar y extraer'),
      op('desencolar', 'Desencolar', 'Copia en *x el dato del frente, avanza el frente al siguiente y libera el nodo.', ['&x'], 'Insertar y extraer'),
      op('frente', 'Consultar el frente', 'Copia en *x el dato del primer nodo sin quitarlo.', ['&x'], 'Consultar'),
      op('tamano', 'Tamaño', 'Devuelve el contador n: no hace falta recorrer.', [], 'Consultar'),
      op('esVacia', '¿Está vacía?', 'Devuelve 1 si el frente es NULL.', [], 'Consultar'),
      op('crearCola', 'Crear la cola', 'Pone frente y final a NULL y n a 0.', [], 'Crear y vaciar', true),
      op('limpiar', 'Vaciar', 'Desencola hasta que no quede nada: cada desencolar libera un nodo.', [], 'Crear y vaciar'),
    ],
  },
  {
    id: 'bicola-array',
    familia: 'Bicola',
    nombre: 'Bicola circular',
    corto: 'Circular',
    resumen: [
      'Se inserta y se extrae **por los dos extremos**. Va en un array circular con `frente` y `n`: el último se calcula, `(frente + n - 1) % MAX`.',
      'El frente se mueve en los dos sentidos: avanza al extraer por delante y **retrocede** al insertar por delante.',
      'Retroceder tiene truco: `(0 - 1) % MAX` vale -1 en C, así que se suma `MAX` antes del módulo.',
    ],
    struct: 'Bicola',
    ctx: {
      structs: [{ nombre: 'Bicola', campos: [{ ...int('datos'), arr: MAX }, int('frente'), int('n')] }],
      constantes: { MAX },
    },
    src: srcBicolaArray,
    header: hBicolaArray,
    archivo: 'bicola_array.c',
    max: MAX,
    ejemplo: [1, 2, 3],
    ejemploFrente: 0,
    operaciones: [
      op('insertarFrente', 'Insertar por el frente', 'Retrocede el frente una casilla (sumando MAX antes del %) y escribe x ahí. Devuelve 0 si no cabe.', ['x'], 'Insertar y extraer'),
      op('insertarFinal', 'Insertar por el final', 'Escribe x en el hueco tras el último, (frente + n) % MAX, y suma 1 a n.', ['x'], 'Insertar y extraer'),
      op('extraerFrente', 'Extraer por el frente', 'Copia en *x el dato del frente y avanza el frente.', ['&x'], 'Insertar y extraer'),
      op('extraerFinal', 'Extraer por el final', 'Copia en *x el último y resta 1 a n: el frente no se mueve.', ['&x'], 'Insertar y extraer'),
      op('verFrente', 'Consultar el frente', 'Copia en *x el dato del frente sin quitarlo.', ['&x'], 'Consultar'),
      op('verFinal', 'Consultar el final', 'Copia en *x el último sin quitarlo.', ['&x'], 'Consultar'),
      op('tamano', 'Tamaño', 'Devuelve n.', [], 'Consultar'),
      op('esVacia', '¿Está vacía?', 'Devuelve 1 si n vale 0.', [], 'Consultar'),
      op('esLlena', '¿Está llena?', 'Devuelve 1 si n vale MAX.', [], 'Consultar'),
      op('crearBicola', 'Crear la bicola', 'Pone frente y n a 0.', [], 'Crear y vaciar', true),
      op('liberarBicola', 'Liberar', 'En el array no hay nada que liberar: no hace nada.', [], 'Crear y vaciar'),
    ],
  },
  {
    id: 'bicola-enlazada',
    familia: 'Bicola',
    nombre: 'Bicola enlazada',
    corto: 'Enlazada',
    resumen: [
      'Es una **lista doblemente enlazada** con `frente` y `final`: cada nodo sabe cuál tiene delante (`ant`) y cuál detrás (`sig`).',
      'Con una lista simple, extraer por el final obligaría a recorrer hasta el penúltimo. Con `ant`, el penúltimo es `final->ant`.',
      'Los cuatro extremos se manejan sin recorrer nada. No se llena nunca.',
    ],
    struct: 'Bicola',
    nodo: { tipo: 'NodoB', campos: ['ant', 'dato', 'sig'] },
    ctx: {
      structs: [
        { nombre: 'NodoB', campos: [int('dato'), ptr('ant', 'NodoB'), ptr('sig', 'NodoB')] },
        { nombre: 'Bicola', campos: [ptr('frente', 'NodoB'), ptr('final', 'NodoB'), int('n')] },
      ],
    },
    src: srcBicolaEnlazada,
    header: hBicolaEnlazada,
    archivo: 'bicola_enlazada.c',
    max: 5,
    ejemplo: [1, 2, 3],
    operaciones: [
      op('insertarFrente', 'Insertar por el frente', 'Crea un nodo, lo engancha delante del frente (el viejo frente apunta atrás a él) y lo convierte en el frente.', ['x'], 'Insertar y extraer'),
      op('insertarFinal', 'Insertar por el final', 'El espejo de insertarFrente: frente por final y ant por sig.', ['x'], 'Insertar y extraer'),
      op('extraerFrente', 'Extraer por el frente', 'Copia el dato, avanza el frente, deja su ant a NULL y libera el nodo.', ['&x'], 'Insertar y extraer'),
      op('extraerFinal', 'Extraer por el final', 'Copia el dato, retrocede el final con ant (sin recorrer), deja su sig a NULL y libera el nodo.', ['&x'], 'Insertar y extraer'),
      op('verFrente', 'Consultar el frente', 'Copia en *x el dato del frente.', ['&x'], 'Consultar'),
      op('verFinal', 'Consultar el final', 'Copia en *x el dato del final.', ['&x'], 'Consultar'),
      op('tamano', 'Tamaño', 'Devuelve el contador n.', [], 'Consultar'),
      op('esVacia', '¿Está vacía?', 'Devuelve 1 si el frente es NULL.', [], 'Consultar'),
      op('esLlena', '¿Está llena?', 'Siempre 0: solo la limita la memoria.', [], 'Consultar'),
      op('crearBicola', 'Crear la bicola', 'Pone frente y final a NULL y n a 0.', [], 'Crear y vaciar', true),
      op('liberarBicola', 'Liberar', 'Extrae por el frente hasta vaciarla: cada extracción libera un nodo.', [], 'Crear y vaciar'),
    ],
  },
  {
    id: 'cola-prioridad',
    familia: 'Cola con prioridad',
    nombre: 'Cola con prioridad',
    corto: 'Con prioridad',
    resumen: [
      'Cada elemento lleva una **prioridad** de 0 a `NPRIO - 1`, y 0 es la más alta. Sale siempre el de prioridad más alta.',
      'Va en una sola **lista enlazada, ordenada al insertar**: desencolar es directo (sale la cabeza) y el trabajo está en encolar.',
      'Es **estable**: entre los de la misma prioridad sale antes el que llegó antes, porque el nuevo va detrás de sus iguales (`<=`, no `<`).',
    ],
    struct: 'ColaPrio',
    nodo: { tipo: 'NodoP', campos: ['dato', 'prio', 'sig'] },
    ctx: {
      structs: [
        { nombre: 'NodoP', campos: [int('dato'), int('prio'), ptr('sig', 'NodoP')] },
        { nombre: 'ColaPrio', campos: [ptr('cabeza', 'NodoP'), int('n')] },
      ],
      constantes: { NPRIO },
    },
    src: srcPrioridad,
    header: hPrioridad,
    archivo: 'cola_prioridad_lista.c',
    max: 5,
    ejemplo: [4, 8, 2],
    prioridades: [0, 1, 1],
    operaciones: [
      op('encolarPrio', 'Encolar con prioridad', 'Recorre la lista con un puntero doble hasta el primero de prioridad mayor que la suya y engancha ahí el nodo nuevo.', ['x', 'prio'], 'Insertar y extraer'),
      op('desencolarPrio', 'Desencolar', 'Sale siempre la cabeza: copia su dato en *x, avanza la cabeza y libera el nodo.', ['&x'], 'Insertar y extraer'),
      op('frentePrio', 'Consultar el frente', 'Copia en *x y *prio el dato y la prioridad de la cabeza.', ['&x', '&prio'], 'Consultar'),
      op('tamanoPrio', 'Tamaño', 'Devuelve el contador n.', [], 'Consultar'),
      op('esVaciaPrio', '¿Está vacía?', 'Devuelve 1 si la cabeza es NULL.', [], 'Consultar'),
      op('crearColaPrio', 'Crear la cola', 'Pone la cabeza a NULL y n a 0.', [], 'Crear y vaciar', true),
      op('liberarColaPrio', 'Liberar', 'Desencola hasta vaciarla: cada desencolar libera un nodo.', [], 'Crear y vaciar'),
    ],
  },
];

export const buscarCola = (id: string) => COLAS.find((c) => c.id === id);
export const FAMILIAS: QueueFamily[] = ['Cola', 'Bicola', 'Cola con prioridad'];
