// Topic 2, second part: the double, circular and circular double lists. They run on the
// structs of the TAD Lista (the same ones as Visualizar), with `lista` in main, and they
// are drawn with DibujoLista.

import { IdLista, LISTAS } from '../listas/catalogo';
import { ponerLista } from '../listas/preparar';
import { Constructor } from '../memoria/construir';
import { c } from './sangrado';
import { EjCodigo } from './tipos';

function deLista(id: IdLista) {
  const t = LISTAS.find((x) => x.id === id)!;
  const inicial = (...valores: number[]): Constructor[] => [(m) => ponerLista(m, t, valores)];
  return { ctx: { ...t.ctx, tipoLista: id }, inicial };
}

const enBloque = (bloque: string, ejercicios: EjCodigo[]): EjCodigo[] => ejercicios.map((e) => ({ ...e, bloque }));

// ------------------------------------------------------------------ doble

const { ctx: ctxD, inicial: D } = deLista('doble');

const DOBLE: EjCodigo[] = [
  {
    id: '2-D1',
    tipo: 'programar',
    titulo: 'Insertar el 1 al principio',
    enunciado: 'La lista guarda `cabeza` y `cola`, y cada nodo su `siguiente` y su `anterior`. Pon un nodo con el **1** delante. Esta vez hay que dejar bien los enlaces en los dos sentidos.',
    pistas: ['El nuevo no tiene a nadie detrás: su `anterior` es NULL.', 'El que era primero tiene que mirar atrás al nuevo. Hazlo antes de mover `lista->cabeza`.'],
    alResolver: 'Un enlace más que en la lista simple: el `anterior` del antiguo primero. Es el que siempre se olvida.',
    ctx: ctxD,
    casos: [{ nombre: '9 ⇄ 3 ⇄ 7', inicial: D(9, 3, 7) }],
    observar: ['lista'],
    solucion: c(`
      NodoDoble *nuevo = malloc(sizeof(NodoDoble));
      nuevo->valor = 1;
      nuevo->anterior = NULL;
      nuevo->siguiente = lista->cabeza;
      lista->cabeza->anterior = nuevo;
      lista->cabeza = nuevo;`),
  },
  {
    id: '2-D2',
    tipo: 'programar',
    titulo: 'Quitar el último sin recorrer',
    enunciado: 'Quita el último nodo y libéralo, **sin ningún bucle**. Sin tocar ningún `valor`.',
    pistas: ['`lista->cola` ya es el último, y su `anterior` es el nuevo último.', 'El nuevo último tiene que apuntar a NULL hacia delante.'],
    alResolver: 'En la lista simple esto obliga a recorrerla entera, O(n). Aquí es O(1): por eso se paga un puntero más por nodo.',
    ctx: ctxD,
    casos: [{ nombre: '9 ⇄ 3 ⇄ 7', inicial: D(9, 3, 7) }],
    observar: ['lista'],
    prohibidos: ['valor'],
    solucion: c(`
      NodoDoble *aux = lista->cola;
      lista->cola = aux->anterior;
      lista->cola->siguiente = NULL;
      free(aux);`),
  },
  {
    id: '2-D3',
    tipo: 'programar',
    titulo: 'Insertar el 5 entre el 3 y el 7',
    enunciado: 'Mete un nodo con el **5** entre el 3 y el 7. Son **cuatro** enlaces: dos del nuevo y uno de cada vecino.',
    pistas: ['Guarda los dos vecinos en auxiliares: al 3 llegas con `lista->cabeza->siguiente`.', 'Primero el nuevo mira a sus vecinos; después los vecinos miran al nuevo.'],
    ctx: ctxD,
    casos: [{ nombre: '9 ⇄ 3 ⇄ 7', inicial: D(9, 3, 7) }],
    observar: ['lista'],
    solucion: c(`
      NodoDoble *izq = lista->cabeza->siguiente;
      NodoDoble *der = izq->siguiente;
      NodoDoble *nuevo = malloc(sizeof(NodoDoble));
      nuevo->valor = 5;
      nuevo->anterior = izq;
      nuevo->siguiente = der;
      izq->siguiente = nuevo;
      der->anterior = nuevo;`),
  },
  {
    id: '2-D4',
    tipo: 'programar',
    titulo: 'Suprimir el del medio',
    enunciado: 'Quita el **3** de `9 ⇄ 3 ⇄ 7` y libéralo. Sin tocar ningún `valor`.',
    pistas: ['Con un puntero al 3 te basta: lleva encima a sus dos vecinos.', 'Son dos enlaces: cada vecino se lo salta por su lado.'],
    alResolver: 'No hay que buscar al anterior: el nodo sabe quién es.',
    ctx: ctxD,
    casos: [{ nombre: '9 ⇄ 3 ⇄ 7', inicial: D(9, 3, 7) }],
    observar: ['lista'],
    prohibidos: ['valor'],
    solucion: c(`
      NodoDoble *aux = lista->cabeza->siguiente;
      aux->anterior->siguiente = aux->siguiente;
      aux->siguiente->anterior = aux->anterior;
      free(aux);`),
  },
  {
    id: '2-D5',
    tipo: 'programar',
    titulo: 'Escribe insertarFinal',
    enunciado: 'Completa `insertarFinal` para la lista doble. Se prueba con la lista vacía, con un nodo y con varios. No hace falta recorrer nada.',
    pistas: ['Da igual que la lista esté vacía: `nuevo->anterior` es siempre `lista->cola`.', 'Si está vacía, el nuevo también pasa a ser `cabeza`; si no, el último tiene que apuntar a él.'],
    ctx: ctxD,
    casos: [
      { nombre: 'Lista vacía', inicial: D(), llamada: 'insertarFinal(lista, 5)' },
      { nombre: 'Un nodo', inicial: D(9), llamada: 'insertarFinal(lista, 5)' },
      { nombre: '9 ⇄ 3 ⇄ 7', inicial: D(9, 3, 7), llamada: 'insertarFinal(lista, 5)' },
    ],
    observar: ['lista'],
    codigoInicial: c(`
      void insertarFinal(ListaDoble *lista, int x)
      {

      }`),
    solucion: c(`
      void insertarFinal(ListaDoble *lista, int x)
      {
          NodoDoble *nuevo = malloc(sizeof(NodoDoble));
          nuevo->valor = x;
          nuevo->siguiente = NULL;
          nuevo->anterior = lista->cola;
          if (lista->cola == NULL)
              lista->cabeza = nuevo;
          else
              lista->cola->siguiente = nuevo;
          lista->cola = nuevo;
      }`),
  },
  {
    id: '2-D6',
    tipo: 'programar',
    titulo: 'Escribe suprimirNodo',
    enunciado: 'Quita de la lista el nodo `n` y libéralo. `n` puede ser el primero, el último, uno del medio o el único.',
    pistas: ['Mira cada lado por separado: si `n` tiene anterior, se cambia su `siguiente`; si no, cambia `cabeza`.', 'Y lo mismo por el otro lado: si `n` tiene siguiente, se cambia su `anterior`; si no, cambia `cola`.'],
    alResolver: 'Dos `if` independientes cubren los cuatro casos: el único es el que entra por los dos `else`.',
    ctx: ctxD,
    casos: [
      { nombre: 'El primero', inicial: D(9, 3, 7), llamada: 'suprimirNodo(lista, lista->cabeza)' },
      { nombre: 'Uno del medio', inicial: D(9, 3, 7), llamada: 'suprimirNodo(lista, lista->cabeza->siguiente)' },
      { nombre: 'El último', inicial: D(9, 3, 7), llamada: 'suprimirNodo(lista, lista->cola)' },
      { nombre: 'El único', inicial: D(9), llamada: 'suprimirNodo(lista, lista->cabeza)' },
    ],
    observar: ['lista'],
    prohibidos: ['valor'],
    codigoInicial: c(`
      void suprimirNodo(ListaDoble *lista, NodoDoble *n)
      {

      }`),
    solucion: c(`
      void suprimirNodo(ListaDoble *lista, NodoDoble *n)
      {
          if (n->anterior != NULL)
              n->anterior->siguiente = n->siguiente;
          else
              lista->cabeza = n->siguiente;
          if (n->siguiente != NULL)
              n->siguiente->anterior = n->anterior;
          else
              lista->cola = n->anterior;
          free(n);
      }`),
  },
  {
    id: '2-D7',
    tipo: 'programar',
    titulo: 'Escribe esCapicua',
    enunciado: 'Devuelve **1** si la lista se lee igual en los dos sentidos y **0** si no. Avanza a la vez desde `cabeza` y desde `cola`. La lista vacía es capicúa.',
    pistas: ['Dos punteros: uno avanza con `siguiente` y el otro retrocede con `anterior`.', 'Con un número impar de nodos se encuentran en el mismo; con uno par, se cruzan: `i->anterior == d`.'],
    ctx: ctxD,
    casos: [
      { nombre: 'Lista vacía', inicial: D(), llamada: 'esCapicua(lista)' },
      { nombre: '1 ⇄ 2 ⇄ 1', inicial: D(1, 2, 1), llamada: 'esCapicua(lista)' },
      { nombre: '1 ⇄ 2 ⇄ 2 ⇄ 1', inicial: D(1, 2, 2, 1), llamada: 'esCapicua(lista)' },
      { nombre: '1 ⇄ 2 ⇄ 3', inicial: D(1, 2, 3), llamada: 'esCapicua(lista)' },
      { nombre: '1 ⇄ 2 ⇄ 3 ⇄ 1', inicial: D(1, 2, 3, 1), llamada: 'esCapicua(lista)' },
    ],
    observar: ['lista'],
    codigoInicial: c(`
      int esCapicua(ListaDoble *lista)
      {

      }`),
    solucion: c(`
      int esCapicua(ListaDoble *lista)
      {
          NodoDoble *i = lista->cabeza;
          NodoDoble *d = lista->cola;
          while (i != NULL && i != d && i->anterior != d) {
              if (i->valor != d->valor) return 0;
              i = i->siguiente;
              d = d->anterior;
          }
          return 1;
      }`),
  },
  {
    id: '2-D8',
    tipo: 'programar',
    titulo: 'Dar la vuelta a la lista',
    enunciado: 'Escribe `invertir`: `9 ⇄ 3 ⇄ 7` queda `7 ⇄ 3 ⇄ 9`. Moviendo enlaces, sin tocar ningún `valor`.',
    pistas: ['En cada nodo se intercambian `siguiente` y `anterior`.', 'Guarda el siguiente antes de cambiar nada, y al final intercambia `cabeza` y `cola`.'],
    alResolver: 'Compáralo con `invertir` en la lista simple: aquí cada nodo se arregla solo, sin arrastrar el anterior.',
    ctx: ctxD,
    casos: [
      { nombre: 'Lista vacía', inicial: D(), llamada: 'invertir(lista)' },
      { nombre: 'Un nodo', inicial: D(9), llamada: 'invertir(lista)' },
      { nombre: '9 ⇄ 3 ⇄ 7', inicial: D(9, 3, 7), llamada: 'invertir(lista)' },
    ],
    observar: ['lista'],
    prohibidos: ['valor'],
    codigoInicial: c(`
      void invertir(ListaDoble *lista)
      {

      }`),
    solucion: c(`
      void invertir(ListaDoble *lista)
      {
          NodoDoble *p = lista->cabeza;
          while (p != NULL) {
              NodoDoble *sig = p->siguiente;
              p->siguiente = p->anterior;
              p->anterior = sig;
              p = sig;
          }
          NodoDoble *aux = lista->cabeza;
          lista->cabeza = lista->cola;
          lista->cola = aux;
      }`),
  },
  {
    id: '2-D9',
    tipo: 'fallo',
    titulo: 'insertarPrincipio que solo funciona hacia delante',
    enunciado: 'Recorriendo desde `cabeza` todo parece bien. Prueba a recorrer desde `cola`.',
    ctx: ctxD,
    casos: [
      { nombre: 'Lista vacía', inicial: D(), llamada: 'insertarPrincipio(lista, 1)' },
      { nombre: '9 ⇄ 3 ⇄ 7', inicial: D(9, 3, 7), llamada: 'insertarPrincipio(lista, 1)' },
    ],
    observar: ['lista'],
    codigo: c(`
      void insertarPrincipio(ListaDoble *lista, int x)
      {
          NodoDoble *nuevo = malloc(sizeof(NodoDoble));
          nuevo->valor = x;
          nuevo->anterior = NULL;
          nuevo->siguiente = lista->cabeza;
          if (lista->cabeza == NULL)
              lista->cola = nuevo;
          lista->cabeza = nuevo;
      }`),
    lineasFallo: [7, 8, 9],
    preguntaLinea: 'Marca dónde falta algo',
    tiposFallo: ['enlace'],
    explicacion: 'Nadie le dice al antiguo primero que tiene un nodo delante: su `anterior` sigue a NULL y, yendo hacia atrás, la lista se acaba antes de llegar al nuevo. Falta un `else lista->cabeza->anterior = nuevo;`.',
    solucion: c(`
      void insertarPrincipio(ListaDoble *lista, int x)
      {
          NodoDoble *nuevo = malloc(sizeof(NodoDoble));
          nuevo->valor = x;
          nuevo->anterior = NULL;
          nuevo->siguiente = lista->cabeza;
          if (lista->cabeza == NULL)
              lista->cola = nuevo;
          else
              lista->cabeza->anterior = nuevo;
          lista->cabeza = nuevo;
      }`),
  },
  {
    id: '2-D10',
    tipo: 'fallo',
    titulo: 'suprimirNodo que se olvida de la cola',
    enunciado: 'Con el primero y con los del medio funciona.',
    ctx: ctxD,
    casos: [
      { nombre: 'El primero', inicial: D(9, 3, 7), llamada: 'suprimirNodo(lista, lista->cabeza)' },
      { nombre: 'Uno del medio', inicial: D(9, 3, 7), llamada: 'suprimirNodo(lista, lista->cabeza->siguiente)' },
      { nombre: 'El último', inicial: D(9, 3, 7), llamada: 'suprimirNodo(lista, lista->cola)' },
    ],
    observar: ['lista'],
    codigo: c(`
      void suprimirNodo(ListaDoble *lista, NodoDoble *n)
      {
          if (n->anterior != NULL)
              n->anterior->siguiente = n->siguiente;
          else
              lista->cabeza = n->siguiente;
          n->siguiente->anterior = n->anterior;
          free(n);
      }`),
    lineasFallo: [7],
    preguntaLinea: 'Marca la línea donde se rompe',
    tiposFallo: ['nulo', 'caso'],
    explicacion: 'El último no tiene siguiente: `n->siguiente` es NULL y `n->siguiente->anterior` no existe. Hay que tratar ese lado igual que el otro: si no hay siguiente, lo que cambia es `lista->cola`.',
    solucion: c(`
      void suprimirNodo(ListaDoble *lista, NodoDoble *n)
      {
          if (n->anterior != NULL)
              n->anterior->siguiente = n->siguiente;
          else
              lista->cabeza = n->siguiente;
          if (n->siguiente != NULL)
              n->siguiente->anterior = n->anterior;
          else
              lista->cola = n->anterior;
          free(n);
      }`),
  },
  {
    id: '2-D11',
    tipo: 'fallo',
    titulo: 'insertarTras con los enlaces en mal orden',
    enunciado: 'Se llama con `insertarTras(lista->cabeza, 5)` para meter el 5 detrás del 9. Están todos los enlaces, pero no en el orden que toca.',
    ctx: ctxD,
    casos: [{ nombre: '9 ⇄ 3 ⇄ 7', inicial: D(9, 3, 7), llamada: 'insertarTras(lista->cabeza, 5)' }],
    observar: ['lista'],
    codigo: c(`
      void insertarTras(NodoDoble *n, int x)
      {
          NodoDoble *nuevo = malloc(sizeof(NodoDoble));
          nuevo->valor = x;
          n->siguiente = nuevo;
          nuevo->anterior = n;
          nuevo->siguiente = n->siguiente;
          nuevo->siguiente->anterior = nuevo;
      }`),
    lineasFallo: [5, 7],
    preguntaLinea: 'Marca la línea que pierde el camino hacia delante',
    tiposFallo: ['pierde'],
    explicacion: 'Al hacer `n->siguiente = nuevo` se pierde el camino al 3, y `nuevo->siguiente = n->siguiente` hace que el nuevo se apunte a sí mismo. Primero el nuevo mira a sus vecinos y solo después los vecinos miran al nuevo.',
    solucion: c(`
      void insertarTras(NodoDoble *n, int x)
      {
          NodoDoble *nuevo = malloc(sizeof(NodoDoble));
          nuevo->valor = x;
          nuevo->anterior = n;
          nuevo->siguiente = n->siguiente;
          n->siguiente->anterior = nuevo;
          n->siguiente = nuevo;
      }`),
  },
  {
    id: '2-D12',
    tipo: 'misterio',
    titulo: 'Un recorrido de vuelta',
    enunciado: 'Predice qué devuelve en cada caso y después di qué hace.',
    ctx: ctxD,
    casos: [
      { nombre: '4 ⇄ 9 ⇄ 2 ⇄ 4 ⇄ 1, x = 4', inicial: D(4, 9, 2, 4, 1), llamada: 'misterio(lista, 4)' },
      { nombre: '4 ⇄ 9 ⇄ 2 ⇄ 4 ⇄ 1, x = 9', inicial: D(4, 9, 2, 4, 1), llamada: 'misterio(lista, 9)' },
      { nombre: '4 ⇄ 9 ⇄ 2 ⇄ 4 ⇄ 1, x = 7', inicial: D(4, 9, 2, 4, 1), llamada: 'misterio(lista, 7)' },
    ],
    observar: ['lista'],
    responder: ['devuelve'],
    solucion: c(`
      int misterio(ListaDoble *lista, int x)
      {
          int n = 0;
          NodoDoble *p = lista->cola;
          while (p != NULL && p->valor != x) {
              n++;
              p = p->anterior;
          }
          return n;
      }`),
    opciones: [
      'Cuenta los nodos que hay detrás de la última aparición de `x` (todos, si no está).',
      'Devuelve la posición de la primera aparición de `x`.',
      'Cuenta cuántas veces aparece `x`.',
      'Cuenta los nodos que hay delante de la última aparición de `x`.',
    ],
    correcta: 0,
    explicacion: 'Empieza por la `cola` y retrocede hasta dar con `x`, contando los que deja atrás. Como va de atrás adelante, la aparición que encuentra es la última de la lista.',
  },
];

// ------------------------------------------------------------------ circular

const { ctx: ctxC, inicial: C } = deLista('circular');

const LONGITUD_CIRCULAR = c(`
  int longitud(ListaCircular *lista)
  {
      if (lista->acceso == NULL) return 0;
      int n = 0;
      Nodo *p = lista->acceso;
      do {
          n++;
          p = p->siguiente;
      } while (p != lista->acceso);
      return n;
  }`);

const CIRCULAR: EjCodigo[] = [
  {
    id: '2-C1',
    tipo: 'programar',
    titulo: 'Insertar el 1 al principio',
    enunciado: 'En la circular no hay NULL: el último apunta al primero, y `lista->acceso` señala al **último**. Pon un nodo con el **1** al principio, sin recorrer nada.',
    pistas: ['El primero es `lista->acceso->siguiente`.', 'El nuevo se engancha detrás del último, y `acceso` no se mueve.'],
    ctx: ctxC,
    casos: [{ nombre: '9 → 3 → 7 ↺', inicial: C(9, 3, 7) }],
    observar: ['lista'],
    solucion: c(`
      Nodo *nuevo = malloc(sizeof(Nodo));
      nuevo->valor = 1;
      nuevo->siguiente = lista->acceso->siguiente;
      lista->acceso->siguiente = nuevo;`),
  },
  {
    id: '2-C2',
    tipo: 'programar',
    titulo: 'Insertar el 1 al final',
    enunciado: 'Ahora pon el **1** al final, también sin recorrer nada. Compáralo con lo que acabas de hacer.',
    pistas: ['El nodo va en el mismo sitio del círculo que en el ejercicio anterior.', 'Lo único que cambia es quién pasa a ser el último.'],
    alResolver: 'Insertar al principio y al final es el mismo enganche; al final, además, se mueve `acceso`. Por eso `acceso` señala al último y no al primero.',
    ctx: ctxC,
    casos: [{ nombre: '9 → 3 → 7 ↺', inicial: C(9, 3, 7) }],
    observar: ['lista'],
    solucion: c(`
      Nodo *nuevo = malloc(sizeof(Nodo));
      nuevo->valor = 1;
      nuevo->siguiente = lista->acceso->siguiente;
      lista->acceso->siguiente = nuevo;
      lista->acceso = nuevo;`),
  },
  {
    id: '2-C3',
    tipo: 'programar',
    titulo: 'Quitar el primero',
    enunciado: 'Quita el primer nodo y libéralo. Sin tocar ningún `valor`.',
    pistas: ['Guarda el primero en un auxiliar.', 'El último tiene que saltárselo: es quien lo apunta.'],
    ctx: ctxC,
    casos: [{ nombre: '9 → 3 → 7 ↺', inicial: C(9, 3, 7) }],
    observar: ['lista'],
    prohibidos: ['valor'],
    solucion: c(`
      Nodo *aux = lista->acceso->siguiente;
      lista->acceso->siguiente = aux->siguiente;
      free(aux);`),
  },
  {
    id: '2-C4',
    tipo: 'programar',
    titulo: 'Pasar el primero al final',
    enunciado: 'Mueve el primero al final: `9 → 3 → 7` queda `3 → 7 → 9`. No se puede cambiar ningún `valor` ni ningún `siguiente`.',
    pistas: ['El círculo no cambia. ¿Qué es lo que decide quién es el último?'],
    alResolver: 'Una sola sentencia. El mismo ejercicio en la lista simple (2-06) necesitaba un bucle y tres enlaces.',
    ctx: ctxC,
    casos: [{ nombre: '9 → 3 → 7 ↺', inicial: C(9, 3, 7) }],
    observar: ['lista'],
    prohibidos: ['valor', 'siguiente'],
    solucion: c(`
      lista->acceso = lista->acceso->siguiente;`),
  },
  {
    id: '2-C5',
    tipo: 'programar',
    titulo: 'Escribe longitud',
    enunciado: 'Devuelve cuántos nodos tiene la lista. No hay NULL que marque el final: para al volver al nodo de partida.',
    pistas: ['La lista vacía va aparte: `lista->acceso == NULL`.', 'Con `do … while` se cuenta el primero antes de comprobar si has dado la vuelta.'],
    ctx: ctxC,
    casos: [
      { nombre: 'Lista vacía', inicial: C(), llamada: 'longitud(lista)' },
      { nombre: 'Un nodo', inicial: C(9), llamada: 'longitud(lista)' },
      { nombre: '9 → 3 → 7 ↺', inicial: C(9, 3, 7), llamada: 'longitud(lista)' },
    ],
    observar: ['lista'],
    codigoInicial: c(`
      int longitud(ListaCircular *lista)
      {

      }`),
    solucion: LONGITUD_CIRCULAR,
  },
  {
    id: '2-C6',
    tipo: 'programar',
    titulo: 'Escribe insertarFinal',
    enunciado: 'Completa `insertarFinal`. Se prueba con la lista vacía, con un nodo y con varios.',
    pistas: ['Un nodo solo también es un círculo: su `siguiente` es él mismo.', 'Pase lo que pase, al final `acceso` señala al nuevo.'],
    ctx: ctxC,
    casos: [
      { nombre: 'Lista vacía', inicial: C(), llamada: 'insertarFinal(lista, 5)' },
      { nombre: 'Un nodo', inicial: C(9), llamada: 'insertarFinal(lista, 5)' },
      { nombre: '9 → 3 → 7 ↺', inicial: C(9, 3, 7), llamada: 'insertarFinal(lista, 5)' },
    ],
    observar: ['lista'],
    codigoInicial: c(`
      void insertarFinal(ListaCircular *lista, int x)
      {

      }`),
    solucion: c(`
      void insertarFinal(ListaCircular *lista, int x)
      {
          Nodo *nuevo = malloc(sizeof(Nodo));
          nuevo->valor = x;
          if (lista->acceso == NULL) {
              nuevo->siguiente = nuevo;
          } else {
              nuevo->siguiente = lista->acceso->siguiente;
              lista->acceso->siguiente = nuevo;
          }
          lista->acceso = nuevo;
      }`),
  },
  {
    id: '2-C7',
    tipo: 'programar',
    titulo: 'Escribe suprimirPrimero',
    enunciado: 'Quita el primer nodo y libéralo. Si la lista está vacía, no hace nada. Ojo con el nodo único: es el primero y también el último.',
    pistas: ['Se sabe que solo queda uno porque `primero == lista->acceso`.', 'En ese caso la lista se queda vacía: `acceso` pasa a NULL.'],
    ctx: ctxC,
    casos: [
      { nombre: 'Lista vacía', inicial: C(), llamada: 'suprimirPrimero(lista)' },
      { nombre: 'Un nodo', inicial: C(9), llamada: 'suprimirPrimero(lista)' },
      { nombre: '9 → 3 → 7 ↺', inicial: C(9, 3, 7), llamada: 'suprimirPrimero(lista)' },
    ],
    observar: ['lista'],
    prohibidos: ['valor'],
    codigoInicial: c(`
      void suprimirPrimero(ListaCircular *lista)
      {

      }`),
    solucion: c(`
      void suprimirPrimero(ListaCircular *lista)
      {
          if (lista->acceso == NULL) return;
          Nodo *primero = lista->acceso->siguiente;
          if (primero == lista->acceso)
              lista->acceso = NULL;
          else
              lista->acceso->siguiente = primero->siguiente;
          free(primero);
      }`),
  },
  {
    id: '2-C8',
    tipo: 'programar',
    titulo: 'Escribe suprimir',
    enunciado: 'Quita el primer nodo que vale `x`, empezando por el primero de la lista, y libéralo. Si no está, no hace nada. Hay un caso nuevo: si quitas el último, `acceso` tiene que retroceder.',
    pistas: ['Empieza con `ant = lista->acceso` y `p = ant->siguiente`: `ant` siempre va detrás de `p`.', 'Has dado la vuelta entera cuando `ant` vuelve a ser `lista->acceso` después de avanzar.', 'Si `p == ant`, solo había un nodo.'],
    ctx: ctxC,
    casos: [
      { nombre: 'Lista vacía', inicial: C(), llamada: 'suprimir(lista, 9)' },
      { nombre: 'El primero (9)', inicial: C(9, 3, 7), llamada: 'suprimir(lista, 9)' },
      { nombre: 'Uno del medio (3)', inicial: C(9, 3, 7), llamada: 'suprimir(lista, 3)' },
      { nombre: 'El último (7)', inicial: C(9, 3, 7), llamada: 'suprimir(lista, 7)' },
      { nombre: 'No está (8)', inicial: C(9, 3, 7), llamada: 'suprimir(lista, 8)' },
      { nombre: 'El único (9)', inicial: C(9), llamada: 'suprimir(lista, 9)' },
    ],
    observar: ['lista'],
    prohibidos: ['valor'],
    codigoInicial: c(`
      void suprimir(ListaCircular *lista, int x)
      {

      }`),
    solucion: c(`
      void suprimir(ListaCircular *lista, int x)
      {
          if (lista->acceso == NULL) return;
          Nodo *ant = lista->acceso;
          Nodo *p = ant->siguiente;
          do {
              if (p->valor == x) {
                  if (p == ant) {
                      lista->acceso = NULL;
                  } else {
                      ant->siguiente = p->siguiente;
                      if (p == lista->acceso) lista->acceso = ant;
                  }
                  free(p);
                  return;
              }
              ant = p;
              p = p->siguiente;
          } while (ant != lista->acceso);
      }`),
  },
  {
    id: '2-C9',
    tipo: 'fallo',
    titulo: 'longitud que no acaba nunca',
    enunciado: 'Es el `longitud` de la lista simple, copiado tal cual.',
    ctx: ctxC,
    casos: [
      { nombre: 'Lista vacía', inicial: C(), llamada: 'longitud(lista)' },
      { nombre: '9 → 3 → 7 ↺', inicial: C(9, 3, 7), llamada: 'longitud(lista)' },
    ],
    observar: ['lista'],
    codigo: c(`
      int longitud(ListaCircular *lista)
      {
          int n = 0;
          Nodo *p = lista->acceso;
          while (p != NULL) {
              n++;
              p = p->siguiente;
          }
          return n;
      }`),
    lineasFallo: [5],
    preguntaLinea: 'Marca la condición que nunca deja de cumplirse',
    tiposFallo: ['bucle'],
    explicacion: 'En una lista circular ningún nodo apunta a NULL, así que `p` da vueltas para siempre. Hay que parar al volver al nodo de partida.',
    solucion: LONGITUD_CIRCULAR,
  },
  {
    id: '2-C10',
    tipo: 'fallo',
    titulo: 'sumar que se deja uno',
    enunciado: 'No se cuelga y no da ningún error, pero el resultado está mal.',
    ctx: ctxC,
    casos: [
      { nombre: 'Lista vacía', inicial: C(), llamada: 'sumar(lista)' },
      { nombre: 'Un nodo', inicial: C(9), llamada: 'sumar(lista)' },
      { nombre: '9 → 3 → 7 ↺', inicial: C(9, 3, 7), llamada: 'sumar(lista)' },
    ],
    observar: ['lista'],
    codigo: c(`
      int sumar(ListaCircular *lista)
      {
          if (lista->acceso == NULL) return 0;
          int s = 0;
          Nodo *p = lista->acceso->siguiente;
          while (p != lista->acceso) {
              s = s + p->valor;
              p = p->siguiente;
          }
          return s;
      }`),
    lineasFallo: [6],
    preguntaLinea: 'Marca la línea que hace que falte un nodo',
    tiposFallo: ['caso'],
    explicacion: 'El `while` para al llegar al último sin haberlo sumado, y con un solo nodo ni siquiera entra. Con `do … while` se suma antes de comprobar, y se para al volver al primero.',
    solucion: c(`
      int sumar(ListaCircular *lista)
      {
          if (lista->acceso == NULL) return 0;
          int s = 0;
          Nodo *primero = lista->acceso->siguiente;
          Nodo *p = primero;
          do {
              s = s + p->valor;
              p = p->siguiente;
          } while (p != primero);
          return s;
      }`),
  },
  {
    id: '2-C11',
    tipo: 'fallo',
    titulo: 'suprimirUltimo que deja el acceso colgando',
    enunciado: 'El círculo queda bien cerrado, pero la lista ya no sirve.',
    ctx: ctxC,
    casos: [
      { nombre: 'Un nodo', inicial: C(9), llamada: 'suprimirUltimo(lista)' },
      { nombre: '9 → 3 → 7 ↺', inicial: C(9, 3, 7), llamada: 'suprimirUltimo(lista)' },
    ],
    observar: ['lista'],
    codigo: c(`
      void suprimirUltimo(ListaCircular *lista)
      {
          Nodo *ult = lista->acceso;
          if (ult->siguiente == ult) {
              lista->acceso = NULL;
              free(ult);
              return;
          }
          Nodo *ant = ult->siguiente;
          while (ant->siguiente != ult)
              ant = ant->siguiente;
          ant->siguiente = ult->siguiente;
          free(ult);
      }`),
    lineasFallo: [12, 13],
    preguntaLinea: 'Marca dónde falta algo',
    tiposFallo: ['colgante'],
    explicacion: '`lista->acceso` sigue señalando al nodo liberado, que era el último. Antes del `free` hay que moverlo al nuevo último: `lista->acceso = ant;`.',
    solucion: c(`
      void suprimirUltimo(ListaCircular *lista)
      {
          Nodo *ult = lista->acceso;
          if (ult->siguiente == ult) {
              lista->acceso = NULL;
              free(ult);
              return;
          }
          Nodo *ant = ult->siguiente;
          while (ant->siguiente != ult)
              ant = ant->siguiente;
          ant->siguiente = ult->siguiente;
          lista->acceso = ant;
          free(ult);
      }`),
  },
  {
    id: '2-C12',
    tipo: 'fallo',
    titulo: 'insertarFinal que no cierra el círculo',
    enunciado: 'Con la lista llena va bien. Empieza con una vacía y mira lo que queda.',
    ctx: ctxC,
    casos: [
      { nombre: 'Lista vacía', inicial: C(), llamada: 'insertarFinal(lista, 5)' },
      { nombre: '9 → 3 → 7 ↺', inicial: C(9, 3, 7), llamada: 'insertarFinal(lista, 5)' },
    ],
    observar: ['lista'],
    codigo: c(`
      void insertarFinal(ListaCircular *lista, int x)
      {
          Nodo *nuevo = malloc(sizeof(Nodo));
          nuevo->valor = x;
          nuevo->siguiente = NULL;
          if (lista->acceso != NULL) {
              nuevo->siguiente = lista->acceso->siguiente;
              lista->acceso->siguiente = nuevo;
          }
          lista->acceso = nuevo;
      }`),
    lineasFallo: [5],
    preguntaLinea: 'Marca la línea que deja un NULL donde no puede haberlo',
    tiposFallo: ['caso', 'enlace'],
    explicacion: 'Con la lista vacía el nuevo se queda con `siguiente` a NULL: un nodo suelto, no un círculo. Cualquier recorrido con `do … while` revienta en cuanto llega a ese NULL. El nodo único tiene que apuntarse a sí mismo: `nuevo->siguiente = nuevo;`.',
    solucion: c(`
      void insertarFinal(ListaCircular *lista, int x)
      {
          Nodo *nuevo = malloc(sizeof(Nodo));
          nuevo->valor = x;
          nuevo->siguiente = nuevo;
          if (lista->acceso != NULL) {
              nuevo->siguiente = lista->acceso->siguiente;
              lista->acceso->siguiente = nuevo;
          }
          lista->acceso = nuevo;
      }`),
  },
  {
    id: '2-C13',
    tipo: 'misterio',
    titulo: 'Un acceso que se mueve',
    enunciado: 'Predice cómo queda la lista en cada caso, leída desde el primero, y después di qué hace.',
    ctx: ctxC,
    casos: [
      { nombre: '1 → 2 → 3 → 4 ↺, k = 1', inicial: C(1, 2, 3, 4), llamada: 'misterio(lista, 1)' },
      { nombre: '1 → 2 → 3 → 4 ↺, k = 3', inicial: C(1, 2, 3, 4), llamada: 'misterio(lista, 3)' },
      { nombre: '1 → 2 → 3 → 4 ↺, k = 4', inicial: C(1, 2, 3, 4), llamada: 'misterio(lista, 4)' },
    ],
    observar: ['lista'],
    responder: ['lista'],
    solucion: c(`
      void misterio(ListaCircular *lista, int k)
      {
          for (int i = 0; i < k; i++)
              lista->acceso = lista->acceso->siguiente;
      }`),
    opciones: [
      'Gira la lista: los `k` primeros pasan al final, en el mismo orden.',
      'Quita los `k` primeros nodos.',
      'Invierte los `k` primeros nodos.',
      'Pasa los `k` últimos al principio, en orden contrario.',
    ],
    correcta: 0,
    explicacion: 'No cambia ningún enlace: solo mueve quién es el último. Cada paso de `acceso` hace que el primero pase a ser el último, y con `k` igual a la longitud se queda como estaba.',
  },
  {
    id: '2-C14',
    tipo: 'misterio',
    titulo: 'Uno de cada dos',
    enunciado: 'Predice qué devuelve en cada caso. Dibújalo: un nodo tras otro, van cayendo.',
    ctx: ctxC,
    casos: [
      { nombre: '1 → 2 → 3 → 4 → 5 ↺', inicial: C(1, 2, 3, 4, 5), llamada: 'misterio(lista)' },
      { nombre: '1 → 2 → 3 → 4 ↺', inicial: C(1, 2, 3, 4), llamada: 'misterio(lista)' },
      { nombre: '1 → 2 → 3 → 4 → 5 → 6 ↺', inicial: C(1, 2, 3, 4, 5, 6), llamada: 'misterio(lista)' },
    ],
    observar: ['lista'],
    responder: ['devuelve'],
    solucion: c(`
      int misterio(ListaCircular *lista)
      {
          Nodo *p = lista->acceso->siguiente;
          while (p->siguiente != p) {
              Nodo *m = p->siguiente;
              p->siguiente = m->siguiente;
              free(m);
              p = p->siguiente;
          }
          lista->acceso = p;
          return p->valor;
      }`),
    opciones: [
      'Va quitando un nodo de cada dos, dando vueltas, hasta que queda uno, y devuelve su valor.',
      'Quita los valores pares y devuelve el primero que queda.',
      'Devuelve el valor del nodo del medio sin cambiar la lista.',
      'Quita todos menos el primero y devuelve su valor.',
    ],
    correcta: 0,
    explicacion: 'Es el problema de Josefo: cada vuelta se salta un nodo, elimina el siguiente y sigue en círculo. Una lista circular es justo esto: no hay que volver al principio al llegar al final.',
  },
];

// ------------------------------------------------------------------ circular doble

const { ctx: ctxE, inicial: E } = deLista('circular-doble');

const CIRCULAR_DOBLE: EjCodigo[] = [
  {
    id: '2-E1',
    tipo: 'programar',
    titulo: 'Insertar el 1 al principio',
    enunciado: 'El círculo en los dos sentidos: no hay ningún NULL. Aquí `lista->acceso` señala al **primero**, y el último es `lista->acceso->anterior`. Pon un nodo con el **1** al principio.',
    pistas: ['Guarda el último en un auxiliar: el nuevo va entre él y el primero.', 'Cuatro enlaces y, al final, mover `acceso`.'],
    ctx: ctxE,
    casos: [{ nombre: '9 ⇄ 3 ⇄ 7 ↺', inicial: E(9, 3, 7) }],
    observar: ['lista'],
    solucion: c(`
      NodoDoble *ult = lista->acceso->anterior;
      NodoDoble *nuevo = malloc(sizeof(NodoDoble));
      nuevo->valor = 1;
      nuevo->siguiente = lista->acceso;
      nuevo->anterior = ult;
      ult->siguiente = nuevo;
      lista->acceso->anterior = nuevo;
      lista->acceso = nuevo;`),
  },
  {
    id: '2-E2',
    tipo: 'programar',
    titulo: 'Insertar el 1 al final',
    enunciado: 'Ahora pon el **1** al final. Compáralo con lo que acabas de hacer.',
    pistas: ['El nodo va en el mismo sitio del círculo: entre el último y el primero.'],
    alResolver: 'El mismo enganche de cuatro enlaces. La diferencia es que `acceso` no se mueve: justo al revés que en la circular simple.',
    ctx: ctxE,
    casos: [{ nombre: '9 ⇄ 3 ⇄ 7 ↺', inicial: E(9, 3, 7) }],
    observar: ['lista'],
    solucion: c(`
      NodoDoble *ult = lista->acceso->anterior;
      NodoDoble *nuevo = malloc(sizeof(NodoDoble));
      nuevo->valor = 1;
      nuevo->siguiente = lista->acceso;
      nuevo->anterior = ult;
      ult->siguiente = nuevo;
      lista->acceso->anterior = nuevo;`),
  },
  {
    id: '2-E3',
    tipo: 'programar',
    titulo: 'Quitar el último',
    enunciado: 'Quita el último nodo y libéralo, sin ningún bucle. Sin tocar ningún `valor`.',
    pistas: ['Sus vecinos son `aux->anterior` y el primero.', 'Dos enlaces: cada vecino se lo salta por su lado.'],
    ctx: ctxE,
    casos: [{ nombre: '9 ⇄ 3 ⇄ 7 ↺', inicial: E(9, 3, 7) }],
    observar: ['lista'],
    prohibidos: ['valor'],
    solucion: c(`
      NodoDoble *aux = lista->acceso->anterior;
      aux->anterior->siguiente = lista->acceso;
      lista->acceso->anterior = aux->anterior;
      free(aux);`),
  },
  {
    id: '2-E4',
    tipo: 'programar',
    titulo: 'Pasar el último al principio',
    enunciado: 'Mueve el último al principio: `9 ⇄ 3 ⇄ 7` queda `7 ⇄ 9 ⇄ 3`. No se puede cambiar ningún `valor` ni ningún enlace de los nodos.',
    pistas: ['El círculo no cambia. ¿Qué decide quién es el primero?'],
    alResolver: 'Una sentencia, y en los dos sentidos: `acceso->siguiente` gira hacia un lado y `acceso->anterior` hacia el otro.',
    ctx: ctxE,
    casos: [{ nombre: '9 ⇄ 3 ⇄ 7 ↺', inicial: E(9, 3, 7) }],
    observar: ['lista'],
    prohibidos: ['valor', 'siguiente', 'anterior'],
    solucion: c(`
      lista->acceso = lista->acceso->anterior;`),
  },
  {
    id: '2-E5',
    tipo: 'programar',
    titulo: 'Escribe insertarFinal',
    enunciado: 'Completa `insertarFinal`. Se prueba con la lista vacía, con un nodo y con varios.',
    pistas: ['Un nodo solo se apunta a sí mismo por los dos lados.', 'Si la lista está vacía, además `acceso` pasa a ser el nuevo.'],
    ctx: ctxE,
    casos: [
      { nombre: 'Lista vacía', inicial: E(), llamada: 'insertarFinal(lista, 5)' },
      { nombre: 'Un nodo', inicial: E(9), llamada: 'insertarFinal(lista, 5)' },
      { nombre: '9 ⇄ 3 ⇄ 7 ↺', inicial: E(9, 3, 7), llamada: 'insertarFinal(lista, 5)' },
    ],
    observar: ['lista'],
    codigoInicial: c(`
      void insertarFinal(ListaCircularDoble *lista, int x)
      {

      }`),
    solucion: c(`
      void insertarFinal(ListaCircularDoble *lista, int x)
      {
          NodoDoble *nuevo = malloc(sizeof(NodoDoble));
          nuevo->valor = x;
          if (lista->acceso == NULL) {
              nuevo->siguiente = nuevo;
              nuevo->anterior = nuevo;
              lista->acceso = nuevo;
              return;
          }
          NodoDoble *ult = lista->acceso->anterior;
          nuevo->siguiente = lista->acceso;
          nuevo->anterior = ult;
          ult->siguiente = nuevo;
          lista->acceso->anterior = nuevo;
      }`),
  },
  {
    id: '2-E6',
    tipo: 'programar',
    titulo: 'Escribe suprimirNodo',
    enunciado: 'Quita de la lista el nodo `n` y libéralo. `n` puede ser el primero, el último, uno del medio o el único.',
    pistas: ['Si `n->siguiente == n`, es el único y la lista se queda vacía.', 'Los vecinos existen siempre: no hay NULL que comprobar. Lo único especial es que `n` sea el de `acceso`.'],
    alResolver: 'Compáralo con 2-D6: sin NULL desaparecen casi todos los `if`.',
    ctx: ctxE,
    casos: [
      { nombre: 'El primero', inicial: E(9, 3, 7), llamada: 'suprimirNodo(lista, lista->acceso)' },
      { nombre: 'Uno del medio', inicial: E(9, 3, 7), llamada: 'suprimirNodo(lista, lista->acceso->siguiente)' },
      { nombre: 'El último', inicial: E(9, 3, 7), llamada: 'suprimirNodo(lista, lista->acceso->anterior)' },
      { nombre: 'El único', inicial: E(9), llamada: 'suprimirNodo(lista, lista->acceso)' },
    ],
    observar: ['lista'],
    prohibidos: ['valor'],
    codigoInicial: c(`
      void suprimirNodo(ListaCircularDoble *lista, NodoDoble *n)
      {

      }`),
    solucion: c(`
      void suprimirNodo(ListaCircularDoble *lista, NodoDoble *n)
      {
          if (n->siguiente == n) {
              lista->acceso = NULL;
          } else {
              n->anterior->siguiente = n->siguiente;
              n->siguiente->anterior = n->anterior;
              if (n == lista->acceso) lista->acceso = n->siguiente;
          }
          free(n);
      }`),
  },
  {
    id: '2-E7',
    tipo: 'programar',
    titulo: 'Escribe sumaUltimos',
    enunciado: 'Devuelve la suma de los `k` últimos valores, yendo hacia atrás desde el último. Si `k` es mayor que la longitud, sigue dando vueltas. Con la lista vacía devuelve 0.',
    pistas: ['Empieza en `lista->acceso` y retrocede antes de sumar: el primer paso atrás cae en el último.'],
    ctx: ctxE,
    casos: [
      { nombre: 'Lista vacía, k = 2', inicial: E(), llamada: 'sumaUltimos(lista, 2)' },
      { nombre: '9 ⇄ 3 ⇄ 7 ↺, k = 1', inicial: E(9, 3, 7), llamada: 'sumaUltimos(lista, 1)' },
      { nombre: '9 ⇄ 3 ⇄ 7 ↺, k = 2', inicial: E(9, 3, 7), llamada: 'sumaUltimos(lista, 2)' },
      { nombre: '9 ⇄ 3 ⇄ 7 ↺, k = 4', inicial: E(9, 3, 7), llamada: 'sumaUltimos(lista, 4)' },
    ],
    observar: ['lista'],
    codigoInicial: c(`
      int sumaUltimos(ListaCircularDoble *lista, int k)
      {

      }`),
    solucion: c(`
      int sumaUltimos(ListaCircularDoble *lista, int k)
      {
          if (lista->acceso == NULL) return 0;
          int s = 0;
          NodoDoble *p = lista->acceso;
          for (int i = 0; i < k; i++) {
              p = p->anterior;
              s = s + p->valor;
          }
          return s;
      }`),
  },
  {
    id: '2-E8',
    tipo: 'fallo',
    titulo: 'insertarFinal con un enlace de menos',
    enunciado: 'Hacia delante, la lista queda perfecta. Hacia atrás, no.',
    ctx: ctxE,
    casos: [
      { nombre: 'Lista vacía', inicial: E(), llamada: 'insertarFinal(lista, 5)' },
      { nombre: '9 ⇄ 3 ⇄ 7 ↺', inicial: E(9, 3, 7), llamada: 'insertarFinal(lista, 5)' },
    ],
    observar: ['lista'],
    codigo: c(`
      void insertarFinal(ListaCircularDoble *lista, int x)
      {
          NodoDoble *nuevo = malloc(sizeof(NodoDoble));
          nuevo->valor = x;
          if (lista->acceso == NULL) {
              nuevo->siguiente = nuevo;
              nuevo->anterior = nuevo;
              lista->acceso = nuevo;
              return;
          }
          NodoDoble *ult = lista->acceso->anterior;
          nuevo->siguiente = lista->acceso;
          nuevo->anterior = ult;
          ult->siguiente = nuevo;
      }`),
    lineasFallo: [14, 15],
    preguntaLinea: 'Marca dónde falta algo',
    tiposFallo: ['enlace'],
    explicacion: 'El primero sigue creyendo que el último es el 7: su `anterior` no se ha actualizado. El nodo nuevo es invisible hacia atrás. Falta `lista->acceso->anterior = nuevo;`.',
    solucion: c(`
      void insertarFinal(ListaCircularDoble *lista, int x)
      {
          NodoDoble *nuevo = malloc(sizeof(NodoDoble));
          nuevo->valor = x;
          if (lista->acceso == NULL) {
              nuevo->siguiente = nuevo;
              nuevo->anterior = nuevo;
              lista->acceso = nuevo;
              return;
          }
          NodoDoble *ult = lista->acceso->anterior;
          nuevo->siguiente = lista->acceso;
          nuevo->anterior = ult;
          ult->siguiente = nuevo;
          lista->acceso->anterior = nuevo;
      }`),
  },
  {
    id: '2-E9',
    tipo: 'fallo',
    titulo: 'suprimirNodo que no ve al último superviviente',
    enunciado: 'Funciona con cualquier nodo de una lista con varios.',
    ctx: ctxE,
    casos: [
      { nombre: 'El primero', inicial: E(9, 3, 7), llamada: 'suprimirNodo(lista, lista->acceso)' },
      { nombre: 'El único', inicial: E(9), llamada: 'suprimirNodo(lista, lista->acceso)' },
    ],
    observar: ['lista'],
    codigo: c(`
      void suprimirNodo(ListaCircularDoble *lista, NodoDoble *n)
      {
          n->anterior->siguiente = n->siguiente;
          n->siguiente->anterior = n->anterior;
          if (n == lista->acceso)
              lista->acceso = n->siguiente;
          free(n);
      }`),
    lineasFallo: [5, 6],
    preguntaLinea: 'Marca la línea que deja mal el acceso',
    tiposFallo: ['colgante', 'caso'],
    explicacion: 'Con un solo nodo, `n->siguiente` es el propio `n`: `acceso` no cambia y queda apuntando a un nodo liberado. Ese caso hay que tratarlo aparte y dejar `acceso` a NULL.',
    solucion: c(`
      void suprimirNodo(ListaCircularDoble *lista, NodoDoble *n)
      {
          n->anterior->siguiente = n->siguiente;
          n->siguiente->anterior = n->anterior;
          if (n->siguiente == n)
              lista->acceso = NULL;
          else if (n == lista->acceso)
              lista->acceso = n->siguiente;
          free(n);
      }`),
  },
  {
    id: '2-E10',
    tipo: 'fallo',
    titulo: 'eliminarLista que no mira si hay lista',
    enunciado: 'El `do … while` es lo correcto en una circular, pero tiene un precio.',
    ctx: ctxE,
    casos: [
      { nombre: 'Lista vacía', inicial: E(), llamada: 'eliminarLista(lista)' },
      { nombre: '9 ⇄ 3 ⇄ 7 ↺', inicial: E(9, 3, 7), llamada: 'eliminarLista(lista)' },
    ],
    observar: ['lista'],
    codigo: c(`
      void eliminarLista(ListaCircularDoble *lista)
      {
          NodoDoble *p = lista->acceso;
          do {
              NodoDoble *sig = p->siguiente;
              free(p);
              p = sig;
          } while (p != lista->acceso);
          lista->acceso = NULL;
      }`),
    lineasFallo: [4, 5],
    preguntaLinea: 'Marca la línea donde se rompe',
    tiposFallo: ['nulo', 'caso'],
    explicacion: 'Un `do … while` siempre da una vuelta, y con la lista vacía `p` es NULL. Antes del bucle hay que comprobar que hay algo que recorrer.',
    solucion: c(`
      void eliminarLista(ListaCircularDoble *lista)
      {
          if (lista->acceso == NULL) return;
          NodoDoble *p = lista->acceso;
          do {
              NodoDoble *sig = p->siguiente;
              free(p);
              p = sig;
          } while (p != lista->acceso);
          lista->acceso = NULL;
      }`),
  },
  {
    id: '2-E11',
    tipo: 'misterio',
    titulo: 'Comparar con el de atrás',
    enunciado: 'Predice qué devuelve en cada caso y después di qué hace. Recuerda quién es el `anterior` del primero.',
    ctx: ctxE,
    casos: [
      { nombre: '1 ⇄ 3 ⇄ 2 ↺', inicial: E(1, 3, 2), llamada: 'misterio(lista)' },
      { nombre: '5 ⇄ 1 ⇄ 2 ↺', inicial: E(5, 1, 2), llamada: 'misterio(lista)' },
      { nombre: 'Un nodo', inicial: E(7), llamada: 'misterio(lista)' },
    ],
    observar: ['lista'],
    responder: ['devuelve'],
    solucion: c(`
      int misterio(ListaCircularDoble *lista)
      {
          int n = 0;
          NodoDoble *p = lista->acceso;
          do {
              if (p->valor > p->anterior->valor) n++;
              p = p->siguiente;
          } while (p != lista->acceso);
          return n;
      }`),
    opciones: [
      'Cuenta los nodos mayores que el que tienen detrás en el círculo; el primero se compara con el último.',
      'Cuenta los nodos mayores que el primero.',
      'Devuelve la posición del mayor valor.',
      'Cuenta los nodos mayores que su siguiente.',
    ],
    correcta: 0,
    explicacion: 'Cada nodo se compara con su `anterior`. Como en el círculo todos tienen anterior, el primero se compara con el último, y un nodo solo se compara consigo mismo: por eso da 0.',
  },
];

export const EJERCICIOS_LISTAS: EjCodigo[] = [
  ...enBloque('Lista doble', DOBLE),
  ...enBloque('Lista circular', CIRCULAR),
  ...enBloque('Lista circular doble', CIRCULAR_DOBLE),
];
