// Topic 7: sorting and searching. The trace exercises are simulated (traza.ts) with the code
// of the deck; the code ones run on plain int arrays (CTX_VECTOR), with the same functions
// as ordenacion.c: intercambiar is always there, and particion where the exercise needs it.

import { Contexto } from '../memoria/modelo';
import { CTX_VECTOR, entero, vector } from '../memoria/construir';
import { c } from './sangrado';
import { Caso, EjCodigo, EjTraza, Tema } from './tipos';

const V = CTX_VECTOR;

/** With particion of the deck too, for the exercises on rapidaRec. */
const V_PARTICION: Contexto = {
  ...CTX_VECTOR,
  preludio:
    CTX_VECTOR.preludio +
    `

int particion(int v[], int ini, int fin) {
  int pivote = v[fin];
  int i = ini - 1;
  for (int j = ini; j < fin; j++)
    if (v[j] <= pivote) intercambiar(&v[++i], &v[j]);
  intercambiar(&v[i + 1], &v[fin]);
  return i + 1;
}`,
};

/** A case on v and n: «v = 5 2 8 1 4». */
const caso = (datos: number[], llamada: string, nombre = `v = ${datos.join(' ')}`): Caso => ({
  nombre,
  inicial: [vector('v', datos), entero('n', datos.length)],
  llamada,
});

/** The cases every sorting function is tried on. */
const casosOrdenar = (fn: string): Caso[] => [
  caso([5, 2, 8, 1, 4], `${fn}(v, n)`),
  caso([9, 7, 5, 3], `${fn}(v, n)`, 'Al revés: v = 9 7 5 3'),
  caso([4, 1, 4, 2, 1], `${fn}(v, n)`, 'Con repetidos: v = 4 1 4 2 1'),
  caso([7], `${fn}(v, n)`, 'Un solo elemento: v = 7'),
];

const ORDENADO = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];

// ------------------------------------------------------------------ traces

const TRAZAS: EjTraza[] = [
  {
    id: '7-01',
    tipo: 'traza',
    titulo: 'Selection sort a mano',
    estructura: 'Selección',
    enunciado: 'El array de los dibujos de clase. Haz la traza de `ordSeleccion` y escribe cómo queda después de cada pasada. Luego cuenta lo que ha hecho.',
    pistas: ['En cada pasada, busca el mínimo desde `i` hasta el final y cámbialo con `v[i]`.', 'Si el mínimo ya está en `i`, se llama igual a `intercambiar`: cambia la casilla consigo misma y no se nota.'],
    alg: 'seleccion',
    datos: [5, 2, 8, 1, 4],
    cuentas: true,
    explicacion:
      'Cada pasada deja uno más en su sitio definitivo, por la izquierda. En la segunda y en la cuarta el mínimo ya estaba en su sitio, y aun así se cuenta el intercambio. Las comparaciones no dependen de los datos: 4 + 3 + 2 + 1 = 10, siempre n(n − 1)/2.',
  },
  {
    id: '7-02',
    tipo: 'traza',
    titulo: 'Selection sort con seis',
    estructura: 'Selección',
    enunciado: 'Haz la traza de `ordSeleccion` sobre este array de seis y escribe cómo queda después de cada pasada.',
    alg: 'seleccion',
    datos: [29, 10, 14, 37, 13, 5],
    explicacion:
      'El 5 va delante en la primera pasada y el 29 sale disparado hasta donde estaba el 5: selection sort no respeta el orden de los iguales porque los intercambios saltan por encima de otros. Por eso no es estable.',
  },
  {
    id: '7-03',
    tipo: 'traza',
    titulo: 'Insertion sort a mano',
    estructura: 'Inserción',
    enunciado: 'El array de clase con `ordInsercion`. Escribe cómo queda después de cada vuelta del `for` y luego cuenta las comparaciones y los desplazamientos.',
    pistas: ['En la vuelta `i` se coge `x = v[i]` y se corren a la derecha los mayores que él de la parte ordenada.', 'Una comparación es cada `v[j] > x` que se evalúa, también la que sale falsa y para el bucle.'],
    alg: 'insercion',
    datos: [5, 2, 8, 1, 4],
    cuentas: true,
    explicacion:
      'Lo de la izquierda está siempre ordenado entre sí, pero no es definitivo: el 1 llega en la tercera vuelta y empuja a todos. Cuando `x` es mayor que todos los de su izquierda, como el 8, solo hace una comparación y no desplaza nada.',
  },
  {
    id: '7-04',
    tipo: 'traza',
    titulo: 'Insertion sort con seis',
    estructura: 'Inserción',
    enunciado: 'Haz la traza de `ordInsercion` y escribe cómo queda el array después de cada vuelta del `for`.',
    alg: 'insercion',
    datos: [3, 7, 4, 9, 5, 2],
    explicacion: 'El 2 del final es el peor: tiene que recorrer toda la parte ordenada, cinco desplazamientos, para llegar a la casilla 0.',
  },
  {
    id: '7-05',
    tipo: 'traza',
    titulo: 'Bubble sort a mano',
    estructura: 'Burbuja',
    enunciado: 'El array de clase con `ordBurbuja`. Escribe cómo queda después de cada pasada del `do-while` y luego cuenta lo que ha hecho.',
    pistas: ['En cada pasada se comparan los vecinos `v[j]` y `v[j+1]` de izquierda a derecha, y el mayor sube hasta el final.', 'El bucle para cuando una pasada entera no cambia nada: esa pasada también se hace, y también va en la tabla.'],
    alg: 'burbuja',
    datos: [5, 2, 8, 1, 4],
    cuentas: true,
    explicacion:
      'Tras la tercera pasada ya está ordenado, pero el algoritmo no lo sabe hasta que hace una pasada sin cambios: la cuarta. Cada pasada mira un vecino menos, 4 + 3 + 2 + 1 = 10 comparaciones.',
  },
  {
    id: '7-06',
    tipo: 'traza',
    titulo: 'Bubble sort casi ordenado',
    estructura: 'Burbuja',
    enunciado: 'Ahora el array viene casi ordenado. Haz la traza de `ordBurbuja`: ¿cuántas pasadas hace? Luego cuenta.',
    alg: 'burbuja',
    datos: [1, 2, 5, 3, 4, 6],
    cuentas: true,
    explicacion:
      'Con la variable `cambio`, burbuja se para en cuanto una pasada no mueve nada: dos pasadas y 5 + 4 = 9 comparaciones, en lugar de las 15 del peor caso. Si el array ya viene ordenado, una sola pasada: O(n).',
  },
  {
    id: '7-07',
    tipo: 'traza',
    titulo: 'Merge sort a mano',
    estructura: 'Mezcla',
    enunciado: 'Haz la traza de `mezclaRec(v, aux, 0, 6)`. Escribe cómo queda `v` después de cada llamada a `fusionar`, en el orden en que se hacen.',
    pistas: ['Las llamadas se hacen primero por la mitad izquierda, hasta el fondo; `fusionar` solo se llama al volver.', 'Con siete, la mitad izquierda es 0..3 y la derecha 4..6: `medio = ini + (fin - ini) / 2`.'],
    alg: 'mezcla',
    datos: [38, 27, 43, 3, 9, 82, 10],
    explicacion:
      'Las primeras fusiones son de tramos de dos, después de cuatro y la última junta las dos mitades ya ordenadas. Fíjate en que `fusionar(4, 4, 5)` no cambia nada: 9 y 82 ya estaban en orden, pero se fusionan igual.',
  },
  {
    id: '7-08',
    tipo: 'traza',
    titulo: 'Merge sort con ocho',
    estructura: 'Mezcla',
    enunciado: 'Haz la traza de `mezclaRec` con ocho, una potencia de dos, y escribe `v` después de cada `fusionar`. Luego cuenta las comparaciones y las copias a `aux`.',
    pistas: ['Cada `fusionar(ini, medio, fin)` copia a aux `fin - ini + 1` datos: todos los del tramo.', 'Una comparación es cada `v[i] <= v[j]` del primer while.'],
    alg: 'mezcla',
    datos: [5, 2, 4, 6, 1, 3, 2, 6],
    cuentas: true,
    explicacion:
      'Con ocho hay tres niveles (log₂ 8) y en cada nivel se copian los ocho datos a aux: 3 · 8 = 24 copias. Esa es la cuenta n log n de merge sort, y no depende de cómo vengan los datos.',
  },
  {
    id: '7-09',
    tipo: 'traza',
    titulo: 'Quicksort a mano',
    estructura: 'Quicksort',
    enunciado: 'El array de clase con `rapidaRec`. Escribe cómo queda después de cada `particion` (el pivote es el último del tramo) y luego cuenta.',
    pistas: ['En `particion`, `i` marca el último de los que ya son menores o iguales que el pivote; cada vez que `v[j] <= pivote` se avanza `i` y se intercambia.', 'Al final, el pivote se cambia con `v[i + 1]`: ahí queda definitivo.'],
    alg: 'rapida',
    datos: [5, 2, 8, 1, 4],
    cuentas: true,
    explicacion:
      'La primera partición deja el 4 en su sitio definitivo (la casilla 2), con los menores a la izquierda y los mayores a la derecha. Luego cada lado se ordena solo. Hay intercambios de una casilla consigo misma, y cuentan.',
  },
  {
    id: '7-10',
    tipo: 'traza',
    titulo: 'Quicksort con siete',
    estructura: 'Quicksort',
    enunciado: 'Haz la traza de `rapidaRec` y escribe cómo queda el array después de cada `particion`.',
    alg: 'rapida',
    datos: [10, 80, 30, 90, 40, 50, 70],
    explicacion:
      'El 70 parte bien la primera vez, pero el lado izquierdo, 10 30 40 50, ya está ordenado: el pivote es siempre el mayor y cada partición solo quita uno. Ese es el peor caso de quicksort con el último como pivote.',
  },
  {
    id: '7-11',
    tipo: 'traza',
    titulo: 'Búsqueda binaria que encuentra',
    estructura: 'Búsqueda binaria',
    enunciado: 'Busca el 23 con `busquedaBinaria`. Escribe `ini`, `fin` y `med` de cada vuelta, y lo que devuelve.',
    pistas: ['`med = ini + (fin - ini) / 2`, con división entera.', 'Si `v[med] < x`, se descarta la mitad izquierda con el med: `ini = med + 1`.'],
    alg: 'binaria',
    datos: ORDENADO,
    x: 23,
    explicacion: 'Tres vueltas para diez datos: en cada una se tira la mitad. Devuelve la posición, 5, no el valor.',
  },
  {
    id: '7-12',
    tipo: 'traza',
    titulo: 'Búsqueda binaria que no encuentra',
    estructura: 'Búsqueda binaria',
    enunciado: 'Ahora busca el 40, que no está. Escribe `ini`, `fin` y `med` de cada vuelta, y lo que devuelve.',
    alg: 'binaria',
    datos: ORDENADO,
    x: 40,
    explicacion:
      'En la última vuelta `ini` y `fin` valen 6: queda un solo candidato, el 38. Como 38 < 40, `ini` pasa a 7, ya mayor que `fin`, y el while termina: devuelve -1. Cuatro vueltas, ⌊log₂ 10⌋ + 1.',
  },
  {
    id: '7-13',
    tipo: 'traza',
    titulo: 'Insertion sort en su mejor caso',
    estructura: 'Inserción',
    enunciado: 'El array ya viene ordenado. Haz la traza de `ordInsercion` y cuenta cuánto trabaja.',
    alg: 'insercion',
    datos: [1, 3, 5, 7, 9],
    cuentas: true,
    explicacion: 'Cada `x` es mayor que el de su izquierda: una comparación por vuelta y ningún desplazamiento. n − 1 comparaciones, O(n). Por eso inserción va tan bien con datos casi ordenados.',
  },
  {
    id: '7-14',
    tipo: 'traza',
    titulo: 'Quicksort en su peor caso',
    estructura: 'Quicksort',
    enunciado: 'El array ya viene ordenado y el pivote es el último. Haz la traza de `rapidaRec` y cuenta.',
    alg: 'rapida',
    datos: [1, 2, 3, 4, 5],
    cuentas: true,
    explicacion:
      'El pivote es siempre el mayor del tramo: cada partición deja un lado vacío y el otro con uno menos. 4 + 3 + 2 + 1 = 10 comparaciones, O(n²), y todos los intercambios son de una casilla consigo misma. Con un pivote al azar o la mediana de tres no pasaría.',
  },
];

// ------------------------------------------------------------------ write the function

const ESCRIBIR: EjCodigo[] = [
  {
    id: '7-15',
    tipo: 'programar',
    titulo: 'Escribe posMinimo',
    estructura: 'Selección',
    enunciado: 'Escribe `posMinimo`, que devuelve la **posición** del menor de `v[desde]`, ..., `v[n-1]`. Si hay empates, la del primero. Es el bucle de dentro de selection sort.',
    pistas: ['Empieza suponiendo que el mínimo está en `desde`.', 'Compara con `<`, no con `<=`: así, en un empate, te quedas con el primero.'],
    ctx: V,
    casos: [
      caso([5, 2, 8, 1, 4], 'posMinimo(v, 0, n)', 'v = 5 2 8 1 4, desde 0'),
      caso([5, 2, 8, 1, 4], 'posMinimo(v, 4, n)', 'v = 5 2 8 1 4, desde 4'),
      caso([3, 3, 1, 1], 'posMinimo(v, 0, n)', 'Empate: v = 3 3 1 1, desde 0'),
    ],
    observar: ['v'],
    codigoInicial: c(`
      int posMinimo(int v[], int desde, int n) {

      }`),
    solucion: c(`
      int posMinimo(int v[], int desde, int n) {
          int min = desde;
          for (int j = desde + 1; j < n; j++)
              if (v[j] < v[min]) min = j;
          return min;
      }`),
  },
  {
    id: '7-16',
    tipo: 'programar',
    titulo: 'Escribe estaOrdenado',
    estructura: 'Arrays',
    enunciado: 'Escribe `estaOrdenado`, que devuelve 1 si `v` está ordenado de menor a mayor (los iguales seguidos valen) y 0 si no.',
    pistas: ['Basta con mirar cada pareja de vecinos: `v[i]` y `v[i + 1]`.', 'Cuidado con el último: `v[i + 1]` tiene que existir.'],
    ctx: V,
    casos: [
      caso([1, 3, 3, 7], 'estaOrdenado(v, n)', 'Ordenado: v = 1 3 3 7'),
      caso([1, 3, 7, 4], 'estaOrdenado(v, n)', 'Falla al final: v = 1 3 7 4'),
      caso([6, 2, 3], 'estaOrdenado(v, n)', 'Falla al principio: v = 6 2 3'),
      caso([5], 'estaOrdenado(v, n)', 'Uno solo: v = 5'),
    ],
    observar: ['v'],
    codigoInicial: c(`
      int estaOrdenado(int v[], int n) {

      }`),
    solucion: c(`
      int estaOrdenado(int v[], int n) {
          for (int i = 0; i < n - 1; i++)
              if (v[i] > v[i + 1]) return 0;
          return 1;
      }`),
  },
  {
    id: '7-17',
    tipo: 'programar',
    titulo: 'Escribe ordSeleccion',
    estructura: 'Selección',
    enunciado: 'Escribe selection sort: en cada pasada, busca el menor de lo que queda y ponlo delante con `intercambiar(&v[i], &v[min])`.',
    pistas: ['Dos bucles: el de fuera dice qué casilla se rellena; el de dentro busca el mínimo desde ahí.', 'El de fuera puede acabar en `n - 2`: cuando queda uno, ya está en su sitio.'],
    ctx: V,
    casos: casosOrdenar('ordSeleccion'),
    observar: ['v'],
    codigoInicial: c(`
      void ordSeleccion(int v[], int n) {

      }`),
    solucion: c(`
      void ordSeleccion(int v[], int n) {
          for (int i = 0; i < n - 1; i++) {
              int min = i;
              for (int j = i + 1; j < n; j++)
                  if (v[j] < v[min]) min = j;
              intercambiar(&v[i], &v[min]);
          }
      }`),
  },
  {
    id: '7-18',
    tipo: 'programar',
    titulo: 'Escribe ordInsercion',
    estructura: 'Inserción',
    enunciado: 'Escribe insertion sort: coge `x = v[i]` y corre a la derecha los mayores que él de la parte ya ordenada, hasta dejarle hueco.',
    pistas: ['El while necesita dos condiciones: que `j` no se salga por la izquierda y que `v[j] > x`. El orden importa.', 'Al salir del while, el hueco es `v[j + 1]`.'],
    ctx: V,
    casos: casosOrdenar('ordInsercion'),
    observar: ['v'],
    codigoInicial: c(`
      void ordInsercion(int v[], int n) {

      }`),
    solucion: c(`
      void ordInsercion(int v[], int n) {
          for (int i = 1; i < n; i++) {
              int x = v[i];
              int j = i - 1;
              while (j >= 0 && v[j] > x) {
                  v[j + 1] = v[j];
                  j--;
              }
              v[j + 1] = x;
          }
      }`),
  },
  {
    id: '7-19',
    tipo: 'programar',
    titulo: 'Escribe ordBurbuja',
    estructura: 'Burbuja',
    enunciado: 'Escribe bubble sort con parada: pasadas comparando vecinos e intercambiando los que están al revés, hasta que una pasada no cambie nada.',
    pistas: ['Una variable `cambio` que se pone a 0 al empezar cada pasada y a 1 si se intercambia algo.', 'Tras la pasada `i`, los `i + 1` últimos ya están en su sitio: la siguiente puede mirar uno menos.'],
    ctx: V,
    casos: casosOrdenar('ordBurbuja'),
    observar: ['v'],
    codigoInicial: c(`
      void ordBurbuja(int v[], int n) {

      }`),
    solucion: c(`
      void ordBurbuja(int v[], int n) {
          int i = 0, cambio;
          do {
              cambio = 0;
              for (int j = 0; j < n - 1 - i; j++)
                  if (v[j] > v[j + 1]) { intercambiar(&v[j], &v[j + 1]); cambio = 1; }
              i++;
          } while (cambio);
      }`),
  },
  {
    id: '7-20',
    tipo: 'programar',
    titulo: 'Escribe busquedaBinaria',
    estructura: 'Búsqueda binaria',
    enunciado: 'Escribe la búsqueda binaria sobre `v`, que está ordenado: devuelve la posición de `x`, o -1 si no está.',
    pistas: ['`ini` y `fin` acotan dónde puede estar todavía. Mientras `ini <= fin`, queda algo donde buscar.', 'Al descartar una mitad, descarta también `med`: `ini = med + 1` o `fin = med - 1`.'],
    ctx: V,
    casos: [
      caso(ORDENADO, 'busquedaBinaria(v, n, 23)', 'Busca el 23'),
      caso(ORDENADO, 'busquedaBinaria(v, n, 2)', 'Busca el primero, 2'),
      caso(ORDENADO, 'busquedaBinaria(v, n, 91)', 'Busca el último, 91'),
      caso(ORDENADO, 'busquedaBinaria(v, n, 40)', 'Busca el 40, que no está'),
      caso([7], 'busquedaBinaria(v, n, 3)', 'v = 7, busca el 3'),
    ],
    observar: ['v'],
    codigoInicial: c(`
      int busquedaBinaria(int v[], int n, int x) {

      }`),
    solucion: c(`
      int busquedaBinaria(int v[], int n, int x) {
          int ini = 0, fin = n - 1;
          while (ini <= fin) {
              int med = ini + (fin - ini) / 2;
              if (v[med] == x) return med;
              if (v[med] < x) ini = med + 1;
              else fin = med - 1;
          }
          return -1;
      }`),
  },
  {
    id: '7-21',
    tipo: 'programar',
    titulo: 'Escribe particion',
    estructura: 'Quicksort',
    enunciado:
      'Escribe la `particion` de quicksort sobre el tramo `v[ini..fin]`: el pivote es `v[fin]`; deja a su izquierda los menores o iguales, a su derecha los mayores, y devuelve dónde queda el pivote.',
    pistas: ['`i` empieza en `ini - 1`: es el último de los que ya son menores o iguales que el pivote.', 'Recorre con `j` de `ini` a `fin - 1`; al final, el pivote va a `i + 1`.'],
    ctx: V,
    casos: [
      caso([5, 2, 8, 1, 4], 'particion(v, 0, 4)', 'v = 5 2 8 1 4, tramo 0..4'),
      caso([3, 9, 7, 8], 'particion(v, 0, 3)', 'v = 3 9 7 8, tramo 0..3'),
      caso([1, 2, 9, 4, 6, 5], 'particion(v, 2, 5)', 'v = 1 2 9 4 6 5, tramo 2..5'),
    ],
    observar: ['v'],
    codigoInicial: c(`
      int particion(int v[], int ini, int fin) {

      }`),
    solucion: c(`
      int particion(int v[], int ini, int fin) {
          int pivote = v[fin];
          int i = ini - 1;
          for (int j = ini; j < fin; j++)
              if (v[j] <= pivote) intercambiar(&v[++i], &v[j]);
          intercambiar(&v[i + 1], &v[fin]);
          return i + 1;
      }`),
  },
  {
    id: '7-22',
    tipo: 'programar',
    titulo: 'Escribe fusionar',
    estructura: 'Mezcla',
    enunciado:
      'Escribe `fusionar`: `v[ini..medio]` y `v[medio+1..fin]` ya están ordenados. Júntalos en `aux` de menor a mayor y cópialos de vuelta a `v[ini..fin]`.',
    pistas: ['Tres índices: `i` recorre la izquierda, `j` la derecha y `k` aux.', 'Cuando una mitad se acaba, copia lo que quede de la otra. Y al final, aux a v solo en `ini..fin`.'],
    ctx: V,
    casos: [
      { nombre: 'v = 2 5 8 | 1 4 9, fusionar 0..5', inicial: [vector('v', [2, 5, 8, 1, 4, 9]), vector('aux', [0, 0, 0, 0, 0, 0])], llamada: 'fusionar(v, aux, 0, 2, 5)' },
      { nombre: 'v = 7 3 6 | 1 2 9, fusionar 1..4', inicial: [vector('v', [7, 3, 6, 1, 2, 9]), vector('aux', [0, 0, 0, 0, 0, 0])], llamada: 'fusionar(v, aux, 1, 2, 4)' },
      { nombre: 'Con iguales: v = 1 4 4 | 2 4 5', inicial: [vector('v', [1, 4, 4, 2, 4, 5]), vector('aux', [0, 0, 0, 0, 0, 0])], llamada: 'fusionar(v, aux, 0, 2, 5)' },
    ],
    observar: ['v'],
    codigoInicial: c(`
      void fusionar(int v[], int aux[], int ini, int medio, int fin) {

      }`),
    solucion: c(`
      void fusionar(int v[], int aux[], int ini, int medio, int fin) {
          int i = ini, j = medio + 1, k = ini;
          while (i <= medio && j <= fin)
              if (v[i] <= v[j]) aux[k++] = v[i++];
              else aux[k++] = v[j++];
          while (i <= medio) aux[k++] = v[i++];
          while (j <= fin) aux[k++] = v[j++];
          for (k = ini; k <= fin; k++) v[k] = aux[k];
      }`),
  },
];

// ------------------------------------------------------------------ find the bug

const FALLOS: EjCodigo[] = [
  {
    id: '7-23',
    tipo: 'fallo',
    titulo: 'Selection sort que se deja uno',
    estructura: 'Selección',
    enunciado: 'Ordena muchos arrays bien, pero no todos.',
    ctx: V,
    casos: [caso([3, 1, 2, 9], 'ordSeleccion(v, n)'), caso([5, 2, 8, 1, 4], 'ordSeleccion(v, n)')],
    observar: ['v'],
    codigo: c(`
      void ordSeleccion(int v[], int n) {
          for (int i = 0; i < n - 1; i++) {
              int min = i;
              for (int j = i + 1; j < n - 1; j++)
                  if (v[j] < v[min]) min = j;
              intercambiar(&v[i], &v[min]);
          }
      }`),
    lineasFallo: [4],
    tiposFallo: ['caso'],
    explicacion:
      'El bucle de dentro tiene que llegar hasta el último: `j < n`. Con `j < n - 1` nunca mira `v[n-1]`, así que si el menor de lo que queda está al final no lo encuentra. Con 9 al final no se nota; con el 4 sí.',
    solucion: c(`
      void ordSeleccion(int v[], int n) {
          for (int i = 0; i < n - 1; i++) {
              int min = i;
              for (int j = i + 1; j < n; j++)
                  if (v[j] < v[min]) min = j;
              intercambiar(&v[i], &v[min]);
          }
      }`),
  },
  {
    id: '7-24',
    tipo: 'fallo',
    titulo: 'Insertion sort que no llega al principio',
    estructura: 'Inserción',
    enunciado: 'Casi siempre ordena. Busca un array con el que no.',
    ctx: V,
    casos: [caso([1, 4, 3, 5], 'ordInsercion(v, n)'), caso([5, 2, 8, 1, 4], 'ordInsercion(v, n)')],
    observar: ['v'],
    codigo: c(`
      void ordInsercion(int v[], int n) {
          for (int i = 1; i < n; i++) {
              int x = v[i];
              int j = i - 1;
              while (j > 0 && v[j] > x) {
                  v[j + 1] = v[j];
                  j--;
              }
              v[j + 1] = x;
          }
      }`),
    lineasFallo: [5],
    tiposFallo: ['caso'],
    explicacion:
      'Con `j > 0` el while para antes de mirar `v[0]`: nada puede colocarse en la casilla 0. Si el primero ya es el menor no se nota; si el menor viene después, como el 2 de 5 2 8 1 4, se queda en la 1. Tiene que ser `j >= 0`.',
    solucion: c(`
      void ordInsercion(int v[], int n) {
          for (int i = 1; i < n; i++) {
              int x = v[i];
              int j = i - 1;
              while (j >= 0 && v[j] > x) {
                  v[j + 1] = v[j];
                  j--;
              }
              v[j + 1] = x;
          }
      }`),
  },
  {
    id: '7-25',
    tipo: 'fallo',
    titulo: 'Bubble sort que se sale',
    estructura: 'Burbuja',
    enunciado: 'Ni siquiera llega a ordenar el primer array.',
    ctx: V,
    casos: [caso([5, 2, 8, 1, 4], 'ordBurbuja(v, n)')],
    observar: ['v'],
    codigo: c(`
      void ordBurbuja(int v[], int n) {
          int i = 0, cambio;
          do {
              cambio = 0;
              for (int j = 0; j < n - i; j++)
                  if (v[j] > v[j + 1]) { intercambiar(&v[j], &v[j + 1]); cambio = 1; }
              i++;
          } while (cambio);
      }`),
    lineasFallo: [5],
    tiposFallo: ['array'],
    explicacion: 'En la primera pasada `j` llega a `n - 1` y `v[j + 1]` es `v[n]`, que no existe. Como se compara cada uno con el siguiente, `j` tiene que parar uno antes: `j < n - 1 - i`.',
    solucion: c(`
      void ordBurbuja(int v[], int n) {
          int i = 0, cambio;
          do {
              cambio = 0;
              for (int j = 0; j < n - 1 - i; j++)
                  if (v[j] > v[j + 1]) { intercambiar(&v[j], &v[j + 1]); cambio = 1; }
              i++;
          } while (cambio);
      }`),
  },
  {
    id: '7-26',
    tipo: 'fallo',
    titulo: 'Búsqueda binaria que no mira el último',
    estructura: 'Búsqueda binaria',
    enunciado: 'A veces no encuentra un número que sí está.',
    ctx: V,
    casos: [caso([2, 5, 8, 12, 16], 'busquedaBinaria(v, n, 8)', 'Busca el 8'), caso([2, 5, 8, 12, 16], 'busquedaBinaria(v, n, 7)', 'Busca el 7, que no está'), caso([2, 5, 8, 12, 16], 'busquedaBinaria(v, n, 5)', 'Busca el 5')],
    observar: ['v'],
    codigo: c(`
      int busquedaBinaria(int v[], int n, int x) {
          int ini = 0, fin = n - 1;
          while (ini < fin) {
              int med = ini + (fin - ini) / 2;
              if (v[med] == x) return med;
              if (v[med] < x) ini = med + 1;
              else fin = med - 1;
          }
          return -1;
      }`),
    lineasFallo: [3],
    tiposFallo: ['caso'],
    explicacion: 'Cuando `ini == fin` aún queda un candidato, y con `ini < fin` no se mira. Buscando el 5 se llega a `ini = fin = 1` y sale sin comprobarlo. Tiene que ser `ini <= fin`.',
    solucion: c(`
      int busquedaBinaria(int v[], int n, int x) {
          int ini = 0, fin = n - 1;
          while (ini <= fin) {
              int med = ini + (fin - ini) / 2;
              if (v[med] == x) return med;
              if (v[med] < x) ini = med + 1;
              else fin = med - 1;
          }
          return -1;
      }`),
  },
  {
    id: '7-27',
    tipo: 'fallo',
    titulo: 'Búsqueda binaria que no acaba',
    estructura: 'Búsqueda binaria',
    enunciado: 'Con unos números va bien y con otros se queda colgada.',
    ctx: V,
    casos: [caso([2, 5, 8, 12, 16], 'busquedaBinaria(v, n, 2)', 'Busca el 2'), caso([2, 5, 8, 12, 16], 'busquedaBinaria(v, n, 16)', 'Busca el 16')],
    observar: ['v'],
    codigo: c(`
      int busquedaBinaria(int v[], int n, int x) {
          int ini = 0, fin = n - 1;
          while (ini <= fin) {
              int med = ini + (fin - ini) / 2;
              if (v[med] == x) return med;
              if (v[med] < x) ini = med;
              else fin = med - 1;
          }
          return -1;
      }`),
    lineasFallo: [6],
    tiposFallo: ['bucle'],
    explicacion:
      'Con `ini = med` el `med` no se descarta. Buscando el 16 se llega a `ini = 3`, `fin = 4`: `med` vuelve a ser 3, 12 < 16 e `ini` se queda en 3 para siempre. Hacia la derecha hay que saltar: `ini = med + 1`.',
    solucion: c(`
      int busquedaBinaria(int v[], int n, int x) {
          int ini = 0, fin = n - 1;
          while (ini <= fin) {
              int med = ini + (fin - ini) / 2;
              if (v[med] == x) return med;
              if (v[med] < x) ini = med + 1;
              else fin = med - 1;
          }
          return -1;
      }`),
  },
  {
    id: '7-28',
    tipo: 'fallo',
    titulo: 'Quicksort que no termina',
    estructura: 'Quicksort',
    enunciado: '`particion` está bien (es la de clase). El fallo está en `rapidaRec`.',
    ctx: V_PARTICION,
    casos: [caso([7], 'rapidaRec(v, 0, n - 1)', 'Uno solo: v = 7'), caso([5, 2, 8, 1, 4], 'rapidaRec(v, 0, n - 1)')],
    observar: ['v'],
    codigo: c(`
      void rapidaRec(int v[], int ini, int fin) {
          if (ini >= fin) return;
          int p = particion(v, ini, fin);
          rapidaRec(v, ini, p);
          rapidaRec(v, p + 1, fin);
      }`),
    lineasFallo: [4],
    tiposFallo: ['bucle'],
    explicacion:
      'El pivote ya está en su sitio definitivo y no se vuelve a tocar: la llamada de la izquierda es hasta `p - 1`. Con `p` incluido, el pivote es el mayor de su tramo, la partición lo deja otra vez en `p` y la llamada se repite igual, sin acercarse nunca al caso base.',
    solucion: c(`
      void rapidaRec(int v[], int ini, int fin) {
          if (ini >= fin) return;
          int p = particion(v, ini, fin);
          rapidaRec(v, ini, p - 1);
          rapidaRec(v, p + 1, fin);
      }`),
  },
  {
    id: '7-29',
    tipo: 'fallo',
    titulo: 'fusionar que se adelanta',
    estructura: 'Mezcla',
    enunciado: 'Las dos mitades llegan ordenadas, pero a veces no salen ordenadas.',
    ctx: V,
    casos: [
      { nombre: 'v = 1 2 | 3 4', inicial: [vector('v', [1, 2, 3, 4]), vector('aux', [0, 0, 0, 0])], llamada: 'fusionar(v, aux, 0, 1, 3)' },
      { nombre: 'v = 1 5 | 2 3', inicial: [vector('v', [1, 5, 2, 3]), vector('aux', [0, 0, 0, 0])], llamada: 'fusionar(v, aux, 0, 1, 3)' },
    ],
    observar: ['v'],
    codigo: c(`
      void fusionar(int v[], int aux[], int ini, int medio, int fin) {
          int i = ini, j = medio + 1, k = ini;
          while (i < medio && j <= fin)
              if (v[i] <= v[j]) aux[k++] = v[i++];
              else aux[k++] = v[j++];
          while (i <= medio) aux[k++] = v[i++];
          while (j <= fin) aux[k++] = v[j++];
          for (k = ini; k <= fin; k++) v[k] = aux[k];
      }`),
    lineasFallo: [3],
    tiposFallo: ['caso'],
    explicacion:
      'La mitad izquierda llega hasta `medio` incluido. Con `i < medio` el primer while sale en cuanto `i` llega a `medio`, y el último de la izquierda se copia sin compararlo con los de la derecha: el 5 queda delante del 2 y el 3. Tiene que ser `i <= medio`.',
    solucion: c(`
      void fusionar(int v[], int aux[], int ini, int medio, int fin) {
          int i = ini, j = medio + 1, k = ini;
          while (i <= medio && j <= fin)
              if (v[i] <= v[j]) aux[k++] = v[i++];
              else aux[k++] = v[j++];
          while (i <= medio) aux[k++] = v[i++];
          while (j <= fin) aux[k++] = v[j++];
          for (k = ini; k <= fin; k++) v[k] = aux[k];
      }`),
  },
];

export const tema7: Tema = {
  id: '7',
  titulo: 'Ordenación y búsqueda',
  resumen:
    'Selection, insertion y bubble sort, merge sort, quicksort y búsqueda binaria: trazas a mano contando comparaciones e intercambios, las funciones de ordenacion.c escritas por ti y sus fallos típicos.',
  ejercicios: [...TRAZAS, ...ESCRIBIR, ...FALLOS],
};
