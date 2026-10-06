import { CTX_PILA_ARRAY, CTX_PILA_ENLAZADA, entero, pilaArray, pilaEnlazada } from '../memoria/construir';
import { c } from './tema2';
import { Tema } from './tipos';

const A = CTX_PILA_ARRAY;
const E = CTX_PILA_ENLAZADA;

// Para el ejercicio de volcar una pila en otra, push y pop vienen hechos.
const A_CON_OPS = {
  ...A,
  preludio:
    A.preludio +
    `
int push(Pila *p, int x) { if (esLlena(p)) return 0; p->datos[++p->cima] = x; return 1; }
int pop(Pila *p, int *x) { if (esVacia(p)) return 0; *x = p->datos[p->cima--]; return 1; }`,
};

export const tema3: Tema = {
  id: '3',
  titulo: 'Pilas',
  resumen: 'Push y pop con array (la cima es un índice) y con enlaces (la cima es el primer nodo), con overflow y underflow.',
  ejercicios: [
    {
      id: '3-01',
      tipo: 'programar',
      titulo: 'Push del 8, a mano, con array',
      enunciado: 'La pila `p` tiene 4 y 1 (el 1 en la cima). Apila el **8** escribiendo tú las sentencias, sin llamar a `push`.',
      pistas: ['Primero sube `p->cima` y después escribe en esa casilla.'],
      ctx: A,
      casos: [{ nombre: 'Pila 4 1', inicial: [pilaArray('p', [4, 1])] }],
      observar: ['p'],
      solucion: c(`
        p->cima++;
        p->datos[p->cima] = 8;`),
    },
    {
      id: '3-02',
      tipo: 'programar',
      titulo: 'Pop a mano, con array',
      enunciado: 'Desapila la cima de `p` y guárdala en `x`, sin llamar a `pop`.',
      alResolver: 'El valor sigue escrito en el array, pero ya no es de la pila: el siguiente push lo machaca.',
      ctx: A,
      casos: [{ nombre: 'Pila 4 1 8', inicial: [pilaArray('p', [4, 1, 8]), entero('x')] }],
      observar: ['p', 'x'],
      solucion: c(`
        x = p->datos[p->cima];
        p->cima--;`),
    },
    {
      id: '3-03',
      tipo: 'programar',
      titulo: 'Escribe push con array',
      enunciado: 'Completa `push`: devuelve 0 si la pila está llena (overflow) sin tocar nada, y 1 si ha apilado. `MAX` vale 6 y tienes `esLlena(p)`.',
      ctx: A,
      casos: [
        { nombre: 'Pila vacía', inicial: [pilaArray('p', [])], llamada: 'push(p, 8)' },
        { nombre: 'Pila 4 1', inicial: [pilaArray('p', [4, 1])], llamada: 'push(p, 8)' },
        { nombre: 'Pila llena', inicial: [pilaArray('p', [4, 1, 8, 2, 6, 3])], llamada: 'push(p, 9)' },
      ],
      observar: ['p'],
      codigoInicial: c(`
        int push(Pila *p, int x)
        {

        }`),
      solucion: c(`
        int push(Pila *p, int x)
        {
            if (esLlena(p)) return 0;
            p->datos[++p->cima] = x;
            return 1;
        }`),
    },
    {
      id: '3-04',
      tipo: 'programar',
      titulo: 'Escribe pop con array',
      enunciado: 'Completa `pop`: deja la cima en `*x`, la quita y devuelve 1; si la pila está vacía (underflow), devuelve 0 sin tocar `*x`.',
      ctx: A,
      casos: [
        { nombre: 'Pila 4 1 8', inicial: [pilaArray('p', [4, 1, 8]), entero('x', 0)], llamada: 'pop(p, &x)' },
        { nombre: 'Pila vacía', inicial: [pilaArray('p', []), entero('x', 0)], llamada: 'pop(p, &x)' },
      ],
      observar: ['p', 'x'],
      codigoInicial: c(`
        int pop(Pila *p, int *x)
        {

        }`),
      solucion: c(`
        int pop(Pila *p, int *x)
        {
            if (esVacia(p)) return 0;
            *x = p->datos[p->cima--];
            return 1;
        }`),
    },
    {
      id: '3-05',
      tipo: 'programar',
      titulo: 'Push del 8, a mano, enlazada',
      enunciado: 'Ahora la pila es enlazada: `p->cima` apunta al nodo de arriba y `p->n` cuenta los elementos. Apila el **8** a mano.',
      pistas: ['Es `insertarPrincipio` del tema 2 con otro nombre.', 'No olvides `p->n`.'],
      ctx: E,
      casos: [{ nombre: 'Pila 4 1', inicial: [pilaEnlazada('p', [4, 1])] }],
      observar: ['p'],
      solucion: c(`
        Nodo *nuevo = malloc(sizeof(Nodo));
        nuevo->valor = 8;
        nuevo->siguiente = p->cima;
        p->cima = nuevo;
        p->n++;`),
    },
    {
      id: '3-06',
      tipo: 'programar',
      titulo: 'Escribe pop enlazada',
      enunciado: 'Completa `pop` de la pila enlazada: guarda la cima en `*x`, quita el nodo, libéralo y devuelve 1; con la pila vacía, devuelve 0.',
      pistas: ['Lee el dato mientras el nodo vive; después mueve la cima; y por último, free.'],
      ctx: E,
      casos: [
        { nombre: 'Pila 4 1 8', inicial: [pilaEnlazada('p', [4, 1, 8]), entero('x', 0)], llamada: 'pop(p, &x)' },
        { nombre: 'Un elemento', inicial: [pilaEnlazada('p', [4]), entero('x', 0)], llamada: 'pop(p, &x)' },
        { nombre: 'Pila vacía', inicial: [pilaEnlazada('p', []), entero('x', 0)], llamada: 'pop(p, &x)' },
      ],
      observar: ['p', 'x'],
      codigoInicial: c(`
        int pop(Pila *p, int *x)
        {

        }`),
      solucion: c(`
        int pop(Pila *p, int *x)
        {
            if (esVacia(p)) return 0;
            Nodo *v = p->cima;
            *x = v->valor;
            p->cima = v->siguiente;
            free(v);
            p->n--;
            return 1;
        }`),
    },
    {
      id: '3-07',
      tipo: 'programar',
      titulo: 'Escribe limpiar enlazada',
      enunciado: 'Completa `limpiar`: libera todos los nodos y deja la pila vacía (`cima` a NULL y `n` a 0).',
      ctx: E,
      casos: [
        { nombre: 'Pila 4 1 8', inicial: [pilaEnlazada('p', [4, 1, 8])], llamada: 'limpiar(p)' },
        { nombre: 'Pila vacía', inicial: [pilaEnlazada('p', [])], llamada: 'limpiar(p)' },
      ],
      observar: ['p'],
      codigoInicial: c(`
        void limpiar(Pila *p)
        {

        }`),
      solucion: c(`
        void limpiar(Pila *p)
        {
            while (p->cima != NULL) {
                Nodo *v = p->cima;
                p->cima = v->siguiente;
                free(v);
            }
            p->n = 0;
        }`),
    },
    {
      id: '3-08',
      tipo: 'programar',
      titulo: 'Volcar una pila en otra',
      enunciado: 'Pasa todos los elementos de `p` a `q` (que empieza vacía) usando `push` y `pop`, que ya están hechos. ¿En qué orden quedan?',
      alResolver: 'Quedan al revés: volcar una pila en otra invierte el orden. Es el truco para dar la vuelta a cualquier secuencia.',
      ctx: A_CON_OPS,
      casos: [{ nombre: 'p = 4 1 8', inicial: [pilaArray('p', [4, 1, 8]), pilaArray('q', [])] }],
      observar: ['p', 'q'],
      codigoInicial: 'int x;\n',
      solucion: c(`
        int x;
        while (!esVacia(p)) {
            pop(p, &x);
            push(q, x);
        }`),
    },
    // ------------------------------------------------------------ fallos
    {
      id: '3-F1',
      tipo: 'fallo',
      titulo: 'push que se pasa por uno',
      enunciado: 'Este `push` comprueba si la pila está llena. O eso cree.',
      ctx: A,
      casos: [
        { nombre: 'Pila 4 1', inicial: [pilaArray('p', [4, 1])], llamada: 'push(p, 8)' },
        { nombre: 'Pila llena', inicial: [pilaArray('p', [4, 1, 8, 2, 6, 3])], llamada: 'push(p, 9)' },
      ],
      observar: ['p'],
      codigo: c(`
        int push(Pila *p, int x)
        {
            if (p->cima == MAX) return 0;
            p->datos[++p->cima] = x;
            return 1;
        }`),
      lineasFallo: [3, 4],
      tiposFallo: ['array'],
      explicacion: 'Con `cima` empezando en -1, la pila está llena cuando `cima == MAX - 1`. Comparando con `MAX` se deja pasar un push más y se escribe en `datos[MAX]`, fuera del array.',
      solucion: c(`
        int push(Pila *p, int x)
        {
            if (p->cima == MAX - 1) return 0;
            p->datos[++p->cima] = x;
            return 1;
        }`),
    },
    {
      id: '3-F2',
      tipo: 'fallo',
      titulo: 'pop sin mirar si hay algo',
      enunciado: 'Este `pop` es rápido. ¿Siempre funciona?',
      ctx: A,
      casos: [
        { nombre: 'Pila 4 1 8', inicial: [pilaArray('p', [4, 1, 8]), entero('x', 0)], llamada: 'pop(p, &x)' },
        { nombre: 'Pila vacía', inicial: [pilaArray('p', []), entero('x', 0)], llamada: 'pop(p, &x)' },
      ],
      observar: ['p', 'x'],
      codigo: c(`
        int pop(Pila *p, int *x)
        {
            *x = p->datos[p->cima--];
            return 1;
        }`),
      lineasFallo: [3],
      tiposFallo: ['array', 'caso'],
      explicacion: 'Con la pila vacía `cima` vale -1 y `datos[-1]` está fuera del array: es el underflow. Falta `if (esVacia(p)) return 0;`.',
      solucion: c(`
        int pop(Pila *p, int *x)
        {
            if (esVacia(p)) return 0;
            *x = p->datos[p->cima--];
            return 1;
        }`),
    },
    {
      id: '3-F3',
      tipo: 'fallo',
      titulo: 'pop enlazada que libera antes de tiempo',
      enunciado: 'Todas las líneas de este `pop` son necesarias. El problema es otro.',
      ctx: E,
      casos: [
        { nombre: 'Pila 4 1 8', inicial: [pilaEnlazada('p', [4, 1, 8]), entero('x', 0)], llamada: 'pop(p, &x)' },
        { nombre: 'Pila vacía', inicial: [pilaEnlazada('p', []), entero('x', 0)], llamada: 'pop(p, &x)' },
      ],
      observar: ['p', 'x'],
      codigo: c(`
        int pop(Pila *p, int *x)
        {
            if (esVacia(p)) return 0;
            Nodo *v = p->cima;
            *x = v->valor;
            free(v);
            p->cima = v->siguiente;
            p->n--;
            return 1;
        }`),
      lineasFallo: [6, 7],
      tiposFallo: ['liberado'],
      explicacion: 'Tras `free(v)`, leer `v->siguiente` es usar memoria liberada. Primero se mueve la cima y después se libera.',
      solucion: c(`
        int pop(Pila *p, int *x)
        {
            if (esVacia(p)) return 0;
            Nodo *v = p->cima;
            *x = v->valor;
            p->cima = v->siguiente;
            free(v);
            p->n--;
            return 1;
        }`),
    },
    {
      id: '3-F4',
      tipo: 'fallo',
      titulo: 'push enlazada que se apunta a sí mismo',
      enunciado: 'El mismo error que un `insertarPrincipio` del tema 2. Encuéntralo aquí.',
      ctx: E,
      casos: [
        { nombre: 'Pila vacía', inicial: [pilaEnlazada('p', [])], llamada: 'push(p, 8)' },
        { nombre: 'Pila 4 1', inicial: [pilaEnlazada('p', [4, 1])], llamada: 'push(p, 8)' },
      ],
      observar: ['p'],
      codigo: c(`
        int push(Pila *p, int x)
        {
            Nodo *nuevo = malloc(sizeof(Nodo));
            nuevo->valor = x;
            p->cima = nuevo;
            nuevo->siguiente = p->cima;
            p->n++;
            return 1;
        }`),
      lineasFallo: [5, 6],
      tiposFallo: ['pierde', 'fuga'],
      explicacion: 'Al mover la cima primero, el nuevo nodo se apunta a sí mismo y el resto de la pila se pierde.',
      solucion: c(`
        int push(Pila *p, int x)
        {
            Nodo *nuevo = malloc(sizeof(Nodo));
            nuevo->valor = x;
            nuevo->siguiente = p->cima;
            p->cima = nuevo;
            p->n++;
            return 1;
        }`),
    },
    {
      id: '3-F5',
      tipo: 'fallo',
      titulo: 'limpiar de una línea',
      enunciado: 'Después de este `limpiar` la pila parece vacía. Parece.',
      ctx: E,
      casos: [
        { nombre: 'Pila vacía', inicial: [pilaEnlazada('p', [])], llamada: 'limpiar(p)' },
        { nombre: 'Pila 4 1 8', inicial: [pilaEnlazada('p', [4, 1, 8])], llamada: 'limpiar(p)' },
      ],
      observar: ['p'],
      codigo: c(`
        void limpiar(Pila *p)
        {
            p->cima = NULL;
            p->n = 0;
        }`),
      lineasFallo: [3],
      tiposFallo: ['fuga'],
      explicacion: 'Poner la cima a NULL no libera los nodos: se quedan reservados y nadie los apunta. En la pila con array esto sí valía, porque no hay nada que liberar.',
      solucion: c(`
        void limpiar(Pila *p)
        {
            while (p->cima != NULL) {
                Nodo *v = p->cima;
                p->cima = v->siguiente;
                free(v);
            }
            p->n = 0;
        }`),
    },
  ],
};
