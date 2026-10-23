import { colaCircular, colaEnlazada, CTX_COLA_CIRCULAR, CTX_COLA_ENLAZADA, entero } from '../memoria/construir';
import { c } from './tema2';
import { Tema } from './tipos';

const CC = CTX_COLA_CIRCULAR;
const CE = CTX_COLA_ENLAZADA;

export const tema4: Tema = {
  id: '4',
  titulo: 'Colas',
  resumen: 'El array circular con contador (MAX 5, el % que da la vuelta) y la cola enlazada con dos punteros.',
  ejercicios: [
    {
      id: '4-01',
      tipo: 'programar',
      titulo: 'Encolar el 9, a mano, dando la vuelta',
      enunciado: 'La cola `c` tiene 8 y 4, con `frente = 3`. Encola el **9** a mano. Fíjate en dónde queda `final`.',
      pistas: ['Primero se escribe en `c->datos[c->final]` y después se avanza `final`.', 'Para que después del 4 venga el 0: `(c->final + 1) % MAX`.'],
      ctx: CC,
      casos: [{ nombre: 'Cola 8 4', inicial: [colaCircular('c', [8, 4], 3, { 0: 6, 1: 1, 2: 5 })] }],
      observar: ['c'],
      solucion: c(`
        c->datos[c->final] = 9;
        c->final = (c->final + 1) % MAX;
        c->n++;`),
    },
    {
      id: '4-02',
      tipo: 'programar',
      titulo: 'Desencolar a mano',
      enunciado: 'Saca el elemento del frente de `c` y guárdalo en `x`, a mano. El frente está en la última casilla.',
      ctx: CC,
      casos: [{ nombre: 'Cola 9 2', inicial: [colaCircular('c', [9, 2], 4, { 1: 1, 2: 8, 3: 4 }), entero('x')] }],
      observar: ['c', 'x'],
      solucion: c(`
        x = c->datos[c->frente];
        c->frente = (c->frente + 1) % MAX;
        c->n--;`),
    },
    {
      id: '4-03',
      tipo: 'programar',
      titulo: 'Escribe encolar (circular)',
      enunciado: 'Completa `encolar`: devuelve 0 si la cola está llena y 1 si ha encolado. Tienes `estaLlena(c)`.',
      ctx: CC,
      casos: [
        { nombre: 'Vacía', inicial: [colaCircular('c', [])], llamada: 'encolar(c, 7)' },
        { nombre: 'Da la vuelta', inicial: [colaCircular('c', [8, 4], 3)], llamada: 'encolar(c, 9)' },
        { nombre: 'Llena', inicial: [colaCircular('c', [1, 2, 3, 4, 5], 2)], llamada: 'encolar(c, 9)' },
      ],
      observar: ['c'],
      codigoInicial: c(`
        int encolar(ColaCircular *c, int x)
        {

        }`),
      solucion: c(`
        int encolar(ColaCircular *c, int x)
        {
            if (estaLlena(c)) return 0;
            c->datos[c->final] = x;
            c->final = (c->final + 1) % MAX;
            c->n++;
            return 1;
        }`),
    },
    {
      id: '4-04',
      tipo: 'programar',
      titulo: 'Escribe desencolar (circular)',
      enunciado: 'Completa `desencolar`: deja el frente en `*x`, lo quita y devuelve 1; si está vacía, devuelve 0 sin tocar `*x`.',
      ctx: CC,
      casos: [
        { nombre: 'Frente al final', inicial: [colaCircular('c', [9, 2], 4), entero('x', 0)], llamada: 'desencolar(c, &x)' },
        { nombre: 'Vacía', inicial: [colaCircular('c', [], 2), entero('x', 0)], llamada: 'desencolar(c, &x)' },
      ],
      observar: ['c', 'x'],
      codigoInicial: c(`
        int desencolar(ColaCircular *c, int *x)
        {

        }`),
      solucion: c(`
        int desencolar(ColaCircular *c, int *x)
        {
            if (estaVacia(c)) return 0;
            *x = c->datos[c->frente];
            c->frente = (c->frente + 1) % MAX;
            c->n--;
            return 1;
        }`),
    },
    {
      id: '4-05',
      tipo: 'programar',
      titulo: 'Encolar el 3, a mano, enlazada',
      enunciado: 'La cola enlazada `c` tiene 1 y 2. Encola el **3** a mano.',
      pistas: ['El nuevo va detrás del último: `c->final->siguiente`.', 'Y después el nuevo pasa a ser el final.'],
      ctx: CE,
      casos: [{ nombre: 'Cola 1 2', inicial: [colaEnlazada('c', [1, 2])] }],
      observar: ['c'],
      solucion: c(`
        Nodo *nuevo = malloc(sizeof(Nodo));
        nuevo->valor = 3;
        nuevo->siguiente = NULL;
        c->final->siguiente = nuevo;
        c->final = nuevo;
        c->n++;`),
    },
    {
      id: '4-06',
      tipo: 'programar',
      titulo: 'Escribe encolar (enlazada)',
      enunciado: 'Completa `encolar` para la cola enlazada. La cola vacía es un caso aparte.',
      pistas: ['Si la cola está vacía, el nuevo es a la vez frente y final.'],
      ctx: CE,
      casos: [
        { nombre: 'Vacía', inicial: [colaEnlazada('c', [])], llamada: 'encolar(c, 7)' },
        { nombre: 'Cola 1 2', inicial: [colaEnlazada('c', [1, 2])], llamada: 'encolar(c, 7)' },
      ],
      observar: ['c'],
      codigoInicial: c(`
        int encolar(Cola *c, int x)
        {

        }`),
      solucion: c(`
        int encolar(Cola *c, int x)
        {
            Nodo *nuevo = malloc(sizeof(Nodo));
            nuevo->valor = x;
            nuevo->siguiente = NULL;
            if (esVacia(c)) c->frente = nuevo;
            else c->final->siguiente = nuevo;
            c->final = nuevo;
            c->n++;
            return 1;
        }`),
    },
    {
      id: '4-07',
      tipo: 'programar',
      titulo: 'Escribe desencolar (enlazada)',
      enunciado: 'Completa `desencolar` para la cola enlazada: guarda el frente en `*x`, quita el nodo, libéralo y devuelve 1. Cuidado cuando la cola se queda vacía.',
      pistas: ['Si al quitar el nodo el frente pasa a ser NULL, el final también tiene que valer NULL.'],
      ctx: CE,
      casos: [
        { nombre: 'Cola 1 2 3', inicial: [colaEnlazada('c', [1, 2, 3]), entero('x', 0)], llamada: 'desencolar(c, &x)' },
        { nombre: 'Un elemento', inicial: [colaEnlazada('c', [1]), entero('x', 0)], llamada: 'desencolar(c, &x)' },
        { nombre: 'Vacía', inicial: [colaEnlazada('c', []), entero('x', 0)], llamada: 'desencolar(c, &x)' },
      ],
      observar: ['c', 'x'],
      codigoInicial: c(`
        int desencolar(Cola *c, int *x)
        {

        }`),
      solucion: c(`
        int desencolar(Cola *c, int *x)
        {
            if (esVacia(c)) return 0;
            Nodo *viejo = c->frente;
            *x = viejo->valor;
            c->frente = viejo->siguiente;
            if (c->frente == NULL)
                c->final = NULL;
            free(viejo);
            c->n--;
            return 1;
        }`),
    },
    {
      id: '4-08',
      tipo: 'programar',
      titulo: 'Rotar la cola',
      enunciado: 'Pasa el nodo del frente al final: `1 2 3` queda `2 3 1`. Sin `malloc`, sin `free` y sin tocar `valor`.',
      ctx: CE,
      casos: [{ nombre: 'Cola 1 2 3', inicial: [colaEnlazada('c', [1, 2, 3])] }],
      observar: ['c'],
      prohibidos: ['valor'],
      solucion: c(`
        Nodo *primero = c->frente;
        c->frente = primero->siguiente;
        primero->siguiente = NULL;
        c->final->siguiente = primero;
        c->final = primero;`),
    },
    // ------------------------------------------------------------ fallos
    {
      id: '4-F1',
      tipo: 'fallo',
      titulo: 'encolar que no da la vuelta',
      enunciado: 'Este `encolar` va bien durante un rato. Prueba a encolar dos veces cuando `final` está al fondo del array.',
      ctx: CC,
      casos: [
        { nombre: 'Vacía', inicial: [colaCircular('c', [])], llamada: 'encolar(c, 7)' },
        { nombre: 'Dos al fondo', inicial: [colaCircular('c', [8, 4], 2)], llamada: 'encolar(c, 9); encolar(c, 2)' },
      ],
      observar: ['c'],
      codigo: c(`
        int encolar(ColaCircular *c, int x)
        {
            if (estaLlena(c)) return 0;
            c->datos[c->final] = x;
            c->final = c->final + 1;
            c->n++;
            return 1;
        }`),
      lineasFallo: [5],
      tiposFallo: ['array'],
      explicacion: 'Sin `% MAX`, `final` sigue creciendo: 5, 6... y el siguiente encolar escribe fuera del array. Con `(c->final + 1) % MAX` después del 4 viene el 0.',
      solucion: c(`
        int encolar(ColaCircular *c, int x)
        {
            if (estaLlena(c)) return 0;
            c->datos[c->final] = x;
            c->final = (c->final + 1) % MAX;
            c->n++;
            return 1;
        }`),
    },
    {
      id: '4-F2',
      tipo: 'fallo',
      titulo: 'estaLlena sin contador',
      enunciado: 'Alguien ha escrito su propio `estaLlena` mirando solo los índices.',
      ctx: CC,
      casos: [
        { nombre: 'Cola 8 4', inicial: [colaCircular('c', [8, 4], 1)], llamada: 'encolar(c, 9)' },
        { nombre: 'Vacía', inicial: [colaCircular('c', [], 3)], llamada: 'encolar(c, 9)' },
      ],
      observar: ['c'],
      codigo: c(`
        int estaLlena(ColaCircular *c)
        {
            return c->frente == c->final;
        }

        int encolar(ColaCircular *c, int x)
        {
            if (estaLlena(c)) return 0;
            c->datos[c->final] = x;
            c->final = (c->final + 1) % MAX;
            c->n++;
            return 1;
        }`),
      lineasFallo: [3],
      tiposFallo: ['caso'],
      explicacion: '`frente == final` pasa tanto con la cola llena como con la vacía: es el dilema de las diapositivas. Con el contador se sale de dudas: llena es `c->n == MAX`.',
      solucion: c(`
        int estaLlena(ColaCircular *c)
        {
            return c->n == MAX;
        }

        int encolar(ColaCircular *c, int x)
        {
            if (estaLlena(c)) return 0;
            c->datos[c->final] = x;
            c->final = (c->final + 1) % MAX;
            c->n++;
            return 1;
        }`),
    },
    {
      id: '4-F3',
      tipo: 'fallo',
      titulo: 'desencolar que se olvida del final',
      enunciado: 'Este `desencolar` funciona con colas largas. Prueba a vaciarla.',
      ctx: CE,
      casos: [
        { nombre: 'Cola 1 2 3', inicial: [colaEnlazada('c', [1, 2, 3]), entero('x', 0)], llamada: 'desencolar(c, &x)' },
        { nombre: 'Un elemento', inicial: [colaEnlazada('c', [1]), entero('x', 0)], llamada: 'desencolar(c, &x)' },
      ],
      observar: ['c', 'x'],
      codigo: c(`
        int desencolar(Cola *c, int *x)
        {
            if (esVacia(c)) return 0;
            Nodo *viejo = c->frente;
            *x = viejo->valor;
            c->frente = viejo->siguiente;
            free(viejo);
            c->n--;
            return 1;
        }`),
      lineasFallo: [6, 7],
      preguntaLinea: 'Marca la línea después de la que falta algo',
      tiposFallo: ['colgante', 'caso'],
      explicacion: 'Al sacar el último, `frente` queda a NULL pero `final` sigue apuntando al nodo liberado. El siguiente `encolar` escribiría en `c->final->siguiente`: memoria liberada.',
      solucion: c(`
        int desencolar(Cola *c, int *x)
        {
            if (esVacia(c)) return 0;
            Nodo *viejo = c->frente;
            *x = viejo->valor;
            c->frente = viejo->siguiente;
            if (c->frente == NULL)
                c->final = NULL;
            free(viejo);
            c->n--;
            return 1;
        }`),
    },
    {
      id: '4-F4',
      tipo: 'fallo',
      titulo: 'encolar enlazada sin caso vacío',
      enunciado: 'Este `encolar` no distingue casos. ¿Hace falta?',
      ctx: CE,
      casos: [
        { nombre: 'Cola 1 2', inicial: [colaEnlazada('c', [1, 2])], llamada: 'encolar(c, 7)' },
        { nombre: 'Vacía', inicial: [colaEnlazada('c', [])], llamada: 'encolar(c, 7)' },
      ],
      observar: ['c'],
      codigo: c(`
        int encolar(Cola *c, int x)
        {
            Nodo *nuevo = malloc(sizeof(Nodo));
            nuevo->valor = x;
            nuevo->siguiente = NULL;
            c->final->siguiente = nuevo;
            c->final = nuevo;
            c->n++;
            return 1;
        }`),
      lineasFallo: [6],
      preguntaLinea: 'Marca la línea donde se rompe',
      tiposFallo: ['nulo', 'caso'],
      explicacion: 'Con la cola vacía `c->final` es NULL y `c->final->siguiente` no existe. En ese caso el nuevo es también el frente.',
      solucion: c(`
        int encolar(Cola *c, int x)
        {
            Nodo *nuevo = malloc(sizeof(Nodo));
            nuevo->valor = x;
            nuevo->siguiente = NULL;
            if (esVacia(c)) c->frente = nuevo;
            else c->final->siguiente = nuevo;
            c->final = nuevo;
            c->n++;
            return 1;
        }`),
    },
    {
      id: '4-F5',
      tipo: 'fallo',
      titulo: 'desencolar circular sin vuelta',
      enunciado: 'Saca dos elementos seguidos cuando el frente está al fondo del array.',
      ctx: CC,
      casos: [
        { nombre: 'Cola 1 2 3', inicial: [colaCircular('c', [1, 2, 3], 0), entero('x', 0)], llamada: 'desencolar(c, &x)' },
        { nombre: 'Dos al fondo', inicial: [colaCircular('c', [9, 2], 4), entero('x', 0)], llamada: 'desencolar(c, &x); desencolar(c, &x)' },
      ],
      observar: ['c', 'x'],
      codigo: c(`
        int desencolar(ColaCircular *c, int *x)
        {
            if (estaVacia(c)) return 0;
            *x = c->datos[c->frente];
            c->frente = c->frente + 1;
            c->n--;
            return 1;
        }`),
      lineasFallo: [5],
      tiposFallo: ['array'],
      explicacion: 'El frente también tiene que dar la vuelta: `(c->frente + 1) % MAX`. Sin eso, el siguiente desencolar lee `datos[5]`.',
      solucion: c(`
        int desencolar(ColaCircular *c, int *x)
        {
            if (estaVacia(c)) return 0;
            *x = c->datos[c->frente];
            c->frente = (c->frente + 1) % MAX;
            c->n--;
            return 1;
        }`),
    },
    {
      id: '4-F6',
      tipo: 'fallo',
      titulo: 'desencolar enlazada que lee tarde',
      enunciado: 'Las mismas líneas que la versión buena, en otro orden.',
      ctx: CE,
      casos: [{ nombre: 'Cola 1 2 3', inicial: [colaEnlazada('c', [1, 2, 3]), entero('x', 0)], llamada: 'desencolar(c, &x)' }],
      observar: ['c', 'x'],
      codigo: c(`
        int desencolar(Cola *c, int *x)
        {
            if (esVacia(c)) return 0;
            Nodo *viejo = c->frente;
            free(viejo);
            *x = viejo->valor;
            c->frente = viejo->siguiente;
            if (c->frente == NULL)
                c->final = NULL;
            c->n--;
            return 1;
        }`),
      lineasFallo: [5, 6],
      tiposFallo: ['liberado'],
      explicacion: 'El free tiene que ser lo último que se hace con el nodo: después ya no se puede leer ni su dato ni su siguiente.',
      solucion: c(`
        int desencolar(Cola *c, int *x)
        {
            if (esVacia(c)) return 0;
            Nodo *viejo = c->frente;
            *x = viejo->valor;
            c->frente = viejo->siguiente;
            if (c->frente == NULL)
                c->final = NULL;
            free(viejo);
            c->n--;
            return 1;
        }`),
    },
  ],
};
