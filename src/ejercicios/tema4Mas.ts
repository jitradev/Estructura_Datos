// Topic 4, second batch: more exercises on the same ColaArray.c and ColaEnlazada.c.

import { colaArray, colaEnlazada, CTX_COLA_ARRAY, CTX_COLA_ENLAZADA, entero } from '../memoria/construir';
import { c } from './sangrado';
import { EjCodigo } from './tipos';

const CA = CTX_COLA_ARRAY;
const CE = CTX_COLA_ENLAZADA;
const LLENA = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const EJERCICIOS_COLAS_MAS: EjCodigo[] = [
  // ------------------------------------------------------------ a mano
  {
    id: '4-14',
    tipo: 'programar',
    titulo: 'Mirar el frente, a mano',
    enunciado: 'Guarda en `valor` el primero de la cola, sin sacarlo y sin llamar a `frenteColaArray` ni a `desencolarColaArray`.',
    pistas: ['El primero no está en la casilla 0: está en la casilla `frente`.'],
    ctx: CA,
    casos: [{ nombre: 'Cola 8 4 desde la casilla 3', inicial: [colaArray('cola', [8, 4], 3), entero('valor')] }],
    observar: ['cola', 'valor'],
    prohibidos: ['frenteColaArray()', 'desencolarColaArray()'],
    solucion: 'valor = cola->array[cola->frente];',
  },
  {
    id: '4-15',
    tipo: 'programar',
    titulo: 'Dejar la cola como nueva, a mano',
    enunciado: 'Deja `cola` como recién creada: sin elementos y con `frente` y `final` en 0. Sin llamar a `vaciarColaArray` ni a `desencolarColaArray`.',
    alResolver: 'Los valores siguen escritos en el array, pero `numElementos` dice que no hay ninguno.',
    ctx: CA,
    casos: [{ nombre: 'Cola 8 4 desde la casilla 3', inicial: [colaArray('cola', [8, 4], 3)] }],
    observar: ['cola'],
    prohibidos: ['vaciarColaArray()', 'desencolarColaArray()'],
    solucion: c(`
      cola->frente = 0;
      cola->final = 0;
      cola->numElementos = 0;`),
  },
  {
    id: '4-16',
    tipo: 'programar',
    titulo: 'Leer el último sin recorrer',
    enunciado: 'Guarda en `valor` el último de la cola enlazada. No hace falta ningún bucle.',
    alResolver: 'Para eso lleva la cola un puntero `final`: encolar y mirar el último cuestan O(1).',
    ctx: CE,
    casos: [{ nombre: 'Cola 1 2 3', inicial: [colaEnlazada('cola', [1, 2, 3]), entero('valor')] }],
    observar: ['cola', 'valor'],
    solucion: 'valor = obtenerValorNodoSimple(cola->final);',
  },
  {
    id: '4-17',
    tipo: 'programar',
    titulo: 'Quitar los dos primeros, a mano',
    enunciado: 'Quita los dos primeros de la cola sin llamar a `desencolarColaEnlazada` ni a `vaciarColaEnlazada`. Libera los nodos con `eliminarNodoSimple` y mantén `tamano` al día.',
    pistas: ['Mueve `cola->inicio` antes de eliminar cada nodo.'],
    ctx: CE,
    casos: [{ nombre: 'Cola 1 2 3', inicial: [colaEnlazada('cola', [1, 2, 3])] }],
    observar: ['cola'],
    prohibidos: ['desencolarColaEnlazada()', 'vaciarColaEnlazada()'],
    solucion: c(`
      NodoSimple *borrar = cola->inicio;
      cola->inicio = obtenerSiguienteNodoSimple(borrar);
      eliminarNodoSimple(borrar);
      borrar = cola->inicio;
      cola->inicio = obtenerSiguienteNodoSimple(borrar);
      eliminarNodoSimple(borrar);
      cola->tamano = cola->tamano - 2;`),
  },
  {
    id: '4-18',
    tipo: 'programar',
    titulo: 'Pasar el primero a otra cola, con array',
    enunciado: 'Saca el primero de `cola` y ponlo el último de `cola2`, usando `desencolarColaArray` y `encolarColaArray`.',
    ctx: CA,
    casos: [{ nombre: 'cola = 1 2 3, cola2 = 7', inicial: [colaArray('cola', [1, 2, 3]), colaArray('cola2', [7], 4)] }],
    observar: ['cola', 'cola2'],
    codigoInicial: 'int aux = 0;\n',
    solucion: c(`
      int aux = 0;
      desencolarColaArray(cola, &aux);
      encolarColaArray(cola2, aux);`),
  },
  {
    id: '4-19',
    tipo: 'programar',
    titulo: 'Pasar el primero a otra cola, moviendo el nodo',
    enunciado: 'Lleva el primer nodo de `cola` al final de `cola2` sin crear ni eliminar nodos y sin cambiar ningún valor: solo moviendo enlaces.',
    pistas: ['Descuélgalo de `cola` y deja su `siguiente` a NULL: va a ser el último.', 'Cambian los dos `tamano`.'],
    ctx: CE,
    casos: [{ nombre: 'cola = 1 2 3, cola2 = 7', inicial: [colaEnlazada('cola', [1, 2, 3]), colaEnlazada('cola2', [7])] }],
    observar: ['cola', 'cola2'],
    prohibidos: ['valor', 'crearNodoSimple()', 'eliminarNodoSimple()', 'establecerValorNodoSimple()', 'encolarColaEnlazada()', 'desencolarColaEnlazada()'],
    solucion: c(`
      NodoSimple *n = cola->inicio;
      cola->inicio = obtenerSiguienteNodoSimple(n);
      cola->tamano--;
      establecerSiguienteNodoSimple(n, NULL);
      establecerSiguienteNodoSimple(cola2->final, n);
      cola2->final = n;
      cola2->tamano++;`),
  },

  // ------------------------------------------------------------ funciones
  {
    id: '4-20',
    tipo: 'programar',
    titulo: 'Escribe ultimoColaArray',
    enunciado: 'Completa `ultimoColaArray`: deja en `*x` el último de la cola y devuelve 1; si está vacía, devuelve 0 sin tocar `*x`. Recuerda que `final` es la casilla **libre** siguiente al último.',
    pistas: ['Un paso atrás desde `final`. Si `final` es 0, ese paso da la vuelta.', 'Sumar `TAM_COLA_ARRAY` antes del `%` evita los negativos.'],
    ctx: CA,
    casos: [
      { nombre: 'Cola 1 2', inicial: [colaArray('cola', [1, 2]), entero('x', 0)], llamada: 'ultimoColaArray(cola, &x)' },
      { nombre: 'Cola 8 4, final en la casilla 0', inicial: [colaArray('cola', [8, 4], 8), entero('x', 0)], llamada: 'ultimoColaArray(cola, &x)' },
      { nombre: 'Vacía', inicial: [colaArray('cola', [], 3), entero('x', 5)], llamada: 'ultimoColaArray(cola, &x)' },
    ],
    observar: ['cola', 'x'],
    codigoInicial: c(`
      int ultimoColaArray(ColaArray *cola, int *x) {

      }`),
    solucion: c(`
      int ultimoColaArray(ColaArray *cola, int *x) {
          if (estaVaciaColaArray(cola) == 1) return 0;
          *x = cola->array[(cola->final - 1 + TAM_COLA_ARRAY) % TAM_COLA_ARRAY];
          return 1;
      }`),
  },
  {
    id: '4-21',
    tipo: 'programar',
    titulo: 'Escribe maximoColaArray',
    enunciado: 'Completa `maximoColaArray`: devuelve el mayor de la cola, sin cambiarla. La cola nunca está vacía. Ojo con lo que queda escrito fuera de la cola.',
    pistas: ['Recorre `numElementos` casillas desde `frente`, dando la vuelta con `%`.'],
    ctx: CA,
    casos: [
      { nombre: 'Cola 3 9 4', inicial: [colaArray('cola', [3, 9, 4])], llamada: 'maximoColaArray(cola)' },
      { nombre: 'Cola 2 6 5 dando la vuelta', inicial: [colaArray('cola', [2, 6, 5], 8)], llamada: 'maximoColaArray(cola)' },
      { nombre: 'Cola 4 1, con un 9 de resto', inicial: [colaArray('cola', [4, 1], 3, { 2: 9 })], llamada: 'maximoColaArray(cola)' },
    ],
    observar: ['cola'],
    codigoInicial: c(`
      int maximoColaArray(ColaArray *cola) {

      }`),
    solucion: c(`
      int maximoColaArray(ColaArray *cola) {
          int m = cola->array[cola->frente];
          for (int i = 1; i < cola->numElementos; i++) {
              int v = cola->array[(cola->frente + i) % TAM_COLA_ARRAY];
              if (v > m) m = v;
          }
          return m;
      }`),
  },
  {
    id: '4-22',
    tipo: 'programar',
    titulo: 'Escribe iesimoColaArray',
    enunciado: 'Completa `iesimoColaArray`: deja en `*x` el elemento que hace `i` contando desde el frente (el frente es el 0) y devuelve 1. Si no hay tantos, devuelve 0 sin tocar `*x`.',
    ctx: CA,
    casos: [
      { nombre: 'Cola 2 6 5, i = 0', inicial: [colaArray('cola', [2, 6, 5], 8), entero('x', 0)], llamada: 'iesimoColaArray(cola, 0, &x)' },
      { nombre: 'Cola 2 6 5, i = 2', inicial: [colaArray('cola', [2, 6, 5], 8), entero('x', 0)], llamada: 'iesimoColaArray(cola, 2, &x)' },
      { nombre: 'Cola 2 6 5, i = 3', inicial: [colaArray('cola', [2, 6, 5], 8), entero('x', 0)], llamada: 'iesimoColaArray(cola, 3, &x)' },
    ],
    observar: ['cola', 'x'],
    codigoInicial: c(`
      int iesimoColaArray(ColaArray *cola, int i, int *x) {

      }`),
    solucion: c(`
      int iesimoColaArray(ColaArray *cola, int i, int *x) {
          if (i < 0 || i >= cola->numElementos) return 0;
          *x = cola->array[(cola->frente + i) % TAM_COLA_ARRAY];
          return 1;
      }`),
  },
  {
    id: '4-23',
    tipo: 'programar',
    titulo: 'Escribe contarColaEnlazada',
    enunciado: 'Completa `contarColaEnlazada`: devuelve cuántos nodos tiene la cola recorriéndolos, sin mirar `tamano`.',
    ctx: CE,
    casos: [
      { nombre: 'Cola 1 2 3', inicial: [colaEnlazada('cola', [1, 2, 3])], llamada: 'contarColaEnlazada(cola)' },
      { nombre: 'Cola 7', inicial: [colaEnlazada('cola', [7])], llamada: 'contarColaEnlazada(cola)' },
      { nombre: 'Vacía', inicial: [colaEnlazada('cola', [])], llamada: 'contarColaEnlazada(cola)' },
    ],
    observar: ['cola'],
    prohibidos: ['tamanoColaEnlazada()'],
    codigoInicial: c(`
      int contarColaEnlazada(ColaEnlazada *cola) {

      }`),
    solucion: c(`
      int contarColaEnlazada(ColaEnlazada *cola) {
          int n = 0;
          NodoSimple *p = cola->inicio;
          while (p != NULL) {
              n++;
              p = obtenerSiguienteNodoSimple(p);
          }
          return n;
      }`),
  },
  {
    id: '4-24',
    tipo: 'programar',
    titulo: 'Escribe buscarColaEnlazada',
    enunciado: 'Completa `buscarColaEnlazada`: devuelve la posición de `x` contando desde el inicio (el primero es el 0), o -1 si no está. La cola no cambia.',
    ctx: CE,
    casos: [
      { nombre: 'Cola 4 9 2, x = 4', inicial: [colaEnlazada('cola', [4, 9, 2])], llamada: 'buscarColaEnlazada(cola, 4)' },
      { nombre: 'Cola 4 9 2, x = 2', inicial: [colaEnlazada('cola', [4, 9, 2])], llamada: 'buscarColaEnlazada(cola, 2)' },
      { nombre: 'Cola 4 9 2, x = 5', inicial: [colaEnlazada('cola', [4, 9, 2])], llamada: 'buscarColaEnlazada(cola, 5)' },
      { nombre: 'Vacía', inicial: [colaEnlazada('cola', [])], llamada: 'buscarColaEnlazada(cola, 5)' },
    ],
    observar: ['cola'],
    codigoInicial: c(`
      int buscarColaEnlazada(ColaEnlazada *cola, int x) {

      }`),
    solucion: c(`
      int buscarColaEnlazada(ColaEnlazada *cola, int x) {
          int i = 0;
          NodoSimple *p = cola->inicio;
          while (p != NULL) {
              if (obtenerValorNodoSimple(p) == x) return i;
              i++;
              p = obtenerSiguienteNodoSimple(p);
          }
          return -1;
      }`),
  },
  {
    id: '4-25',
    tipo: 'programar',
    titulo: 'Escribe colarColaEnlazada',
    enunciado: 'Completa `colarColaEnlazada`: mete `x` por delante de todos y devuelve 1. Piensa qué pasa con `final` si la cola estaba vacía.',
    alResolver: 'Meter por delante ya no es una cola: es el principio de una bicola.',
    ctx: CE,
    casos: [
      { nombre: 'Cola 1 2', inicial: [colaEnlazada('cola', [1, 2])], llamada: 'colarColaEnlazada(cola, 9)' },
      { nombre: 'Vacía', inicial: [colaEnlazada('cola', [])], llamada: 'colarColaEnlazada(cola, 9)' },
    ],
    observar: ['cola'],
    codigoInicial: c(`
      int colarColaEnlazada(ColaEnlazada *cola, int x) {

      }`),
    solucion: c(`
      int colarColaEnlazada(ColaEnlazada *cola, int x) {
          NodoSimple *aux = crearNodoSimple(x);
          if (estaVaciaColaEnlazada(cola) == 1) {
              cola->final = aux;
          } else {
              establecerSiguienteNodoSimple(aux, cola->inicio);
          }
          cola->inicio = aux;
          cola->tamano++;
          return 1;
      }`),
  },
  {
    id: '4-26',
    tipo: 'programar',
    titulo: 'Escribe invertirColaEnlazada',
    enunciado: 'Completa `invertirColaEnlazada`: da la vuelta a la cola moviendo enlaces, sin crear ni eliminar nodos. No olvides que hay dos punteros que cuidar.',
    pistas: ['El antiguo `inicio` es el nuevo `final`: guárdalo antes de empezar.'],
    ctx: CE,
    casos: [
      { nombre: 'Cola 1 2 3', inicial: [colaEnlazada('cola', [1, 2, 3])], llamada: 'invertirColaEnlazada(cola)' },
      { nombre: 'Cola 7', inicial: [colaEnlazada('cola', [7])], llamada: 'invertirColaEnlazada(cola)' },
      { nombre: 'Vacía', inicial: [colaEnlazada('cola', [])], llamada: 'invertirColaEnlazada(cola)' },
    ],
    observar: ['cola'],
    prohibidos: ['valor', 'crearNodoSimple()', 'eliminarNodoSimple()', 'encolarColaEnlazada()', 'desencolarColaEnlazada()'],
    codigoInicial: c(`
      void invertirColaEnlazada(ColaEnlazada *cola) {

      }`),
    solucion: c(`
      void invertirColaEnlazada(ColaEnlazada *cola) {
          NodoSimple *ant = NULL;
          NodoSimple *p = cola->inicio;
          cola->final = p;
          while (p != NULL) {
              NodoSimple *sig = obtenerSiguienteNodoSimple(p);
              establecerSiguienteNodoSimple(p, ant);
              ant = p;
              p = sig;
          }
          cola->inicio = ant;
      }`),
  },

  // ------------------------------------------------------------ fallos
  {
    id: '4-F11',
    tipo: 'fallo',
    titulo: 'tamanoColaArray que resta índices',
    enunciado: 'Alguien ha pensado que el contador sobra.',
    ctx: CA,
    casos: [
      { nombre: 'Cola 1 2 3', inicial: [colaArray('cola', [1, 2, 3])], llamada: 'tamanoColaArray(cola)' },
      { nombre: 'Cola 8 4 dando la vuelta', inicial: [colaArray('cola', [8, 4], 9)], llamada: 'tamanoColaArray(cola)' },
    ],
    observar: ['cola'],
    codigo: c(`
      int tamanoColaArray(ColaArray *cola) {
          return cola->final - cola->frente;
      }`),
    lineasFallo: [2],
    tiposFallo: ['caso'],
    explicacion: 'Cuando la cola da la vuelta, `final` queda por detrás de `frente` y la resta sale negativa. Y con la cola llena sale 0. Para eso está `numElementos`.',
    solucion: c(`
      int tamanoColaArray(ColaArray *cola) {
          return cola->numElementos;
      }`),
  },
  {
    id: '4-F12',
    tipo: 'fallo',
    titulo: 'estaVaciaColaArray sin contador',
    enunciado: 'Alguien ha reescrito `estaVaciaColaArray` mirando solo los índices. `desencolarColaArray` está bien, pero depende de ella.',
    ctx: CA,
    casos: [
      { nombre: 'Cola 8 4', inicial: [colaArray('cola', [8, 4], 1), entero('x', 0)], llamada: 'desencolarColaArray(cola, &x)' },
      { nombre: 'Llena', inicial: [colaArray('cola', LLENA), entero('x', 0)], llamada: 'desencolarColaArray(cola, &x)' },
    ],
    observar: ['cola', 'x'],
    codigo: c(`
      int estaVaciaColaArray(ColaArray *cola) {
          if(cola->frente == cola->final) {
              return 1;
          }
          return 0;
      }

      int desencolarColaArray(ColaArray *cola, int *x) {
          if(estaVaciaColaArray(cola) == 1) return 0;
          *x = cola->array[cola->frente];
          cola->frente = (cola->frente + 1) % TAM_COLA_ARRAY;
          cola->numElementos--;
          return 1;
      }`),
    lineasFallo: [2],
    tiposFallo: ['caso'],
    explicacion: 'Con la cola llena, `final` ha dado la vuelta y coincide con `frente`, igual que con la cola vacía. Solo el contador las distingue: vacía es `cola->numElementos == 0`.',
    solucion: c(`
      int estaVaciaColaArray(ColaArray *cola) {
          if(cola->numElementos == 0) {
              return 1;
          }
          return 0;
      }

      int desencolarColaArray(ColaArray *cola, int *x) {
          if(estaVaciaColaArray(cola) == 1) return 0;
          *x = cola->array[cola->frente];
          cola->frente = (cola->frente + 1) % TAM_COLA_ARRAY;
          cola->numElementos--;
          return 1;
      }`),
  },
  {
    id: '4-F13',
    tipo: 'fallo',
    titulo: 'frenteColaArray que avanza',
    enunciado: 'Mirar el frente no debería cambiar la cola.',
    ctx: CA,
    casos: [
      { nombre: 'Vacía', inicial: [colaArray('cola', [], 2), entero('x', 0)], llamada: 'frenteColaArray(cola, &x)' },
      { nombre: 'Cola 8 4', inicial: [colaArray('cola', [8, 4], 1), entero('x', 0)], llamada: 'frenteColaArray(cola, &x)' },
    ],
    observar: ['cola', 'x'],
    codigo: c(`
      int frenteColaArray(ColaArray *cola, int *x) {
          if(estaVaciaColaArray(cola) == 1) return 0;
          *x = cola->array[cola->frente];
          cola->frente = (cola->frente + 1) % TAM_COLA_ARRAY;
          return 1;
      }`),
    lineasFallo: [4],
    tiposFallo: ['caso'],
    explicacion: 'Esa línea es de `desencolarColaArray`. Aquí sobra, y encima deja `frente` y `numElementos` sin cuadrar: el contador dice 2 y el frente ya ha saltado uno.',
    solucion: c(`
      int frenteColaArray(ColaArray *cola, int *x) {
          if(estaVaciaColaArray(cola) == 1) return 0;
          *x = cola->array[cola->frente];
          return 1;
      }`),
  },
  {
    id: '4-F14',
    tipo: 'fallo',
    titulo: 'iesimoColaArray que no da la vuelta',
    enunciado: 'Con la cola al principio del array funciona bien.',
    ctx: CA,
    casos: [
      { nombre: 'Cola 2 6 5, i = 2', inicial: [colaArray('cola', [2, 6, 5]), entero('x', 0)], llamada: 'iesimoColaArray(cola, 2, &x)' },
      { nombre: 'Cola 2 6 5 dando la vuelta, i = 2', inicial: [colaArray('cola', [2, 6, 5], 8), entero('x', 0)], llamada: 'iesimoColaArray(cola, 2, &x)' },
    ],
    observar: ['cola', 'x'],
    codigo: c(`
      int iesimoColaArray(ColaArray *cola, int i, int *x) {
          if (i < 0 || i >= cola->numElementos) return 0;
          *x = cola->array[cola->frente + i];
          return 1;
      }`),
    lineasFallo: [3],
    tiposFallo: ['array'],
    explicacion: 'Sin el `%`, `frente + i` se sale del array cuando la cola da la vuelta. Es el mismo cálculo de siempre: `(cola->frente + i) % TAM_COLA_ARRAY`.',
    solucion: c(`
      int iesimoColaArray(ColaArray *cola, int i, int *x) {
          if (i < 0 || i >= cola->numElementos) return 0;
          *x = cola->array[(cola->frente + i) % TAM_COLA_ARRAY];
          return 1;
      }`),
  },
  {
    id: '4-F15',
    tipo: 'fallo',
    titulo: 'ultimoColaArray que retrocede de más',
    enunciado: 'Da la vuelta hacia delante, así que hacia atrás también, ¿no?',
    ctx: CA,
    casos: [
      { nombre: 'Cola 1 2', inicial: [colaArray('cola', [1, 2]), entero('x', 0)], llamada: 'ultimoColaArray(cola, &x)' },
      { nombre: 'Cola 8 4, final en la casilla 0', inicial: [colaArray('cola', [8, 4], 8), entero('x', 0)], llamada: 'ultimoColaArray(cola, &x)' },
    ],
    observar: ['cola', 'x'],
    codigo: c(`
      int ultimoColaArray(ColaArray *cola, int *x) {
          if (estaVaciaColaArray(cola) == 1) return 0;
          *x = cola->array[(cola->final - 1) % TAM_COLA_ARRAY];
          return 1;
      }`),
    lineasFallo: [3],
    tiposFallo: ['array'],
    explicacion: 'En C, `-1 % 10` da -1, no 9. Con `final` en 0 se lee `array[-1]`. Hay que sumar el tamaño antes: `(cola->final - 1 + TAM_COLA_ARRAY) % TAM_COLA_ARRAY`.',
    solucion: c(`
      int ultimoColaArray(ColaArray *cola, int *x) {
          if (estaVaciaColaArray(cola) == 1) return 0;
          *x = cola->array[(cola->final - 1 + TAM_COLA_ARRAY) % TAM_COLA_ARRAY];
          return 1;
      }`),
  },
  {
    id: '4-F16',
    tipo: 'fallo',
    titulo: 'contarColaEnlazada que para antes',
    enunciado: 'Aprovecha que la cola sabe cuál es su último nodo.',
    ctx: CE,
    casos: [
      { nombre: 'Vacía', inicial: [colaEnlazada('cola', [])], llamada: 'contarColaEnlazada(cola)' },
      { nombre: 'Cola 1 2 3', inicial: [colaEnlazada('cola', [1, 2, 3])], llamada: 'contarColaEnlazada(cola)' },
    ],
    observar: ['cola'],
    codigo: c(`
      int contarColaEnlazada(ColaEnlazada *cola) {
          int n = 0;
          NodoSimple *p = cola->inicio;
          while (p != cola->final) {
              n++;
              p = obtenerSiguienteNodoSimple(p);
          }
          return n;
      }`),
    lineasFallo: [4],
    tiposFallo: ['caso'],
    explicacion: 'El bucle para al llegar al último, sin contarlo. El recorrido tiene que seguir hasta `p != NULL`.',
    solucion: c(`
      int contarColaEnlazada(ColaEnlazada *cola) {
          int n = 0;
          NodoSimple *p = cola->inicio;
          while (p != NULL) {
              n++;
              p = obtenerSiguienteNodoSimple(p);
          }
          return n;
      }`),
  },
  {
    id: '4-F17',
    tipo: 'fallo',
    titulo: 'encolarColaEnlazada con final atrasado',
    enunciado: 'Los nodos quedan bien enlazados desde `inicio`. Mira el otro extremo.',
    ctx: CE,
    casos: [
      { nombre: 'Cola 1 2', inicial: [colaEnlazada('cola', [1, 2])], llamada: 'encolarColaEnlazada(cola, 9)' },
      { nombre: 'Vacía', inicial: [colaEnlazada('cola', [])], llamada: 'encolarColaEnlazada(cola, 9)' },
    ],
    observar: ['cola'],
    codigo: c(`
      int encolarColaEnlazada(ColaEnlazada *cola, int x) {
          if (cola == NULL) return 0;
          NodoSimple *aux = crearNodoSimple(x);
          if (aux == NULL) return 0;
          if (estaVaciaColaEnlazada(cola) == 1) {
              cola->inicio = aux;
          }else {
              establecerSiguienteNodoSimple(cola->final, aux);
          }
          cola->tamano++;
          return 1;
      }`),
    lineasFallo: [9, 10],
    preguntaLinea: 'Falta una línea. ¿Dónde iría?',
    tiposFallo: ['enlace'],
    explicacion: 'Falta `cola->final = aux`. `final` sigue en el penúltimo, y el siguiente que se encole sobrescribirá su enlace y dejará este nodo perdido.',
    solucion: c(`
      int encolarColaEnlazada(ColaEnlazada *cola, int x) {
          if (cola == NULL) return 0;
          NodoSimple *aux = crearNodoSimple(x);
          if (aux == NULL) return 0;
          if (estaVaciaColaEnlazada(cola) == 1) {
              cola->inicio = aux;
          }else {
              establecerSiguienteNodoSimple(cola->final, aux);
          }
          cola->final = aux;
          cola->tamano++;
          return 1;
      }`),
  },
  {
    id: '4-F18',
    tipo: 'fallo',
    titulo: 'colarColaEnlazada sin caso vacío',
    enunciado: 'Colarse delante de alguien funciona. El problema llega cuando no hay nadie.',
    ctx: CE,
    casos: [
      { nombre: 'Cola 1 2', inicial: [colaEnlazada('cola', [1, 2])], llamada: 'colarColaEnlazada(cola, 9)' },
      { nombre: 'Vacía', inicial: [colaEnlazada('cola', [])], llamada: 'colarColaEnlazada(cola, 9)' },
    ],
    observar: ['cola'],
    codigo: c(`
      int colarColaEnlazada(ColaEnlazada *cola, int x) {
          NodoSimple *aux = crearNodoSimple(x);
          establecerSiguienteNodoSimple(aux, cola->inicio);
          cola->inicio = aux;
          cola->tamano++;
          return 1;
      }`),
    lineasFallo: [3, 4],
    tiposFallo: ['caso', 'enlace'],
    explicacion: 'En una cola vacía el nodo nuevo es a la vez el primero y el último, pero `final` se queda en NULL. Hay que mirar ese caso aparte y dejar `cola->final = aux`.',
    solucion: c(`
      int colarColaEnlazada(ColaEnlazada *cola, int x) {
          NodoSimple *aux = crearNodoSimple(x);
          establecerSiguienteNodoSimple(aux, cola->inicio);
          cola->inicio = aux;
          if (cola->final == NULL) cola->final = aux;
          cola->tamano++;
          return 1;
      }`),
  },
  {
    id: '4-F19',
    tipo: 'fallo',
    titulo: 'buscarColaEnlazada que confía en encontrarlo',
    enunciado: 'Si el valor está en la cola, todo va bien.',
    ctx: CE,
    casos: [
      { nombre: 'Cola 4 9 2, x = 9', inicial: [colaEnlazada('cola', [4, 9, 2])], llamada: 'buscarColaEnlazada(cola, 9)' },
      { nombre: 'Cola 4 9 2, x = 5', inicial: [colaEnlazada('cola', [4, 9, 2])], llamada: 'buscarColaEnlazada(cola, 5)' },
    ],
    observar: ['cola'],
    codigo: c(`
      int buscarColaEnlazada(ColaEnlazada *cola, int x) {
          int i = 0;
          NodoSimple *p = cola->inicio;
          while (p->valor != x) {
              i++;
              p = p->siguiente;
          }
          return i;
      }`),
    lineasFallo: [4],
    tiposFallo: ['nulo'],
    explicacion: 'Si no está, `p` llega a NULL y `p->valor` revienta. El bucle tiene que mirar primero si quedan nodos, y devolver -1 al acabarse.',
    solucion: c(`
      int buscarColaEnlazada(ColaEnlazada *cola, int x) {
          int i = 0;
          NodoSimple *p = cola->inicio;
          while (p != NULL) {
              if (p->valor == x) return i;
              i++;
              p = p->siguiente;
          }
          return -1;
      }`),
  },
  {
    id: '4-F20',
    tipo: 'fallo',
    titulo: 'invertirColaEnlazada que olvida un extremo',
    enunciado: 'Desde `inicio` la cola se lee perfectamente al revés.',
    ctx: CE,
    casos: [
      { nombre: 'Cola 7', inicial: [colaEnlazada('cola', [7])], llamada: 'invertirColaEnlazada(cola)' },
      { nombre: 'Cola 1 2 3', inicial: [colaEnlazada('cola', [1, 2, 3])], llamada: 'invertirColaEnlazada(cola)' },
    ],
    observar: ['cola'],
    codigo: c(`
      void invertirColaEnlazada(ColaEnlazada *cola) {
          NodoSimple *ant = NULL;
          NodoSimple *p = cola->inicio;
          while (p != NULL) {
              NodoSimple *sig = obtenerSiguienteNodoSimple(p);
              establecerSiguienteNodoSimple(p, ant);
              ant = p;
              p = sig;
          }
          cola->inicio = ant;
      }`),
    lineasFallo: [3, 4, 10],
    preguntaLinea: 'Falta una línea. ¿Dónde iría?',
    tiposFallo: ['enlace'],
    explicacion: '`final` sigue apuntando al antiguo último, que ahora es el primero. Hay que dejarlo en el antiguo `inicio`.',
    solucion: c(`
      void invertirColaEnlazada(ColaEnlazada *cola) {
          NodoSimple *ant = NULL;
          NodoSimple *p = cola->inicio;
          cola->final = p;
          while (p != NULL) {
              NodoSimple *sig = obtenerSiguienteNodoSimple(p);
              establecerSiguienteNodoSimple(p, ant);
              ant = p;
              p = sig;
          }
          cola->inicio = ant;
      }`),
  },

  // ------------------------------------------------------------ misteriosas
  {
    id: '4-M7',
    tipo: 'misterio',
    titulo: 'Hasta que queden k',
    enunciado: 'Predice cómo queda la cola (del frente al final) en cada caso y después di qué hace.',
    ctx: CA,
    casos: [
      { nombre: 'Cola 1 2 3 4, k = 1', inicial: [colaArray('cola', [1, 2, 3, 4])], llamada: 'misterio(cola, 1)' },
      { nombre: 'Cola 1 2 3 4, k = 3', inicial: [colaArray('cola', [1, 2, 3, 4])], llamada: 'misterio(cola, 3)' },
      { nombre: 'Cola 5 6, k = 4', inicial: [colaArray('cola', [5, 6], 9)], llamada: 'misterio(cola, 4)' },
    ],
    observar: ['cola'],
    responder: ['cola'],
    solucion: c(`
      void misterio(ColaArray *cola, int k) {
          int x = 0;
          while (tamanoColaArray(cola) > k) desencolarColaArray(cola, &x);
      }`),
    opciones: ['Se queda con los k últimos.', 'Se queda con los k primeros.', 'Quita k elementos.', 'Pasa k elementos al final.'],
    correcta: 0,
    explicacion: 'Siempre se saca por el frente, así que los que sobreviven son los de atrás. Si ya hay k o menos, no entra en el bucle.',
  },
  {
    id: '4-M8',
    tipo: 'misterio',
    titulo: 'Uno se salva y otro no',
    enunciado: 'Predice qué devuelve y cómo queda la cola (del frente al final) en cada caso. Después di qué hace.',
    ctx: CE,
    casos: [
      { nombre: 'Cola 1 2 3', inicial: [colaEnlazada('cola', [1, 2, 3])], llamada: 'misterio(cola)' },
      { nombre: 'Cola 1 2 3 4', inicial: [colaEnlazada('cola', [1, 2, 3, 4])], llamada: 'misterio(cola)' },
      { nombre: 'Cola 7', inicial: [colaEnlazada('cola', [7])], llamada: 'misterio(cola)' },
    ],
    observar: ['cola'],
    responder: ['devuelve', 'cola'],
    solucion: c(`
      int misterio(ColaEnlazada *cola) {
          int x = 0;
          while (tamanoColaEnlazada(cola) > 1) {
              desencolarColaEnlazada(cola, &x);
              encolarColaEnlazada(cola, x);
              desencolarColaEnlazada(cola, &x);
          }
          frenteColaEnlazada(cola, &x);
          return x;
      }`),
    opciones: ['En corro, salta uno y elimina el siguiente hasta que queda uno, y lo devuelve.', 'Se queda con el último de la cola y lo devuelve.', 'Quita los que están en posición impar una sola vez.', 'Devuelve el del medio sin cambiar la cola.'],
    correcta: 0,
    explicacion: 'Es el problema de Josefo: la cola hace de corro, porque el que se salva pasa al final. Cada vuelta del bucle la deja con uno menos.',
  },
  {
    id: '4-M9',
    tipo: 'misterio',
    titulo: 'Girar hasta el menor',
    enunciado: 'Predice cómo queda la cola (del frente al final) en cada caso y después di qué hace.',
    ctx: CA,
    casos: [
      { nombre: 'Cola 3 1 2', inicial: [colaArray('cola', [3, 1, 2])], llamada: 'misterio(cola)' },
      { nombre: 'Cola 5 9 4 6', inicial: [colaArray('cola', [5, 9, 4, 6], 8)], llamada: 'misterio(cola)' },
      { nombre: 'Cola 2 7', inicial: [colaArray('cola', [2, 7])], llamada: 'misterio(cola)' },
    ],
    observar: ['cola'],
    responder: ['cola'],
    solucion: c(`
      void misterio(ColaArray *cola) {
          int x = 0;
          int m = 0;
          frenteColaArray(cola, &m);
          for (int i = 0; i < tamanoColaArray(cola); i++) {
              desencolarColaArray(cola, &x);
              if (x < m) m = x;
              encolarColaArray(cola, x);
          }
          frenteColaArray(cola, &x);
          while (x != m) {
              desencolarColaArray(cola, &x);
              encolarColaArray(cola, x);
              frenteColaArray(cola, &x);
          }
      }`),
    opciones: ['Rota la cola hasta que el menor queda el primero, sin cambiar el orden circular.', 'Ordena la cola de menor a mayor.', 'Lleva el menor al frente y deja los demás en su orden.', 'Quita los que van antes del menor.'],
    correcta: 0,
    explicacion: 'El primer bucle da una vuelta completa buscando el menor, y la cola acaba como estaba. El segundo rota hasta tenerlo delante. Los que iban antes del menor acaban detrás: `3 1 2` queda `1 2 3` por casualidad, y `5 9 4 6` queda `4 6 5 9`.',
  },
  {
    id: '4-M10',
    tipo: 'misterio',
    titulo: 'Sin repetirse',
    enunciado: 'Predice cómo queda la cola (del frente al final) en cada caso y después di qué hace.',
    ctx: CE,
    casos: [
      { nombre: 'Cola 1 1 2 2 1', inicial: [colaEnlazada('cola', [1, 1, 2, 2, 1])], llamada: 'misterio(cola)' },
      { nombre: 'Cola 3 3 3', inicial: [colaEnlazada('cola', [3, 3, 3])], llamada: 'misterio(cola)' },
      { nombre: 'Cola 1 2', inicial: [colaEnlazada('cola', [1, 2])], llamada: 'misterio(cola)' },
    ],
    observar: ['cola'],
    responder: ['cola'],
    solucion: c(`
      void misterio(ColaEnlazada *cola) {
          int n = tamanoColaEnlazada(cola);
          int ant = -1;
          int x = 0;
          for (int i = 0; i < n; i++) {
              desencolarColaEnlazada(cola, &x);
              if (x != ant) encolarColaEnlazada(cola, x);
              ant = x;
          }
      }`),
    opciones: ['Quita los que son iguales al anterior, sin mirar más atrás.', 'Quita todos los repetidos, estén donde estén.', 'Deja solo los valores que aparecen una vez.', 'Ordena la cola y quita los repetidos.'],
    correcta: 0,
    explicacion: 'Da una vuelta exacta porque `n` se guarda antes de empezar. Solo compara con el anterior: en `1 1 2 2 1` el último 1 se queda, porque va detrás de un 2.',
  },
  {
    id: '4-M11',
    tipo: 'misterio',
    titulo: 'Una llamada dentro de otra',
    enunciado: 'Predice cómo queda la cola (del frente al final) en cada caso y después di qué hace.',
    ctx: CA,
    casos: [
      { nombre: 'Cola 1 2 3', inicial: [colaArray('cola', [1, 2, 3])], llamada: 'misterio(cola)' },
      { nombre: 'Cola 4 9', inicial: [colaArray('cola', [4, 9], 9)], llamada: 'misterio(cola)' },
      { nombre: 'Cola 7', inicial: [colaArray('cola', [7])], llamada: 'misterio(cola)' },
    ],
    observar: ['cola'],
    responder: ['cola'],
    solucion: c(`
      void misterio(ColaArray *cola) {
          int x = 0;
          if (desencolarColaArray(cola, &x) == 0) return;
          misterio(cola);
          encolarColaArray(cola, x);
      }`),
    opciones: ['Da la vuelta a la cola.', 'Deja la cola como estaba.', 'Vacía la cola.', 'Pasa el primero al final.'],
    correcta: 0,
    explicacion: 'Cada llamada guarda su `x` y espera a que las siguientes acaben. La pila de llamadas hace de pila: el último en salir de la cola es el primero en volver a entrar.',
  },
  {
    id: '4-M12',
    tipo: 'misterio',
    titulo: 'Cremallera',
    enunciado: 'Predice cómo quedan las dos colas (del frente al final) en cada caso. Después di qué hace.',
    ctx: CE,
    casos: [
      { nombre: 'cola = 1 2 3, cola2 = 7 8', inicial: [colaEnlazada('cola', [1, 2, 3]), colaEnlazada('cola2', [7, 8])], llamada: 'misterio(cola, cola2)' },
      { nombre: 'cola = 1 2, cola2 = 7 8 9', inicial: [colaEnlazada('cola', [1, 2]), colaEnlazada('cola2', [7, 8, 9])], llamada: 'misterio(cola, cola2)' },
      { nombre: 'cola = 5, cola2 vacía', inicial: [colaEnlazada('cola', [5]), colaEnlazada('cola2', [])], llamada: 'misterio(cola, cola2)' },
    ],
    observar: ['cola', 'cola2'],
    responder: ['cola', 'cola2'],
    solucion: c(`
      void misterio(ColaEnlazada *cola, ColaEnlazada *cola2) {
          int n = tamanoColaEnlazada(cola);
          int x = 0;
          for (int i = 0; i < n; i++) {
              desencolarColaEnlazada(cola, &x);
              encolarColaEnlazada(cola, x);
              if (desencolarColaEnlazada(cola2, &x) == 1)
                  encolarColaEnlazada(cola, x);
          }
      }`),
    opciones: ['Intercala los de `cola2` en `cola`, uno y uno, mientras quede sitio; lo que sobra se queda en `cola2`.', 'Pone toda `cola2` detrás de `cola`.', 'Intercala las dos y vacía siempre `cola2`.', 'Intercambia las dos colas.'],
    correcta: 0,
    explicacion: 'Cada vuelta pasa uno de `cola` al final y, si puede, uno de `cola2` detrás. Tras `n` vueltas, `cola` ha dado la vuelta completa con los nuevos intercalados. Si `cola2` es más larga, lo que no ha cabido sigue allí.',
  },
];
