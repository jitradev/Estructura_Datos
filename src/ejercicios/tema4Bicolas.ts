// Topic 4, third part: the deques and the priority queues of the Colas project, array and
// linked. They run on the same code as Visualizar, with `cola` in main, and are drawn the same.

import { Constructor, entero, funcionesDe } from '../memoria/construir';
import { COLAS, QueueId } from '../queues/catalog';
import { ponerCola } from '../queues/prepare';
import { c } from './sangrado';
import { EjCodigo } from './tipos';

function deCola(id: QueueId) {
  const t = COLAS.find((x) => x.id === id)!;
  const inicial =
    (valores: number[], prioridades: number[] = [], frente = 0): Constructor =>
    (m) => {
      m.marcos[0].vars.push({ nombre: 'cola', tipo: { base: t.struct, ptr: 1 }, valor: ponerCola(m, t, { valores, prioridades, frente }) });
    };
  return { ctx: { ...t.ctx, tipoCola: id, preludio: funcionesDe(t.src, ...t.otros) }, inicial };
}

const deLaEstructura = (estructura: string, ejercicios: EjCodigo[]): EjCodigo[] => ejercicios.map((e) => ({ ...e, estructura }));

const { ctx: BA, inicial: ba } = deCola('bicola-array');
const { ctx: BE, inicial: be } = deCola('bicola-enlazada');
const { ctx: PL, inicial: pl } = deCola('cola-prioridad-lista');
const { ctx: PA, inicial: pa } = deCola('cola-prioridad-array');
const LLENA = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// ------------------------------------------------------------------ bicola con array

const BICOLA_ARRAY: EjCodigo[] = [
  {
    id: '4-27',
    tipo: 'programar',
    titulo: 'Insertar el 5 por el principio, a mano',
    enunciado: 'La bicola tiene 8 y 4, con el frente en la casilla 0. Mete el **5** por el principio sin llamar a `insertarPrincipioBicolaArray`.',
    pistas: ['`frente` tiene que retroceder, y desde la casilla 0 eso da la vuelta.', 'En C, `-1 % 10` vale -1: suma `TAM_BICOLA_ARRAY` antes del `%`.'],
    ctx: BA,
    casos: [{ nombre: 'Bicola 8 4 desde la casilla 0', inicial: [ba([8, 4])] }],
    observar: ['cola'],
    prohibidos: ['insertarPrincipioBicolaArray()'],
    solucion: c(`
      cola->frente = (cola->frente - 1 + TAM_BICOLA_ARRAY) % TAM_BICOLA_ARRAY;
      cola->array[cola->frente] = 5;
      cola->numElementos++;`),
  },
  {
    id: '4-28',
    tipo: 'programar',
    titulo: 'Quitar el último, a mano',
    enunciado: 'Quita el último de la bicola y guárdalo en `x`, sin llamar a `eliminarFinalBicolaArray`. Aquí `final` está en la casilla 0.',
    pistas: ['`final` es la casilla libre siguiente al último: primero retrocede y después se lee.'],
    ctx: BA,
    casos: [{ nombre: 'Bicola 8 4, final en la casilla 0', inicial: [ba([8, 4], [], 8), entero('x', 0)] }],
    observar: ['cola', 'x'],
    prohibidos: ['eliminarFinalBicolaArray()'],
    solucion: c(`
      cola->final = (cola->final - 1 + TAM_BICOLA_ARRAY) % TAM_BICOLA_ARRAY;
      x = cola->array[cola->final];
      cola->numElementos--;`),
  },
  {
    id: '4-29',
    tipo: 'programar',
    titulo: 'Pasar el último al principio',
    enunciado: 'Usando las funciones de la bicola, pasa el último al principio: `1 2 3` queda `3 1 2`.',
    alResolver: 'En una cola normal esto obligaría a dar la vuelta entera. La bicola lo hace en O(1).',
    ctx: BA,
    casos: [{ nombre: 'Bicola 1 2 3', inicial: [ba([1, 2, 3])] }],
    observar: ['cola'],
    codigoInicial: 'int aux = 0;\n',
    solucion: c(`
      int aux = 0;
      eliminarFinalBicolaArray(cola, &aux);
      insertarPrincipioBicolaArray(cola, aux);`),
  },
  {
    id: '4-39',
    tipo: 'programar',
    titulo: 'Escribe insertarPrincipioBicolaArray',
    enunciado: 'Completa `insertarPrincipioBicolaArray`: mete `x` por delante y devuelve 1; si está llena, devuelve 0 sin tocar nada. Tienes `estaLLenaBicolaArray(cola)`.',
    ctx: BA,
    casos: [
      { nombre: 'Bicola 8 4 desde la casilla 3', inicial: [ba([8, 4], [], 3)], llamada: 'insertarPrincipioBicolaArray(cola, 5)' },
      { nombre: 'Bicola 8 4 desde la casilla 0', inicial: [ba([8, 4])], llamada: 'insertarPrincipioBicolaArray(cola, 5)' },
      { nombre: 'Llena', inicial: [ba(LLENA)], llamada: 'insertarPrincipioBicolaArray(cola, 5)' },
    ],
    observar: ['cola'],
    codigoInicial: c(`
      int insertarPrincipioBicolaArray(BicolaArray *cola, int x) {

      }`),
    solucion: c(`
      int insertarPrincipioBicolaArray(BicolaArray *cola, int x) {
          if(estaLLenaBicolaArray(cola) == 1) return 0;
          cola->frente = (cola->frente - 1 + TAM_BICOLA_ARRAY) % TAM_BICOLA_ARRAY;
          cola->array[cola->frente] = x;
          cola->numElementos++;
          return 1;
      }`),
  },
  {
    id: '4-40',
    tipo: 'programar',
    titulo: 'Escribe eliminarFinalBicolaArray',
    enunciado: 'Completa `eliminarFinalBicolaArray`: deja el último en `*x`, lo quita y devuelve 1; si está vacía, devuelve 0 sin tocar `*x`.',
    ctx: BA,
    casos: [
      { nombre: 'Bicola 8 4 6', inicial: [ba([8, 4, 6]), entero('x', 0)], llamada: 'eliminarFinalBicolaArray(cola, &x)' },
      { nombre: 'Bicola 8 4, final en la casilla 0', inicial: [ba([8, 4], [], 8), entero('x', 0)], llamada: 'eliminarFinalBicolaArray(cola, &x)' },
      { nombre: 'Vacía', inicial: [ba([], [], 3), entero('x', 7)], llamada: 'eliminarFinalBicolaArray(cola, &x)' },
    ],
    observar: ['cola', 'x'],
    codigoInicial: c(`
      int eliminarFinalBicolaArray(BicolaArray *cola, int *x) {

      }`),
    solucion: c(`
      int eliminarFinalBicolaArray(BicolaArray *cola, int *x) {
          if(estaVaciaBicolaArray(cola) == 1) return 0;
          cola->final = (cola->final - 1 + TAM_BICOLA_ARRAY) % TAM_BICOLA_ARRAY;
          *x = cola->array[cola->final];
          cola->numElementos--;
          return 1;
      }`),
  },
  {
    id: '4-41',
    tipo: 'programar',
    titulo: 'Escribe esCapicuaBicolaArray',
    enunciado: 'Completa `esCapicuaBicolaArray`: devuelve 1 si la bicola se lee igual desde los dos extremos y 0 si no, sin cambiarla.',
    pistas: ['El elemento `i` contando desde el frente está en `(frente + i) % TAM_BICOLA_ARRAY`.', 'Compara el `i` con el `numElementos - 1 - i`, hasta la mitad.'],
    ctx: BA,
    casos: [
      { nombre: 'Bicola 1 2 1', inicial: [ba([1, 2, 1])], llamada: 'esCapicuaBicolaArray(cola)' },
      { nombre: 'Bicola 1 2 3', inicial: [ba([1, 2, 3])], llamada: 'esCapicuaBicolaArray(cola)' },
      { nombre: 'Bicola 4 5 5 4 dando la vuelta', inicial: [ba([4, 5, 5, 4], [], 8)], llamada: 'esCapicuaBicolaArray(cola)' },
      { nombre: 'Vacía', inicial: [ba([])], llamada: 'esCapicuaBicolaArray(cola)' },
    ],
    observar: ['cola'],
    codigoInicial: c(`
      int esCapicuaBicolaArray(BicolaArray *cola) {

      }`),
    solucion: c(`
      int esCapicuaBicolaArray(BicolaArray *cola) {
          int n = cola->numElementos;
          for (int i = 0; i < n / 2; i++) {
              int a = cola->array[(cola->frente + i) % TAM_BICOLA_ARRAY];
              int b = cola->array[(cola->frente + n - 1 - i) % TAM_BICOLA_ARRAY];
              if (a != b) return 0;
          }
          return 1;
      }`),
  },
  {
    id: '4-F21',
    tipo: 'fallo',
    titulo: 'insertarPrincipioBicolaArray que retrocede sin red',
    enunciado: 'Si el frente no está en la casilla 0, funciona.',
    ctx: BA,
    casos: [
      { nombre: 'Bicola 8 4 desde la casilla 3', inicial: [ba([8, 4], [], 3)], llamada: 'insertarPrincipioBicolaArray(cola, 5)' },
      { nombre: 'Bicola 8 4 desde la casilla 0', inicial: [ba([8, 4])], llamada: 'insertarPrincipioBicolaArray(cola, 5)' },
    ],
    observar: ['cola'],
    codigo: c(`
      int insertarPrincipioBicolaArray(BicolaArray *cola, int x) {
          if(estaLLenaBicolaArray(cola) == 1) return 0;
          cola->frente = (cola->frente - 1) % TAM_BICOLA_ARRAY;
          cola->array[cola->frente] = x;
          cola->numElementos++;
          return 1;
      }`),
    lineasFallo: [3],
    tiposFallo: ['array'],
    explicacion: 'En C, `-1 % 10` vale -1, así que desde la casilla 0 se escribe en `array[-1]`. Hay que sumar el tamaño antes del módulo.',
    solucion: c(`
      int insertarPrincipioBicolaArray(BicolaArray *cola, int x) {
          if(estaLLenaBicolaArray(cola) == 1) return 0;
          cola->frente = (cola->frente - 1 + TAM_BICOLA_ARRAY) % TAM_BICOLA_ARRAY;
          cola->array[cola->frente] = x;
          cola->numElementos++;
          return 1;
      }`),
  },
  {
    id: '4-F22',
    tipo: 'fallo',
    titulo: 'eliminarFinalBicolaArray que lee antes de retroceder',
    enunciado: 'Las líneas son las de siempre. El orden, no.',
    ctx: BA,
    casos: [
      { nombre: 'Vacía', inicial: [ba([], [], 3), entero('x', 7)], llamada: 'eliminarFinalBicolaArray(cola, &x)' },
      { nombre: 'Llena', inicial: [ba(LLENA), entero('x', 0)], llamada: 'eliminarFinalBicolaArray(cola, &x)' },
    ],
    observar: ['cola', 'x'],
    codigo: c(`
      int eliminarFinalBicolaArray(BicolaArray *cola, int *x) {
          if(estaVaciaBicolaArray(cola) == 1) return 0;
          *x = cola->array[cola->final];
          cola->final = (cola->final - 1 + TAM_BICOLA_ARRAY) % TAM_BICOLA_ARRAY;
          cola->numElementos--;
          return 1;
      }`),
    lineasFallo: [3, 4],
    tiposFallo: ['caso'],
    explicacion: '`final` no apunta al último, sino a la casilla libre siguiente. Hay que retroceder primero y leer después: con la bicola llena, aquí se lee el primero en vez del último.',
    solucion: c(`
      int eliminarFinalBicolaArray(BicolaArray *cola, int *x) {
          if(estaVaciaBicolaArray(cola) == 1) return 0;
          cola->final = (cola->final - 1 + TAM_BICOLA_ARRAY) % TAM_BICOLA_ARRAY;
          *x = cola->array[cola->final];
          cola->numElementos--;
          return 1;
      }`),
  },
  {
    id: '4-F23',
    tipo: 'fallo',
    titulo: 'finalBicolaArray que no retrocede',
    enunciado: 'Quiere consultar el último sin sacarlo.',
    ctx: BA,
    casos: [
      { nombre: 'Vacía', inicial: [ba([], [], 3), entero('x', 7)], llamada: 'finalBicolaArray(cola, &x)' },
      { nombre: 'Llena', inicial: [ba(LLENA), entero('x', 0)], llamada: 'finalBicolaArray(cola, &x)' },
    ],
    observar: ['cola', 'x'],
    codigo: c(`
      int finalBicolaArray(BicolaArray *cola, int *x) {
          if(estaVaciaBicolaArray(cola) == 1) return 0;
          *x = cola->array[cola->final % TAM_BICOLA_ARRAY];
          return 1;
      }`),
    lineasFallo: [3],
    tiposFallo: ['caso'],
    explicacion: 'El último está una casilla antes de `final`: `(cola->final - 1 + TAM_BICOLA_ARRAY) % TAM_BICOLA_ARRAY`.',
    solucion: c(`
      int finalBicolaArray(BicolaArray *cola, int *x) {
          if(estaVaciaBicolaArray(cola) == 1) return 0;
          *x = cola->array[(cola->final - 1 + TAM_BICOLA_ARRAY) % TAM_BICOLA_ARRAY];
          return 1;
      }`),
  },
  {
    id: '4-F24',
    tipo: 'fallo',
    titulo: 'esCapicuaBicolaArray que se sale',
    enunciado: 'Con la bicola al principio del array, acierta siempre.',
    ctx: BA,
    casos: [
      { nombre: 'Bicola 1 2 1', inicial: [ba([1, 2, 1])], llamada: 'esCapicuaBicolaArray(cola)' },
      { nombre: 'Bicola 4 5 5 4 dando la vuelta', inicial: [ba([4, 5, 5, 4], [], 8)], llamada: 'esCapicuaBicolaArray(cola)' },
    ],
    observar: ['cola'],
    codigo: c(`
      int esCapicuaBicolaArray(BicolaArray *cola) {
          int n = cola->numElementos;
          for (int i = 0; i < n / 2; i++) {
              int a = cola->array[cola->frente + i];
              int b = cola->array[cola->frente + n - 1 - i];
              if (a != b) return 0;
          }
          return 1;
      }`),
    lineasFallo: [4, 5],
    tiposFallo: ['array'],
    explicacion: 'Sin `% TAM_BICOLA_ARRAY`, el índice se sale cuando la bicola da la vuelta al array.',
    solucion: c(`
      int esCapicuaBicolaArray(BicolaArray *cola) {
          int n = cola->numElementos;
          for (int i = 0; i < n / 2; i++) {
              int a = cola->array[(cola->frente + i) % TAM_BICOLA_ARRAY];
              int b = cola->array[(cola->frente + n - 1 - i) % TAM_BICOLA_ARRAY];
              if (a != b) return 0;
          }
          return 1;
      }`),
  },
  {
    id: '4-M13',
    tipo: 'misterio',
    titulo: 'Por los dos lados',
    enunciado: 'Predice cómo queda la bicola (del frente al final) en cada caso y después di qué hace.',
    ctx: BA,
    casos: [
      { nombre: 'Bicola 1 2 3', inicial: [ba([1, 2, 3])], llamada: 'misterio(cola)' },
      { nombre: 'Bicola 1 2 3 4', inicial: [ba([1, 2, 3, 4])], llamada: 'misterio(cola)' },
      { nombre: 'Bicola 5 6 7 8 9', inicial: [ba([5, 6, 7, 8, 9], [], 7)], llamada: 'misterio(cola)' },
    ],
    observar: ['cola'],
    responder: ['cola'],
    solucion: c(`
      void misterio(BicolaArray *cola) {
          int x = 0;
          while (tamanoBicolaArray(cola) > 1) {
              eliminarPrincipioBicolaArray(cola, &x);
              eliminarFinalBicolaArray(cola, &x);
          }
      }`),
    opciones: ['Deja solo el del medio si hay un número impar; si es par, la vacía.', 'Deja siempre el del medio.', 'Deja solo el primero y el último.', 'La vacía siempre.'],
    correcta: 0,
    explicacion: 'Cada vuelta quita uno por cada extremo, así que el tamaño baja de dos en dos. Con un número impar para en 1, y con uno par llega a 0.',
  },
  {
    id: '4-M14',
    tipo: 'misterio',
    titulo: 'De atrás adelante',
    enunciado: 'Predice cómo queda la bicola (del frente al final) en cada caso y después di qué hace.',
    ctx: BA,
    casos: [
      { nombre: 'Bicola 1 2 3 4, k = 1', inicial: [ba([1, 2, 3, 4])], llamada: 'misterio(cola, 1)' },
      { nombre: 'Bicola 1 2 3 4, k = 3', inicial: [ba([1, 2, 3, 4])], llamada: 'misterio(cola, 3)' },
      { nombre: 'Bicola 6 7, k = 2', inicial: [ba([6, 7], [], 9)], llamada: 'misterio(cola, 2)' },
    ],
    observar: ['cola'],
    responder: ['cola'],
    solucion: c(`
      void misterio(BicolaArray *cola, int k) {
          int x = 0;
          for (int i = 0; i < k; i++) {
              eliminarFinalBicolaArray(cola, &x);
              insertarPrincipioBicolaArray(cola, x);
          }
      }`),
    opciones: ['Pasa los k últimos al principio, sin cambiar su orden.', 'Pasa los k primeros al final.', 'Da la vuelta a los k últimos.', 'Quita los k últimos.'],
    correcta: 0,
    explicacion: 'Cada vuelta rota una posición hacia atrás. Los k últimos acaban delante y en su orden, porque el último de ellos es el primero en moverse y los demás se le ponen delante.',
  },
];

// ------------------------------------------------------------------ bicola enlazada

const BICOLA_ENLAZADA: EjCodigo[] = [
  {
    id: '4-30',
    tipo: 'programar',
    titulo: 'Insertar el 5 por el principio, enlazada',
    enunciado: 'Mete el **5** por delante de la bicola sin llamar a `insertarPrincipioBicolaEnlazada`. Los nodos son dobles: cuida los dos enlaces.',
    pistas: ['`crearNodoDoble(5)` te da el nodo.', 'Después, `siguiente` del nuevo y `anterior` del que era primero.'],
    ctx: BE,
    casos: [{ nombre: 'Bicola 1 2', inicial: [be([1, 2])] }],
    observar: ['cola'],
    prohibidos: ['insertarPrincipioBicolaEnlazada()'],
    solucion: c(`
      NodoDoble *aux = crearNodoDoble(5);
      establecerSiguienteNodoDoble(aux, cola->inicio);
      establecerAnteriorNodoDoble(cola->inicio, aux);
      cola->inicio = aux;
      cola->tamano++;`),
  },
  {
    id: '4-31',
    tipo: 'programar',
    titulo: 'Quitar el último sin recorrer',
    enunciado: 'Quita el último de la bicola y guárdalo en `x`, sin llamar a `eliminarFinalBicolaEnlazada`. Libera el nodo con `eliminarNodoDoble`.',
    alResolver: 'Esto es lo que da el enlace `anterior`: en la cola enlazada simple, llegar al penúltimo obliga a recorrer.',
    ctx: BE,
    casos: [{ nombre: 'Bicola 1 2 3', inicial: [be([1, 2, 3]), entero('x', 0)] }],
    observar: ['cola', 'x'],
    prohibidos: ['eliminarFinalBicolaEnlazada()'],
    solucion: c(`
      NodoDoble *aux = cola->final;
      x = obtenerValorNodoDoble(aux);
      cola->final = obtenerAnteriorNodoDoble(aux);
      establecerSiguienteNodoDoble(cola->final, NULL);
      cola->tamano--;
      eliminarNodoDoble(aux);`),
  },
  {
    id: '4-32',
    tipo: 'programar',
    titulo: 'Intercambiar los valores de los extremos',
    enunciado: 'Intercambia el valor del primero y el del último: `1 2 3` queda `3 2 1`. Aquí sí se cambian los valores, no los enlaces.',
    ctx: BE,
    casos: [{ nombre: 'Bicola 1 2 3', inicial: [be([1, 2, 3])] }],
    observar: ['cola'],
    solucion: c(`
      int a = obtenerValorNodoDoble(cola->inicio);
      establecerValorNodoDoble(cola->inicio, obtenerValorNodoDoble(cola->final));
      establecerValorNodoDoble(cola->final, a);`),
  },
  {
    id: '4-42',
    tipo: 'programar',
    titulo: 'Escribe insertarFinalBicolaEnlazada',
    enunciado: 'Completa `insertarFinalBicolaEnlazada`: mete `x` por detrás y devuelve 1. Si la bicola estaba vacía, el nodo es también el primero.',
    ctx: BE,
    casos: [
      { nombre: 'Bicola 1 2', inicial: [be([1, 2])], llamada: 'insertarFinalBicolaEnlazada(cola, 9)' },
      { nombre: 'Vacía', inicial: [be([])], llamada: 'insertarFinalBicolaEnlazada(cola, 9)' },
    ],
    observar: ['cola'],
    codigoInicial: c(`
      int insertarFinalBicolaEnlazada(BicolaEnlazada *cola, int x) {

      }`),
    solucion: c(`
      int insertarFinalBicolaEnlazada(BicolaEnlazada *cola, int x) {
          NodoDoble *aux = crearNodoDoble(x);
          if (estaVaciaBicolaEnlazada(cola) == 1) {
              cola->inicio = aux;
          } else {
              establecerAnteriorNodoDoble(aux, cola->final);
              establecerSiguienteNodoDoble(cola->final, aux);
          }
          cola->final = aux;
          cola->tamano++;
          return 1;
      }`),
  },
  {
    id: '4-43',
    tipo: 'programar',
    titulo: 'Escribe eliminarPrincipioBicolaEnlazada',
    enunciado: 'Completa `eliminarPrincipioBicolaEnlazada`: deja el primero en `*x`, lo quita y devuelve 1; si está vacía, devuelve 0. Piensa en el caso de un solo nodo.',
    pistas: ['El nuevo primero no puede seguir apuntando hacia atrás al nodo liberado.'],
    ctx: BE,
    casos: [
      { nombre: 'Bicola 1 2 3', inicial: [be([1, 2, 3]), entero('x', 0)], llamada: 'eliminarPrincipioBicolaEnlazada(cola, &x)' },
      { nombre: 'Bicola 7', inicial: [be([7]), entero('x', 0)], llamada: 'eliminarPrincipioBicolaEnlazada(cola, &x)' },
      { nombre: 'Vacía', inicial: [be([]), entero('x', 5)], llamada: 'eliminarPrincipioBicolaEnlazada(cola, &x)' },
    ],
    observar: ['cola', 'x'],
    codigoInicial: c(`
      int eliminarPrincipioBicolaEnlazada(BicolaEnlazada *cola, int *x) {

      }`),
    solucion: c(`
      int eliminarPrincipioBicolaEnlazada(BicolaEnlazada *cola, int *x) {
          if (estaVaciaBicolaEnlazada(cola) == 1) return 0;
          NodoDoble *aux = cola->inicio;
          *x = obtenerValorNodoDoble(aux);
          cola->inicio = obtenerSiguienteNodoDoble(aux);
          if (cola->inicio == NULL) {
              cola->final = NULL;
          } else {
              establecerAnteriorNodoDoble(cola->inicio, NULL);
          }
          cola->tamano--;
          return eliminarNodoDoble(aux);
      }`),
  },
  {
    id: '4-44',
    tipo: 'programar',
    titulo: 'Escribe esCapicuaBicolaEnlazada',
    enunciado: 'Completa `esCapicuaBicolaEnlazada`: devuelve 1 si se lee igual desde los dos extremos y 0 si no, sin cambiarla.',
    pistas: ['Un puntero avanza desde `inicio` y otro retrocede desde `final`.', 'Bastan `tamano / 2` comparaciones.'],
    ctx: BE,
    casos: [
      { nombre: 'Bicola 1 2 1', inicial: [be([1, 2, 1])], llamada: 'esCapicuaBicolaEnlazada(cola)' },
      { nombre: 'Bicola 1 2 3', inicial: [be([1, 2, 3])], llamada: 'esCapicuaBicolaEnlazada(cola)' },
      { nombre: 'Bicola 4 4', inicial: [be([4, 4])], llamada: 'esCapicuaBicolaEnlazada(cola)' },
      { nombre: 'Vacía', inicial: [be([])], llamada: 'esCapicuaBicolaEnlazada(cola)' },
    ],
    observar: ['cola'],
    codigoInicial: c(`
      int esCapicuaBicolaEnlazada(BicolaEnlazada *cola) {

      }`),
    solucion: c(`
      int esCapicuaBicolaEnlazada(BicolaEnlazada *cola) {
          NodoDoble *a = cola->inicio;
          NodoDoble *b = cola->final;
          for (int i = 0; i < cola->tamano / 2; i++) {
              if (obtenerValorNodoDoble(a) != obtenerValorNodoDoble(b)) return 0;
              a = obtenerSiguienteNodoDoble(a);
              b = obtenerAnteriorNodoDoble(b);
          }
          return 1;
      }`),
  },
  {
    id: '4-F25',
    tipo: 'fallo',
    titulo: 'insertarPrincipioBicolaEnlazada con un enlace de menos',
    enunciado: 'Leída desde `inicio`, la bicola está perfecta.',
    ctx: BE,
    casos: [
      { nombre: 'Vacía', inicial: [be([])], llamada: 'insertarPrincipioBicolaEnlazada(cola, 9)' },
      { nombre: 'Bicola 1 2', inicial: [be([1, 2])], llamada: 'insertarPrincipioBicolaEnlazada(cola, 9)' },
    ],
    observar: ['cola'],
    codigo: c(`
      int insertarPrincipioBicolaEnlazada(BicolaEnlazada *cola, int x) {
          if (cola == NULL) return 0;
          NodoDoble *aux = crearNodoDoble(x);
          if (aux == NULL) return 0;
          if (estaVaciaBicolaEnlazada(cola) == 1) {
              cola->final = aux;
          } else {
              establecerSiguienteNodoDoble(aux, cola->inicio);
          }
          cola->inicio = aux;
          cola->tamano++;
          return 1;
      }`),
    lineasFallo: [8, 9],
    preguntaLinea: 'Falta una línea. ¿Dónde iría?',
    tiposFallo: ['enlace'],
    explicacion: 'Falta `establecerAnteriorNodoDoble(cola->inicio, aux)`. Hacia delante se llega a todo, pero hacia atrás el que era primero sigue diciendo que no tiene a nadie delante.',
    solucion: c(`
      int insertarPrincipioBicolaEnlazada(BicolaEnlazada *cola, int x) {
          if (cola == NULL) return 0;
          NodoDoble *aux = crearNodoDoble(x);
          if (aux == NULL) return 0;
          if (estaVaciaBicolaEnlazada(cola) == 1) {
              cola->final = aux;
          } else {
              establecerSiguienteNodoDoble(aux, cola->inicio);
              establecerAnteriorNodoDoble(cola->inicio, aux);
          }
          cola->inicio = aux;
          cola->tamano++;
          return 1;
      }`),
  },
  {
    id: '4-F26',
    tipo: 'fallo',
    titulo: 'eliminarFinalBicolaEnlazada que deja un enlace al vacío',
    enunciado: 'El nodo se libera y `final` retrocede. Mira lo que apunta al nodo que ya no existe.',
    ctx: BE,
    casos: [
      { nombre: 'Bicola 7', inicial: [be([7]), entero('x', 0)], llamada: 'eliminarFinalBicolaEnlazada(cola, &x)' },
      { nombre: 'Bicola 1 2 3', inicial: [be([1, 2, 3]), entero('x', 0)], llamada: 'eliminarFinalBicolaEnlazada(cola, &x)' },
    ],
    observar: ['cola', 'x'],
    codigo: c(`
      int eliminarFinalBicolaEnlazada(BicolaEnlazada *cola, int *x) {
          if (estaVaciaBicolaEnlazada(cola) == 1) return 0;
          NodoDoble *aux = cola->final;
          *x = obtenerValorNodoDoble(aux);
          cola->final = obtenerAnteriorNodoDoble(aux);
          if (cola->final == NULL) {
              cola->inicio = NULL;
          }
          cola->tamano--;
          return eliminarNodoDoble(aux);
      }`),
    lineasFallo: [8, 9],
    preguntaLinea: 'Falta una línea. ¿Dónde iría?',
    tiposFallo: ['colgante'],
    explicacion: 'El nuevo último sigue con su `siguiente` apuntando al nodo liberado. Hace falta un `else` con `establecerSiguienteNodoDoble(cola->final, NULL)`.',
    solucion: c(`
      int eliminarFinalBicolaEnlazada(BicolaEnlazada *cola, int *x) {
          if (estaVaciaBicolaEnlazada(cola) == 1) return 0;
          NodoDoble *aux = cola->final;
          *x = obtenerValorNodoDoble(aux);
          cola->final = obtenerAnteriorNodoDoble(aux);
          if (cola->final == NULL) {
              cola->inicio = NULL;
          } else {
              establecerSiguienteNodoDoble(cola->final, NULL);
          }
          cola->tamano--;
          return eliminarNodoDoble(aux);
      }`),
  },
  {
    id: '4-F27',
    tipo: 'fallo',
    titulo: 'eliminarPrincipioBicolaEnlazada sin el caso del único',
    enunciado: 'Con dos o más nodos no hay nada que reprochar.',
    ctx: BE,
    casos: [
      { nombre: 'Bicola 1 2', inicial: [be([1, 2]), entero('x', 0)], llamada: 'eliminarPrincipioBicolaEnlazada(cola, &x)' },
      { nombre: 'Bicola 7', inicial: [be([7]), entero('x', 0)], llamada: 'eliminarPrincipioBicolaEnlazada(cola, &x)' },
    ],
    observar: ['cola', 'x'],
    codigo: c(`
      int eliminarPrincipioBicolaEnlazada(BicolaEnlazada *cola, int *x) {
          if (estaVaciaBicolaEnlazada(cola) == 1) return 0;
          NodoDoble *aux = cola->inicio;
          *x = obtenerValorNodoDoble(aux);
          cola->inicio = obtenerSiguienteNodoDoble(aux);
          establecerAnteriorNodoDoble(cola->inicio, NULL);
          cola->tamano--;
          return eliminarNodoDoble(aux);
      }`),
    lineasFallo: [5, 6],
    tiposFallo: ['colgante', 'caso'],
    explicacion: 'Si era el único, `inicio` pasa a NULL pero `final` sigue apuntando al nodo liberado. Hay que mirar ese caso y dejar `cola->final = NULL`.',
    solucion: c(`
      int eliminarPrincipioBicolaEnlazada(BicolaEnlazada *cola, int *x) {
          if (estaVaciaBicolaEnlazada(cola) == 1) return 0;
          NodoDoble *aux = cola->inicio;
          *x = obtenerValorNodoDoble(aux);
          cola->inicio = obtenerSiguienteNodoDoble(aux);
          if (cola->inicio == NULL) {
              cola->final = NULL;
          } else {
              establecerAnteriorNodoDoble(cola->inicio, NULL);
          }
          cola->tamano--;
          return eliminarNodoDoble(aux);
      }`),
  },
  {
    id: '4-F28',
    tipo: 'fallo',
    titulo: 'eliminarFinalBicolaEnlazada que lee demasiado tarde',
    enunciado: 'Todas las líneas son necesarias. El problema es cuándo se ejecuta cada una.',
    ctx: BE,
    casos: [
      { nombre: 'Vacía', inicial: [be([]), entero('x', 0)], llamada: 'eliminarFinalBicolaEnlazada(cola, &x)' },
      { nombre: 'Bicola 1 2', inicial: [be([1, 2]), entero('x', 0)], llamada: 'eliminarFinalBicolaEnlazada(cola, &x)' },
    ],
    observar: ['cola', 'x'],
    codigo: c(`
      int eliminarFinalBicolaEnlazada(BicolaEnlazada *cola, int *x) {
          if (estaVaciaBicolaEnlazada(cola) == 1) return 0;
          NodoDoble *aux = cola->final;
          cola->final = aux->anterior;
          if (cola->final == NULL) {
              cola->inicio = NULL;
          } else {
              cola->final->siguiente = NULL;
          }
          cola->tamano--;
          free(aux);
          *x = aux->valor;
          return 1;
      }`),
    lineasFallo: [11, 12],
    tiposFallo: ['liberado'],
    explicacion: 'Tras `free(aux)`, leer `aux->valor` es usar memoria liberada. El valor se guarda antes de liberar.',
    solucion: c(`
      int eliminarFinalBicolaEnlazada(BicolaEnlazada *cola, int *x) {
          if (estaVaciaBicolaEnlazada(cola) == 1) return 0;
          NodoDoble *aux = cola->final;
          cola->final = aux->anterior;
          if (cola->final == NULL) {
              cola->inicio = NULL;
          } else {
              cola->final->siguiente = NULL;
          }
          cola->tamano--;
          *x = aux->valor;
          free(aux);
          return 1;
      }`),
  },
  {
    id: '4-M15',
    tipo: 'misterio',
    titulo: 'De fuera adentro',
    enunciado: 'Predice cómo queda la bicola (del frente al final) en cada caso y después di qué hace.',
    ctx: BE,
    casos: [
      { nombre: 'Bicola 1 2 3', inicial: [be([1, 2, 3])], llamada: 'misterio(cola)' },
      { nombre: 'Bicola 4 5 6 7', inicial: [be([4, 5, 6, 7])], llamada: 'misterio(cola)' },
      { nombre: 'Bicola 9', inicial: [be([9])], llamada: 'misterio(cola)' },
    ],
    observar: ['cola'],
    responder: ['cola'],
    solucion: c(`
      void misterio(BicolaEnlazada *cola) {
          NodoDoble *a = cola->inicio;
          NodoDoble *b = cola->final;
          for (int i = 0; i < cola->tamano / 2; i++) {
              int v = obtenerValorNodoDoble(a);
              establecerValorNodoDoble(a, obtenerValorNodoDoble(b));
              establecerValorNodoDoble(b, v);
              a = obtenerSiguienteNodoDoble(a);
              b = obtenerAnteriorNodoDoble(b);
          }
      }`),
    opciones: ['Da la vuelta a la bicola intercambiando valores, sin tocar los enlaces.', 'Da la vuelta a la bicola moviendo enlaces.', 'Intercambia solo el primero y el último.', 'La deja como estaba.'],
    correcta: 0,
    explicacion: 'Dos punteros van de los extremos hacia el centro intercambiando valores. Parar en `tamano / 2` es clave: si llegasen hasta el final, se desharía todo y quedaría como estaba.',
  },
  {
    id: '4-M16',
    tipo: 'misterio',
    titulo: 'Delante del espejo',
    enunciado: 'Predice cómo queda la bicola (del frente al final) en cada caso y después di qué hace.',
    ctx: BE,
    casos: [
      { nombre: 'Bicola 1 2', inicial: [be([1, 2])], llamada: 'misterio(cola)' },
      { nombre: 'Bicola 3 4 5', inicial: [be([3, 4, 5])], llamada: 'misterio(cola)' },
      { nombre: 'Vacía', inicial: [be([])], llamada: 'misterio(cola)' },
    ],
    observar: ['cola'],
    responder: ['cola'],
    solucion: c(`
      void misterio(BicolaEnlazada *cola) {
          int n = tamanoBicolaEnlazada(cola);
          NodoDoble *p = cola->final;
          for (int i = 0; i < n; i++) {
              insertarFinalBicolaEnlazada(cola, obtenerValorNodoDoble(p));
              p = obtenerAnteriorNodoDoble(p);
          }
      }`),
    opciones: ['Añade detrás una copia al revés: la bicola queda capicúa.', 'Añade detrás una copia en el mismo orden.', 'Da la vuelta a la bicola.', 'Duplica cada elemento justo detrás de sí mismo.'],
    correcta: 0,
    explicacion: '`p` retrocede desde el último original mientras se insertan copias por detrás. Guardar `n` antes es lo que evita que el bucle persiga a los nodos que va creando.',
  },
];

const PRIORIDAD_LISTA: EjCodigo[] = [
  {
    id: '4-33',
    tipo: 'programar',
    titulo: 'Mirar el primero, a mano',
    enunciado: 'Guarda en `x` el valor y en `prioridad` la prioridad del que saldría primero, sin sacarlo y sin llamar a `frenteColaPrioridadLista`.',
    alResolver: 'La lista está ordenada al insertar, así que mirar el primero cuesta O(1).',
    ctx: PL,
    casos: [{ nombre: '30 (p0), 10 (p1), 40 (p1)', inicial: [pl([30, 10, 40], [0, 1, 1]), entero('x', 0), entero('prioridad', 0)] }],
    observar: ['cola', 'x', 'prioridad'],
    prohibidos: ['frenteColaPrioridadLista()', 'desencolarColaPrioridadLista()'],
    solucion: c(`
      x = obtenerValorNodoPrioridad(cola->inicio);
      prioridad = obtenerPrioridadNodoPrioridad(cola->inicio);`),
  },
  {
    id: '4-34',
    tipo: 'programar',
    titulo: 'Colar el 9 con prioridad 0',
    enunciado: 'En esta cola nadie tiene prioridad 0. Mete el **9** con prioridad 0 sin llamar a `encolarColaPrioridadLista`: ¿dónde tiene que ir?',
    ctx: PL,
    casos: [{ nombre: '30 (p1), 40 (p2)', inicial: [pl([30, 40], [1, 2])] }],
    observar: ['cola'],
    prohibidos: ['encolarColaPrioridadLista()'],
    solucion: c(`
      NodoPrioridad *nuevo = crearNodoPrioridad(9, 0);
      establecerSiguienteNodoPrioridad(nuevo, cola->inicio);
      cola->inicio = nuevo;
      cola->tamano++;`),
  },
  {
    id: '4-35',
    tipo: 'programar',
    titulo: 'Desencolar a mano, con lista',
    enunciado: 'Saca el que toca, guárdalo en `x` y libera su nodo, sin llamar a `desencolarColaPrioridadLista` ni a `vaciarColaPrioridadLista`.',
    pistas: ['No hay que buscar nada: sale el del inicio.'],
    ctx: PL,
    casos: [{ nombre: '30 (p0), 10 (p1)', inicial: [pl([30, 10], [0, 1]), entero('x', 0)] }],
    observar: ['cola', 'x'],
    prohibidos: ['desencolarColaPrioridadLista()', 'vaciarColaPrioridadLista()'],
    solucion: c(`
      NodoPrioridad *aux = cola->inicio;
      x = obtenerValorNodoPrioridad(aux);
      cola->inicio = obtenerSiguienteNodoPrioridad(aux);
      cola->tamano--;
      eliminarNodoPrioridad(aux);`),
  },
  {
    id: '4-45',
    tipo: 'programar',
    titulo: 'Escribe encolarColaPrioridadLista',
    enunciado: 'Completa `encolarColaPrioridadLista`: mete `x` donde le toca y devuelve 1. Entre iguales, el nuevo va detrás. Si la prioridad no está entre 0 y `NUM_PRIORIDADES - 1`, devuelve 0 sin tocar nada.',
    pistas: ['Avanza con dos punteros, `anterior` y `actual`, mientras la prioridad de `actual` sea `<=` que la nueva.', 'Si `anterior` sigue en NULL, el nuevo va el primero.'],
    ctx: PL,
    casos: [
      { nombre: 'Prioridad 1, entre iguales', inicial: [pl([30, 10, 40], [0, 1, 2])], llamada: 'encolarColaPrioridadLista(cola, 5, 1)' },
      { nombre: 'Prioridad 0, antes que nadie', inicial: [pl([10, 40], [1, 2])], llamada: 'encolarColaPrioridadLista(cola, 5, 0)' },
      { nombre: 'Prioridad 3, al final', inicial: [pl([30, 10], [0, 1])], llamada: 'encolarColaPrioridadLista(cola, 5, 3)' },
      { nombre: 'Vacía', inicial: [pl([])], llamada: 'encolarColaPrioridadLista(cola, 5, 2)' },
      { nombre: 'Prioridad 4, no existe', inicial: [pl([30], [0])], llamada: 'encolarColaPrioridadLista(cola, 5, 4)' },
    ],
    observar: ['cola'],
    codigoInicial: c(`
      int encolarColaPrioridadLista(ColaPrioridadLista *cola, int x, int prioridad) {

      }`),
    solucion: c(`
      int encolarColaPrioridadLista(ColaPrioridadLista *cola, int x, int prioridad) {
          if (prioridad < 0 || prioridad >= NUM_PRIORIDADES) return 0;
          NodoPrioridad *nuevo = crearNodoPrioridad(x, prioridad);
          NodoPrioridad *anterior = NULL;
          NodoPrioridad *actual = cola->inicio;
          while (actual != NULL && obtenerPrioridadNodoPrioridad(actual) <= prioridad) {
              anterior = actual;
              actual = obtenerSiguienteNodoPrioridad(actual);
          }
          establecerSiguienteNodoPrioridad(nuevo, actual);
          if (anterior == NULL) {
              cola->inicio = nuevo;
          } else {
              establecerSiguienteNodoPrioridad(anterior, nuevo);
          }
          cola->tamano++;
          return 1;
      }`),
  },
  {
    id: '4-46',
    tipo: 'programar',
    titulo: 'Escribe contarPrioridadLista',
    enunciado: 'Completa `contarPrioridadLista`: devuelve cuántos elementos tienen la prioridad `p`, sin cambiar la cola.',
    ctx: PL,
    casos: [
      { nombre: '30 (p0), 10 (p1), 40 (p1), p = 1', inicial: [pl([30, 10, 40], [0, 1, 1])], llamada: 'contarPrioridadLista(cola, 1)' },
      { nombre: '30 (p0), 10 (p1), 40 (p1), p = 2', inicial: [pl([30, 10, 40], [0, 1, 1])], llamada: 'contarPrioridadLista(cola, 2)' },
      { nombre: 'Vacía', inicial: [pl([])], llamada: 'contarPrioridadLista(cola, 1)' },
    ],
    observar: ['cola'],
    codigoInicial: c(`
      int contarPrioridadLista(ColaPrioridadLista *cola, int p) {

      }`),
    solucion: c(`
      int contarPrioridadLista(ColaPrioridadLista *cola, int p) {
          int n = 0;
          NodoPrioridad *aux = cola->inicio;
          while (aux != NULL) {
              if (obtenerPrioridadNodoPrioridad(aux) == p) n++;
              aux = obtenerSiguienteNodoPrioridad(aux);
          }
          return n;
      }`),
  },
  {
    id: '4-47',
    tipo: 'programar',
    titulo: 'Escribe quitarPrioridadLista',
    enunciado: 'Completa `quitarPrioridadLista`: quita todos los elementos con prioridad `p`, liberando sus nodos, y devuelve cuántos ha quitado.',
    pistas: ['Guarda el siguiente antes de liberar.', '`anterior` solo avanza cuando el nodo se queda.', 'Si el que se va es el primero, cambia `cola->inicio`.'],
    ctx: PL,
    casos: [
      { nombre: 'Quitar p = 1, en medio', inicial: [pl([30, 10, 40, 20], [0, 1, 1, 2])], llamada: 'quitarPrioridadLista(cola, 1)' },
      { nombre: 'Quitar p = 0, al principio', inicial: [pl([30, 10], [0, 1])], llamada: 'quitarPrioridadLista(cola, 0)' },
      { nombre: 'Quitar p = 3, no hay', inicial: [pl([30, 10], [0, 1])], llamada: 'quitarPrioridadLista(cola, 3)' },
      { nombre: 'Quitarlos todos', inicial: [pl([5, 6], [2, 2])], llamada: 'quitarPrioridadLista(cola, 2)' },
    ],
    observar: ['cola'],
    codigoInicial: c(`
      int quitarPrioridadLista(ColaPrioridadLista *cola, int p) {

      }`),
    solucion: c(`
      int quitarPrioridadLista(ColaPrioridadLista *cola, int p) {
          int n = 0;
          NodoPrioridad *anterior = NULL;
          NodoPrioridad *actual = cola->inicio;
          while (actual != NULL) {
              NodoPrioridad *sig = obtenerSiguienteNodoPrioridad(actual);
              if (obtenerPrioridadNodoPrioridad(actual) == p) {
                  if (anterior == NULL) {
                      cola->inicio = sig;
                  } else {
                      establecerSiguienteNodoPrioridad(anterior, sig);
                  }
                  eliminarNodoPrioridad(actual);
                  cola->tamano--;
                  n++;
              } else {
                  anterior = actual;
              }
              actual = sig;
          }
          return n;
      }`),
  },
  {
    id: '4-F29',
    tipo: 'fallo',
    titulo: 'encolarColaPrioridadLista que se cuela entre iguales',
    enunciado: 'Respeta las prioridades. Mira qué pasa entre dos con la misma.',
    ctx: PL,
    casos: [
      { nombre: 'Prioridad 2, nadie igual', inicial: [pl([30, 10], [0, 1])], llamada: 'encolarColaPrioridadLista(cola, 5, 2)' },
      { nombre: 'Prioridad 1, ya hay uno', inicial: [pl([30, 10], [0, 1])], llamada: 'encolarColaPrioridadLista(cola, 5, 1)' },
    ],
    observar: ['cola'],
    codigo: c(`
      int encolarColaPrioridadLista(ColaPrioridadLista *cola, int x, int prioridad) {
          if (prioridad < 0 || prioridad >= NUM_PRIORIDADES) return 0;
          NodoPrioridad *nuevo = crearNodoPrioridad(x, prioridad);
          NodoPrioridad *anterior = NULL;
          NodoPrioridad *actual = cola->inicio;
          while (actual != NULL && obtenerPrioridadNodoPrioridad(actual) < prioridad) {
              anterior = actual;
              actual = obtenerSiguienteNodoPrioridad(actual);
          }
          establecerSiguienteNodoPrioridad(nuevo, actual);
          if (anterior == NULL) {
              cola->inicio = nuevo;
          } else {
              establecerSiguienteNodoPrioridad(anterior, nuevo);
          }
          cola->tamano++;
          return 1;
      }`),
    lineasFallo: [6],
    tiposFallo: ['caso'],
    explicacion: 'Con `<`, el nuevo se pone delante de los de su misma prioridad. Entre iguales tiene que salir antes el que llegó antes: hace falta `<=`.',
    solucion: c(`
      int encolarColaPrioridadLista(ColaPrioridadLista *cola, int x, int prioridad) {
          if (prioridad < 0 || prioridad >= NUM_PRIORIDADES) return 0;
          NodoPrioridad *nuevo = crearNodoPrioridad(x, prioridad);
          NodoPrioridad *anterior = NULL;
          NodoPrioridad *actual = cola->inicio;
          while (actual != NULL && obtenerPrioridadNodoPrioridad(actual) <= prioridad) {
              anterior = actual;
              actual = obtenerSiguienteNodoPrioridad(actual);
          }
          establecerSiguienteNodoPrioridad(nuevo, actual);
          if (anterior == NULL) {
              cola->inicio = nuevo;
          } else {
              establecerSiguienteNodoPrioridad(anterior, nuevo);
          }
          cola->tamano++;
          return 1;
      }`),
  },
  {
    id: '4-F30',
    tipo: 'fallo',
    titulo: 'encolarColaPrioridadLista que no piensa en el primero',
    enunciado: 'Encuentra bien el hueco. Prueba con uno que deba ir delante de todos.',
    ctx: PL,
    casos: [
      { nombre: 'Prioridad 2, en medio', inicial: [pl([30, 10], [1, 3])], llamada: 'encolarColaPrioridadLista(cola, 5, 2)' },
      { nombre: 'Prioridad 0, el primero', inicial: [pl([30, 10], [1, 3])], llamada: 'encolarColaPrioridadLista(cola, 5, 0)' },
    ],
    observar: ['cola'],
    codigo: c(`
      int encolarColaPrioridadLista(ColaPrioridadLista *cola, int x, int prioridad) {
          if (prioridad < 0 || prioridad >= NUM_PRIORIDADES) return 0;
          NodoPrioridad *nuevo = crearNodoPrioridad(x, prioridad);
          NodoPrioridad *anterior = NULL;
          NodoPrioridad *actual = cola->inicio;
          while (actual != NULL && obtenerPrioridadNodoPrioridad(actual) <= prioridad) {
              anterior = actual;
              actual = obtenerSiguienteNodoPrioridad(actual);
          }
          establecerSiguienteNodoPrioridad(nuevo, actual);
          establecerSiguienteNodoPrioridad(anterior, nuevo);
          cola->tamano++;
          return 1;
      }`),
    lineasFallo: [11],
    tiposFallo: ['caso', 'fuga'],
    explicacion: 'Si el nuevo va el primero, `anterior` es NULL y nadie lo engancha: `establecerSiguienteNodoPrioridad` no hace nada con NULL. Hay que cambiar `cola->inicio` en ese caso.',
    solucion: c(`
      int encolarColaPrioridadLista(ColaPrioridadLista *cola, int x, int prioridad) {
          if (prioridad < 0 || prioridad >= NUM_PRIORIDADES) return 0;
          NodoPrioridad *nuevo = crearNodoPrioridad(x, prioridad);
          NodoPrioridad *anterior = NULL;
          NodoPrioridad *actual = cola->inicio;
          while (actual != NULL && obtenerPrioridadNodoPrioridad(actual) <= prioridad) {
              anterior = actual;
              actual = obtenerSiguienteNodoPrioridad(actual);
          }
          establecerSiguienteNodoPrioridad(nuevo, actual);
          if (anterior == NULL) {
              cola->inicio = nuevo;
          } else {
              establecerSiguienteNodoPrioridad(anterior, nuevo);
          }
          cola->tamano++;
          return 1;
      }`),
  },
  {
    id: '4-F31',
    tipo: 'fallo',
    titulo: 'frenteColaPrioridadLista que exige prioridad',
    enunciado: 'Quien solo quiere el valor puede pasar NULL como tercer argumento.',
    ctx: PL,
    casos: [
      { nombre: 'Pidiendo la prioridad', inicial: [pl([30], [1]), entero('x', 0), entero('prioridad', 0)], llamada: 'frenteColaPrioridadLista(cola, &x, &prioridad)' },
      { nombre: 'Con NULL', inicial: [pl([30], [1]), entero('x', 0), entero('prioridad', 0)], llamada: 'frenteColaPrioridadLista(cola, &x, NULL)' },
    ],
    observar: ['cola', 'x', 'prioridad'],
    codigo: c(`
      int frenteColaPrioridadLista(ColaPrioridadLista *cola, int *x, int *prioridad) {
          if (estaVaciaColaPrioridadLista(cola) == 1) return 0;
          *x = obtenerValorNodoPrioridad(cola->inicio);
          *prioridad = obtenerPrioridadNodoPrioridad(cola->inicio);
          return 1;
      }`),
    lineasFallo: [4],
    tiposFallo: ['nulo'],
    explicacion: 'Si `prioridad` es NULL, `*prioridad` escribe en ningún sitio. Hay que comprobarlo antes: `if (prioridad != NULL)`.',
    solucion: c(`
      int frenteColaPrioridadLista(ColaPrioridadLista *cola, int *x, int *prioridad) {
          if (estaVaciaColaPrioridadLista(cola) == 1) return 0;
          *x = obtenerValorNodoPrioridad(cola->inicio);
          if (prioridad != NULL) {
              *prioridad = obtenerPrioridadNodoPrioridad(cola->inicio);
          }
          return 1;
      }`),
  },
  {
    id: '4-F32',
    tipo: 'fallo',
    titulo: 'desencolarColaPrioridadLista que busca al mejor',
    enunciado: 'Alguien ha pensado que el número más alto es la prioridad más alta.',
    ctx: PL,
    casos: [
      { nombre: 'Un solo elemento', inicial: [pl([30], [1]), entero('x', 0)], llamada: 'desencolarColaPrioridadLista(cola, &x)' },
      { nombre: '30 (p0), 10 (p2)', inicial: [pl([30, 10], [0, 2]), entero('x', 0)], llamada: 'desencolarColaPrioridadLista(cola, &x)' },
    ],
    observar: ['cola', 'x'],
    codigo: c(`
      int desencolarColaPrioridadLista(ColaPrioridadLista *cola, int *x) {
          if (estaVaciaColaPrioridadLista(cola) == 1) return 0;
          NodoPrioridad *anterior = NULL;
          NodoPrioridad *aux = cola->inicio;
          while (obtenerSiguienteNodoPrioridad(aux) != NULL) {
              anterior = aux;
              aux = obtenerSiguienteNodoPrioridad(aux);
          }
          *x = obtenerValorNodoPrioridad(aux);
          if (anterior == NULL) {
              cola->inicio = NULL;
          } else {
              establecerSiguienteNodoPrioridad(anterior, NULL);
          }
          cola->tamano--;
          return eliminarNodoPrioridad(aux);
      }`),
    lineasFallo: [5, 6, 7, 8],
    preguntaLinea: '¿Qué línea sobra o está mal?',
    tiposFallo: ['caso'],
    explicacion: 'La prioridad 0 es la más alta y la lista está ordenada: sale siempre el `inicio`. Este código recorre hasta el último, que es justo el de menos prioridad, y además cuesta O(n).',
    solucion: c(`
      int desencolarColaPrioridadLista(ColaPrioridadLista *cola, int *x) {
          if (estaVaciaColaPrioridadLista(cola) == 1) return 0;
          NodoPrioridad *aux = cola->inicio;
          *x = obtenerValorNodoPrioridad(aux);
          cola->inicio = obtenerSiguienteNodoPrioridad(aux);
          cola->tamano--;
          return eliminarNodoPrioridad(aux);
      }`),
  },
  {
    id: '4-M17',
    tipo: 'misterio',
    titulo: 'Cuántos por delante',
    enunciado: 'Predice qué devuelve en cada caso. Después di qué hace.',
    ctx: PL,
    casos: [
      { nombre: '30 (p0), 10 (p1), 40 (p1), 20 (p3), p = 1', inicial: [pl([30, 10, 40, 20], [0, 1, 1, 3])], llamada: 'misterio(cola, 1)' },
      { nombre: '30 (p0), 10 (p1), 40 (p1), 20 (p3), p = 0', inicial: [pl([30, 10, 40, 20], [0, 1, 1, 3])], llamada: 'misterio(cola, 0)' },
      { nombre: '30 (p0), 10 (p1), 40 (p1), 20 (p3), p = 2', inicial: [pl([30, 10, 40, 20], [0, 1, 1, 3])], llamada: 'misterio(cola, 2)' },
    ],
    observar: ['cola'],
    responder: ['devuelve'],
    solucion: c(`
      int misterio(ColaPrioridadLista *cola, int p) {
          int n = 0;
          NodoPrioridad *aux = cola->inicio;
          while (aux != NULL && obtenerPrioridadNodoPrioridad(aux) <= p) {
              n++;
              aux = obtenerSiguienteNodoPrioridad(aux);
          }
          return n;
      }`),
    opciones: ['Cuántos saldrían antes que un elemento nuevo con prioridad `p`.', 'Cuántos tienen exactamente la prioridad `p`.', 'Cuántos tienen menos prioridad que `p`.', 'El tamaño de la cola.'],
    correcta: 0,
    explicacion: 'Es el mismo bucle de `encolarColaPrioridadLista`: cuenta los que el nuevo dejaría delante, incluidos los de su misma prioridad. Los números más bajos son los que salen antes.',
  },
  {
    id: '4-M18',
    tipo: 'misterio',
    titulo: 'Los primeros de la fila',
    enunciado: 'Predice qué devuelve y cómo queda la cola (en el orden en que saldrán) en cada caso. Después di qué hace.',
    ctx: PL,
    casos: [
      { nombre: '3 (p1), 4 (p1), 5 (p2)', inicial: [pl([3, 4, 5], [1, 1, 2])], llamada: 'misterio(cola)' },
      { nombre: '3 (p0), 4 (p1), 5 (p1)', inicial: [pl([3, 4, 5], [0, 1, 1])], llamada: 'misterio(cola)' },
      { nombre: 'Vacía', inicial: [pl([])], llamada: 'misterio(cola)' },
    ],
    observar: ['cola'],
    responder: ['devuelve', 'cola'],
    solucion: c(`
      int misterio(ColaPrioridadLista *cola) {
          int x = 0;
          int p = 0;
          int q = 0;
          int s = 0;
          if (frenteColaPrioridadLista(cola, &x, &p) == 0) return 0;
          q = p;
          while (frenteColaPrioridadLista(cola, &x, &q) == 1 && q == p) {
              desencolarColaPrioridadLista(cola, &x);
              s += x;
          }
          return s;
      }`),
    opciones: ['Saca todos los de la prioridad más alta que haya y devuelve su suma.', 'Saca el primero y devuelve su valor.', 'Vacía la cola y devuelve la suma de todos.', 'Devuelve la suma de los de prioridad 0, sin sacarlos.'],
    correcta: 0,
    explicacion: 'Mira la prioridad del primero y va sacando mientras el nuevo primero tenga esa misma. No tiene por qué ser la 0: es la más alta de las que hay.',
  },
];

const PRIORIDAD_ARRAY: EjCodigo[] = [
  {
    id: '4-36',
    tipo: 'programar',
    titulo: 'Encolar el 7 con prioridad 2, a mano',
    enunciado: 'Mete el **7** con prioridad 2 sin llamar a `encolarColaPrioridadArray`: encólalo directamente en la cola de esa prioridad. El `tamano` de fuera también cuenta.',
    pistas: ['La cola de la prioridad 2 es `cola->colas[2]`, y es una `ColaEnlazada` normal.'],
    alResolver: 'Son dos contadores: el de cada `ColaEnlazada` y el total. `encolarColaEnlazada` solo actualiza el suyo.',
    ctx: PA,
    casos: [{ nombre: '30 (p0), 10 (p2)', inicial: [pa([30, 10], [0, 2])] }],
    observar: ['cola'],
    prohibidos: ['encolarColaPrioridadArray()'],
    solucion: c(`
      encolarColaEnlazada(cola->colas[2], 7);
      cola->tamano++;`),
  },
  {
    id: '4-37',
    tipo: 'programar',
    titulo: 'Sacar de una prioridad concreta',
    enunciado: 'Saca a `x` el primero de la prioridad 1, aunque haya alguien en la 0. Sin llamar a `desencolarColaPrioridadArray`.',
    ctx: PA,
    casos: [{ nombre: '30 (p0), 10 (p1), 40 (p1)', inicial: [pa([30, 10, 40], [0, 1, 1]), entero('x', 0)] }],
    observar: ['cola', 'x'],
    prohibidos: ['desencolarColaPrioridadArray()'],
    solucion: c(`
      desencolarColaEnlazada(cola->colas[1], &x);
      cola->tamano--;`),
  },
  {
    id: '4-38',
    tipo: 'programar',
    titulo: 'Subir uno de prioridad',
    enunciado: 'Pasa el primero de la prioridad 3 al final de la prioridad 0. ¿Cambia el `tamano` total?',
    alResolver: 'No cambia: el elemento se mueve de una cola a otra, pero sigue dentro.',
    ctx: PA,
    casos: [{ nombre: '30 (p0), 20 (p3)', inicial: [pa([30, 20], [0, 3])] }],
    observar: ['cola'],
    prohibidos: ['encolarColaPrioridadArray()', 'desencolarColaPrioridadArray()'],
    codigoInicial: 'int aux = 0;\n',
    solucion: c(`
      int aux = 0;
      desencolarColaEnlazada(cola->colas[3], &aux);
      encolarColaEnlazada(cola->colas[0], aux);`),
  },
  {
    id: '4-48',
    tipo: 'programar',
    titulo: 'Escribe encolarColaPrioridadArray',
    enunciado: 'Completa `encolarColaPrioridadArray`: mete `x` en la cola de su prioridad y devuelve 1. Si la prioridad no está entre 0 y `NUM_PRIORIDADES - 1`, devuelve 0 sin tocar nada.',
    ctx: PA,
    casos: [
      { nombre: 'Prioridad 1, ya hay uno', inicial: [pa([30, 10], [0, 1])], llamada: 'encolarColaPrioridadArray(cola, 5, 1)' },
      { nombre: 'Prioridad 3, vacía', inicial: [pa([30], [0])], llamada: 'encolarColaPrioridadArray(cola, 5, 3)' },
      { nombre: 'Prioridad 4, no existe', inicial: [pa([30], [0])], llamada: 'encolarColaPrioridadArray(cola, 5, 4)' },
      { nombre: 'Prioridad -1, no existe', inicial: [pa([30], [0])], llamada: 'encolarColaPrioridadArray(cola, 5, -1)' },
    ],
    observar: ['cola'],
    codigoInicial: c(`
      int encolarColaPrioridadArray(ColaPrioridadArray *cola, int x, int prioridad) {

      }`),
    solucion: c(`
      int encolarColaPrioridadArray(ColaPrioridadArray *cola, int x, int prioridad) {
          if (prioridad < 0 || prioridad >= NUM_PRIORIDADES) return 0;
          if (encolarColaEnlazada(cola->colas[prioridad], x) == 0) return 0;
          cola->tamano++;
          return 1;
      }`),
  },
  {
    id: '4-49',
    tipo: 'programar',
    titulo: 'Escribe desencolarColaPrioridadArray',
    enunciado: 'Completa `desencolarColaPrioridadArray`: saca a `*x` el primero de la prioridad más alta que tenga elementos y devuelve 1. Si no hay nadie, devuelve 0.',
    pistas: ['Recorre las colas desde la 0 y para en la primera que no esté vacía.'],
    ctx: PA,
    casos: [
      { nombre: '30 (p0), 10 (p1)', inicial: [pa([30, 10], [0, 1]), entero('x', 0)], llamada: 'desencolarColaPrioridadArray(cola, &x)' },
      { nombre: '10 (p2), 40 (p3)', inicial: [pa([10, 40], [2, 3]), entero('x', 0)], llamada: 'desencolarColaPrioridadArray(cola, &x)' },
      { nombre: 'Vacía', inicial: [pa([]), entero('x', 5)], llamada: 'desencolarColaPrioridadArray(cola, &x)' },
    ],
    observar: ['cola', 'x'],
    codigoInicial: c(`
      int desencolarColaPrioridadArray(ColaPrioridadArray *cola, int *x) {

      }`),
    solucion: c(`
      int desencolarColaPrioridadArray(ColaPrioridadArray *cola, int *x) {
          for (int i = 0; i < NUM_PRIORIDADES; i++) {
              if (estaVaciaColaEnlazada(cola->colas[i]) == 0) {
                  desencolarColaEnlazada(cola->colas[i], x);
                  cola->tamano--;
                  return 1;
              }
          }
          return 0;
      }`),
  },
  {
    id: '4-50',
    tipo: 'programar',
    titulo: 'Escribe mejorPrioridadArray',
    enunciado: 'Completa `mejorPrioridadArray`: devuelve la prioridad del que saldría primero, o -1 si la cola está vacía, sin cambiarla.',
    ctx: PA,
    casos: [
      { nombre: '30 (p0), 10 (p1)', inicial: [pa([30, 10], [0, 1])], llamada: 'mejorPrioridadArray(cola)' },
      { nombre: '40 (p3)', inicial: [pa([40], [3])], llamada: 'mejorPrioridadArray(cola)' },
      { nombre: 'Vacía', inicial: [pa([])], llamada: 'mejorPrioridadArray(cola)' },
    ],
    observar: ['cola'],
    codigoInicial: c(`
      int mejorPrioridadArray(ColaPrioridadArray *cola) {

      }`),
    solucion: c(`
      int mejorPrioridadArray(ColaPrioridadArray *cola) {
          for (int i = 0; i < NUM_PRIORIDADES; i++) {
              if (estaVaciaColaEnlazada(cola->colas[i]) == 0) return i;
          }
          return -1;
      }`),
  },
  {
    id: '4-F33',
    tipo: 'fallo',
    titulo: 'desencolarColaPrioridadArray que no descuenta',
    enunciado: 'Sale el que tiene que salir. Compara el `tamano` de fuera con lo que queda dentro.',
    ctx: PA,
    casos: [
      { nombre: 'Vacía', inicial: [pa([]), entero('x', 0)], llamada: 'desencolarColaPrioridadArray(cola, &x)' },
      { nombre: '30 (p0), 10 (p1)', inicial: [pa([30, 10], [0, 1]), entero('x', 0)], llamada: 'desencolarColaPrioridadArray(cola, &x)' },
    ],
    observar: ['cola', 'x'],
    codigo: c(`
      int desencolarColaPrioridadArray(ColaPrioridadArray *cola, int *x) {
          if (estaVaciaColaPrioridadArray(cola) == 1) return 0;
          for (int i = 0; i < NUM_PRIORIDADES; i++) {
              if (estaVaciaColaEnlazada(cola->colas[i]) == 0) {
                  desencolarColaEnlazada(cola->colas[i], x);
                  return 1;
              }
          }
          return 0;
      }`),
    lineasFallo: [5, 6],
    preguntaLinea: 'Falta una línea. ¿Dónde iría?',
    tiposFallo: ['caso'],
    explicacion: 'Falta `cola->tamano--`. `desencolarColaEnlazada` solo descuenta en su cola; el total lo lleva la cola de prioridad. Y como `estaVaciaColaPrioridadArray` mira ese total, la cola nunca volvería a estar vacía.',
    solucion: c(`
      int desencolarColaPrioridadArray(ColaPrioridadArray *cola, int *x) {
          if (estaVaciaColaPrioridadArray(cola) == 1) return 0;
          for (int i = 0; i < NUM_PRIORIDADES; i++) {
              if (estaVaciaColaEnlazada(cola->colas[i]) == 0) {
                  desencolarColaEnlazada(cola->colas[i], x);
                  cola->tamano--;
                  return 1;
              }
          }
          return 0;
      }`),
  },
  {
    id: '4-F34',
    tipo: 'fallo',
    titulo: 'encolarColaPrioridadArray que se fía',
    enunciado: 'Con una prioridad válida funciona bien.',
    ctx: PA,
    casos: [
      { nombre: 'Prioridad 1', inicial: [pa([30], [0])], llamada: 'encolarColaPrioridadArray(cola, 5, 1)' },
      { nombre: 'Prioridad 4', inicial: [pa([30], [0])], llamada: 'encolarColaPrioridadArray(cola, 5, 4)' },
    ],
    observar: ['cola'],
    codigo: c(`
      int encolarColaPrioridadArray(ColaPrioridadArray *cola, int x, int prioridad) {
          if (cola == NULL) return 0;
          if (encolarColaEnlazada(cola->colas[prioridad], x) == 0) return 0;
          cola->tamano++;
          return 1;
      }`),
    lineasFallo: [2, 3],
    tiposFallo: ['array'],
    explicacion: 'La prioridad es el índice del array: si vale 4 o más, `cola->colas[prioridad]` se sale. Hay que rechazarla antes de usarla.',
    solucion: c(`
      int encolarColaPrioridadArray(ColaPrioridadArray *cola, int x, int prioridad) {
          if (cola == NULL) return 0;
          if (prioridad < 0 || prioridad >= NUM_PRIORIDADES) return 0;
          if (encolarColaEnlazada(cola->colas[prioridad], x) == 0) return 0;
          cola->tamano++;
          return 1;
      }`),
  },
  {
    id: '4-F35',
    tipo: 'fallo',
    titulo: 'desencolarColaPrioridadArray del revés',
    enunciado: 'Si solo hay una prioridad con elementos, nadie nota nada.',
    ctx: PA,
    casos: [
      { nombre: '30 (p1), 10 (p1)', inicial: [pa([30, 10], [1, 1]), entero('x', 0)], llamada: 'desencolarColaPrioridadArray(cola, &x)' },
      { nombre: '30 (p0), 10 (p2)', inicial: [pa([30, 10], [0, 2]), entero('x', 0)], llamada: 'desencolarColaPrioridadArray(cola, &x)' },
    ],
    observar: ['cola', 'x'],
    codigo: c(`
      int desencolarColaPrioridadArray(ColaPrioridadArray *cola, int *x) {
          if (estaVaciaColaPrioridadArray(cola) == 1) return 0;
          for (int i = NUM_PRIORIDADES - 1; i >= 0; i--) {
              if (estaVaciaColaEnlazada(cola->colas[i]) == 0) {
                  desencolarColaEnlazada(cola->colas[i], x);
                  cola->tamano--;
                  return 1;
              }
          }
          return 0;
      }`),
    lineasFallo: [3],
    tiposFallo: ['caso'],
    explicacion: 'La prioridad más alta es la 0, así que hay que buscar desde la 0 hacia arriba. Aquí sale siempre el menos urgente.',
    solucion: c(`
      int desencolarColaPrioridadArray(ColaPrioridadArray *cola, int *x) {
          if (estaVaciaColaPrioridadArray(cola) == 1) return 0;
          for (int i = 0; i < NUM_PRIORIDADES; i++) {
              if (estaVaciaColaEnlazada(cola->colas[i]) == 0) {
                  desencolarColaEnlazada(cola->colas[i], x);
                  cola->tamano--;
                  return 1;
              }
          }
          return 0;
      }`),
  },
  {
    id: '4-F36',
    tipo: 'fallo',
    titulo: 'vaciarColaPrioridadArray que olvida el total',
    enunciado: 'Todas las colas quedan vacías. ¿Y la de fuera?',
    ctx: PA,
    casos: [
      { nombre: 'Vacía', inicial: [pa([])], llamada: 'vaciarColaPrioridadArray(cola)' },
      { nombre: '30 (p0), 10 (p2)', inicial: [pa([30, 10], [0, 2])], llamada: 'vaciarColaPrioridadArray(cola)' },
    ],
    observar: ['cola'],
    codigo: c(`
      int vaciarColaPrioridadArray(ColaPrioridadArray *cola) {
          if (cola == NULL) return 0;
          for (int i = 0; i < NUM_PRIORIDADES; i++) {
              vaciarColaEnlazada(cola->colas[i]);
          }
          return 1;
      }`),
    lineasFallo: [5, 6],
    preguntaLinea: 'Falta una línea. ¿Dónde iría?',
    tiposFallo: ['caso'],
    explicacion: 'Falta `cola->tamano = 0`. Las colas de dentro se vacían, pero el total sigue diciendo que hay elementos.',
    solucion: c(`
      int vaciarColaPrioridadArray(ColaPrioridadArray *cola) {
          if (cola == NULL) return 0;
          for (int i = 0; i < NUM_PRIORIDADES; i++) {
              vaciarColaEnlazada(cola->colas[i]);
          }
          cola->tamano = 0;
          return 1;
      }`),
  },
  {
    id: '4-M19',
    tipo: 'misterio',
    titulo: 'La fila más larga',
    enunciado: 'Predice qué devuelve en cada caso. Después di qué hace.',
    ctx: PA,
    casos: [
      { nombre: 'p0: 1 elemento, p2: 2 elementos', inicial: [pa([30, 10, 40], [0, 2, 2])], llamada: 'misterio(cola)' },
      { nombre: 'p1: 1 elemento, p3: 1 elemento', inicial: [pa([30, 10], [1, 3])], llamada: 'misterio(cola)' },
      { nombre: 'Vacía', inicial: [pa([])], llamada: 'misterio(cola)' },
    ],
    observar: ['cola'],
    responder: ['devuelve'],
    solucion: c(`
      int misterio(ColaPrioridadArray *cola) {
          int m = 0;
          for (int i = 1; i < NUM_PRIORIDADES; i++) {
              if (tamanoColaEnlazada(cola->colas[i]) > tamanoColaEnlazada(cola->colas[m])) m = i;
          }
          return m;
      }`),
    opciones: ['La prioridad con más elementos; si empatan, la más alta (el número menor).', 'La prioridad con más elementos; si empatan, la más baja (el número mayor).', 'La prioridad del que saldría primero.', 'Cuántos elementos tiene la cola más larga.'],
    correcta: 0,
    explicacion: 'Es buscar un máximo en un array, donde el dato de cada casilla es el tamaño de su cola. Con `>` estricto, en un empate se queda la primera que encontró. Vacía devuelve 0, que no significa que haya alguien en esa prioridad.',
  },
  {
    id: '4-M20',
    tipo: 'misterio',
    titulo: 'Todos a la primera',
    enunciado: 'Predice cómo queda la cola (en el orden en que saldrán) en cada caso y después di qué hace.',
    ctx: PA,
    casos: [
      { nombre: '30 (p0), 10 (p1), 20 (p3)', inicial: [pa([30, 10, 20], [0, 1, 3])], llamada: 'misterio(cola)' },
      { nombre: '5 (p1), 6 (p1), 7 (p2)', inicial: [pa([5, 6, 7], [1, 1, 2])], llamada: 'misterio(cola)' },
      { nombre: '9 (p0)', inicial: [pa([9], [0])], llamada: 'misterio(cola)' },
    ],
    observar: ['cola'],
    responder: ['cola'],
    solucion: c(`
      void misterio(ColaPrioridadArray *cola) {
          int x = 0;
          for (int i = NUM_PRIORIDADES - 1; i > 0; i--) {
              while (desencolarColaEnlazada(cola->colas[i], &x) == 1) {
                  encolarColaEnlazada(cola->colas[0], x);
              }
          }
      }`),
    opciones: ['Pasa todos a la prioridad 0, empezando por los de menos prioridad.', 'Pasa todos a la prioridad 0, sin cambiar el orden de salida.', 'Pasa todos a la última prioridad.', 'Da la vuelta a cada cola.'],
    correcta: 0,
    explicacion: 'El bucle va de la prioridad 3 a la 1 y vuelca cada cola al final de la 0. Los menos urgentes llegan antes, así que ahora salen antes que los que tenían mejor prioridad. El `tamano` total no cambia.',
  },
];

export const EJERCICIOS_BICOLAS_PRIORIDAD: EjCodigo[] = [
  ...deLaEstructura('Bicola array', BICOLA_ARRAY),
  ...deLaEstructura('Bicola enlazada', BICOLA_ENLAZADA),
  ...deLaEstructura('Prioridad enlazada', PRIORIDAD_LISTA),
  ...deLaEstructura('Prioridad array', PRIORIDAD_ARRAY),
];
