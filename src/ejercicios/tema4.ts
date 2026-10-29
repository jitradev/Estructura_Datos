import { colaArray, colaEnlazada, CTX_COLA_ARRAY, CTX_COLA_ENLAZADA, entero } from '../memoria/construir';
import { c } from './tema2';
import { Tema } from './tipos';

// Los structs y las funciones son los del proyecto Colas: ColaArray.c y ColaEnlazada.c,
// que trabaja con el TAD NodoSimple. En cada ejercicio están todas disponibles, salvo la
// que se pide escribir (la del alumno la sustituye).
const CA = CTX_COLA_ARRAY;
const CE = CTX_COLA_ENLAZADA;
const LLENA = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const tema4: Tema = {
  id: '4',
  titulo: 'Colas',
  resumen: 'La cola con array circular y contador (TAM_COLA_ARRAY 10, el % que da la vuelta) y la cola enlazada con inicio y final sobre el TAD NodoSimple. Los structs y las funciones de ColaArray.c y ColaEnlazada.c.',
  ejercicios: [
    {
      id: '4-01',
      tipo: 'programar',
      titulo: 'Encolar el 9, a mano, dando la vuelta',
      enunciado: 'La cola `cola` tiene 8 y 4, con `frente = 7`. Encola el **9** sin llamar a `encolarColaArray`. Fíjate en dónde queda `final`.',
      pistas: ['Primero se escribe en `cola->array[cola->final]` y después se avanza `final`.', 'Para que después del 9 venga el 0: `(cola->final + 1) % TAM_COLA_ARRAY`.'],
      ctx: CA,
      casos: [{ nombre: 'Cola 8 4', inicial: [colaArray('cola', [8, 4], 7, { 0: 6, 1: 1, 2: 5 })] }],
      observar: ['cola'],
      prohibidos: ['encolarColaArray()'],
      solucion: c(`
        cola->array[cola->final] = 9;
        cola->final = (cola->final + 1) % TAM_COLA_ARRAY;
        cola->numElementos++;`),
    },
    {
      id: '4-02',
      tipo: 'programar',
      titulo: 'Desencolar a mano',
      enunciado: 'Saca el elemento del frente de `cola` y guárdalo en `x`, sin llamar a `desencolarColaArray`. El frente está en la última casilla.',
      ctx: CA,
      casos: [{ nombre: 'Cola 9 2', inicial: [colaArray('cola', [9, 2], 9, { 1: 1, 2: 8, 3: 4 }), entero('x')] }],
      observar: ['cola', 'x'],
      prohibidos: ['desencolarColaArray()'],
      solucion: c(`
        x = cola->array[cola->frente];
        cola->frente = (cola->frente + 1) % TAM_COLA_ARRAY;
        cola->numElementos--;`),
    },
    {
      id: '4-03',
      tipo: 'programar',
      titulo: 'Escribe encolarColaArray',
      enunciado: 'Completa `encolarColaArray`: devuelve 0 si la cola está llena y 1 si ha encolado. Tienes `estaLLenaColaArray(cola)`.',
      ctx: CA,
      casos: [
        { nombre: 'Vacía', inicial: [colaArray('cola', [])], llamada: 'encolarColaArray(cola, 7)' },
        { nombre: 'Da la vuelta', inicial: [colaArray('cola', [8, 4], 8)], llamada: 'encolarColaArray(cola, 9)' },
        { nombre: 'Llena', inicial: [colaArray('cola', LLENA, 2)], llamada: 'encolarColaArray(cola, 99)' },
      ],
      observar: ['cola'],
      codigoInicial: c(`
        int encolarColaArray(ColaArray *cola, int x) {

        }`),
      solucion: c(`
        int encolarColaArray(ColaArray *cola, int x) {
            if(estaLLenaColaArray(cola) == 1) return 0;
            cola->array[cola->final] = x;
            cola->final = (cola->final + 1) % TAM_COLA_ARRAY;
            cola->numElementos++;
            return 1;
        }`),
    },
    {
      id: '4-04',
      tipo: 'programar',
      titulo: 'Escribe desencolarColaArray',
      enunciado: 'Completa `desencolarColaArray`: deja el frente en `*x`, lo quita y devuelve 1; si está vacía, devuelve 0 sin tocar `*x`. Tienes `estaVaciaColaArray(cola)`.',
      ctx: CA,
      casos: [
        { nombre: 'Frente al final', inicial: [colaArray('cola', [9, 2], 9), entero('x', 0)], llamada: 'desencolarColaArray(cola, &x)' },
        { nombre: 'Vacía', inicial: [colaArray('cola', [], 2), entero('x', 0)], llamada: 'desencolarColaArray(cola, &x)' },
      ],
      observar: ['cola', 'x'],
      codigoInicial: c(`
        int desencolarColaArray(ColaArray *cola, int *x) {

        }`),
      solucion: c(`
        int desencolarColaArray(ColaArray *cola, int *x) {
            if(estaVaciaColaArray(cola) == 1) return 0;
            *x = cola->array[cola->frente];
            cola->frente = (cola->frente + 1) % TAM_COLA_ARRAY;
            cola->numElementos--;
            return 1;
        }`),
    },
    {
      id: '4-05',
      tipo: 'programar',
      titulo: 'Encolar el 3, a mano, enlazada',
      enunciado: 'La cola enlazada `cola` tiene 1 y 2. Encola el **3** sin llamar a `encolarColaEnlazada`. Los nodos se manejan con el TAD: `crearNodoSimple`, `establecerSiguienteNodoSimple`...',
      pistas: ['El nuevo va detrás del último: el siguiente de `cola->final`.', 'Y después el nuevo pasa a ser el final.'],
      ctx: CE,
      casos: [{ nombre: 'Cola 1 2', inicial: [colaEnlazada('cola', [1, 2])] }],
      observar: ['cola'],
      prohibidos: ['encolarColaEnlazada()'],
      solucion: c(`
        NodoSimple *aux = crearNodoSimple(3);
        establecerSiguienteNodoSimple(cola->final, aux);
        cola->final = aux;
        cola->tamano++;`),
    },
    {
      id: '4-06',
      tipo: 'programar',
      titulo: 'Escribe encolarColaEnlazada',
      enunciado: 'Completa `encolarColaEnlazada`: devuelve 0 si la cola no existe o no hay memoria, y 1 si ha encolado. La cola vacía es un caso aparte.',
      pistas: ['Si la cola está vacía, el nuevo es a la vez inicio y final.'],
      ctx: CE,
      casos: [
        { nombre: 'Vacía', inicial: [colaEnlazada('cola', [])], llamada: 'encolarColaEnlazada(cola, 7)' },
        { nombre: 'Cola 1 2', inicial: [colaEnlazada('cola', [1, 2])], llamada: 'encolarColaEnlazada(cola, 7)' },
      ],
      observar: ['cola'],
      codigoInicial: c(`
        int encolarColaEnlazada(ColaEnlazada *cola, int x) {

        }`),
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
      id: '4-07',
      tipo: 'programar',
      titulo: 'Escribe desencolarColaEnlazada',
      enunciado: 'Completa `desencolarColaEnlazada`: guarda el valor del inicio en `*x`, quita el nodo, elimínalo y devuelve 1; con la cola vacía, devuelve 0. Cuidado cuando la cola se queda vacía.',
      pistas: ['Si al quitar el nodo el inicio pasa a ser NULL, el final también tiene que valer NULL.', '`eliminarNodoSimple` hace el free: después ya no se puede usar el nodo.'],
      ctx: CE,
      casos: [
        { nombre: 'Cola 1 2 3', inicial: [colaEnlazada('cola', [1, 2, 3]), entero('x', 0)], llamada: 'desencolarColaEnlazada(cola, &x)' },
        { nombre: 'Un elemento', inicial: [colaEnlazada('cola', [1]), entero('x', 0)], llamada: 'desencolarColaEnlazada(cola, &x)' },
        { nombre: 'Vacía', inicial: [colaEnlazada('cola', []), entero('x', 0)], llamada: 'desencolarColaEnlazada(cola, &x)' },
      ],
      observar: ['cola', 'x'],
      codigoInicial: c(`
        int desencolarColaEnlazada(ColaEnlazada *cola, int *x) {

        }`),
      solucion: c(`
        int desencolarColaEnlazada(ColaEnlazada *cola, int *x) {
            if (estaVaciaColaEnlazada(cola) == 1) return 0;
            *x = obtenerValorNodoSimple(cola->inicio);
            NodoSimple *aux = cola->inicio;
            cola->inicio = obtenerSiguienteNodoSimple(cola->inicio);
            if (cola->inicio == NULL) {
                cola->final = NULL;
            }
            cola->tamano--;
            if (eliminarNodoSimple(aux) == 1) return 1;

            return 0;
        }`),
    },
    {
      id: '4-08',
      tipo: 'programar',
      titulo: 'Rotar la cola',
      enunciado: 'Pasa el nodo del inicio al final: `1 2 3` queda `2 3 1`. Sin crear ni eliminar nodos y sin cambiar ningún valor: solo moviendo enlaces.',
      ctx: CE,
      casos: [{ nombre: 'Cola 1 2 3', inicial: [colaEnlazada('cola', [1, 2, 3])] }],
      observar: ['cola'],
      prohibidos: ['valor', 'crearNodoSimple()', 'eliminarNodoSimple()', 'establecerValorNodoSimple()', 'encolarColaEnlazada()', 'desencolarColaEnlazada()'],
      solucion: c(`
        NodoSimple *primero = cola->inicio;
        cola->inicio = obtenerSiguienteNodoSimple(primero);
        establecerSiguienteNodoSimple(primero, NULL);
        establecerSiguienteNodoSimple(cola->final, primero);
        cola->final = primero;`),
    },
    {
      id: '4-09',
      tipo: 'programar',
      titulo: 'Desencolar a mano, enlazada',
      enunciado: 'Saca el primero de la cola `1 2 3`, guárdalo en `x` y libera su nodo, sin llamar a `desencolarColaEnlazada`. Usa las funciones del TAD NodoSimple.',
      pistas: ['Guarda el nodo del inicio en un auxiliar, mueve `cola->inicio` al siguiente y después libéralo con `eliminarNodoSimple`.', 'Aquí quedan nodos, así que `cola->final` no cambia. No olvides `cola->tamano`.'],
      ctx: CE,
      casos: [{ nombre: 'Cola 1 2 3', inicial: [colaEnlazada('cola', [1, 2, 3]), entero('x', 0)] }],
      observar: ['cola', 'x'],
      prohibidos: ['desencolarColaEnlazada()', 'vaciarColaEnlazada()'],
      solucion: c(`
        NodoSimple *aux = cola->inicio;
        x = obtenerValorNodoSimple(aux);
        cola->inicio = obtenerSiguienteNodoSimple(aux);
        cola->tamano--;
        eliminarNodoSimple(aux);`),
    },
    {
      id: '4-10',
      tipo: 'programar',
      titulo: 'Pasar una cola a otra',
      enunciado: 'Pasa todos los elementos de `cola` a `cola2` (que empieza vacía) con `desencolarColaArray` y `encolarColaArray`. ¿En qué orden quedan?',
      alResolver: 'Al contrario que al volcar una pila en otra, el orden se mantiene: lo primero que sale es lo primero que entra.',
      ctx: CA,
      casos: [{ nombre: 'cola = 1 2 3, dando la vuelta', inicial: [colaArray('cola', [1, 2, 3], 8), colaArray('cola2', [])] }],
      observar: ['cola', 'cola2'],
      codigoInicial: 'int x = 0;\n',
      solucion: c(`
        int x = 0;
        while (!estaVaciaColaArray(cola)) {
            desencolarColaArray(cola, &x);
            encolarColaArray(cola2, x);
        }`),
    },
    {
      id: '4-11',
      tipo: 'programar',
      titulo: 'Escribe frenteColaArray',
      enunciado: 'Completa `frenteColaArray`: deja en `*x` el primero de la cola **sin sacarlo** y devuelve 1; con la cola vacía, devuelve 0 sin tocar `*x`.',
      pistas: ['El primero está en `array[frente]`, no en `array[0]`.'],
      ctx: CA,
      casos: [
        { nombre: 'Cola 5 8 2, desde la casilla 7', inicial: [colaArray('cola', [5, 8, 2], 7), entero('x', 0)], llamada: 'frenteColaArray(cola, &x)' },
        { nombre: 'Vacía', inicial: [colaArray('cola', [], 3), entero('x', 0)], llamada: 'frenteColaArray(cola, &x)' },
      ],
      observar: ['cola', 'x'],
      codigoInicial: c(`
        int frenteColaArray(ColaArray *cola, int *x) {

        }`),
      solucion: c(`
        int frenteColaArray(ColaArray *cola, int *x) {
            if(estaVaciaColaArray(cola) == 1) return 0;
            *x = cola->array[cola->frente];
            return 1;
        }`),
    },
    {
      id: '4-12',
      tipo: 'programar',
      titulo: 'Escribe vaciarColaEnlazada',
      enunciado: 'Completa `vaciarColaEnlazada`: saca y libera todos los nodos, deja la cola vacía (`inicio` y `final` a NULL, `tamano` a 0) y devuelve 1. Puedes usar `desencolarColaEnlazada`.',
      ctx: CE,
      casos: [
        { nombre: 'Cola 1 2 3', inicial: [colaEnlazada('cola', [1, 2, 3])], llamada: 'vaciarColaEnlazada(cola)' },
        { nombre: 'Vacía', inicial: [colaEnlazada('cola', [])], llamada: 'vaciarColaEnlazada(cola)' },
      ],
      observar: ['cola'],
      codigoInicial: c(`
        int vaciarColaEnlazada(ColaEnlazada *cola) {

        }`),
      solucion: c(`
        int vaciarColaEnlazada(ColaEnlazada *cola) {
            int aux = 0;
            while (estaVaciaColaEnlazada(cola) == 0) {
                desencolarColaEnlazada(cola, &aux);
            }
            return 1;
        }`),
    },
    // ------------------------------------------------------------ fallos
    {
      id: '4-F1',
      tipo: 'fallo',
      titulo: 'encolarColaArray que no da la vuelta',
      enunciado: 'Este `encolarColaArray` va bien durante un rato. Prueba a encolar dos veces cuando `final` está en la última casilla.',
      ctx: CA,
      casos: [
        { nombre: 'Vacía', inicial: [colaArray('cola', [])], llamada: 'encolarColaArray(cola, 7)' },
        { nombre: 'Dos al fondo', inicial: [colaArray('cola', [8, 4], 7)], llamada: 'encolarColaArray(cola, 9); encolarColaArray(cola, 2)' },
      ],
      observar: ['cola'],
      codigo: c(`
        int encolarColaArray(ColaArray *cola, int x) {
            if(estaLLenaColaArray(cola) == 1) return 0;
            cola->array[cola->final] = x;
            cola->final = cola->final + 1;
            cola->numElementos++;
            return 1;
        }`),
      lineasFallo: [4],
      tiposFallo: ['array'],
      explicacion: 'Sin `% TAM_COLA_ARRAY`, `final` sigue creciendo: 10, 11... y el siguiente encolar escribe fuera del array. Con `(cola->final + 1) % TAM_COLA_ARRAY` después del 9 viene el 0.',
      solucion: c(`
        int encolarColaArray(ColaArray *cola, int x) {
            if(estaLLenaColaArray(cola) == 1) return 0;
            cola->array[cola->final] = x;
            cola->final = (cola->final + 1) % TAM_COLA_ARRAY;
            cola->numElementos++;
            return 1;
        }`),
    },
    {
      id: '4-F2',
      tipo: 'fallo',
      titulo: 'estaLLenaColaArray sin contador',
      enunciado: 'Alguien ha reescrito `estaLLenaColaArray` mirando solo los índices.',
      ctx: CA,
      casos: [
        { nombre: 'Cola 8 4', inicial: [colaArray('cola', [8, 4], 1)], llamada: 'encolarColaArray(cola, 9)' },
        { nombre: 'Vacía', inicial: [colaArray('cola', [], 3)], llamada: 'encolarColaArray(cola, 9)' },
      ],
      observar: ['cola'],
      codigo: c(`
        int estaLLenaColaArray(ColaArray *cola) {
            if(cola->frente == cola->final) {
                return 1;
            }
            return 0;
        }

        int encolarColaArray(ColaArray *cola, int x) {
            if(estaLLenaColaArray(cola) == 1) return 0;
            cola->array[cola->final] = x;
            cola->final = (cola->final + 1) % TAM_COLA_ARRAY;
            cola->numElementos++;
            return 1;
        }`),
      lineasFallo: [2],
      tiposFallo: ['caso'],
      explicacion: '`frente == final` pasa tanto con la cola llena como con la vacía: es el dilema de las diapositivas. Con el contador se sale de dudas: llena es `cola->numElementos == TAM_COLA_ARRAY`.',
      solucion: c(`
        int estaLLenaColaArray(ColaArray *cola) {
            if(cola->numElementos == TAM_COLA_ARRAY) {
                return 1;
            }
            return 0;
        }

        int encolarColaArray(ColaArray *cola, int x) {
            if(estaLLenaColaArray(cola) == 1) return 0;
            cola->array[cola->final] = x;
            cola->final = (cola->final + 1) % TAM_COLA_ARRAY;
            cola->numElementos++;
            return 1;
        }`),
    },
    {
      id: '4-F3',
      tipo: 'fallo',
      titulo: 'desencolarColaEnlazada que se olvida del final',
      enunciado: 'Este `desencolarColaEnlazada` funciona con colas largas. Prueba a vaciarla.',
      ctx: CE,
      casos: [
        { nombre: 'Cola 1 2 3', inicial: [colaEnlazada('cola', [1, 2, 3]), entero('x', 0)], llamada: 'desencolarColaEnlazada(cola, &x)' },
        { nombre: 'Un elemento', inicial: [colaEnlazada('cola', [1]), entero('x', 0)], llamada: 'desencolarColaEnlazada(cola, &x)' },
      ],
      observar: ['cola', 'x'],
      codigo: c(`
        int desencolarColaEnlazada(ColaEnlazada *cola, int *x) {
            if (estaVaciaColaEnlazada(cola) == 1) return 0;
            *x = obtenerValorNodoSimple(cola->inicio);
            NodoSimple *aux = cola->inicio;
            cola->inicio = obtenerSiguienteNodoSimple(cola->inicio);
            cola->tamano--;
            if (eliminarNodoSimple(aux) == 1) return 1;

            return 0;
        }`),
      lineasFallo: [5, 6],
      preguntaLinea: 'Marca la línea después de la que falta algo',
      tiposFallo: ['colgante', 'caso'],
      explicacion: 'Al sacar el último, `inicio` queda a NULL pero `final` sigue apuntando al nodo eliminado. El siguiente `encolarColaEnlazada` engancharía el nodo nuevo detrás de memoria liberada.',
      solucion: c(`
        int desencolarColaEnlazada(ColaEnlazada *cola, int *x) {
            if (estaVaciaColaEnlazada(cola) == 1) return 0;
            *x = obtenerValorNodoSimple(cola->inicio);
            NodoSimple *aux = cola->inicio;
            cola->inicio = obtenerSiguienteNodoSimple(cola->inicio);
            if (cola->inicio == NULL) {
                cola->final = NULL;
            }
            cola->tamano--;
            if (eliminarNodoSimple(aux) == 1) return 1;

            return 0;
        }`),
    },
    {
      id: '4-F4',
      tipo: 'fallo',
      titulo: 'encolarColaEnlazada sin caso vacío',
      enunciado: 'Este `encolarColaEnlazada` no distingue casos. No se rompe nunca. ¿Funciona siempre?',
      ctx: CE,
      casos: [
        { nombre: 'Cola 1 2', inicial: [colaEnlazada('cola', [1, 2])], llamada: 'encolarColaEnlazada(cola, 7)' },
        { nombre: 'Vacía', inicial: [colaEnlazada('cola', [])], llamada: 'encolarColaEnlazada(cola, 7)' },
      ],
      observar: ['cola'],
      codigo: c(`
        int encolarColaEnlazada(ColaEnlazada *cola, int x) {
            if (cola == NULL) return 0;
            NodoSimple *aux = crearNodoSimple(x);
            if (aux == NULL) return 0;
            establecerSiguienteNodoSimple(cola->final, aux);
            cola->final = aux;
            cola->tamano++;
            return 1;
        }`),
      lineasFallo: [5],
      preguntaLinea: 'Marca la línea que no hace lo que parece',
      tiposFallo: ['caso'],
      explicacion: 'Con la cola vacía `cola->final` es NULL: `establecerSiguienteNodoSimple` no hace nada (devuelve 0) y `inicio` se queda a NULL. La cola tiene un nodo, pero `estaVaciaColaEnlazada` dice que está vacía. En ese caso el nuevo es también el inicio.',
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
      id: '4-F5',
      tipo: 'fallo',
      titulo: 'desencolarColaArray sin vuelta',
      enunciado: 'Saca dos elementos seguidos cuando el frente está en la última casilla.',
      ctx: CA,
      casos: [
        { nombre: 'Cola 1 2 3', inicial: [colaArray('cola', [1, 2, 3], 0), entero('x', 0)], llamada: 'desencolarColaArray(cola, &x)' },
        { nombre: 'Dos al fondo', inicial: [colaArray('cola', [9, 2], 9), entero('x', 0)], llamada: 'desencolarColaArray(cola, &x); desencolarColaArray(cola, &x)' },
      ],
      observar: ['cola', 'x'],
      codigo: c(`
        int desencolarColaArray(ColaArray *cola, int *x) {
            if(estaVaciaColaArray(cola) == 1) return 0;
            *x = cola->array[cola->frente];
            cola->frente = cola->frente + 1;
            cola->numElementos--;
            return 1;
        }`),
      lineasFallo: [4],
      tiposFallo: ['array'],
      explicacion: 'El frente también tiene que dar la vuelta: `(cola->frente + 1) % TAM_COLA_ARRAY`. Sin eso, el siguiente desencolar lee `array[10]`.',
      solucion: c(`
        int desencolarColaArray(ColaArray *cola, int *x) {
            if(estaVaciaColaArray(cola) == 1) return 0;
            *x = cola->array[cola->frente];
            cola->frente = (cola->frente + 1) % TAM_COLA_ARRAY;
            cola->numElementos--;
            return 1;
        }`),
    },
    {
      id: '4-F6',
      tipo: 'fallo',
      titulo: 'desencolarColaEnlazada que lee tarde',
      enunciado: 'Las mismas cosas que la versión buena, en otro orden.',
      ctx: CE,
      casos: [{ nombre: 'Cola 1 2 3', inicial: [colaEnlazada('cola', [1, 2, 3]), entero('x', 0)], llamada: 'desencolarColaEnlazada(cola, &x)' }],
      observar: ['cola', 'x'],
      codigo: c(`
        int desencolarColaEnlazada(ColaEnlazada *cola, int *x) {
            if (estaVaciaColaEnlazada(cola) == 1) return 0;
            NodoSimple *aux = cola->inicio;
            eliminarNodoSimple(aux);
            *x = obtenerValorNodoSimple(aux);
            cola->inicio = obtenerSiguienteNodoSimple(aux);
            if (cola->inicio == NULL) {
                cola->final = NULL;
            }
            cola->tamano--;
            return 1;
        }`),
      lineasFallo: [4, 5],
      tiposFallo: ['liberado'],
      explicacion: '`eliminarNodoSimple` hace el free: tiene que ser lo último que se hace con el nodo. Después ya no se puede leer ni su valor ni su siguiente, aunque sea a través de las funciones del TAD.',
      solucion: c(`
        int desencolarColaEnlazada(ColaEnlazada *cola, int *x) {
            if (estaVaciaColaEnlazada(cola) == 1) return 0;
            *x = obtenerValorNodoSimple(cola->inicio);
            NodoSimple *aux = cola->inicio;
            cola->inicio = obtenerSiguienteNodoSimple(cola->inicio);
            if (cola->inicio == NULL) {
                cola->final = NULL;
            }
            cola->tamano--;
            if (eliminarNodoSimple(aux) == 1) return 1;

            return 0;
        }`),
    },
    {
      id: '4-F7',
      tipo: 'fallo',
      titulo: 'frenteColaEnlazada que no se queja',
      enunciado: 'Este `frenteColaEnlazada` nunca da un error de memoria. Eso no quiere decir que funcione.',
      ctx: CE,
      casos: [
        { nombre: 'Cola 1 2 3', inicial: [colaEnlazada('cola', [1, 2, 3]), entero('x', 7)], llamada: 'frenteColaEnlazada(cola, &x)' },
        { nombre: 'Vacía', inicial: [colaEnlazada('cola', []), entero('x', 7)], llamada: 'frenteColaEnlazada(cola, &x)' },
      ],
      observar: ['cola', 'x'],
      codigo: c(`
        int frenteColaEnlazada(ColaEnlazada *cola, int *x) {
            *x = obtenerValorNodoSimple(cola->inicio);
            return 1;
        }`),
      lineasFallo: [2],
      preguntaLinea: 'Marca la línea antes de la que falta algo',
      tiposFallo: ['caso'],
      explicacion: 'Con la cola vacía, `obtenerValorNodoSimple(NULL)` no falla: devuelve 0. Así que la función dice que ha ido bien (devuelve 1) y deja un 0 en `x` como si fuera el primero. Falta `if (estaVaciaColaEnlazada(cola) == 1) return 0;`.',
      solucion: c(`
        int frenteColaEnlazada(ColaEnlazada *cola, int *x) {
            if (estaVaciaColaEnlazada(cola) == 1) return 0;
            *x = obtenerValorNodoSimple(cola->inicio);
            return 1;
        }`),
    },
    {
      id: '4-F8',
      tipo: 'fallo',
      titulo: 'encolarColaArray sin mirar si cabe',
      enunciado: 'Gracias al `%`, este `encolarColaArray` nunca se sale del array. ¿Entonces?',
      ctx: CA,
      casos: [
        { nombre: 'Cola 1 2 3', inicial: [colaArray('cola', [1, 2, 3])], llamada: 'encolarColaArray(cola, 9)' },
        { nombre: 'Llena', inicial: [colaArray('cola', LLENA, 4)], llamada: 'encolarColaArray(cola, 99)' },
      ],
      observar: ['cola'],
      codigo: c(`
        int encolarColaArray(ColaArray *cola, int x) {
            cola->array[cola->final] = x;
            cola->final = (cola->final + 1) % TAM_COLA_ARRAY;
            cola->numElementos++;
            return 1;
        }`),
      lineasFallo: [2],
      preguntaLinea: 'Marca la línea antes de la que falta algo',
      tiposFallo: ['caso'],
      explicacion: 'Con la cola llena, `final` coincide con `frente`: el 99 machaca el primero de la cola y `numElementos` pasa a 11. No hay error de memoria, pero la cola ya no es lo que era. Falta `if (estaLLenaColaArray(cola) == 1) return 0;`.',
      solucion: c(`
        int encolarColaArray(ColaArray *cola, int x) {
            if(estaLLenaColaArray(cola) == 1) return 0;
            cola->array[cola->final] = x;
            cola->final = (cola->final + 1) % TAM_COLA_ARRAY;
            cola->numElementos++;
            return 1;
        }`),
    },
  ],
};
