// Topic 3, second batch: more exercises on the same PilaArray.c and PilaEnlazada.c.

import { CTX_PILA_ARRAY, CTX_PILA_ENLAZADA, entero, pilaArray, pilaEnlazada } from '../memoria/construir';
import { c } from './sangrado';
import { EjCodigo } from './tipos';

const A = CTX_PILA_ARRAY;
const E = CTX_PILA_ENLAZADA;
const LLENA = [4, 1, 8, 2, 6, 3, 7, 5];

export const EJERCICIOS_PILAS_MAS: EjCodigo[] = [
  // ------------------------------------------------------------ a mano
  {
    id: '3-14',
    tipo: 'programar',
    titulo: 'Intercambiar los dos de arriba, con array',
    enunciado: 'La pila tiene 4, 1 y 8 (el 8 en la cima). Intercambia los dos de arriba para que quede `4 8 1`, sin llamar a `pushArray` ni a `popArray`.',
    pistas: ['Hace falta una variable auxiliar, como en cualquier intercambio.', 'El de debajo de la cima está en `pila->cima - 1`.'],
    ctx: A,
    casos: [{ nombre: 'Pila 4 1 8', inicial: [pilaArray('pila', [4, 1, 8])] }],
    observar: ['pila'],
    prohibidos: ['pushArray()', 'popArray()'],
    solucion: c(`
      int aux = pila->array[pila->cima];
      pila->array[pila->cima] = pila->array[pila->cima - 1];
      pila->array[pila->cima - 1] = aux;`),
  },
  {
    id: '3-15',
    tipo: 'programar',
    titulo: 'Intercambiar los dos de arriba, enlazada',
    enunciado: 'Lo mismo con la pila enlazada, pero moviendo nodos: no puedes cambiar ningún `valor` ni llamar a `pushEnlazada` o `popEnlazada`.',
    pistas: ['Guarda los dos nodos de arriba en dos punteros antes de tocar nada.', 'Cambian tres enlaces: el del primero, el del segundo y `pila->cima`.'],
    alResolver: '`tamano` no cambia: siguen siendo los mismos nodos.',
    ctx: E,
    casos: [{ nombre: 'Pila 4 1 8', inicial: [pilaEnlazada('pila', [4, 1, 8])] }],
    observar: ['pila'],
    prohibidos: ['valor', 'pushEnlazada()', 'popEnlazada()'],
    solucion: c(`
      Nodo *a = pila->cima;
      Nodo *b = a->siguiente;
      a->siguiente = b->siguiente;
      b->siguiente = a;
      pila->cima = b;`),
  },
  {
    id: '3-16',
    tipo: 'programar',
    titulo: 'Vaciar la pila de un golpe, con array',
    enunciado: 'Deja `pila` vacía con una sola sentencia, sin llamar a `limpiarArray` ni a `popArray`.',
    alResolver: 'Los valores siguen escritos en el array, pero nadie los ve: lo que manda es la cima. Con la pila enlazada no bastaría, porque habría que liberar cada nodo.',
    ctx: A,
    casos: [{ nombre: 'Pila 4 1 8', inicial: [pilaArray('pila', [4, 1, 8])] }],
    observar: ['pila'],
    prohibidos: ['limpiarArray()', 'popArray()'],
    solucion: 'pila->cima = -1;',
  },
  {
    id: '3-17',
    tipo: 'programar',
    titulo: 'Quitar los dos de arriba, enlazada',
    enunciado: 'Quita los dos nodos de arriba de `pila` sin llamar a `popEnlazada` ni a `limpiarEnlazada`. No dejes memoria sin liberar y mantén `tamano` al día.',
    pistas: ['Mueve la cima antes de cada `free`.'],
    ctx: E,
    casos: [{ nombre: 'Pila 4 1 8', inicial: [pilaEnlazada('pila', [4, 1, 8])] }],
    observar: ['pila'],
    prohibidos: ['popEnlazada()', 'limpiarEnlazada()'],
    solucion: c(`
      Nodo *borrar = pila->cima;
      pila->cima = borrar->siguiente;
      free(borrar);
      borrar = pila->cima;
      pila->cima = borrar->siguiente;
      free(borrar);
      pila->tamano = pila->tamano - 2;`),
  },
  {
    id: '3-18',
    tipo: 'programar',
    titulo: 'Pasar la cima a otra pila, con array',
    enunciado: 'Pasa la cima de `pila` a la cima de `pila2` usando `popArray` y `pushArray`.',
    ctx: A,
    casos: [{ nombre: 'pila = 4 1 8, pila2 = 5', inicial: [pilaArray('pila', [4, 1, 8]), pilaArray('pila2', [5])] }],
    observar: ['pila', 'pila2'],
    codigoInicial: 'int aux = 0;\n',
    solucion: c(`
      int aux = 0;
      popArray(pila, &aux);
      pushArray(pila2, aux);`),
  },
  {
    id: '3-19',
    tipo: 'programar',
    titulo: 'Pasar la cima a otra pila, moviendo el nodo',
    enunciado: 'Con pilas enlazadas no hace falta copiar: lleva el nodo de la cima de `pila` a la cima de `pila2` sin crear ni liberar nodos y sin escribir ningún `valor`.',
    pistas: ['Primero descuélgalo de `pila`, después engánchalo en `pila2`.', 'Cambian los dos `tamano`.'],
    ctx: E,
    casos: [{ nombre: 'pila = 4 1 8, pila2 = 5', inicial: [pilaEnlazada('pila', [4, 1, 8]), pilaEnlazada('pila2', [5])] }],
    observar: ['pila', 'pila2'],
    prohibidos: ['valor', 'pushEnlazada()', 'popEnlazada()'],
    solucion: c(`
      Nodo *n = pila->cima;
      pila->cima = n->siguiente;
      pila->tamano--;
      n->siguiente = pila2->cima;
      pila2->cima = n;
      pila2->tamano++;`),
  },

  // ------------------------------------------------------------ funciones
  {
    id: '3-20',
    tipo: 'programar',
    titulo: 'Escribe tamanoArray',
    enunciado: 'Completa `tamanoArray`: devuelve cuántos elementos tiene la pila.',
    pistas: ['La cima es un índice y los índices empiezan en 0.'],
    ctx: A,
    casos: [
      { nombre: 'Pila 4 1 8', inicial: [pilaArray('pila', [4, 1, 8])], llamada: 'tamanoArray(pila)' },
      { nombre: 'Pila vacía', inicial: [pilaArray('pila', [])], llamada: 'tamanoArray(pila)' },
      { nombre: 'Pila llena', inicial: [pilaArray('pila', LLENA)], llamada: 'tamanoArray(pila)' },
    ],
    observar: ['pila'],
    codigoInicial: c(`
      int tamanoArray(PilaArray *pila) {

      }`),
    solucion: c(`
      int tamanoArray(PilaArray *pila) {
          return pila->cima + 1;
      }`),
  },
  {
    id: '3-21',
    tipo: 'programar',
    titulo: 'Escribe contieneArray',
    enunciado: 'Completa `contieneArray`: devuelve 1 si `x` está en la pila y 0 si no, sin cambiarla. Ojo con lo que queda escrito por encima de la cima.',
    ctx: A,
    casos: [
      { nombre: 'Pila 4 1 8, x = 4', inicial: [pilaArray('pila', [4, 1, 8])], llamada: 'contieneArray(pila, 4)' },
      { nombre: 'Pila 4 1 8, x = 5', inicial: [pilaArray('pila', [4, 1, 8])], llamada: 'contieneArray(pila, 5)' },
      { nombre: 'Pila 4 1, con un 7 de resto', inicial: [pilaArray('pila', [4, 1], [7])], llamada: 'contieneArray(pila, 7)' },
      { nombre: 'Pila vacía', inicial: [pilaArray('pila', [])], llamada: 'contieneArray(pila, 4)' },
    ],
    observar: ['pila'],
    codigoInicial: c(`
      int contieneArray(PilaArray *pila, int x) {

      }`),
    solucion: c(`
      int contieneArray(PilaArray *pila, int x) {
          for (int i = 0; i <= pila->cima; i++) {
              if (pila->array[i] == x) { return 1; }
          }
          return 0;
      }`),
  },
  {
    id: '3-22',
    tipo: 'programar',
    titulo: 'Escribe copiarArray',
    enunciado: 'Completa `copiarArray`: deja en `destino` los mismos elementos que `origen`, sin cambiar `origen`. Lo que tuviera `destino` se pierde.',
    pistas: ['Copia las casillas de la 0 a la cima, y no olvides la cima de `destino`.'],
    ctx: A,
    casos: [
      { nombre: 'origen = 4 1 8, destino vacía', inicial: [pilaArray('pila', [4, 1, 8]), pilaArray('pila2', [])], llamada: 'copiarArray(pila, pila2)' },
      { nombre: 'origen = 3, destino = 9 9', inicial: [pilaArray('pila', [3]), pilaArray('pila2', [9, 9])], llamada: 'copiarArray(pila, pila2)' },
    ],
    observar: ['pila', 'pila2'],
    codigoInicial: c(`
      void copiarArray(PilaArray *origen, PilaArray *destino) {

      }`),
    solucion: c(`
      void copiarArray(PilaArray *origen, PilaArray *destino) {
          for (int i = 0; i <= origen->cima; i++) {
              destino->array[i] = origen->array[i];
          }
          destino->cima = origen->cima;
      }`),
  },
  {
    id: '3-23',
    tipo: 'programar',
    titulo: 'Escribe contarEnlazada',
    enunciado: 'Completa `contarEnlazada`: devuelve cuántos nodos tiene la pila recorriéndolos, sin mirar `tamano`.',
    alResolver: 'Recorrer cuesta O(n) y `tamano` da lo mismo en O(1): por eso la pila lo lleva al día en cada push y pop.',
    ctx: E,
    casos: [
      { nombre: 'Pila 4 1 8', inicial: [pilaEnlazada('pila', [4, 1, 8])], llamada: 'contarEnlazada(pila)' },
      { nombre: 'Pila vacía', inicial: [pilaEnlazada('pila', [])], llamada: 'contarEnlazada(pila)' },
    ],
    observar: ['pila'],
    prohibidos: ['tamanoEnlazada()'],
    codigoInicial: c(`
      int contarEnlazada(PilaEnlazada *pila) {

      }`),
    solucion: c(`
      int contarEnlazada(PilaEnlazada *pila) {
          int n = 0;
          Nodo *p = pila->cima;
          while (p != NULL) {
              n++;
              p = p->siguiente;
          }
          return n;
      }`),
  },
  {
    id: '3-24',
    tipo: 'programar',
    titulo: 'Escribe fondoEnlazada',
    enunciado: 'Completa `fondoEnlazada`: deja en `*valor` el elemento del fondo y devuelve 1, sin cambiar la pila. Si está vacía, devuelve 0 sin tocar `*valor`.',
    pistas: ['El fondo es el nodo cuyo `siguiente` es NULL.'],
    ctx: E,
    casos: [
      { nombre: 'Pila 4 1 8', inicial: [pilaEnlazada('pila', [4, 1, 8]), entero('valor', 0)], llamada: 'fondoEnlazada(pila, &valor)' },
      { nombre: 'Pila 7', inicial: [pilaEnlazada('pila', [7]), entero('valor', 0)], llamada: 'fondoEnlazada(pila, &valor)' },
      { nombre: 'Pila vacía', inicial: [pilaEnlazada('pila', []), entero('valor', 3)], llamada: 'fondoEnlazada(pila, &valor)' },
    ],
    observar: ['pila', 'valor'],
    codigoInicial: c(`
      int fondoEnlazada(PilaEnlazada *pila, int *valor) {

      }`),
    solucion: c(`
      int fondoEnlazada(PilaEnlazada *pila, int *valor) {
          if (esVaciaEnlazada(pila)) { return 0; }
          Nodo *p = pila->cima;
          while (p->siguiente != NULL) {
              p = p->siguiente;
          }
          *valor = p->valor;
          return 1;
      }`),
  },
  {
    id: '3-25',
    tipo: 'programar',
    titulo: 'Escribe invertirEnlazada',
    enunciado: 'Completa `invertirEnlazada`: da la vuelta a la pila moviendo enlaces, sin crear ni liberar nodos.',
    pistas: ['Es dar la vuelta a una lista del tema 2: tres punteros, el anterior, el actual y el siguiente.'],
    ctx: E,
    casos: [
      { nombre: 'Pila 4 1 8', inicial: [pilaEnlazada('pila', [4, 1, 8])], llamada: 'invertirEnlazada(pila)' },
      { nombre: 'Pila 7', inicial: [pilaEnlazada('pila', [7])], llamada: 'invertirEnlazada(pila)' },
      { nombre: 'Pila vacía', inicial: [pilaEnlazada('pila', [])], llamada: 'invertirEnlazada(pila)' },
    ],
    observar: ['pila'],
    prohibidos: ['valor', 'pushEnlazada()', 'popEnlazada()'],
    codigoInicial: c(`
      void invertirEnlazada(PilaEnlazada *pila) {

      }`),
    solucion: c(`
      void invertirEnlazada(PilaEnlazada *pila) {
          Nodo *ant = NULL;
          Nodo *p = pila->cima;
          while (p != NULL) {
              Nodo *sig = p->siguiente;
              p->siguiente = ant;
              ant = p;
              p = sig;
          }
          pila->cima = ant;
      }`),
  },
  {
    id: '3-26',
    tipo: 'programar',
    titulo: 'Escribe quitarHastaArray',
    enunciado: 'Completa `quitarHastaArray`: desapila hasta que la cima sea `x` (que se queda) y devuelve cuántos ha quitado. Si `x` no está, la pila acaba vacía.',
    ctx: A,
    casos: [
      { nombre: 'Pila 4 1 8, x = 1', inicial: [pilaArray('pila', [4, 1, 8])], llamada: 'quitarHastaArray(pila, 1)' },
      { nombre: 'Pila 4 1 8, x = 8', inicial: [pilaArray('pila', [4, 1, 8])], llamada: 'quitarHastaArray(pila, 8)' },
      { nombre: 'Pila 4 1 8, x = 5', inicial: [pilaArray('pila', [4, 1, 8])], llamada: 'quitarHastaArray(pila, 5)' },
      { nombre: 'Pila vacía', inicial: [pilaArray('pila', [])], llamada: 'quitarHastaArray(pila, 5)' },
    ],
    observar: ['pila'],
    codigoInicial: c(`
      int quitarHastaArray(PilaArray *pila, int x) {

      }`),
    solucion: c(`
      int quitarHastaArray(PilaArray *pila, int x) {
          int n = 0;
          while (pila->cima >= 0 && pila->array[pila->cima] != x) {
              pila->cima--;
              n++;
          }
          return n;
      }`),
  },

  // ------------------------------------------------------------ fallos
  {
    id: '3-F11',
    tipo: 'fallo',
    titulo: 'pushEnlazada que no lleva la cuenta',
    enunciado: 'La pila queda bien enlazada. Y aun así, algo no cuadra.',
    ctx: E,
    casos: [
      { nombre: 'Pila 4 1', inicial: [pilaEnlazada('pila', [4, 1])], llamada: 'pushEnlazada(pila, 8)' },
      { nombre: 'Pila vacía', inicial: [pilaEnlazada('pila', [])], llamada: 'pushEnlazada(pila, 8)' },
    ],
    observar: ['pila'],
    codigo: c(`
      int pushEnlazada(PilaEnlazada *pila, int valor) {
          if (pila == NULL) { return 0; }
          Nodo *nuevo = malloc(sizeof(Nodo));
          if (nuevo == NULL) { return 0; }
          nuevo->valor = valor;
          nuevo->siguiente = pila->cima;
          pila->cima = nuevo;
          return 1;
      }`),
    lineasFallo: [7, 8],
    preguntaLinea: 'Falta una línea. ¿Dónde iría?',
    tiposFallo: ['caso'],
    explicacion: 'Falta `pila->tamano++`. Los enlaces están bien, pero el contador se queda atrás y `tamanoEnlazada` mentirá a partir de ahora.',
    solucion: c(`
      int pushEnlazada(PilaEnlazada *pila, int valor) {
          if (pila == NULL) { return 0; }
          Nodo *nuevo = malloc(sizeof(Nodo));
          if (nuevo == NULL) { return 0; }
          nuevo->valor = valor;
          nuevo->siguiente = pila->cima;
          pila->cima = nuevo;
          pila->tamano++;
          return 1;
      }`),
  },
  {
    id: '3-F12',
    tipo: 'fallo',
    titulo: 'pushEnlazada que empieza de cero',
    enunciado: 'Con la pila vacía funciona de maravilla.',
    ctx: E,
    casos: [
      { nombre: 'Pila vacía', inicial: [pilaEnlazada('pila', [])], llamada: 'pushEnlazada(pila, 8)' },
      { nombre: 'Pila 4 1', inicial: [pilaEnlazada('pila', [4, 1])], llamada: 'pushEnlazada(pila, 8)' },
    ],
    observar: ['pila'],
    codigo: c(`
      int pushEnlazada(PilaEnlazada *pila, int valor) {
          if (pila == NULL) { return 0; }
          Nodo *nuevo = malloc(sizeof(Nodo));
          if (nuevo == NULL) { return 0; }
          nuevo->valor = valor;
          nuevo->siguiente = NULL;
          pila->cima = nuevo;
          pila->tamano++;
          return 1;
      }`),
    lineasFallo: [6],
    tiposFallo: ['pierde', 'fuga'],
    explicacion: 'El nodo nuevo tiene que colgar de la cima antigua. Con `NULL`, todo lo que había se queda sin nadie que apunte a ello: se pierde la pila y esos nodos ya no se pueden liberar.',
    solucion: c(`
      int pushEnlazada(PilaEnlazada *pila, int valor) {
          if (pila == NULL) { return 0; }
          Nodo *nuevo = malloc(sizeof(Nodo));
          if (nuevo == NULL) { return 0; }
          nuevo->valor = valor;
          nuevo->siguiente = pila->cima;
          pila->cima = nuevo;
          pila->tamano++;
          return 1;
      }`),
  },
  {
    id: '3-F13',
    tipo: 'fallo',
    titulo: 'esVaciaArray que confunde el 0',
    enunciado: 'Alguien ha reescrito `esVaciaArray`. `popArray` está bien, pero depende de ella.',
    ctx: A,
    casos: [
      { nombre: 'Pila 4 1', inicial: [pilaArray('pila', [4, 1]), entero('valor', 0)], llamada: 'popArray(pila, &valor)' },
      { nombre: 'Pila 7', inicial: [pilaArray('pila', [7]), entero('valor', 0)], llamada: 'popArray(pila, &valor)' },
      { nombre: 'Pila vacía', inicial: [pilaArray('pila', []), entero('valor', 0)], llamada: 'popArray(pila, &valor)' },
    ],
    observar: ['pila', 'valor'],
    codigo: c(`
      int esVaciaArray(PilaArray *pila) {
          return pila->cima == 0;
      }

      int popArray(PilaArray *pila, int *valor) {
          if (esVaciaArray(pila)) { return 0; }
          *valor = pila->array[pila->cima];
          pila->cima--;
          return 1;
      }`),
    lineasFallo: [2],
    tiposFallo: ['caso', 'array'],
    explicacion: 'Cima 0 significa que hay **un** elemento, en la casilla 0. La pila vacía tiene la cima en -1. Así, con un elemento dice que no hay nada, y con ninguno lee `array[-1]`.',
    solucion: c(`
      int esVaciaArray(PilaArray *pila) {
          return pila->cima == -1;
      }

      int popArray(PilaArray *pila, int *valor) {
          if (esVaciaArray(pila)) { return 0; }
          *valor = pila->array[pila->cima];
          pila->cima--;
          return 1;
      }`),
  },
  {
    id: '3-F14',
    tipo: 'fallo',
    titulo: 'tamanoArray que devuelve la cima',
    enunciado: 'La función es de una línea y no toca la pila. Comprueba lo que devuelve.',
    ctx: A,
    casos: [
      { nombre: 'Pila 4 1 8', inicial: [pilaArray('pila', [4, 1, 8])], llamada: 'tamanoArray(pila)' },
      { nombre: 'Pila vacía', inicial: [pilaArray('pila', [])], llamada: 'tamanoArray(pila)' },
    ],
    observar: ['pila'],
    codigo: c(`
      int tamanoArray(PilaArray *pila) {
          return pila->cima;
      }`),
    lineasFallo: [2],
    tiposFallo: ['caso'],
    explicacion: 'La cima es el índice del último, no cuántos hay. Los índices empiezan en 0: el tamaño es `pila->cima + 1`.',
    solucion: c(`
      int tamanoArray(PilaArray *pila) {
          return pila->cima + 1;
      }`),
  },
  {
    id: '3-F15',
    tipo: 'fallo',
    titulo: 'limpiarArray que deja uno',
    enunciado: 'Después de limpiar, la pila debería estar vacía.',
    ctx: A,
    casos: [
      { nombre: 'Pila 4 1 8', inicial: [pilaArray('pila', [4, 1, 8])], llamada: 'limpiarArray(pila)' },
      { nombre: 'Pila 7', inicial: [pilaArray('pila', [7])], llamada: 'limpiarArray(pila)' },
    ],
    observar: ['pila'],
    codigo: c(`
      int limpiarArray(PilaArray *pila) {
          if (pila == NULL) { return 0; }
          pila->cima = 0;
          return 1;
      }`),
    lineasFallo: [3],
    tiposFallo: ['caso'],
    explicacion: 'Con la cima en 0 queda un elemento, el del fondo. La pila vacía tiene la cima en -1.',
    solucion: c(`
      int limpiarArray(PilaArray *pila) {
          if (pila == NULL) { return 0; }
          pila->cima = -1;
          return 1;
      }`),
  },
  {
    id: '3-F16',
    tipo: 'fallo',
    titulo: 'cimaEnlazada que se lleva la cima',
    enunciado: 'Consultar la cima no debería cambiar la pila.',
    ctx: E,
    casos: [
      { nombre: 'Pila vacía', inicial: [pilaEnlazada('pila', []), entero('valor', 0)], llamada: 'cimaEnlazada(pila, &valor)' },
      { nombre: 'Pila 4 1 8', inicial: [pilaEnlazada('pila', [4, 1, 8]), entero('valor', 0)], llamada: 'cimaEnlazada(pila, &valor)' },
    ],
    observar: ['pila', 'valor'],
    codigo: c(`
      int cimaEnlazada(PilaEnlazada *pila, int *valor) {
          if (esVaciaEnlazada(pila)) { return 0; }
          *valor = pila->cima->valor;
          pila->cima = pila->cima->siguiente;
          return 1;
      }`),
    lineasFallo: [4],
    tiposFallo: ['fuga', 'pierde'],
    explicacion: 'Esa línea sobra: el valor ya está leído. Además de cambiar la pila, deja el nodo de arriba sin nadie que apunte a él, y `tamano` deja de cuadrar.',
    solucion: c(`
      int cimaEnlazada(PilaEnlazada *pila, int *valor) {
          if (esVaciaEnlazada(pila)) { return 0; }
          *valor = pila->cima->valor;
          return 1;
      }`),
  },
  {
    id: '3-F17',
    tipo: 'fallo',
    titulo: 'contarEnlazada que no avanza',
    enunciado: 'Con la pila vacía devuelve lo correcto.',
    ctx: E,
    casos: [
      { nombre: 'Pila vacía', inicial: [pilaEnlazada('pila', [])], llamada: 'contarEnlazada(pila)' },
      { nombre: 'Pila 4 1', inicial: [pilaEnlazada('pila', [4, 1])], llamada: 'contarEnlazada(pila)' },
    ],
    observar: ['pila'],
    codigo: c(`
      int contarEnlazada(PilaEnlazada *pila) {
          int n = 0;
          Nodo *p = pila->cima;
          while (p != NULL) {
              n++;
          }
          return n;
      }`),
    lineasFallo: [4, 5, 6],
    tiposFallo: ['bucle'],
    explicacion: '`p` nunca cambia, así que la condición nunca deja de cumplirse. Falta `p = p->siguiente` dentro del bucle.',
    solucion: c(`
      int contarEnlazada(PilaEnlazada *pila) {
          int n = 0;
          Nodo *p = pila->cima;
          while (p != NULL) {
              n++;
              p = p->siguiente;
          }
          return n;
      }`),
  },
  {
    id: '3-F18',
    tipo: 'fallo',
    titulo: 'fondoEnlazada que se pasa de largo',
    enunciado: 'Quiere leer el último nodo de la pila.',
    ctx: E,
    casos: [
      { nombre: 'Pila vacía', inicial: [pilaEnlazada('pila', []), entero('valor', 0)], llamada: 'fondoEnlazada(pila, &valor)' },
      { nombre: 'Pila 4 1 8', inicial: [pilaEnlazada('pila', [4, 1, 8]), entero('valor', 0)], llamada: 'fondoEnlazada(pila, &valor)' },
    ],
    observar: ['pila', 'valor'],
    codigo: c(`
      int fondoEnlazada(PilaEnlazada *pila, int *valor) {
          if (esVaciaEnlazada(pila)) { return 0; }
          Nodo *p = pila->cima;
          while (p != NULL) {
              p = p->siguiente;
          }
          *valor = p->valor;
          return 1;
      }`),
    lineasFallo: [4, 7],
    tiposFallo: ['nulo'],
    explicacion: 'El bucle solo termina cuando `p` es NULL, y entonces ya no hay nodo que leer. Para quedarse en el último hay que preguntar por `p->siguiente != NULL`.',
    solucion: c(`
      int fondoEnlazada(PilaEnlazada *pila, int *valor) {
          if (esVaciaEnlazada(pila)) { return 0; }
          Nodo *p = pila->cima;
          while (p->siguiente != NULL) {
              p = p->siguiente;
          }
          *valor = p->valor;
          return 1;
      }`),
  },
  {
    id: '3-F19',
    tipo: 'fallo',
    titulo: 'contieneArray que ve fantasmas',
    enunciado: 'Encuentra todo lo que está en la pila. El problema es lo que encuentra de más.',
    ctx: A,
    casos: [
      { nombre: 'Pila 4 1 8, x = 1', inicial: [pilaArray('pila', [4, 1, 8])], llamada: 'contieneArray(pila, 1)' },
      { nombre: 'Pila 4 1, con un 7 de resto', inicial: [pilaArray('pila', [4, 1], [7])], llamada: 'contieneArray(pila, 7)' },
    ],
    observar: ['pila'],
    codigo: c(`
      int contieneArray(PilaArray *pila, int x) {
          for (int i = 0; i < TAM; i++) {
              if (pila->array[i] == x) { return 1; }
          }
          return 0;
      }`),
    lineasFallo: [2],
    tiposFallo: ['caso'],
    explicacion: 'Lo que hay por encima de la cima son restos de pop anteriores, no elementos. El recorrido acaba en la cima: `i <= pila->cima`.',
    solucion: c(`
      int contieneArray(PilaArray *pila, int x) {
          for (int i = 0; i <= pila->cima; i++) {
              if (pila->array[i] == x) { return 1; }
          }
          return 0;
      }`),
  },
  {
    id: '3-F20',
    tipo: 'fallo',
    titulo: 'invertirEnlazada que avanza por donde no hay',
    enunciado: 'Con un solo nodo funciona.',
    ctx: E,
    casos: [
      { nombre: 'Pila 7', inicial: [pilaEnlazada('pila', [7])], llamada: 'invertirEnlazada(pila)' },
      { nombre: 'Pila 4 1 8', inicial: [pilaEnlazada('pila', [4, 1, 8])], llamada: 'invertirEnlazada(pila)' },
    ],
    observar: ['pila'],
    codigo: c(`
      void invertirEnlazada(PilaEnlazada *pila) {
          Nodo *ant = NULL;
          Nodo *p = pila->cima;
          while (p != NULL) {
              p->siguiente = ant;
              ant = p;
              p = p->siguiente;
          }
          pila->cima = ant;
      }`),
    lineasFallo: [5, 7],
    tiposFallo: ['pierde', 'fuga'],
    explicacion: 'Al cambiar `p->siguiente` se pierde el camino al resto de la pila, y el avance sigue el enlace ya cambiado. Hay que guardar `p->siguiente` en una variable antes de tocarlo.',
    solucion: c(`
      void invertirEnlazada(PilaEnlazada *pila) {
          Nodo *ant = NULL;
          Nodo *p = pila->cima;
          while (p != NULL) {
              Nodo *sig = p->siguiente;
              p->siguiente = ant;
              ant = p;
              p = sig;
          }
          pila->cima = ant;
      }`),
  },

  // ------------------------------------------------------------ misteriosas
  {
    id: '3-M7',
    tipo: 'misterio',
    titulo: 'Un colador',
    enunciado: 'Predice cómo queda la pila (del fondo a la cima) en cada caso. Después di qué hace.',
    ctx: A,
    casos: [
      { nombre: 'Pila 4 1 8', inicial: [pilaArray('pila', [4, 1, 8])], llamada: 'misterio(pila)' },
      { nombre: 'Pila 2 5 6 7', inicial: [pilaArray('pila', [2, 5, 6, 7])], llamada: 'misterio(pila)' },
      { nombre: 'Pila 1 3', inicial: [pilaArray('pila', [1, 3])], llamada: 'misterio(pila)' },
    ],
    observar: ['pila'],
    responder: ['pila'],
    solucion: c(`
      void misterio(PilaArray *pila) {
          PilaArray *aux = CrearPilaArray();
          int x = 0;
          while (popArray(pila, &x)) {
              if (x % 2 == 0) pushArray(aux, x);
          }
          while (popArray(aux, &x)) pushArray(pila, x);
          destruirPilaArray(aux);
      }`),
    opciones: ['Quita los impares y deja los pares en su orden.', 'Quita los pares y deja los impares en su orden.', 'Se queda con los pares, pero al revés.', 'Quita uno de cada dos elementos.'],
    correcta: 0,
    explicacion: 'El primer bucle lo saca todo y guarda solo los pares; el segundo los devuelve. Como pasan por dos vuelcos, conservan el orden. Mira valores, no posiciones.',
  },
  {
    id: '3-M8',
    tipo: 'misterio',
    titulo: 'De arriba abajo',
    enunciado: 'Predice cómo queda la pila (del fondo a la cima) en cada caso. Después di qué hace.',
    ctx: E,
    casos: [
      { nombre: 'Pila 4 1 8', inicial: [pilaEnlazada('pila', [4, 1, 8])], llamada: 'misterio(pila)' },
      { nombre: 'Pila 2 9', inicial: [pilaEnlazada('pila', [2, 9])], llamada: 'misterio(pila)' },
      { nombre: 'Pila 7', inicial: [pilaEnlazada('pila', [7])], llamada: 'misterio(pila)' },
    ],
    observar: ['pila'],
    responder: ['pila'],
    solucion: c(`
      void misterio(PilaEnlazada *pila) {
          int c = 0;
          int x = 0;
          if (!popEnlazada(pila, &c)) return;
          PilaEnlazada *aux = CrearPilaEnlazada();
          while (popEnlazada(pila, &x)) pushEnlazada(aux, x);
          pushEnlazada(pila, c);
          while (popEnlazada(aux, &x)) pushEnlazada(pila, x);
          destruirPilaEnlazada(aux);
      }`),
    opciones: ['Lleva la cima al fondo y deja los demás en su orden.', 'Lleva el fondo a la cima.', 'Da la vuelta a la pila.', 'Intercambia la cima y el fondo.'],
    correcta: 0,
    explicacion: 'Guarda la cima en `c`, vuelca el resto en `aux`, apila `c` en la pila ya vacía y devuelve el resto encima. Así se llega al fondo de una pila usando solo su interfaz.',
  },
  {
    id: '3-M9',
    tipo: 'misterio',
    titulo: 'De dos en uno',
    enunciado: 'Predice cómo queda la pila (del fondo a la cima) en cada caso. Después di qué hace.',
    ctx: A,
    casos: [
      { nombre: 'Pila 1 2 3', inicial: [pilaArray('pila', [1, 2, 3])], llamada: 'misterio(pila)' },
      { nombre: 'Pila 5', inicial: [pilaArray('pila', [5])], llamada: 'misterio(pila)' },
      { nombre: 'Pila vacía', inicial: [pilaArray('pila', [])], llamada: 'misterio(pila)' },
    ],
    observar: ['pila'],
    responder: ['pila'],
    solucion: c(`
      void misterio(PilaArray *pila) {
          int a = 0;
          int b = 0;
          while (tamanoArray(pila) > 1) {
              popArray(pila, &a);
              popArray(pila, &b);
              pushArray(pila, a + b);
          }
      }`),
    opciones: ['Deja un solo elemento con la suma de todos; la pila vacía sigue vacía.', 'Deja solo el mayor.', 'Suma los dos de arriba y para.', 'Vacía la pila.'],
    correcta: 0,
    explicacion: 'Cada vuelta cambia dos elementos por su suma, así que la pila baja de uno en uno hasta quedar uno. Es como se evalúa una expresión en notación postfija: operandos a la pila y cada operación saca dos y mete uno.',
  },
  {
    id: '3-M10',
    tipo: 'misterio',
    titulo: 'Iguales desde arriba',
    enunciado: 'Predice qué devuelve en cada caso. Después di qué hace.',
    ctx: E,
    casos: [
      { nombre: 'Pila 1 8 8', inicial: [pilaEnlazada('pila', [1, 8, 8])], llamada: 'misterio(pila)' },
      { nombre: 'Pila 8 1', inicial: [pilaEnlazada('pila', [8, 1])], llamada: 'misterio(pila)' },
      { nombre: 'Pila 3 3 3', inicial: [pilaEnlazada('pila', [3, 3, 3])], llamada: 'misterio(pila)' },
      { nombre: 'Pila vacía', inicial: [pilaEnlazada('pila', [])], llamada: 'misterio(pila)' },
    ],
    observar: ['pila'],
    responder: ['devuelve'],
    solucion: c(`
      int misterio(PilaEnlazada *pila) {
          int n = 0;
          Nodo *p = pila->cima;
          while (p != NULL && p->valor == pila->cima->valor) {
              n++;
              p = p->siguiente;
          }
          return n;
      }`),
    opciones: ['Cuenta cuántos elementos seguidos, desde la cima, son iguales a ella.', 'Cuenta cuántas veces está la cima en toda la pila.', 'Cuenta los elementos de la pila.', 'Cuenta cuántos valores distintos hay.'],
    correcta: 0,
    explicacion: 'El bucle para en el primer nodo distinto de la cima, aunque más abajo haya otro igual. Con la pila vacía `p` es NULL y el `&&` no llega a mirar `pila->cima->valor`.',
  },
  {
    id: '3-M11',
    tipo: 'misterio',
    titulo: 'Escalones',
    enunciado: 'Predice qué devuelve en cada caso. Después di qué hace.',
    ctx: A,
    casos: [
      { nombre: 'Pila 1 4 8', inicial: [pilaArray('pila', [1, 4, 8])], llamada: 'misterio(pila)' },
      { nombre: 'Pila 4 1 8', inicial: [pilaArray('pila', [4, 1, 8])], llamada: 'misterio(pila)' },
      { nombre: 'Pila 8 4 1', inicial: [pilaArray('pila', [8, 4, 1])], llamada: 'misterio(pila)' },
      { nombre: 'Pila vacía', inicial: [pilaArray('pila', [])], llamada: 'misterio(pila)' },
    ],
    observar: ['pila'],
    responder: ['devuelve'],
    solucion: c(`
      int misterio(PilaArray *pila) {
          for (int i = 1; i <= pila->cima; i++) {
              if (pila->array[i - 1] > pila->array[i]) return 0;
          }
          return 1;
      }`),
    opciones: ['Devuelve 1 si del fondo a la cima los valores no bajan nunca.', 'Devuelve 1 si de la cima al fondo los valores no bajan nunca.', 'Devuelve 1 si la cima es el mayor.', 'Devuelve 1 si no hay repetidos.'],
    correcta: 0,
    explicacion: 'Compara cada casilla con la de debajo. Al primer escalón que baja, devuelve 0. Con la cima como mayor no basta: `4 1 8` la tiene y devuelve 0. Una pila vacía no tiene ningún escalón que baje.',
  },
  {
    id: '3-M12',
    tipo: 'misterio',
    titulo: 'Una encima de otra',
    enunciado: 'Predice cómo quedan las dos pilas (del fondo a la cima) en cada caso. Después di qué hace.',
    ctx: E,
    casos: [
      { nombre: 'pila = 1 2, pila2 = 3 4', inicial: [pilaEnlazada('pila', [1, 2]), pilaEnlazada('pila2', [3, 4])], llamada: 'misterio(pila, pila2)' },
      { nombre: 'pila vacía, pila2 = 5 6 7', inicial: [pilaEnlazada('pila', []), pilaEnlazada('pila2', [5, 6, 7])], llamada: 'misterio(pila, pila2)' },
      { nombre: 'pila = 9, pila2 vacía', inicial: [pilaEnlazada('pila', [9]), pilaEnlazada('pila2', [])], llamada: 'misterio(pila, pila2)' },
    ],
    observar: ['pila', 'pila2'],
    responder: ['pila', 'pila2'],
    solucion: c(`
      void misterio(PilaEnlazada *pila, PilaEnlazada *pila2) {
          int x = 0;
          while (popEnlazada(pila2, &x)) pushEnlazada(pila, x);
      }`),
    opciones: ['Pone los de `pila2` encima de `pila`, al revés, y vacía `pila2`.', 'Pone los de `pila2` encima de `pila`, en el mismo orden, y vacía `pila2`.', 'Copia `pila2` en `pila` sin cambiar `pila2`.', 'Intercambia las dos pilas.'],
    correcta: 0,
    explicacion: 'Volcar invierte: el primero que sale de `pila2` es su cima, y acaba el más abajo de los que llegan. Para conservar el orden harían falta dos vuelcos, pasando por una pila auxiliar.',
  },
];
