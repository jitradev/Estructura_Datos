// The two stacks of the Pilas project (PilaArray and PilaEnlazada): their structs, how an
// example stack is laid out in memory and which operations can be watched step by step.
// The code that runs is the one in src/stacks/c, untouched.

import { Contexto } from '../memoria/modelo';
import srcArray from './c/PilaArray.c?raw';
import srcEnlazada from './c/PilaEnlazada.c?raw';

export type StackId = 'pila-array' | 'pila-enlazada';

/** Extra argument of an operation, besides the stack. */
export type StackArg =
  | 'valor' // a number typed by the user (push)
  | '&valor'; // the address of main's `valor` (pop, cima)

export interface StackOp {
  fn: string; // real function name in the .c
  titulo: string;
  descripcion: string;
  args: StackArg[];
  grupo: 'Apilar y desapilar' | 'Consultar' | 'Crear y destruir';
  /** Creates the stack from scratch: main starts with an uninitialised pointer. */
  crea?: boolean;
}

export interface StackType {
  id: StackId;
  nombre: string;
  corto: string;
  resumen: string[];
  struct: string; // PilaArray / PilaEnlazada
  enlazada: boolean;
  ctx: Contexto;
  src: string;
  archivo: string;
  operaciones: StackOp[];
  /** Most elements the page lets you start with. */
  max: number;
  nota?: string;
}

/** TAM is 1024 in the code; in the drawing it is 8 so the whole array fits. */
export const TAM_DIBUJO = 8;

const op = (fn: string, titulo: string, descripcion: string, args: StackArg[], grupo: StackOp['grupo'], crea = false): StackOp => ({ fn, titulo, descripcion, args, grupo, crea });

export const PILAS: StackType[] = [
  {
    id: 'pila-array',
    nombre: 'Pila con array',
    corto: 'Con array',
    resumen: [
      'Los datos van en un **array** dentro del struct; `cima` es el **índice** del último que entró.',
      'Vacía: `cima == -1`. Llena: `cima == TAM - 1`. El tamaño es `cima + 1`.',
      'Desapilar no borra nada: solo baja `cima`. El valor sigue en el array, pero ya no es de la pila y el siguiente push lo machaca.',
    ],
    struct: 'PilaArray',
    enlazada: false,
    ctx: {
      structs: [
        {
          nombre: 'PilaArray',
          campos: [
            { nombre: 'array', tipo: { base: 'int', ptr: 0 }, arr: TAM_DIBUJO },
            { nombre: 'cima', tipo: { base: 'int', ptr: 0 } },
          ],
        },
      ],
      constantes: { TAM: TAM_DIBUJO },
    },
    src: srcArray,
    archivo: 'PilaArray.c',
    max: TAM_DIBUJO,
    nota: `En el código \`TAM\` vale 1024; aquí vale ${TAM_DIBUJO} para que el array quepa entero en el dibujo y se pueda ver la pila llena.`,
    operaciones: [
      op('pushArray', 'Apilar (push)', 'Sube la cima y escribe el valor en esa casilla. Devuelve 0 si la pila está llena.', ['valor'], 'Apilar y desapilar'),
      op('popArray', 'Desapilar (pop)', 'Copia el valor de la cima en *valor y baja la cima. Devuelve 0 si la pila está vacía.', ['&valor'], 'Apilar y desapilar'),
      op('cimaArray', 'Consultar la cima', 'Copia el valor de la cima en *valor sin quitarlo.', ['&valor'], 'Consultar'),
      op('tamanoArray', 'Tamaño', 'Devuelve cuántos elementos hay: cima + 1.', [], 'Consultar'),
      op('esVaciaArray', '¿Está vacía?', 'Devuelve 1 si cima vale -1.', [], 'Consultar'),
      op('esLLenaArray', '¿Está llena?', 'Devuelve 1 si cima vale TAM - 1.', [], 'Consultar'),
      op('limpiarArray', 'Vaciar', 'Pone la cima a -1. Los valores se quedan en el array, pero ya no cuentan.', [], 'Apilar y desapilar'),
      op('CrearPilaArray', 'Crear la pila', 'Reserva el struct con malloc y deja la cima a -1.', [], 'Crear y destruir', true),
      op('destruirPilaArray', 'Destruir la pila', 'Libera el struct con free: el array va dentro, así que se va con él.', [], 'Crear y destruir'),
    ],
  },
  {
    id: 'pila-enlazada',
    nombre: 'Pila enlazada',
    corto: 'Enlazada',
    resumen: [
      'Cada elemento es un **nodo** en el montón; `cima` apunta al último que entró y cada nodo apunta al que tiene debajo.',
      'Vacía: `cima == NULL`. El struct lleva además un contador, `tamano`.',
      'No se llena nunca: push solo falla si `malloc` no consigue memoria. Pop tiene que hacer `free` del nodo.',
    ],
    struct: 'PilaEnlazada',
    enlazada: true,
    ctx: {
      structs: [
        {
          nombre: 'Nodo',
          campos: [
            { nombre: 'valor', tipo: { base: 'int', ptr: 0 } },
            { nombre: 'siguiente', tipo: { base: 'Nodo', ptr: 1 } },
          ],
        },
        {
          nombre: 'PilaEnlazada',
          campos: [
            { nombre: 'cima', tipo: { base: 'Nodo', ptr: 1 } },
            { nombre: 'tamano', tipo: { base: 'int', ptr: 0 } },
          ],
        },
      ],
    },
    src: srcEnlazada,
    archivo: 'PilaEnlazada.c',
    max: 6,
    operaciones: [
      op('pushEnlazada', 'Apilar (push)', 'Crea un nodo con malloc, lo engancha encima de la cima y lo convierte en la nueva cima.', ['valor'], 'Apilar y desapilar'),
      op('popEnlazada', 'Desapilar (pop)', 'Guarda la cima, copia su valor en *valor, baja la cima al siguiente y libera el nodo.', ['&valor'], 'Apilar y desapilar'),
      op('cimaEnlazada', 'Consultar la cima', 'Copia el valor del nodo de la cima en *valor sin quitarlo.', ['&valor'], 'Consultar'),
      op('tamanoEnlazada', 'Tamaño', 'Devuelve el contador tamano: no hace falta recorrer.', [], 'Consultar'),
      op('esVaciaEnlazada', '¿Está vacía?', 'Devuelve 1 si la cima es NULL.', [], 'Consultar'),
      op('limpiarEnlazada', 'Vaciar', 'Hace pop hasta que no quede nada: cada pop libera un nodo.', [], 'Apilar y desapilar'),
      op('CrearPilaEnlazada', 'Crear la pila', 'Reserva el struct con malloc: cima a NULL y tamano a 0.', [], 'Crear y destruir', true),
      op('destruirPilaEnlazada', 'Destruir la pila', 'Vacía la pila (libera todos los nodos) y después libera el struct.', [], 'Crear y destruir'),
    ],
  },
];

export const buscarPila = (id: string) => PILAS.find((p) => p.id === id);
