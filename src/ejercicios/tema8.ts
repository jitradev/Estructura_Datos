// Topics 8 and 9 together: binary trees (traversals and recursion over both subtrees) and
// binary search trees (search, insert, delete). The structs and the functions are the ones of
// Nodo.c and Arbol.c of the Arboles project: in every exercise they are all available, except
// the one to be written (the student's replaces it). Trees are written as «8(3(1,6),10(,14))».

import { arbolABB, CTX_ARBOL, raizABB, raizForma } from '../arboles/catalogo';
import { puntero } from '../memoria/construir';
import { c } from './sangrado';
import { porTipo } from './orden';
import { EjCodigo, Tema } from './tipos';

const ctx = CTX_ARBOL;
/** The search tree of the examples: 8(3(1,6(4,7)),10(,14(13,))). */
const EJ = [8, 3, 10, 1, 6, 14, 4, 7, 13];
const EJ_TXT = '8(3(1,6(4,7)),10(,14(13,)))';
/** A binary tree that is not a search tree. */
const F1 = '5(9(2,),7(4,1))';
const F2 = '3(,8(6,))';

const BIN = 'Árbol binario';
const ABB = 'ABB';

const ejercicios: (EjCodigo & { estructura: string })[] = [
  // ------------------------------------------------------------------ a mano
  {
    id: '8-01',
    tipo: 'programar',
    estructura: BIN,
    titulo: 'Cuelga dos hijos a mano',
    enunciado: 'En `raiz` hay un nodo con el **8** y sin hijos. Cuélgale un hijo izquierdo con el **3** y uno derecho con el **10**. Tienes `crearNodo(valor)`, que lo deja con los dos hijos a `NULL`.',
    pistas: ['Crea los dos nodos y después enlázalos desde `raiz->izquierda` y `raiz->derecha` (o con `establecerIzquierda` y `establecerDerecha`).'],
    ctx,
    casos: [{ nombre: 'Solo el 8', inicial: [raizABB('raiz', [8])] }],
    observar: ['raiz'],
    prohibidos: ['insertar()', 'insertarNodo()'],
    solucion: c(`
      Nodo *a = crearNodo(3);
      Nodo *b = crearNodo(10);
      raiz->izquierda = a;
      raiz->derecha = b;`),
  },
  {
    id: '8-02',
    tipo: 'programar',
    estructura: ABB,
    titulo: 'Inserta el 5 a mano',
    enunciado: 'El ABB `arbol` tiene 8, 3, 10, 1, 6 y 14, insertados en ese orden. Inserta el **5** en su sitio sin llamar a `insertar` ni a `insertarNodo`: baja tú por los punteros desde `arbol->raiz`.',
    pistas: ['Primero dibújalo: 8 arriba, 3 y 10 debajo...', '5 < 8: izquierda. 5 > 3: derecha. 5 < 6: izquierda, y ahí hay `NULL`. Ese es su sitio.'],
    alResolver: 'Un nodo nuevo siempre entra como **hoja**: es el sitio donde una búsqueda del 5 habría acabado en `NULL`.',
    ctx,
    casos: [{ nombre: 'ABB 8 3 10 1 6 14', inicial: [arbolABB('arbol', [8, 3, 10, 1, 6, 14])] }],
    observar: ['arbol'],
    prohibidos: ['insertar()', 'insertarNodo()'],
    solucion: c(`
      arbol->raiz->izquierda->derecha->izquierda = crearNodo(5);`),
  },
  {
    id: '8-03',
    tipo: 'programar',
    estructura: ABB,
    titulo: 'Quita una hoja a mano',
    enunciado: 'Quita el **14** del ABB `arbol` (tiene 8, 3, 10, 1, 6 y 14) sin llamar a `eliminar`: es una hoja. No dejes fugas ni punteros colgando.',
    pistas: ['Guarda un puntero a la hoja, pon a `NULL` el enlace de su padre y después haz `free`.'],
    ctx,
    casos: [{ nombre: 'ABB 8 3 10 1 6 14', inicial: [arbolABB('arbol', [8, 3, 10, 1, 6, 14])] }],
    observar: ['arbol'],
    prohibidos: ['eliminar()', 'eliminarNodo()'],
    solucion: c(`
      Nodo *hoja = arbol->raiz->derecha->derecha;
      arbol->raiz->derecha->derecha = NULL;
      free(hoja);`),
  },
  {
    id: '8-04',
    tipo: 'programar',
    estructura: ABB,
    titulo: 'Quita un nodo con un hijo a mano',
    enunciado: 'Quita el **10** del ABB `arbol` (tiene 8, 3, 10, 1, 6 y 14) sin llamar a `eliminar`. El 10 tiene un solo hijo: el 14.',
    pistas: ['El hijo sube a ocupar su sitio: el padre del 10 pasa a apuntar al 14.', 'Sigue siendo un ABB: todo lo que colgaba del 10 era mayor que 8.'],
    ctx,
    casos: [{ nombre: 'ABB 8 3 10 1 6 14', inicial: [arbolABB('arbol', [8, 3, 10, 1, 6, 14])] }],
    observar: ['arbol'],
    prohibidos: ['eliminar()', 'eliminarNodo()'],
    solucion: c(`
      Nodo *borrar = arbol->raiz->derecha;
      arbol->raiz->derecha = borrar->derecha;
      free(borrar);`),
  },
  {
    id: '8-05',
    tipo: 'programar',
    estructura: ABB,
    titulo: 'Baja hasta el mínimo',
    enunciado: 'Deja en `menor` un puntero al nodo con el valor más pequeño del ABB `arbol`, sin llamar a `minimo`. El árbol no está vacío.',
    pistas: ['En un ABB, lo menor está siempre a la izquierda.', 'Empieza en la raíz y baja por la izquierda mientras **haya** hijo izquierdo.'],
    ctx,
    casos: [
      { nombre: `ABB ${EJ_TXT}`, inicial: [arbolABB('arbol', EJ), puntero('menor')] },
      { nombre: 'ABB 5 7 9', inicial: [arbolABB('arbol', [5, 7, 9]), puntero('menor')] },
      { nombre: 'Solo el 4', inicial: [arbolABB('arbol', [4]), puntero('menor')] },
    ],
    observar: ['arbol', 'menor'],
    prohibidos: ['minimo()'],
    solucion: c(`
      menor = arbol->raiz;
      while (menor->izquierda != NULL) {
          menor = menor->izquierda;
      }`),
  },

  // ------------------------------------------------------------------ escribe la función
  {
    id: '8-06',
    tipo: 'programar',
    estructura: BIN,
    titulo: 'Escribe contarNodos',
    enunciado: 'Completa `contarNodos`: devuelve cuántos nodos tiene el árbol. Hazlo con recursión.',
    pistas: ['Caso base: el árbol vacío (`raiz == NULL`) tiene 0 nodos.', 'Si no, es 1 (la raíz) más los nodos de cada subárbol.'],
    ctx,
    casos: [
      { nombre: 'Vacío', inicial: [raizForma('raiz', '')], llamada: 'contarNodos(raiz)' },
      { nombre: 'Solo el 5', inicial: [raizForma('raiz', '5')], llamada: 'contarNodos(raiz)' },
      { nombre: F1, inicial: [raizForma('raiz', F1)], llamada: 'contarNodos(raiz)' },
    ],
    observar: ['raiz'],
    codigoInicial: c(`
      int contarNodos(Nodo *raiz) {

      }`),
    solucion: c(`
      int contarNodos(Nodo *raiz) {
          if (raiz == NULL) return 0;
          return 1 + contarNodos(raiz->izquierda) + contarNodos(raiz->derecha);
      }`),
  },
  {
    id: '8-07',
    tipo: 'programar',
    estructura: BIN,
    titulo: 'Escribe sumar',
    enunciado: 'Completa `sumar`: devuelve la suma de todos los valores del árbol (0 si está vacío).',
    pistas: ['Es `contarNodos` cambiando el 1 de la raíz por su valor.'],
    ctx,
    casos: [
      { nombre: 'Vacío', inicial: [raizForma('raiz', '')], llamada: 'sumar(raiz)' },
      { nombre: 'Solo el 5', inicial: [raizForma('raiz', '5')], llamada: 'sumar(raiz)' },
      { nombre: F1, inicial: [raizForma('raiz', F1)], llamada: 'sumar(raiz)' },
    ],
    observar: ['raiz'],
    codigoInicial: c(`
      int sumar(Nodo *raiz) {

      }`),
    solucion: c(`
      int sumar(Nodo *raiz) {
          if (raiz == NULL) return 0;
          return raiz->valor + sumar(raiz->izquierda) + sumar(raiz->derecha);
      }`),
  },
  {
    id: '8-08',
    tipo: 'programar',
    estructura: BIN,
    titulo: 'Escribe contarHojas',
    enunciado: 'Completa `contarHojas`: devuelve cuántas hojas (nodos sin ningún hijo) tiene el árbol.',
    pistas: ['Hay dos casos base: el árbol vacío (0 hojas) y una hoja (1).', 'Si no es ninguno de los dos, suma las hojas de los dos subárboles: la raíz no cuenta.'],
    ctx,
    casos: [
      { nombre: 'Vacío', inicial: [raizForma('raiz', '')], llamada: 'contarHojas(raiz)' },
      { nombre: F1, inicial: [raizForma('raiz', F1)], llamada: 'contarHojas(raiz)' },
      { nombre: F2, inicial: [raizForma('raiz', F2)], llamada: 'contarHojas(raiz)' },
    ],
    observar: ['raiz'],
    codigoInicial: c(`
      int contarHojas(Nodo *raiz) {

      }`),
    solucion: c(`
      int contarHojas(Nodo *raiz) {
          if (raiz == NULL) return 0;
          if (raiz->izquierda == NULL && raiz->derecha == NULL) return 1;
          return contarHojas(raiz->izquierda) + contarHojas(raiz->derecha);
      }`),
  },
  {
    id: '8-09',
    tipo: 'programar',
    estructura: BIN,
    titulo: 'Escribe altura',
    enunciado: 'Completa `altura`: el número de niveles del camino más largo desde la raíz. El árbol vacío tiene altura 0 y uno con solo la raíz, 1.',
    pistas: ['Calcula la altura de cada subárbol y quédate con la mayor.', 'No olvides sumar 1 por la raíz.'],
    ctx,
    casos: [
      { nombre: 'Vacío', inicial: [raizForma('raiz', '')], llamada: 'altura(raiz)' },
      { nombre: 'Solo el 5', inicial: [raizForma('raiz', '5')], llamada: 'altura(raiz)' },
      { nombre: F1, inicial: [raizForma('raiz', F1)], llamada: 'altura(raiz)' },
      { nombre: '4(2(1,),6)', inicial: [raizForma('raiz', '4(2(1,),6)')], llamada: 'altura(raiz)' },
    ],
    observar: ['raiz'],
    codigoInicial: c(`
      int altura(Nodo *raiz) {

      }`),
    solucion: c(`
      int altura(Nodo *raiz) {
          if (raiz == NULL) return 0;
          int izq = altura(raiz->izquierda);
          int der = altura(raiz->derecha);
          if (izq > der) return izq + 1;
          return der + 1;
      }`),
  },
  {
    id: '8-10',
    tipo: 'programar',
    estructura: BIN,
    titulo: 'El mayor de un árbol cualquiera',
    enunciado: 'Completa `mayor`: devuelve el valor más grande del árbol, que **no** es de búsqueda (lo mayor puede estar en cualquier sitio). El árbol nunca está vacío.',
    pistas: ['Empieza suponiendo que el mayor es la raíz.', 'Compáralo con el mayor de cada subárbol, pero llama solo si ese hijo existe: `mayor` no sabe qué devolver con `NULL`.'],
    ctx,
    casos: [
      { nombre: 'Solo el 5', inicial: [raizForma('raiz', '5')], llamada: 'mayor(raiz)' },
      { nombre: F1, inicial: [raizForma('raiz', F1)], llamada: 'mayor(raiz)' },
      { nombre: F2, inicial: [raizForma('raiz', F2)], llamada: 'mayor(raiz)' },
      { nombre: '2(1,)', inicial: [raizForma('raiz', '2(1,)')], llamada: 'mayor(raiz)' },
    ],
    observar: ['raiz'],
    codigoInicial: c(`
      int mayor(Nodo *raiz) {

      }`),
    solucion: c(`
      int mayor(Nodo *raiz) {
          int m = raiz->valor;
          if (raiz->izquierda != NULL) {
              int i = mayor(raiz->izquierda);
              if (i > m) m = i;
          }
          if (raiz->derecha != NULL) {
              int d = mayor(raiz->derecha);
              if (d > m) m = d;
          }
          return m;
      }`),
  },
  {
    id: '8-11',
    tipo: 'programar',
    estructura: BIN,
    titulo: 'Escribe preOrden',
    enunciado: 'Completa `preOrden`: escribe con `printf("%d ", ...)` los valores del árbol en preorden (la raíz, después el subárbol izquierdo y después el derecho).',
    pistas: ['Si el árbol está vacío no se escribe nada: `return`.', 'Tres líneas: escribir la raíz y dos llamadas recursivas.'],
    alResolver: 'Cambiando de sitio el `printf` salen el inorden (entre las dos llamadas) y el postorden (después de las dos).',
    ctx,
    casos: [
      { nombre: F1, inicial: [raizForma('raiz', F1)], llamada: 'preOrden(raiz)' },
      { nombre: F2, inicial: [raizForma('raiz', F2)], llamada: 'preOrden(raiz)' },
      { nombre: 'Vacío', inicial: [raizForma('raiz', '')], llamada: 'preOrden(raiz)' },
    ],
    observar: ['raiz'],
    codigoInicial: c(`
      void preOrden(Nodo *raiz) {

      }`),
    solucion: c(`
      void preOrden(Nodo *raiz) {
          if (raiz == NULL) return;
          printf("%d ", raiz->valor);
          preOrden(raiz->izquierda);
          preOrden(raiz->derecha);
      }`),
  },
  {
    id: '8-12',
    tipo: 'programar',
    estructura: ABB,
    titulo: 'De mayor a menor',
    enunciado: 'Completa `mayorAMenor`: escribe con `printf("%d ", ...)` los valores del ABB de mayor a menor.',
    pistas: ['El inorden (izquierda, raíz, derecha) sale de menor a mayor.', 'Dale la vuelta: derecha, raíz, izquierda.'],
    ctx,
    casos: [
      { nombre: `ABB ${EJ_TXT}`, inicial: [raizABB('raiz', EJ)], llamada: 'mayorAMenor(raiz)' },
      { nombre: 'ABB 5 2', inicial: [raizABB('raiz', [5, 2])], llamada: 'mayorAMenor(raiz)' },
      { nombre: 'Vacío', inicial: [raizABB('raiz', [])], llamada: 'mayorAMenor(raiz)' },
    ],
    observar: ['raiz'],
    codigoInicial: c(`
      void mayorAMenor(Nodo *raiz) {

      }`),
    solucion: c(`
      void mayorAMenor(Nodo *raiz) {
          if (raiz == NULL) return;
          mayorAMenor(raiz->derecha);
          printf("%d ", raiz->valor);
          mayorAMenor(raiz->izquierda);
      }`),
  },
  {
    id: '8-13',
    tipo: 'programar',
    estructura: ABB,
    titulo: 'Escribe buscar',
    enunciado: 'Completa `buscar`: devuelve 1 si `valor` está en el ABB y 0 si no. Baja por **un solo** camino: no mires los dos subárboles.',
    pistas: ['Casos base: árbol vacío (no está) y raíz con ese valor (está).', 'Si es menor que la raíz, solo puede estar a la izquierda.'],
    ctx,
    casos: [
      { nombre: `Busca 7 en ${EJ_TXT}`, inicial: [raizABB('raiz', EJ)], llamada: 'buscar(raiz, 7)' },
      { nombre: `Busca 5 en ${EJ_TXT}`, inicial: [raizABB('raiz', EJ)], llamada: 'buscar(raiz, 5)' },
      { nombre: 'Busca 13', inicial: [raizABB('raiz', EJ)], llamada: 'buscar(raiz, 13)' },
      { nombre: 'Vacío', inicial: [raizABB('raiz', [])], llamada: 'buscar(raiz, 3)' },
    ],
    observar: ['raiz'],
    codigoInicial: c(`
      int buscar(Nodo *raiz, int valor) {

      }`),
    solucion: c(`
      int buscar(Nodo *raiz, int valor) {
          if (raiz == NULL) return 0;
          if (valor == raiz->valor) return 1;
          if (valor < raiz->valor) return buscar(raiz->izquierda, valor);
          return buscar(raiz->derecha, valor);
      }`),
  },
  {
    id: '8-14',
    tipo: 'programar',
    estructura: ABB,
    titulo: 'Escribe maximo',
    enunciado: 'Completa `maximo`: devuelve un puntero al nodo con el valor más grande del ABB, o `NULL` si está vacío. Sin recursión: con un bucle.',
    pistas: ['Lo mayor está bajando siempre por la derecha.', 'Para en el nodo que **no tiene** hijo derecho, no en el `NULL`.'],
    ctx,
    casos: [
      { nombre: EJ_TXT, inicial: [raizABB('raiz', EJ)], llamada: 'maximo(raiz)' },
      { nombre: 'ABB 9 7 5', inicial: [raizABB('raiz', [9, 7, 5])], llamada: 'maximo(raiz)' },
      { nombre: 'Vacío', inicial: [raizABB('raiz', [])], llamada: 'maximo(raiz)' },
    ],
    observar: ['raiz'],
    codigoInicial: c(`
      Nodo *maximo(Nodo *raiz) {

      }`),
    solucion: c(`
      Nodo *maximo(Nodo *raiz) {
          if (raiz == NULL) return NULL;
          while (raiz->derecha != NULL) {
              raiz = raiz->derecha;
          }
          return raiz;
      }`),
  },
  {
    id: '8-15',
    tipo: 'programar',
    estructura: ABB,
    titulo: 'Escribe insertarNodo',
    enunciado: 'Completa `insertarNodo`: inserta `valor` en el ABB que empieza en `raiz` y devuelve la raíz (que solo cambia si estaba vacío). Si el valor ya está, no hace nada. Se llama así: `raiz = insertarNodo(raiz, 5);`.',
    pistas: ['Árbol vacío: el nuevo nodo es la raíz, devuélvelo.', 'Si no, inserta en el subárbol que toque y **guarda** lo que devuelve: `raiz->izquierda = insertarNodo(raiz->izquierda, valor);`.'],
    alResolver: 'Devolver la raíz es lo que permite cambiarla desde dentro: con `Nodo *raiz` como parámetro, `raiz = crearNodo(valor)` solo cambiaría la copia local.',
    ctx,
    casos: [
      { nombre: 'Vacío, inserta 5', inicial: [raizABB('raiz', [])], llamada: 'raiz = insertarNodo(raiz, 5)' },
      { nombre: `Inserta 5 en ${EJ_TXT}`, inicial: [raizABB('raiz', EJ)], llamada: 'raiz = insertarNodo(raiz, 5)' },
      { nombre: 'Inserta 20', inicial: [raizABB('raiz', EJ)], llamada: 'raiz = insertarNodo(raiz, 20)' },
      { nombre: 'Inserta 6, que ya está', inicial: [raizABB('raiz', EJ)], llamada: 'raiz = insertarNodo(raiz, 6)' },
    ],
    observar: ['raiz'],
    codigoInicial: c(`
      Nodo *insertarNodo(Nodo *raiz, int valor) {

      }`),
    solucion: c(`
      Nodo *insertarNodo(Nodo *raiz, int valor) {
          if (raiz == NULL) return crearNodo(valor);
          if (valor < raiz->valor) {
              raiz->izquierda = insertarNodo(raiz->izquierda, valor);
          } else if (valor > raiz->valor) {
              raiz->derecha = insertarNodo(raiz->derecha, valor);
          }
          return raiz;
      }`),
  },
  {
    id: '8-16',
    tipo: 'programar',
    estructura: ABB,
    titulo: 'Cuenta los menores',
    enunciado: 'Completa `contarMenores`: devuelve cuántos valores del ABB son **menores** que `x`. Aprovecha que es de búsqueda: si la raíz no es menor que `x`, nada de su derecha lo es.',
    pistas: ['Si `raiz->valor >= x`, solo pueden estar a la izquierda.', 'Si es menor, cuenta la raíz, todo su subárbol izquierdo y los menores de la derecha.'],
    ctx,
    casos: [
      { nombre: `Menores que 7 en ${EJ_TXT}`, inicial: [raizABB('raiz', EJ)], llamada: 'contarMenores(raiz, 7)' },
      { nombre: 'Menores que 100', inicial: [raizABB('raiz', EJ)], llamada: 'contarMenores(raiz, 100)' },
      { nombre: 'Menores que 1', inicial: [raizABB('raiz', EJ)], llamada: 'contarMenores(raiz, 1)' },
      { nombre: 'Vacío', inicial: [raizABB('raiz', [])], llamada: 'contarMenores(raiz, 3)' },
    ],
    observar: ['raiz'],
    codigoInicial: c(`
      int contarMenores(Nodo *raiz, int x) {

      }`),
    solucion: c(`
      int contarMenores(Nodo *raiz, int x) {
          if (raiz == NULL) return 0;
          if (raiz->valor >= x) return contarMenores(raiz->izquierda, x);
          return 1 + contarNodos(raiz->izquierda) + contarMenores(raiz->derecha, x);
      }`),
  },
  {
    id: '8-17',
    tipo: 'programar',
    estructura: BIN,
    titulo: 'Escribe liberarNodos',
    enunciado: 'Completa `liberarNodos`: libera con `free` todos los nodos del árbol, sin usar ninguno después de liberarlo.',
    pistas: ['¿En qué recorrido el padre va después de los hijos?', 'En postorden: primero los dos subárboles y al final `free(raiz)`.'],
    ctx,
    casos: [
      { nombre: F1, inicial: [raizForma('raiz', F1)], llamada: 'liberarNodos(raiz)' },
      { nombre: 'Solo el 5', inicial: [raizForma('raiz', '5')], llamada: 'liberarNodos(raiz)' },
      { nombre: 'Vacío', inicial: [raizForma('raiz', '')], llamada: 'liberarNodos(raiz)' },
    ],
    observar: ['raiz'],
    codigoInicial: c(`
      void liberarNodos(Nodo *raiz) {

      }`),
    solucion: c(`
      void liberarNodos(Nodo *raiz) {
          if (raiz == NULL) return;
          liberarNodos(raiz->izquierda);
          liberarNodos(raiz->derecha);
          free(raiz);
      }`),
  },
  {
    id: '8-18',
    tipo: 'programar',
    estructura: BIN,
    titulo: 'El árbol en el espejo',
    enunciado: 'Completa `espejo`: deja el árbol como se vería en un espejo, intercambiando en **cada** nodo su hijo izquierdo y su hijo derecho.',
    pistas: ['Con un puntero auxiliar, intercambia los dos hijos de la raíz.', 'Después, haz lo mismo con cada subárbol.'],
    ctx,
    casos: [
      { nombre: F1, inicial: [raizForma('raiz', F1)], llamada: 'espejo(raiz)' },
      { nombre: F2, inicial: [raizForma('raiz', F2)], llamada: 'espejo(raiz)' },
      { nombre: 'Vacío', inicial: [raizForma('raiz', '')], llamada: 'espejo(raiz)' },
    ],
    observar: ['raiz'],
    codigoInicial: c(`
      void espejo(Nodo *raiz) {

      }`),
    solucion: c(`
      void espejo(Nodo *raiz) {
          if (raiz == NULL) return;
          Nodo *aux = raiz->izquierda;
          raiz->izquierda = raiz->derecha;
          raiz->derecha = aux;
          espejo(raiz->izquierda);
          espejo(raiz->derecha);
      }`),
  },
  {
    id: '8-19',
    tipo: 'programar',
    estructura: ABB,
    titulo: 'En qué nivel está',
    enunciado: 'Completa `nivel`: devuelve el nivel en que está `valor` en el ABB (la raíz está en el nivel 0, sus hijos en el 1...) o -1 si no está.',
    pistas: ['Con un bucle: baja como en una búsqueda contando los pasos.', 'Si llegas a `NULL`, no estaba.'],
    ctx,
    casos: [
      { nombre: `El 7 en ${EJ_TXT}`, inicial: [raizABB('raiz', EJ)], llamada: 'nivel(raiz, 7)' },
      { nombre: 'El 8', inicial: [raizABB('raiz', EJ)], llamada: 'nivel(raiz, 8)' },
      { nombre: 'El 5, que no está', inicial: [raizABB('raiz', EJ)], llamada: 'nivel(raiz, 5)' },
      { nombre: 'Vacío', inicial: [raizABB('raiz', [])], llamada: 'nivel(raiz, 1)' },
    ],
    observar: ['raiz'],
    codigoInicial: c(`
      int nivel(Nodo *raiz, int valor) {

      }`),
    solucion: c(`
      int nivel(Nodo *raiz, int valor) {
          int n = 0;
          while (raiz != NULL) {
              if (valor == raiz->valor) return n;
              if (valor < raiz->valor) raiz = raiz->izquierda;
              else raiz = raiz->derecha;
              n++;
          }
          return -1;
      }`),
  },
  {
    id: '8-20',
    tipo: 'programar',
    estructura: BIN,
    titulo: '¿Son iguales?',
    enunciado: 'Completa `sonIguales`: devuelve 1 si los árboles `a` y `b` tienen la misma forma y los mismos valores en los mismos sitios, y 0 si no.',
    pistas: ['Si los dos están vacíos, son iguales. Si solo uno lo está, no.', 'Si no, tienen que coincidir las raíces y ser iguales los dos pares de subárboles.'],
    ctx,
    casos: [
      { nombre: `${F1} y ${F1}`, inicial: [raizForma('a', F1), raizForma('b', F1)], llamada: 'sonIguales(a, b)' },
      { nombre: `${F1} y 5(9(2,),7(4,))`, inicial: [raizForma('a', F1), raizForma('b', '5(9(2,),7(4,))')], llamada: 'sonIguales(a, b)' },
      { nombre: '2(1,) y 2(,1)', inicial: [raizForma('a', '2(1,)'), raizForma('b', '2(,1)')], llamada: 'sonIguales(a, b)' },
      { nombre: 'Los dos vacíos', inicial: [raizForma('a', ''), raizForma('b', '')], llamada: 'sonIguales(a, b)' },
      { nombre: '5 y vacío', inicial: [raizForma('a', '5'), raizForma('b', '')], llamada: 'sonIguales(a, b)' },
    ],
    observar: ['a', 'b'],
    codigoInicial: c(`
      int sonIguales(Nodo *a, Nodo *b) {

      }`),
    solucion: c(`
      int sonIguales(Nodo *a, Nodo *b) {
          if (a == NULL && b == NULL) return 1;
          if (a == NULL || b == NULL) return 0;
          if (a->valor != b->valor) return 0;
          return sonIguales(a->izquierda, b->izquierda) && sonIguales(a->derecha, b->derecha);
      }`),
  },

  // ------------------------------------------------------------------ encuentra el fallo
  {
    id: '8-F1',
    tipo: 'fallo',
    estructura: BIN,
    titulo: 'contarNodos sin freno',
    enunciado: 'Este `contarNodos` es muy corto. Demasiado.',
    ctx,
    casos: [
      { nombre: 'Solo el 5', inicial: [raizForma('raiz', '5')], llamada: 'contarNodos(raiz)' },
      { nombre: F1, inicial: [raizForma('raiz', F1)], llamada: 'contarNodos(raiz)' },
    ],
    observar: ['raiz'],
    codigo: c(`
      int contarNodos(Nodo *raiz) {
          return 1 + contarNodos(raiz->izquierda) + contarNodos(raiz->derecha);
      }`),
    lineasFallo: [1, 2],
    preguntaLinea: 'Marca la línea donde falta algo',
    tiposFallo: ['recursion', 'nulo'],
    explicacion: 'Falta el **caso base**. Toda recursión sobre un árbol acaba llamándose con un hijo que no existe: sin `if (raiz == NULL) return 0;` esa llamada hace `NULL->izquierda`.',
    solucion: c(`
      int contarNodos(Nodo *raiz) {
          if (raiz == NULL) return 0;
          return 1 + contarNodos(raiz->izquierda) + contarNodos(raiz->derecha);
      }`),
  },
  {
    id: '8-F2',
    tipo: 'fallo',
    estructura: BIN,
    titulo: 'Una altura que a veces se queda corta',
    enunciado: 'Esta `altura` acierta con unos árboles y con otros no.',
    ctx,
    casos: [
      { nombre: F2, inicial: [raizForma('raiz', F2)], llamada: 'altura(raiz)' },
      { nombre: '4(2(1,),6)', inicial: [raizForma('raiz', '4(2(1,),6)')], llamada: 'altura(raiz)' },
    ],
    observar: ['raiz'],
    codigo: c(`
      int altura(Nodo *raiz) {
          if (raiz == NULL) return 0;
          int izq = altura(raiz->izquierda);
          int der = altura(raiz->derecha);
          return izq > der ? izq : der + 1;
      }`),
    lineasFallo: [5],
    tiposFallo: ['recursion'],
    explicacion: 'El `+ 1` solo se aplica a `der`: `?:` no reparte la suma entre las dos ramas. Cuando el subárbol izquierdo es el más alto se olvida de contar la raíz. Va así: `return (izq > der ? izq : der) + 1;`.',
    solucion: c(`
      int altura(Nodo *raiz) {
          if (raiz == NULL) return 0;
          int izq = altura(raiz->izquierda);
          int der = altura(raiz->derecha);
          return (izq > der ? izq : der) + 1;
      }`),
  },
  {
    id: '8-F3',
    tipo: 'fallo',
    estructura: ABB,
    titulo: 'insertarNodo que no engancha',
    enunciado: 'Este `insertarNodo` crea el nodo nuevo, seguro. ¿Dónde acaba?',
    ctx,
    casos: [
      { nombre: 'Vacío, inserta 5', inicial: [raizABB('raiz', [])], llamada: 'raiz = insertarNodo(raiz, 5)' },
      { nombre: `Inserta 5 en ${EJ_TXT}`, inicial: [raizABB('raiz', EJ)], llamada: 'raiz = insertarNodo(raiz, 5)' },
    ],
    observar: ['raiz'],
    codigo: c(`
      Nodo *insertarNodo(Nodo *raiz, int valor) {
          if (raiz == NULL) return crearNodo(valor);
          if (valor < raiz->valor) insertarNodo(raiz->izquierda, valor);
          else if (valor > raiz->valor) insertarNodo(raiz->derecha, valor);
          return raiz;
      }`),
    lineasFallo: [3, 4],
    tiposFallo: ['fuga', 'recursion'],
    explicacion: 'Las llamadas recursivas devuelven la raíz del subárbol (el nodo nuevo, si estaba vacío), pero nadie la guarda: el nodo se crea y no lo apunta nadie. Hay que engancharla: `raiz->izquierda = insertarNodo(raiz->izquierda, valor);`.',
    solucion: c(`
      Nodo *insertarNodo(Nodo *raiz, int valor) {
          if (raiz == NULL) return crearNodo(valor);
          if (valor < raiz->valor) raiz->izquierda = insertarNodo(raiz->izquierda, valor);
          else if (valor > raiz->valor) raiz->derecha = insertarNodo(raiz->derecha, valor);
          return raiz;
      }`),
  },
  {
    id: '8-F4',
    tipo: 'fallo',
    estructura: ABB,
    titulo: 'buscar con brújula invertida',
    enunciado: 'Este `buscar` encuentra la raíz siempre. Lo demás, no tanto.',
    ctx,
    casos: [
      { nombre: `Busca 8 en ${EJ_TXT}`, inicial: [raizABB('raiz', EJ)], llamada: 'buscar(raiz, 8)' },
      { nombre: 'Busca 7', inicial: [raizABB('raiz', EJ)], llamada: 'buscar(raiz, 7)' },
      { nombre: 'Busca 5', inicial: [raizABB('raiz', EJ)], llamada: 'buscar(raiz, 5)' },
    ],
    observar: ['raiz'],
    codigo: c(`
      int buscar(Nodo *raiz, int valor) {
          if (raiz == NULL) return 0;
          if (valor == raiz->valor) return 1;
          if (valor > raiz->valor) return buscar(raiz->izquierda, valor);
          return buscar(raiz->derecha, valor);
      }`),
    lineasFallo: [4, 5],
    tiposFallo: ['recursion'],
    explicacion: 'Baja hacia el lado contrario: los **mayores** están a la derecha. Con el 7 se va del 8 al 10 y no lo encuentra. Va `valor < raiz->valor` con la izquierda.',
    solucion: c(`
      int buscar(Nodo *raiz, int valor) {
          if (raiz == NULL) return 0;
          if (valor == raiz->valor) return 1;
          if (valor < raiz->valor) return buscar(raiz->izquierda, valor);
          return buscar(raiz->derecha, valor);
      }`),
  },
  {
    id: '8-F5',
    tipo: 'fallo',
    estructura: BIN,
    titulo: 'Liberar con prisa',
    enunciado: 'Este `liberarNodos` libera primero la raíz, que es lo que tiene más a mano.',
    ctx,
    casos: [
      { nombre: 'Vacío', inicial: [raizForma('raiz', '')], llamada: 'liberarNodos(raiz)' },
      { nombre: F1, inicial: [raizForma('raiz', F1)], llamada: 'liberarNodos(raiz)' },
    ],
    observar: ['raiz'],
    codigo: c(`
      void liberarNodos(Nodo *raiz) {
          if (raiz == NULL) return;
          free(raiz);
          liberarNodos(raiz->izquierda);
          liberarNodos(raiz->derecha);
      }`),
    lineasFallo: [3, 4],
    tiposFallo: ['liberado'],
    explicacion: 'Después de `free(raiz)` ya no se puede leer `raiz->izquierda`. Hay que liberar en **postorden**: los hijos primero y el padre al final.',
    solucion: c(`
      void liberarNodos(Nodo *raiz) {
          if (raiz == NULL) return;
          liberarNodos(raiz->izquierda);
          liberarNodos(raiz->derecha);
          free(raiz);
      }`),
  },
  {
    id: '8-F6',
    tipo: 'fallo',
    estructura: ABB,
    titulo: 'minimo confiado',
    enunciado: 'Este `minimo` baja por la izquierda sin miedo.',
    ctx,
    casos: [
      { nombre: EJ_TXT, inicial: [raizABB('raiz', EJ)], llamada: 'minimo(raiz)' },
      { nombre: 'Vacío', inicial: [raizABB('raiz', [])], llamada: 'minimo(raiz)' },
    ],
    observar: ['raiz'],
    codigo: c(`
      Nodo *minimo(Nodo *raiz) {
          while (raiz->izquierda != NULL) {
              raiz = raiz->izquierda;
          }
          return raiz;
      }`),
    lineasFallo: [1, 2],
    preguntaLinea: 'Marca la línea donde falla (o donde falta algo)',
    tiposFallo: ['nulo', 'caso'],
    explicacion: 'Con el árbol vacío, `raiz` es `NULL` y `raiz->izquierda` revienta. Falta `if (raiz == NULL) return NULL;` antes del bucle.',
    solucion: c(`
      Nodo *minimo(Nodo *raiz) {
          if (raiz == NULL) return NULL;
          while (raiz->izquierda != NULL) {
              raiz = raiz->izquierda;
          }
          return raiz;
      }`),
  },
  {
    id: '8-F7',
    tipo: 'fallo',
    estructura: ABB,
    titulo: 'Quitar una hoja sin avisar al padre',
    enunciado: 'Esta función solo quita hojas, y el valor siempre está. Se llama así: `raiz = eliminarHoja(raiz, 4);`.',
    ctx,
    casos: [
      { nombre: 'Solo el 5, quita 5', inicial: [raizABB('raiz', [5])], llamada: 'raiz = eliminarHoja(raiz, 5)' },
      { nombre: `Quita 4 de ${EJ_TXT}`, inicial: [raizABB('raiz', EJ)], llamada: 'raiz = eliminarHoja(raiz, 4)' },
    ],
    observar: ['raiz'],
    codigo: c(`
      Nodo *eliminarHoja(Nodo *raiz, int valor) {
          if (valor < raiz->valor) {
              eliminarHoja(raiz->izquierda, valor);
              return raiz;
          }
          if (valor > raiz->valor) {
              eliminarHoja(raiz->derecha, valor);
              return raiz;
          }
          free(raiz);
          return NULL;
      }`),
    lineasFallo: [3, 7],
    tiposFallo: ['colgante', 'recursion'],
    explicacion: 'La hoja se libera y su llamada devuelve `NULL`, pero el padre no lo guarda: su enlace sigue apuntando al nodo liberado. Hay que escribir `raiz->izquierda = eliminarHoja(raiz->izquierda, valor);` (y lo mismo a la derecha).',
    solucion: c(`
      Nodo *eliminarHoja(Nodo *raiz, int valor) {
          if (valor < raiz->valor) {
              raiz->izquierda = eliminarHoja(raiz->izquierda, valor);
              return raiz;
          }
          if (valor > raiz->valor) {
              raiz->derecha = eliminarHoja(raiz->derecha, valor);
              return raiz;
          }
          free(raiz);
          return NULL;
      }`),
  },
  {
    id: '8-F8',
    tipo: 'fallo',
    estructura: BIN,
    titulo: 'Hojas que no existen',
    enunciado: 'Este `contarHojas` cuenta de más con algunos árboles.',
    ctx,
    casos: [
      { nombre: '2(1,3)', inicial: [raizForma('raiz', '2(1,3)')], llamada: 'contarHojas(raiz)' },
      { nombre: F1, inicial: [raizForma('raiz', F1)], llamada: 'contarHojas(raiz)' },
      { nombre: 'Vacío', inicial: [raizForma('raiz', '')], llamada: 'contarHojas(raiz)' },
    ],
    observar: ['raiz'],
    codigo: c(`
      int contarHojas(Nodo *raiz) {
          if (raiz == NULL) return 1;
          if (raiz->izquierda == NULL && raiz->derecha == NULL) return 1;
          return contarHojas(raiz->izquierda) + contarHojas(raiz->derecha);
      }`),
    lineasFallo: [2],
    tiposFallo: ['recursion', 'caso'],
    explicacion: 'Un hueco vacío no es una hoja: con `return 1` en el caso `NULL`, cada nodo con un solo hijo suma una hoja de más, y el árbol vacío tiene una. El caso base vacío devuelve 0.',
    solucion: c(`
      int contarHojas(Nodo *raiz) {
          if (raiz == NULL) return 0;
          if (raiz->izquierda == NULL && raiz->derecha == NULL) return 1;
          return contarHojas(raiz->izquierda) + contarHojas(raiz->derecha);
      }`),
  },
  {
    id: '8-F9',
    tipo: 'fallo',
    estructura: ABB,
    titulo: 'La raíz que no llega',
    enunciado: 'Este `insertarEn` va bien con árboles que ya tienen algo. Prueba a estrenarlo con uno vacío.',
    ctx,
    casos: [
      { nombre: `Inserta 5 en ${EJ_TXT}`, inicial: [arbolABB('arbol', EJ)], llamada: 'insertarEn(arbol, 5)' },
      { nombre: 'Vacío, inserta 5', inicial: [arbolABB('arbol', [])], llamada: 'insertarEn(arbol, 5)' },
    ],
    observar: ['arbol'],
    codigo: c(`
      void insertarEn(Arbol *arbol, int valor) {
          Nodo *raiz = arbol->raiz;
          if (raiz == NULL) {
              raiz = crearNodo(valor);
              return;
          }
          while (raiz->valor != valor) {
              if (valor < raiz->valor) {
                  if (raiz->izquierda == NULL) raiz->izquierda = crearNodo(valor);
                  raiz = raiz->izquierda;
              } else {
                  if (raiz->derecha == NULL) raiz->derecha = crearNodo(valor);
                  raiz = raiz->derecha;
              }
          }
      }`),
    lineasFallo: [4],
    tiposFallo: ['fuga', 'pierde'],
    explicacion: '`raiz` es una copia de `arbol->raiz`: cambiarla no cambia el árbol. El nodo nuevo se queda sin nadie que lo apunte y el árbol sigue vacío. Va `arbol->raiz = crearNodo(valor);`. Es lo mismo que le pasaría a un `insertar(Nodo *raiz, ...)`: por eso `insertar` recibe el `Arbol *` o `insertarNodo` devuelve la raíz.',
    solucion: c(`
      void insertarEn(Arbol *arbol, int valor) {
          Nodo *raiz = arbol->raiz;
          if (raiz == NULL) {
              arbol->raiz = crearNodo(valor);
              return;
          }
          while (raiz->valor != valor) {
              if (valor < raiz->valor) {
                  if (raiz->izquierda == NULL) raiz->izquierda = crearNodo(valor);
                  raiz = raiz->izquierda;
              } else {
                  if (raiz->derecha == NULL) raiz->derecha = crearNodo(valor);
                  raiz = raiz->derecha;
              }
          }
      }`),
  },

  // ------------------------------------------------------------------ funciones misteriosas
  {
    id: '8-M1',
    tipo: 'misterio',
    estructura: BIN,
    titulo: 'Primero yo',
    enunciado: 'Predice qué escribe en cada caso. Después di qué hace.',
    ctx,
    casos: [
      { nombre: F1, inicial: [raizForma('raiz', F1)], llamada: 'misterio(raiz)' },
      { nombre: '4(2(1,3),6)', inicial: [raizForma('raiz', '4(2(1,3),6)')], llamada: 'misterio(raiz)' },
    ],
    observar: ['raiz'],
    responder: ['salida'],
    solucion: c(`
      void misterio(Nodo *r) {
          if (r == NULL) return;
          printf("%d ", r->valor);
          misterio(r->izquierda);
          misterio(r->derecha);
      }`),
    opciones: ['Escribe el árbol en preorden: cada nodo antes que sus subárboles.', 'Escribe el árbol en inorden.', 'Escribe el árbol en postorden.', 'Escribe el árbol por niveles, de arriba abajo.'],
    correcta: 0,
    explicacion: 'Escribe la raíz y después recorre **entero** el subárbol izquierdo antes de pasar al derecho. Por eso con 5(9(2,),7(4,1)) sale el 2 antes que el 7: no va por niveles.',
  },
  {
    id: '8-M2',
    tipo: 'misterio',
    estructura: BIN,
    titulo: 'Yo, al final',
    enunciado: 'Predice qué escribe en cada caso. Después di qué hace.',
    ctx,
    casos: [
      { nombre: F1, inicial: [raizForma('raiz', F1)], llamada: 'misterio(raiz)' },
      { nombre: '4(2(1,3),6)', inicial: [raizForma('raiz', '4(2(1,3),6)')], llamada: 'misterio(raiz)' },
    ],
    observar: ['raiz'],
    responder: ['salida'],
    solucion: c(`
      void misterio(Nodo *r) {
          if (r == NULL) return;
          misterio(r->izquierda);
          misterio(r->derecha);
          printf("%d ", r->valor);
      }`),
    opciones: ['Escribe el árbol en postorden: cada nodo después de sus dos subárboles.', 'Escribe el árbol en preorden.', 'Escribe el árbol en inorden.', 'Escribe el árbol por niveles, de abajo arriba.'],
    correcta: 0,
    explicacion: 'La raíz sale la última de su subárbol. Es el orden en que hay que liberar: cuando se libera un nodo, sus hijos ya no hacen falta.',
  },
  {
    id: '8-M3',
    tipo: 'misterio',
    estructura: ABB,
    titulo: 'En medio',
    enunciado: 'El árbol es un ABB construido insertando los valores en el orden del caso. Predice qué escribe y di qué hace.',
    ctx,
    casos: [
      { nombre: 'ABB 5 2 8 1 9 3', inicial: [raizABB('raiz', [5, 2, 8, 1, 9, 3])], llamada: 'misterio(raiz)' },
      { nombre: 'ABB 4 7 6', inicial: [raizABB('raiz', [4, 7, 6])], llamada: 'misterio(raiz)' },
    ],
    observar: ['raiz'],
    responder: ['salida'],
    solucion: c(`
      void misterio(Nodo *r) {
          if (r == NULL) return;
          misterio(r->izquierda);
          printf("%d ", r->valor);
          misterio(r->derecha);
      }`),
    opciones: ['Escribe los valores de menor a mayor.', 'Escribe los valores en el orden en que se insertaron.', 'Escribe los valores de mayor a menor.', 'Escribe solo las hojas, de izquierda a derecha.'],
    correcta: 0,
    explicacion: 'Es el inorden. En un ABB todo lo de la izquierda es menor y todo lo de la derecha mayor, así que escribir izquierda, raíz y derecha los deja ordenados. Ordenar insertando en un ABB y recorriendo en inorden es el **treesort**.',
  },
  {
    id: '8-M4',
    tipo: 'misterio',
    estructura: BIN,
    titulo: 'Hijos únicos',
    enunciado: 'Predice qué devuelve en cada caso. Después di qué hace.',
    ctx,
    casos: [
      { nombre: F1, inicial: [raizForma('raiz', F1)], llamada: 'misterio(raiz)' },
      { nombre: F2, inicial: [raizForma('raiz', F2)], llamada: 'misterio(raiz)' },
      { nombre: '2(1,3)', inicial: [raizForma('raiz', '2(1,3)')], llamada: 'misterio(raiz)' },
    ],
    observar: ['raiz'],
    responder: ['devuelve'],
    solucion: c(`
      int misterio(Nodo *r) {
          if (r == NULL) return 0;
          int n = misterio(r->izquierda) + misterio(r->derecha);
          if ((r->izquierda == NULL) != (r->derecha == NULL)) n++;
          return n;
      }`),
    opciones: ['Cuenta los nodos que tienen exactamente un hijo.', 'Cuenta las hojas.', 'Cuenta los nodos con dos hijos.', 'Cuenta los nodos que no son hojas.'],
    correcta: 0,
    explicacion: '`(r->izquierda == NULL) != (r->derecha == NULL)` es cierto cuando uno de los dos hijos falta y el otro no: un «o exclusivo».',
  },
  {
    id: '8-M5',
    tipo: 'misterio',
    estructura: ABB,
    titulo: 'Siempre a la izquierda',
    enunciado: 'Predice qué devuelve en cada caso (son ABB construidos en el orden del caso). Después di qué hace.',
    ctx,
    casos: [
      { nombre: `ABB ${EJ_TXT}`, inicial: [raizABB('raiz', EJ)], llamada: 'misterio(raiz)' },
      { nombre: 'ABB 5 7 9', inicial: [raizABB('raiz', [5, 7, 9])], llamada: 'misterio(raiz)' },
      { nombre: 'ABB 6 4 2 5', inicial: [raizABB('raiz', [6, 4, 2, 5])], llamada: 'misterio(raiz)' },
    ],
    observar: ['raiz'],
    responder: ['devuelve'],
    solucion: c(`
      int misterio(Nodo *r) {
          if (r == NULL) return 0;
          return r->valor + misterio(r->izquierda);
      }`),
    opciones: ['Suma los valores del camino desde la raíz hasta el mínimo.', 'Suma todos los valores del árbol.', 'Suma los valores del subárbol izquierdo.', 'Suma los valores de las hojas.'],
    correcta: 0,
    explicacion: 'Solo baja por la izquierda: es el camino que sigue `minimo`, sumando lo que encuentra.',
  },
  {
    id: '8-M6',
    tipo: 'misterio',
    estructura: ABB,
    titulo: 'Contando pasos',
    enunciado: `El árbol es el ABB ${EJ_TXT}. Predice qué devuelve en cada caso y di qué hace.`,
    ctx,
    casos: [
      { nombre: 'x = 7', inicial: [raizABB('raiz', EJ)], llamada: 'misterio(raiz, 7)' },
      { nombre: 'x = 8', inicial: [raizABB('raiz', EJ)], llamada: 'misterio(raiz, 8)' },
      { nombre: 'x = 13', inicial: [raizABB('raiz', EJ)], llamada: 'misterio(raiz, 13)' },
    ],
    observar: ['raiz'],
    responder: ['devuelve'],
    solucion: c(`
      int misterio(Nodo *r, int x) {
          int c = 0;
          while (r != NULL && r->valor != x) {
              c++;
              if (x < r->valor) r = r->izquierda;
              else r = r->derecha;
          }
          return c;
      }`),
    opciones: ['Devuelve el nivel en que está x (la raíz es el 0).', 'Cuenta los valores menores que x.', 'Cuenta los nodos del árbol.', 'Devuelve 1 si x está y 0 si no.'],
    correcta: 0,
    explicacion: 'Baja como una búsqueda y cuenta cada paso: llega a x tras tantos pasos como su nivel. Ese número (más uno) son las comparaciones de una búsqueda, y nunca pasa de la altura.',
  },
  {
    id: '8-M7',
    tipo: 'misterio',
    estructura: ABB,
    titulo: 'Construye y recorre',
    enunciado: 'Predice qué escribe en cada caso. `arbol` es un ABB: vacío en el primero y con el 7 en el segundo. Después di qué hace.',
    pistas: ['Dibuja el árbol insertando uno a uno: cada valor baja desde la raíz hasta un hueco libre.'],
    ctx,
    casos: [
      { nombre: 'Árbol vacío', inicial: [arbolABB('arbol', [])] },
      { nombre: 'Árbol con el 7', inicial: [arbolABB('arbol', [7])] },
    ],
    observar: ['arbol'],
    responder: ['salida'],
    solucion: c(`
      insertar(arbol, 5);
      insertar(arbol, 2);
      insertar(arbol, 8);
      insertar(arbol, 6);
      insertar(arbol, 1);
      insertar(arbol, 9);
      preOrden(arbol->raiz);`),
    opciones: ['Construye un ABB con esos valores y lo escribe en preorden.', 'Construye un ABB y lo escribe ordenado.', 'Escribe los valores en el orden en que se insertan.', 'Construye un ABB y lo escribe de mayor a menor.'],
    correcta: 0,
    explicacion: 'El primero que entra es la raíz y los demás bajan a su sitio. Con el 7 ya puesto, la raíz es el 7 y la forma cambia entera: el orden de inserción decide la forma del ABB.',
  },
  {
    id: '8-M8',
    tipo: 'misterio',
    estructura: BIN,
    titulo: 'El atajo',
    enunciado: 'Se parece mucho a `altura`. Predice qué devuelve en cada caso y di qué hace.',
    ctx,
    casos: [
      { nombre: F1, inicial: [raizForma('raiz', F1)], llamada: 'misterio(raiz)' },
      { nombre: F2, inicial: [raizForma('raiz', F2)], llamada: 'misterio(raiz)' },
      { nombre: '4(2(1,3),6(5,7))', inicial: [raizForma('raiz', '4(2(1,3),6(5,7))')], llamada: 'misterio(raiz)' },
    ],
    observar: ['raiz'],
    responder: ['devuelve'],
    solucion: c(`
      int misterio(Nodo *r) {
          if (r == NULL) return 0;
          int a = misterio(r->izquierda);
          int b = misterio(r->derecha);
          if (a < b) return a + 1;
          return b + 1;
      }`),
    opciones: ['Cuenta los nodos del camino más corto desde la raíz hasta un hueco vacío (un NULL).', 'Devuelve la altura del árbol.', 'Cuenta las hojas.', 'Devuelve el nivel de la hoja más profunda.'],
    correcta: 0,
    explicacion: 'Donde `altura` se queda con el mayor de los dos subárboles, esta se queda con el menor. Ojo: no es el camino hasta la hoja más cercana. En 3(,8(6,)) el 3 ya tiene un hueco a la izquierda, así que devuelve 1.',
  },
];

export const tema8: Tema = {
  id: '8-9',
  titulo: 'Árboles binarios y ABB',
  resumen:
    'Los temas 8 y 9 juntos: árboles binarios (recorridos en preorden, inorden y postorden, y recursión sobre los dos subárboles) y árboles binarios de búsqueda (buscar, insertar y eliminar). Los structs y las funciones de Nodo.c y Arbol.c del proyecto Arboles.',
  ejercicios: porTipo(ejercicios, (e) => e.estructura ?? BIN),
};
