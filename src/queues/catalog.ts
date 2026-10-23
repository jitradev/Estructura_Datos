// The queues of the Colas project: the array and linked queue, the three deques (array,
// linked and output-restricted) and the two priority queues (sorted list and array of
// queues). Their structs, how an example queue is laid out in memory and which operations
// can be watched step by step. The code that runs is the one in src/queues/c, untouched.

import { Contexto } from '../memoria/modelo';
import srcColaArray from './c/ColaArray.c?raw';
import srcColaEnlazada from './c/ColaEnlazada.c?raw';
import srcBicolaArray from './c/BicolaArray.c?raw';
import srcBicolaEnlazada from './c/BicolaEnlazada.c?raw';
import srcBicolaSalida from './c/BicolaSalidaRestringida.c?raw';
import srcPrioridadLista from './c/ColaPrioridadLista.c?raw';
import srcPrioridadArray from './c/ColaPrioridadArray.c?raw';
import srcNodoSimple from './c/NodoSimple.c?raw';
import srcNodoDoble from './c/NodoDoble.c?raw';
import srcNodoPrioridad from './c/NodoPrioridad.c?raw';
import hColaArray from './h/ColaArray.h?raw';
import hBicolaArray from './h/BicolasArray.h?raw';
import hPrioridadLista from './h/ColaPrioridadLista.h?raw';
import hPrioridadArray from './h/ColaPrioridadArray.h?raw';

export type QueueId = 'cola-array' | 'cola-enlazada' | 'bicola-array' | 'bicola-enlazada' | 'bicola-salida-restringida' | 'cola-prioridad-lista' | 'cola-prioridad-array';
export type QueueFamily = 'Cola' | 'Bicola' | 'Cola con prioridad';

/** Extra argument of an operation, besides the queue. */
export type QueueArg =
  | 'x' // a number typed by the user (encolar, insertar...)
  | 'prioridad' // a priority typed by the user
  | '&x'; // the address of main's `x`

export interface QueueOp {
  fn: string; // real function name in the .c
  titulo: string;
  descripcion: string;
  args: QueueArg[];
  grupo: 'Insertar y extraer' | 'Consultar' | 'Crear y destruir';
  /** Creates the queue from scratch: main starts with an uninitialised pointer. */
  crea?: boolean;
}

export interface QueueType {
  id: QueueId;
  familia: QueueFamily;
  nombre: string;
  corto: string;
  resumen: string[];
  struct: string; // ColaArray, ColaEnlazada...
  /** Node type of the linked ones, with its fields in drawing order. */
  nodo?: { tipo: string; campos: string[] };
  /** The array of priority queues keeps one ColaEnlazada per priority. */
  subcola?: string;
  ctx: Contexto;
  src: string;
  /** Other .c files it uses (the node TAD, the queue inside the priority array). */
  otros: string[];
  /** Header with the #defines (when it has any). */
  header?: string;
  archivo: string;
  operaciones: QueueOp[];
  /** Most elements the page lets you start with. */
  max: number;
  /** Example queue, from front to back (with its priorities for the priority queues). */
  ejemplo: number[];
  prioridades?: number[];
  /** Index of the front in the example (array queues). */
  ejemploFrente?: number;
  nota?: string;
}

/** TAM_COLA_ARRAY is 10 in the code. */
export const TAM_COLA = 10;
/** TAM_BICOLA_ARRAY is 100 in the code; in the drawing it is 10, like the queue. */
export const TAM_BICOLA_DIBUJO = 10;
export const NUM_PRIORIDADES = 4;

const op = (fn: string, titulo: string, descripcion: string, args: QueueArg[], grupo: QueueOp['grupo'], crea = false): QueueOp => ({ fn, titulo, descripcion, args, grupo, crea });
const int = (nombre: string) => ({ nombre, tipo: { base: 'int', ptr: 0 } });
const ptr = (nombre: string, base: string) => ({ nombre, tipo: { base, ptr: 1 } });

const NODO_SIMPLE = { nombre: 'NodoSimple', campos: [int('valor'), ptr('siguiente', 'NodoSimple')] };
const NODO_DOBLE = { nombre: 'NodoDoble', campos: [int('valor'), ptr('anterior', 'NodoDoble'), ptr('siguiente', 'NodoDoble')] };
const NODO_PRIORIDAD = { nombre: 'NodoPrioridad', campos: [int('valor'), int('prioridad'), ptr('siguiente', 'NodoPrioridad')] };
const enlazada = (nombre: string, nodo: string) => ({ nombre, campos: [ptr('inicio', nodo), ptr('final', nodo), int('tamano')] });

/** The same operations for the two FIFO queues. */
const opsCola = (s: string, array: boolean): QueueOp[] => [
  op(
    `encolar${s}`,
    'Encolar',
    array ? 'Escribe x en la casilla final y avanza final con % TAM. Devuelve 0 si la cola está llena.' : 'Crea un nodo y lo engancha detrás del final. Si la cola estaba vacía, también es el inicio.',
    ['x'],
    'Insertar y extraer',
  ),
  op(
    `desencolar${s}`,
    'Desencolar',
    array ? 'Copia en *x el valor del frente y avanza frente con % TAM. Devuelve 0 si la cola está vacía.' : 'Copia en *x el valor del inicio, avanza el inicio al siguiente y elimina el nodo.',
    ['&x'],
    'Insertar y extraer',
  ),
  op(`frente${s}`, 'Consultar el frente', 'Copia en *x el valor del frente sin sacarlo.', ['&x'], 'Consultar'),
  op(`tamano${s}`, 'Tamaño', array ? 'Devuelve numElementos.' : 'Devuelve el contador tamano: no hace falta recorrer.', [], 'Consultar'),
  op(`estaVacia${s}`, '¿Está vacía?', array ? 'Devuelve 1 si numElementos vale 0.' : 'Devuelve 1 si el inicio es NULL.', [], 'Consultar'),
  ...(array ? [op(`estaLLena${s}`, '¿Está llena?', 'Devuelve 1 si numElementos vale TAM_COLA_ARRAY.', [], 'Consultar')] : []),
  op(
    `vaciar${s}`,
    'Vaciar',
    array ? 'Pone frente, final y numElementos a 0: los valores se quedan en el array, pero ya no cuentan.' : 'Desencola hasta que no quede nada: cada desencolar elimina un nodo.',
    [],
    'Insertar y extraer',
  ),
  op(`crear${s}`, 'Crear la cola', array ? 'Reserva el struct con malloc y pone frente, final y numElementos a 0.' : 'Reserva el struct con malloc: inicio y final a NULL y tamano a 0.', [], 'Crear y destruir', true),
  op(`destruir${s}`, 'Destruir la cola', array ? 'Vacía la cola y libera el struct: el array va dentro, así que se va con él.' : 'Vacía la cola (elimina todos los nodos) y después libera el struct.', [], 'Crear y destruir'),
];

export const COLAS: QueueType[] = [
  {
    id: 'cola-array',
    familia: 'Cola',
    nombre: 'Cola con array',
    corto: 'Con array',
    resumen: [
      'Los datos van en un **array circular**: `frente` es el índice del primero y `final` el del primer hueco libre.',
      'Los dos avanzan con `% TAM_COLA_ARRAY`, así que después de la última casilla viene la 0 y ningún elemento cambia de sitio.',
      'Llena y vacía tienen `frente == final`: lo que las distingue es el contador `numElementos`.',
    ],
    struct: 'ColaArray',
    ctx: {
      structs: [{ nombre: 'ColaArray', campos: [{ ...int('array'), arr: TAM_COLA }, int('frente'), int('final'), int('numElementos')] }],
      constantes: { TAM_COLA_ARRAY: TAM_COLA },
    },
    src: srcColaArray,
    otros: [],
    header: hColaArray,
    archivo: 'ColaArray.c',
    max: TAM_COLA,
    ejemplo: [5, 6, 7],
    ejemploFrente: 8,
    operaciones: opsCola('ColaArray', true),
  },
  {
    id: 'cola-enlazada',
    familia: 'Cola',
    nombre: 'Cola enlazada',
    corto: 'Enlazada',
    resumen: [
      'Cada elemento es un **NodoSimple** en el montón. La cola guarda **dos punteros**: `inicio`, por donde se desencola, y `final`, por donde se encola.',
      'Con uno solo, encolar obligaría a recorrer hasta el último nodo.',
      'No se llena nunca: solo la limita la memoria. Al desencolar el último, `final` vuelve a NULL.',
    ],
    struct: 'ColaEnlazada',
    nodo: { tipo: 'NodoSimple', campos: ['valor', 'siguiente'] },
    ctx: { structs: [NODO_SIMPLE, enlazada('ColaEnlazada', 'NodoSimple')] },
    src: srcColaEnlazada,
    otros: [srcNodoSimple],
    archivo: 'ColaEnlazada.c',
    max: 6,
    ejemplo: [7, 10, 11],
    operaciones: opsCola('ColaEnlazada', false),
  },
  {
    id: 'bicola-array',
    familia: 'Bicola',
    nombre: 'Bicola con array',
    corto: 'Con array',
    resumen: [
      'Se inserta y se extrae **por los dos extremos**. Es el array circular de la cola, con `frente`, `final` y `numElementos`.',
      'Por el principio, `frente` **retrocede** al insertar; por el final, `final` retrocede al eliminar.',
      'Retroceder tiene truco: `(0 - 1) % TAM` vale -1 en C, así que se suma `TAM_BICOLA_ARRAY` antes del módulo.',
    ],
    struct: 'BicolaArray',
    ctx: {
      structs: [{ nombre: 'BicolaArray', campos: [{ ...int('array'), arr: TAM_BICOLA_DIBUJO }, int('frente'), int('final'), int('numElementos')] }],
      constantes: { TAM_BICOLA_ARRAY: TAM_BICOLA_DIBUJO },
    },
    src: srcBicolaArray,
    otros: [],
    header: hBicolaArray,
    archivo: 'BicolaArray.c',
    max: TAM_BICOLA_DIBUJO,
    ejemplo: [9, 7, 3],
    ejemploFrente: 0,
    nota: `En el código \`TAM_BICOLA_ARRAY\` vale 100; aquí vale ${TAM_BICOLA_DIBUJO} para que el array quepa entero en el dibujo y se vea la vuelta.`,
    operaciones: [
      op('insertarPrincipioBicolaArray', 'Insertar al principio', 'Retrocede frente una casilla (sumando TAM antes del %) y escribe x ahí. Devuelve 0 si está llena.', ['x'], 'Insertar y extraer'),
      op('insertarFinalBicolaArray', 'Insertar al final', 'Escribe x en la casilla final y avanza final, como encolar.', ['x'], 'Insertar y extraer'),
      op('eliminarPrincipioBicolaArray', 'Eliminar del principio', 'Copia en *x el valor del frente y avanza frente, como desencolar.', ['&x'], 'Insertar y extraer'),
      op('eliminarFinalBicolaArray', 'Eliminar del final', 'Retrocede final (sumando TAM antes del %) y copia en *x el valor de esa casilla.', ['&x'], 'Insertar y extraer'),
      op('principioBicolaArray', 'Consultar el principio', 'Copia en *x el valor del frente sin sacarlo.', ['&x'], 'Consultar'),
      op('finalBicolaArray', 'Consultar el final', 'Copia en *x el último: el de la casilla anterior a final.', ['&x'], 'Consultar'),
      op('tamanoBicolaArray', 'Tamaño', 'Devuelve numElementos.', [], 'Consultar'),
      op('estaVaciaBicolaArray', '¿Está vacía?', 'Devuelve 1 si numElementos vale 0.', [], 'Consultar'),
      op('estaLLenaBicolaArray', '¿Está llena?', 'Devuelve 1 si numElementos vale TAM_BICOLA_ARRAY.', [], 'Consultar'),
      op('vaciarBicolaArray', 'Vaciar', 'Pone frente, final y numElementos a 0.', [], 'Insertar y extraer'),
      op('crearBicolaArray', 'Crear la bicola', 'Reserva el struct con malloc y pone frente, final y numElementos a 0.', [], 'Crear y destruir', true),
      op('destruirBicolaArray', 'Destruir la bicola', 'Vacía la bicola y libera el struct.', [], 'Crear y destruir'),
    ],
  },
  {
    id: 'bicola-enlazada',
    familia: 'Bicola',
    nombre: 'Bicola enlazada',
    corto: 'Enlazada',
    resumen: [
      'Es una **lista doblemente enlazada** de `NodoDoble` con `inicio` y `final`: cada nodo sabe cuál tiene delante (`anterior`) y cuál detrás (`siguiente`).',
      'Con una lista simple, eliminar del final obligaría a recorrer hasta el penúltimo. Con `anterior`, el penúltimo es el anterior del final.',
      'Los cuatro extremos se manejan sin recorrer nada. No se llena nunca.',
    ],
    struct: 'BicolaEnlazada',
    nodo: { tipo: 'NodoDoble', campos: ['anterior', 'valor', 'siguiente'] },
    ctx: { structs: [NODO_DOBLE, enlazada('BicolaEnlazada', 'NodoDoble')] },
    src: srcBicolaEnlazada,
    otros: [srcNodoDoble],
    archivo: 'BicolaEnlazada.c',
    max: 5,
    ejemplo: [9, 7, 3],
    operaciones: [
      op('insertarPrincipioBicolaEnlazada', 'Insertar al principio', 'Crea un nodo, lo engancha delante del inicio (el viejo inicio apunta atrás a él) y lo convierte en el inicio.', ['x'], 'Insertar y extraer'),
      op('insertarFinalBicolaEnlazada', 'Insertar al final', 'El espejo: el nodo nuevo apunta atrás al final, el final apunta adelante al nuevo y el nuevo pasa a ser el final.', ['x'], 'Insertar y extraer'),
      op('eliminarPrincipioBicolaEnlazada', 'Eliminar del principio', 'Copia el valor, avanza el inicio, deja su anterior a NULL y elimina el nodo.', ['&x'], 'Insertar y extraer'),
      op('eliminarFinalBicolaEnlazada', 'Eliminar del final', 'Copia el valor, retrocede el final con su anterior (sin recorrer), deja su siguiente a NULL y elimina el nodo.', ['&x'], 'Insertar y extraer'),
      op('principioBicolaEnlazada', 'Consultar el principio', 'Copia en *x el valor del inicio.', ['&x'], 'Consultar'),
      op('finalBicolaEnlazada', 'Consultar el final', 'Copia en *x el valor del final.', ['&x'], 'Consultar'),
      op('tamanoBicolaEnlazada', 'Tamaño', 'Devuelve el contador tamano.', [], 'Consultar'),
      op('estaVaciaBicolaEnlazada', '¿Está vacía?', 'Devuelve 1 si el inicio es NULL.', [], 'Consultar'),
      op('vaciarBicolaEnlazada', 'Vaciar', 'Elimina del principio hasta vaciarla: cada vez se elimina un nodo.', [], 'Insertar y extraer'),
      op('crearBicolaEnlazada', 'Crear la bicola', 'Reserva el struct con malloc: inicio y final a NULL y tamano a 0.', [], 'Crear y destruir', true),
      op('destruirBicolaEnlazada', 'Destruir la bicola', 'Vacía la bicola y después libera el struct.', [], 'Crear y destruir'),
    ],
  },
  {
    id: 'bicola-salida-restringida',
    familia: 'Bicola',
    nombre: 'Bicola de salida restringida',
    corto: 'Salida restringida',
    resumen: [
      'Una bicola con una sola puerta de salida: **entra por los dos extremos y sale solo por el principio**.',
      'Basta una **lista simple** de `NodoSimple` con `inicio` y `final`: insertar al final es como encolar e insertar al principio es enganchar delante del inicio.',
      'No hace falta `anterior`: lo único que lo necesitaría es eliminar del final, y esta bicola no lo hace.',
    ],
    struct: 'BicolaSalidaRestringida',
    nodo: { tipo: 'NodoSimple', campos: ['valor', 'siguiente'] },
    ctx: { structs: [NODO_SIMPLE, enlazada('BicolaSalidaRestringida', 'NodoSimple')] },
    src: srcBicolaSalida,
    otros: [srcNodoSimple],
    archivo: 'BicolaSalidaRestringida.c',
    max: 6,
    ejemplo: [0, 1, 2],
    operaciones: [
      op('insertarPrincipioBicolaSalidaRestringida', 'Insertar al principio', 'Crea un nodo que apunta al inicio y lo convierte en el inicio. Si estaba vacía, también es el final.', ['x'], 'Insertar y extraer'),
      op('insertarFinalBicolaSalidaRestringida', 'Insertar al final', 'Crea un nodo y lo engancha detrás del final, como encolar.', ['x'], 'Insertar y extraer'),
      op('eliminarPrincipioBicolaSalidaRestringida', 'Eliminar del principio', 'La única salida: copia el valor del inicio, avanza el inicio y elimina el nodo.', ['&x'], 'Insertar y extraer'),
      op('principioBicolaSalidaRestringida', 'Consultar el principio', 'Copia en *x el valor del inicio sin sacarlo.', ['&x'], 'Consultar'),
      op('tamanoBicolaSalidaRestringida', 'Tamaño', 'Devuelve el contador tamano.', [], 'Consultar'),
      op('estaVaciaBicolaSalidaRestringida', '¿Está vacía?', 'Devuelve 1 si el inicio es NULL.', [], 'Consultar'),
      op('vaciarBicolaSalidaRestringida', 'Vaciar', 'Elimina del principio hasta vaciarla.', [], 'Insertar y extraer'),
      op('crearBicolaSalidaRestringida', 'Crear la bicola', 'Reserva el struct con malloc: inicio y final a NULL y tamano a 0.', [], 'Crear y destruir', true),
      op('destruirBicolaSalidaRestringida', 'Destruir la bicola', 'Vacía la bicola y después libera el struct.', [], 'Crear y destruir'),
    ],
  },
  {
    id: 'cola-prioridad-lista',
    familia: 'Cola con prioridad',
    nombre: 'Cola con prioridad (lista)',
    corto: 'Lista ordenada',
    resumen: [
      'Cada elemento lleva una **prioridad** de 0 a `NUM_PRIORIDADES - 1`, y 0 es la más alta. Sale siempre el de prioridad más alta.',
      'Va en una sola **lista de `NodoPrioridad`, ordenada al insertar**: desencolar es directo (sale el inicio) y el trabajo está en encolar, que busca el hueco con `anterior` y `actual`.',
      'Es **estable**: entre los de la misma prioridad sale antes el que llegó antes, porque el nuevo va detrás de sus iguales (`<=`, no `<`).',
    ],
    struct: 'ColaPrioridadLista',
    nodo: { tipo: 'NodoPrioridad', campos: ['valor', 'prioridad', 'siguiente'] },
    ctx: {
      structs: [NODO_PRIORIDAD, { nombre: 'ColaPrioridadLista', campos: [ptr('inicio', 'NodoPrioridad'), int('tamano')] }],
      constantes: { NUM_PRIORIDADES },
    },
    src: srcPrioridadLista,
    otros: [srcNodoPrioridad],
    header: hPrioridadLista,
    archivo: 'ColaPrioridadLista.c',
    max: 5,
    ejemplo: [30, 10, 40],
    prioridades: [0, 1, 1],
    operaciones: [
      op('encolarColaPrioridadLista', 'Encolar con prioridad', 'Avanza anterior y actual mientras la prioridad sea <= que la suya y engancha el nodo nuevo entre los dos.', ['x', 'prioridad'], 'Insertar y extraer'),
      op('desencolarColaPrioridadLista', 'Desencolar', 'Sale siempre el inicio: copia su valor en *x, avanza el inicio y elimina el nodo.', ['&x'], 'Insertar y extraer'),
      op('frenteColaPrioridadLista', 'Consultar el frente', 'Copia en *x el valor del inicio: la lista está ordenada, así que es el más prioritario.', ['&x'], 'Consultar'),
      op('tamanoColaPrioridadLista', 'Tamaño', 'Devuelve el contador tamano.', [], 'Consultar'),
      op('estaVaciaColaPrioridadLista', '¿Está vacía?', 'Devuelve 1 si el inicio es NULL.', [], 'Consultar'),
      op('vaciarColaPrioridadLista', 'Vaciar', 'Desencola hasta vaciarla: cada desencolar elimina un nodo.', [], 'Insertar y extraer'),
      op('crearColaPrioridadLista', 'Crear la cola', 'Reserva el struct con malloc: inicio a NULL y tamano a 0.', [], 'Crear y destruir', true),
      op('destruirColaPrioridadLista', 'Destruir la cola', 'Vacía la cola y después libera el struct.', [], 'Crear y destruir'),
    ],
  },
  {
    id: 'cola-prioridad-array',
    familia: 'Cola con prioridad',
    nombre: 'Cola con prioridad (array de colas)',
    corto: 'Array de colas',
    resumen: [
      'Un **array de colas enlazadas**, una por prioridad (`NUM_PRIORIDADES` en total): la prioridad es el índice, así que no se compara nada.',
      'Encolar es directo: al final de la cola de su prioridad. Desencolar mira las colas de la 0 en adelante hasta dar con una que no esté vacía.',
      'La estabilidad viene puesta, porque cada cola ya es FIFO. Cada `ColaEnlazada` se crea con su propio `malloc` al crear la cola.',
    ],
    struct: 'ColaPrioridadArray',
    nodo: { tipo: 'NodoSimple', campos: ['valor', 'siguiente'] },
    subcola: 'ColaEnlazada',
    ctx: {
      structs: [
        NODO_SIMPLE,
        enlazada('ColaEnlazada', 'NodoSimple'),
        { nombre: 'ColaPrioridadArray', campos: [{ ...ptr('colas', 'ColaEnlazada'), arr: NUM_PRIORIDADES }, int('tamano')] },
      ],
      constantes: { NUM_PRIORIDADES },
    },
    src: srcPrioridadArray,
    otros: [srcColaEnlazada, srcNodoSimple],
    header: hPrioridadArray,
    archivo: 'ColaPrioridadArray.c',
    max: 6,
    ejemplo: [30, 10, 40, 20],
    prioridades: [0, 1, 1, 3],
    operaciones: [
      op('encolarColaPrioridadArray', 'Encolar con prioridad', 'Encola x al final de la cola de su prioridad, colas[prioridad], y suma 1 al tamaño.', ['x', 'prioridad'], 'Insertar y extraer'),
      op('desencolarColaPrioridadArray', 'Desencolar', 'Busca desde la prioridad 0 la primera cola que no esté vacía y desencola de ella.', ['&x'], 'Insertar y extraer'),
      op('frenteColaPrioridadArray', 'Consultar el frente', 'Como desencolar, pero consulta el frente de esa cola sin sacarlo.', ['&x'], 'Consultar'),
      op('tamanoColaPrioridadArray', 'Tamaño', 'Devuelve el contador tamano: la suma de todas las colas.', [], 'Consultar'),
      op('estaVaciaColaPrioridadArray', '¿Está vacía?', 'Devuelve 1 si tamano vale 0.', [], 'Consultar'),
      op('vaciarColaPrioridadArray', 'Vaciar', 'Vacía cada una de las colas y pone tamano a 0. Las colas siguen existiendo.', [], 'Insertar y extraer'),
      op('crearColaPrioridadArray', 'Crear la cola', 'Reserva el struct y crea una ColaEnlazada por prioridad. Si alguna falla, destruye las ya creadas.', [], 'Crear y destruir', true),
      op('destruirColaPrioridadArray', 'Destruir la cola', 'Destruye cada ColaEnlazada (con sus nodos) y después libera el struct.', [], 'Crear y destruir'),
    ],
  },
];

export const buscarCola = (id: string) => COLAS.find((c) => c.id === id);
export const FAMILIAS: QueueFamily[] = ['Cola', 'Bicola', 'Cola con prioridad'];
