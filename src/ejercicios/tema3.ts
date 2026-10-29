import { CTX_PILA_ARRAY, CTX_PILA_ENLAZADA, entero, pilaArray, pilaEnlazada, TAM_PILA_EJERCICIOS } from '../memoria/construir';
import { c } from './tema2';
import { Tema } from './tipos';

// Los structs y las funciones son los del proyecto Pilas: en cada ejercicio están todas
// disponibles, salvo la que se pide escribir (la del alumno la sustituye).
const A = CTX_PILA_ARRAY;
const E = CTX_PILA_ENLAZADA;
const LLENA = [4, 1, 8, 2, 6, 3, 7, 5];

export const tema3: Tema = {
  id: '3',
  titulo: 'Pilas',
  resumen: `Push y pop con array (la cima es un índice) y con enlaces (la cima es el primer nodo), con overflow y underflow. Los structs y las funciones de PilaArray.c y PilaEnlazada.c, con TAM ${TAM_PILA_EJERCICIOS}.`,
  ejercicios: [
    {
      id: '3-01',
      tipo: 'programar',
      titulo: 'Push del 8, a mano, con array',
      enunciado: 'La pila `pila` tiene 4 y 1 (el 1 en la cima). Apila el **8** escribiendo tú las sentencias, sin llamar a `pushArray`.',
      pistas: ['Primero sube `pila->cima` y después escribe en esa casilla de `pila->array`.'],
      ctx: A,
      casos: [{ nombre: 'Pila 4 1', inicial: [pilaArray('pila', [4, 1])] }],
      observar: ['pila'],
      prohibidos: ['pushArray()'],
      solucion: c(`
        pila->cima++;
        pila->array[pila->cima] = 8;`),
    },
    {
      id: '3-02',
      tipo: 'programar',
      titulo: 'Pop a mano, con array',
      enunciado: 'Desapila la cima de `pila` y guárdala en `valor`, sin llamar a `popArray`.',
      alResolver: 'El valor sigue escrito en el array, pero ya no es de la pila: el siguiente push lo machaca.',
      ctx: A,
      casos: [{ nombre: 'Pila 4 1 8', inicial: [pilaArray('pila', [4, 1, 8]), entero('valor')] }],
      observar: ['pila', 'valor'],
      prohibidos: ['popArray()'],
      solucion: c(`
        valor = pila->array[pila->cima];
        pila->cima--;`),
    },
    {
      id: '3-03',
      tipo: 'programar',
      titulo: 'Escribe pushArray',
      enunciado: `Completa \`pushArray\`: devuelve 0 si la pila no existe o está llena (overflow) sin tocar nada, y 1 si ha apilado. Aquí \`TAM\` vale ${TAM_PILA_EJERCICIOS} y tienes \`esLLenaArray(pila)\`.`,
      ctx: A,
      casos: [
        { nombre: 'Pila vacía', inicial: [pilaArray('pila', [])], llamada: 'pushArray(pila, 8)' },
        { nombre: 'Pila 4 1', inicial: [pilaArray('pila', [4, 1])], llamada: 'pushArray(pila, 8)' },
        { nombre: 'Pila llena', inicial: [pilaArray('pila', LLENA)], llamada: 'pushArray(pila, 9)' },
      ],
      observar: ['pila'],
      codigoInicial: c(`
        int pushArray(PilaArray *pila, int valor) {

        }`),
      solucion: c(`
        int pushArray(PilaArray *pila, int valor) {
            if (pila == NULL || esLLenaArray(pila)) { return 0; }
            pila->cima++;
            pila->array[pila->cima] = valor;
            return 1;
        }`),
    },
    {
      id: '3-04',
      tipo: 'programar',
      titulo: 'Escribe popArray',
      enunciado: 'Completa `popArray`: deja la cima en `*valor`, la quita y devuelve 1; si la pila está vacía (underflow), devuelve 0 sin tocar `*valor`. Tienes `esVaciaArray(pila)`.',
      ctx: A,
      casos: [
        { nombre: 'Pila 4 1 8', inicial: [pilaArray('pila', [4, 1, 8]), entero('valor', 0)], llamada: 'popArray(pila, &valor)' },
        { nombre: 'Pila vacía', inicial: [pilaArray('pila', []), entero('valor', 0)], llamada: 'popArray(pila, &valor)' },
      ],
      observar: ['pila', 'valor'],
      codigoInicial: c(`
        int popArray(PilaArray *pila, int *valor) {

        }`),
      solucion: c(`
        int popArray(PilaArray *pila, int *valor) {
            if (esVaciaArray(pila)) { return 0; }
            if (valor != NULL) { *valor = pila->array[pila->cima]; }
            pila->cima--;
            return 1;
        }`),
    },
    {
      id: '3-05',
      tipo: 'programar',
      titulo: 'Push del 8, a mano, enlazada',
      enunciado: 'Ahora la pila es enlazada: `pila->cima` apunta al nodo de arriba y `pila->tamano` cuenta los elementos. Apila el **8** a mano, sin llamar a `pushEnlazada`.',
      pistas: ['Es `insertarPrincipio` del tema 2 con otro nombre.', 'No olvides `pila->tamano`.'],
      ctx: E,
      casos: [{ nombre: 'Pila 4 1', inicial: [pilaEnlazada('pila', [4, 1])] }],
      observar: ['pila'],
      prohibidos: ['pushEnlazada()'],
      solucion: c(`
        Nodo *nuevo = malloc(sizeof(Nodo));
        nuevo->valor = 8;
        nuevo->siguiente = pila->cima;
        pila->cima = nuevo;
        pila->tamano++;`),
    },
    {
      id: '3-06',
      tipo: 'programar',
      titulo: 'Escribe popEnlazada',
      enunciado: 'Completa `popEnlazada`: guarda la cima en `*valor`, quita el nodo, libéralo y devuelve 1; con la pila vacía, devuelve 0. Tienes `esVaciaEnlazada(pila)`.',
      pistas: ['Lee el valor mientras el nodo vive; después mueve la cima; y por último, free.'],
      ctx: E,
      casos: [
        { nombre: 'Pila 4 1 8', inicial: [pilaEnlazada('pila', [4, 1, 8]), entero('valor', 0)], llamada: 'popEnlazada(pila, &valor)' },
        { nombre: 'Un elemento', inicial: [pilaEnlazada('pila', [4]), entero('valor', 0)], llamada: 'popEnlazada(pila, &valor)' },
        { nombre: 'Pila vacía', inicial: [pilaEnlazada('pila', []), entero('valor', 0)], llamada: 'popEnlazada(pila, &valor)' },
      ],
      observar: ['pila', 'valor'],
      codigoInicial: c(`
        int popEnlazada(PilaEnlazada *pila, int *valor) {

        }`),
      solucion: c(`
        int popEnlazada(PilaEnlazada *pila, int *valor) {
            if (esVaciaEnlazada(pila)) { return 0; }
            Nodo *borrar = pila->cima;
            if (valor != NULL) { *valor = borrar->valor; }
            pila->cima = borrar->siguiente;
            free(borrar);
            pila->tamano--;
            return 1;
        }`),
    },
    {
      id: '3-07',
      tipo: 'programar',
      titulo: 'Escribe limpiarEnlazada',
      enunciado: 'Completa `limpiarEnlazada`: libera todos los nodos, deja la pila vacía (`cima` a NULL y `tamano` a 0) y devuelve 1; si la pila no existe, devuelve 0. Puedes usar `popEnlazada`, que acepta NULL en lugar de `&valor`.',
      ctx: E,
      casos: [
        { nombre: 'Pila 4 1 8', inicial: [pilaEnlazada('pila', [4, 1, 8])], llamada: 'limpiarEnlazada(pila)' },
        { nombre: 'Pila vacía', inicial: [pilaEnlazada('pila', [])], llamada: 'limpiarEnlazada(pila)' },
      ],
      observar: ['pila'],
      codigoInicial: c(`
        int limpiarEnlazada(PilaEnlazada *pila) {

        }`),
      solucion: c(`
        int limpiarEnlazada(PilaEnlazada *pila) {
            if (pila == NULL) { return 0; }
            while (popEnlazada(pila, NULL)) {}
            return 1;
        }`),
    },
    {
      id: '3-08',
      tipo: 'programar',
      titulo: 'Volcar una pila en otra',
      enunciado: 'Pasa todos los elementos de `pila` a `pila2` (que empieza vacía) usando `popArray` y `pushArray`. ¿En qué orden quedan?',
      alResolver: 'Quedan al revés: volcar una pila en otra invierte el orden. Es lo que hace `imprimirPilaArray` para recorrer la pila sin tocar sus tripas, y después la vuelca otra vez para dejarla como estaba.',
      ctx: A,
      casos: [{ nombre: 'pila = 4 1 8', inicial: [pilaArray('pila', [4, 1, 8]), pilaArray('pila2', [])] }],
      observar: ['pila', 'pila2'],
      codigoInicial: 'int aux = 0;\n',
      solucion: c(`
        int aux = 0;
        while (!esVaciaArray(pila)) {
            popArray(pila, &aux);
            pushArray(pila2, aux);
        }`),
    },
    {
      id: '3-09',
      tipo: 'programar',
      titulo: 'Pop a mano, enlazada',
      enunciado: 'Desapila la cima de la pila enlazada, guárdala en `valor` y libera su nodo, sin llamar a `popEnlazada`.',
      pistas: ['Guarda un puntero al nodo de arriba antes de mover la cima: si no, ya no podrás liberarlo.'],
      ctx: E,
      casos: [{ nombre: 'Pila 4 1 8', inicial: [pilaEnlazada('pila', [4, 1, 8]), entero('valor', 0)] }],
      observar: ['pila', 'valor'],
      prohibidos: ['popEnlazada()', 'limpiarEnlazada()'],
      solucion: c(`
        Nodo *borrar = pila->cima;
        valor = borrar->valor;
        pila->cima = borrar->siguiente;
        free(borrar);
        pila->tamano--;`),
    },
    {
      id: '3-10',
      tipo: 'programar',
      titulo: 'Duplicar la cima',
      enunciado: 'Deja la pila `4 1 8` como `4 1 8 8`: consulta la cima con `cimaArray` y vuelve a apilarla con `pushArray`.',
      alResolver: '`cimaArray` mira la cima sin quitarla. Con `popArray` habría que volver a apilarla dos veces.',
      ctx: A,
      casos: [{ nombre: 'Pila 4 1 8', inicial: [pilaArray('pila', [4, 1, 8])] }],
      observar: ['pila'],
      prohibidos: ['array', 'cima'],
      solucion: c(`
        int aux = 0;
        cimaArray(pila, &aux);
        pushArray(pila, aux);`),
    },
    {
      id: '3-11',
      tipo: 'programar',
      titulo: 'Escribe cimaArray',
      enunciado: 'Completa `cimaArray`: deja la cima en `*valor` **sin quitarla** y devuelve 1; si la pila está vacía o `valor` es NULL, devuelve 0 sin tocar nada.',
      ctx: A,
      casos: [
        { nombre: 'Pila 4 1 8', inicial: [pilaArray('pila', [4, 1, 8]), entero('valor', 0)], llamada: 'cimaArray(pila, &valor)' },
        { nombre: 'Pila vacía', inicial: [pilaArray('pila', []), entero('valor', 0)], llamada: 'cimaArray(pila, &valor)' },
      ],
      observar: ['pila', 'valor'],
      codigoInicial: c(`
        int cimaArray(PilaArray *pila, int *valor) {

        }`),
      solucion: c(`
        int cimaArray(PilaArray *pila, int *valor) {
            if (esVaciaArray(pila) || valor == NULL) { return 0; }
            *valor = pila->array[pila->cima];
            return 1;
        }`),
    },
    {
      id: '3-12',
      tipo: 'programar',
      titulo: 'Escribe sumaArray',
      enunciado: 'Completa `sumaArray`: devuelve la suma de los elementos de la pila, sin cambiarla. Con la pila vacía, 0.',
      pistas: ['Los elementos están de `array[0]` a `array[cima]`, los dos incluidos.'],
      ctx: A,
      casos: [
        { nombre: 'Pila 4 1 8', inicial: [pilaArray('pila', [4, 1, 8])], llamada: 'sumaArray(pila)' },
        { nombre: 'Pila vacía, con restos', inicial: [pilaArray('pila', [], [5, 5])], llamada: 'sumaArray(pila)' },
        { nombre: 'Pila llena', inicial: [pilaArray('pila', LLENA)], llamada: 'sumaArray(pila)' },
      ],
      observar: ['pila'],
      codigoInicial: c(`
        int sumaArray(PilaArray *pila) {

        }`),
      solucion: c(`
        int sumaArray(PilaArray *pila) {
            int suma = 0;
            for (int i = 0; i <= pila->cima; i++)
                suma += pila->array[i];
            return suma;
        }`),
    },
    {
      id: '3-13',
      tipo: 'programar',
      titulo: 'Escribe cimaEnlazada',
      enunciado: 'Completa `cimaEnlazada`: deja el valor de la cima en `*valor` **sin quitarla** y devuelve 1; con la pila vacía o `valor` a NULL, devuelve 0 sin tocar nada.',
      ctx: E,
      casos: [
        { nombre: 'Pila 4 1 8', inicial: [pilaEnlazada('pila', [4, 1, 8]), entero('valor', 0)], llamada: 'cimaEnlazada(pila, &valor)' },
        { nombre: 'Pila vacía', inicial: [pilaEnlazada('pila', []), entero('valor', 0)], llamada: 'cimaEnlazada(pila, &valor)' },
      ],
      observar: ['pila', 'valor'],
      codigoInicial: c(`
        int cimaEnlazada(PilaEnlazada *pila, int *valor) {

        }`),
      solucion: c(`
        int cimaEnlazada(PilaEnlazada *pila, int *valor) {
            if (esVaciaEnlazada(pila) || valor == NULL) { return 0; }
            *valor = pila->cima->valor;
            return 1;
        }`),
    },
    // ------------------------------------------------------------ fallos
    {
      id: '3-F1',
      tipo: 'fallo',
      titulo: 'pushArray que se pasa por uno',
      enunciado: 'Este `pushArray` comprueba si la pila está llena. O eso cree.',
      ctx: A,
      casos: [
        { nombre: 'Pila 4 1', inicial: [pilaArray('pila', [4, 1])], llamada: 'pushArray(pila, 8)' },
        { nombre: 'Pila llena', inicial: [pilaArray('pila', LLENA)], llamada: 'pushArray(pila, 9)' },
      ],
      observar: ['pila'],
      codigo: c(`
        int pushArray(PilaArray *pila, int valor) {
            if (pila == NULL || pila->cima == TAM) { return 0; }
            pila->cima++;
            pila->array[pila->cima] = valor;
            return 1;
        }`),
      lineasFallo: [2, 4],
      tiposFallo: ['array'],
      explicacion: 'Con `cima` empezando en -1, la pila está llena cuando `cima == TAM - 1`, que es lo que mira `esLLenaArray`. Comparando con `TAM` se deja pasar un push más y se escribe en `array[TAM]`, fuera del array.',
      solucion: c(`
        int pushArray(PilaArray *pila, int valor) {
            if (pila == NULL || esLLenaArray(pila)) { return 0; }
            pila->cima++;
            pila->array[pila->cima] = valor;
            return 1;
        }`),
    },
    {
      id: '3-F2',
      tipo: 'fallo',
      titulo: 'popArray sin mirar si hay algo',
      enunciado: 'Este `popArray` es rápido. ¿Siempre funciona?',
      ctx: A,
      casos: [
        { nombre: 'Pila 4 1 8', inicial: [pilaArray('pila', [4, 1, 8]), entero('valor', 0)], llamada: 'popArray(pila, &valor)' },
        { nombre: 'Pila vacía', inicial: [pilaArray('pila', []), entero('valor', 0)], llamada: 'popArray(pila, &valor)' },
      ],
      observar: ['pila', 'valor'],
      codigo: c(`
        int popArray(PilaArray *pila, int *valor) {
            if (valor != NULL) { *valor = pila->array[pila->cima]; }
            pila->cima--;
            return 1;
        }`),
      lineasFallo: [2],
      tiposFallo: ['array', 'caso'],
      explicacion: 'Con la pila vacía `cima` vale -1 y `array[-1]` está fuera del array: es el underflow. Falta `if (esVaciaArray(pila)) { return 0; }`.',
      solucion: c(`
        int popArray(PilaArray *pila, int *valor) {
            if (esVaciaArray(pila)) { return 0; }
            if (valor != NULL) { *valor = pila->array[pila->cima]; }
            pila->cima--;
            return 1;
        }`),
    },
    {
      id: '3-F3',
      tipo: 'fallo',
      titulo: 'popEnlazada que libera antes de tiempo',
      enunciado: 'Todas las líneas de este `popEnlazada` son necesarias. El problema es otro.',
      ctx: E,
      casos: [
        { nombre: 'Pila 4 1 8', inicial: [pilaEnlazada('pila', [4, 1, 8]), entero('valor', 0)], llamada: 'popEnlazada(pila, &valor)' },
        { nombre: 'Pila vacía', inicial: [pilaEnlazada('pila', []), entero('valor', 0)], llamada: 'popEnlazada(pila, &valor)' },
      ],
      observar: ['pila', 'valor'],
      codigo: c(`
        int popEnlazada(PilaEnlazada *pila, int *valor) {
            if (esVaciaEnlazada(pila)) { return 0; }
            Nodo *borrar = pila->cima;
            if (valor != NULL) { *valor = borrar->valor; }
            free(borrar);
            pila->cima = borrar->siguiente;
            pila->tamano--;
            return 1;
        }`),
      lineasFallo: [5, 6],
      tiposFallo: ['liberado'],
      explicacion: 'Tras `free(borrar)`, leer `borrar->siguiente` es usar memoria liberada. Primero se mueve la cima y después se libera.',
      solucion: c(`
        int popEnlazada(PilaEnlazada *pila, int *valor) {
            if (esVaciaEnlazada(pila)) { return 0; }
            Nodo *borrar = pila->cima;
            if (valor != NULL) { *valor = borrar->valor; }
            pila->cima = borrar->siguiente;
            free(borrar);
            pila->tamano--;
            return 1;
        }`),
    },
    {
      id: '3-F4',
      tipo: 'fallo',
      titulo: 'pushEnlazada que se apunta a sí mismo',
      enunciado: 'El mismo error que un `insertarPrincipio` del tema 2. Encuéntralo aquí.',
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
            pila->cima = nuevo;
            nuevo->siguiente = pila->cima;
            pila->tamano++;
            return 1;
        }`),
      lineasFallo: [6, 7],
      tiposFallo: ['pierde', 'fuga'],
      explicacion: 'Al mover la cima primero, el nuevo nodo se apunta a sí mismo y el resto de la pila se pierde.',
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
      id: '3-F5',
      tipo: 'fallo',
      titulo: 'limpiarEnlazada de una línea',
      enunciado: 'Después de este `limpiarEnlazada` la pila parece vacía. Parece.',
      ctx: E,
      casos: [
        { nombre: 'Pila vacía', inicial: [pilaEnlazada('pila', [])], llamada: 'limpiarEnlazada(pila)' },
        { nombre: 'Pila 4 1 8', inicial: [pilaEnlazada('pila', [4, 1, 8])], llamada: 'limpiarEnlazada(pila)' },
      ],
      observar: ['pila'],
      codigo: c(`
        int limpiarEnlazada(PilaEnlazada *pila) {
            if (pila == NULL) { return 0; }
            pila->cima = NULL;
            pila->tamano = 0;
            return 1;
        }`),
      lineasFallo: [3],
      tiposFallo: ['fuga'],
      explicacion: 'Poner la cima a NULL no libera los nodos: se quedan reservados y nadie los apunta. En `limpiarArray` esto sí vale, porque no hay nada que liberar.',
      solucion: c(`
        int limpiarEnlazada(PilaEnlazada *pila) {
            if (pila == NULL) { return 0; }
            while (popEnlazada(pila, NULL)) {}
            return 1;
        }`),
    },
    {
      id: '3-F6',
      tipo: 'fallo',
      titulo: 'cimaArray que no mira si hay algo',
      enunciado: 'Este `cimaArray` comprueba `valor`, pero se le olvida otra cosa.',
      ctx: A,
      casos: [
        { nombre: 'Pila 4 1 8', inicial: [pilaArray('pila', [4, 1, 8]), entero('valor', 0)], llamada: 'cimaArray(pila, &valor)' },
        { nombre: 'Pila vacía', inicial: [pilaArray('pila', []), entero('valor', 0)], llamada: 'cimaArray(pila, &valor)' },
      ],
      observar: ['pila', 'valor'],
      codigo: c(`
        int cimaArray(PilaArray *pila, int *valor) {
            if (valor == NULL) { return 0; }
            *valor = pila->array[pila->cima];
            return 1;
        }`),
      lineasFallo: [2, 3],
      tiposFallo: ['array', 'caso'],
      explicacion: 'Con la pila vacía `cima` vale -1 y `array[-1]` está fuera del array. Falta mirar `esVaciaArray(pila)` antes de leer, como en `popArray`.',
      solucion: c(`
        int cimaArray(PilaArray *pila, int *valor) {
            if (esVaciaArray(pila) || valor == NULL) { return 0; }
            *valor = pila->array[pila->cima];
            return 1;
        }`),
    },
    {
      id: '3-F7',
      tipo: 'fallo',
      titulo: 'pushArray que escribe antes de subir',
      enunciado: 'Este `pushArray` tiene las líneas justas. Pruébalo con la pila vacía y con elementos.',
      ctx: A,
      casos: [
        { nombre: 'Pila 4 1', inicial: [pilaArray('pila', [4, 1])], llamada: 'pushArray(pila, 8)' },
        { nombre: 'Pila vacía', inicial: [pilaArray('pila', [])], llamada: 'pushArray(pila, 8)' },
      ],
      observar: ['pila'],
      codigo: c(`
        int pushArray(PilaArray *pila, int valor) {
            if (pila == NULL || esLLenaArray(pila)) { return 0; }
            pila->array[pila->cima] = valor;
            pila->cima++;
            return 1;
        }`),
      lineasFallo: [3, 4],
      tiposFallo: ['array'],
      explicacion: '`cima` apunta al último elemento, no al primer hueco. Escribiendo antes de subir se machaca la cima (el 1 pasa a 8 y la nueva casilla se queda sin valor) y, con la pila vacía, se escribe en `array[-1]`. Primero `cima++` y después se escribe.',
      solucion: c(`
        int pushArray(PilaArray *pila, int valor) {
            if (pila == NULL || esLLenaArray(pila)) { return 0; }
            pila->cima++;
            pila->array[pila->cima] = valor;
            return 1;
        }`),
    },
    {
      id: '3-F8',
      tipo: 'fallo',
      titulo: 'popArray que baja antes de leer',
      enunciado: 'Este `popArray` devuelve 1 y baja la cima. ¿Devuelve el valor que toca?',
      ctx: A,
      casos: [
        { nombre: 'Pila 4 1 8', inicial: [pilaArray('pila', [4, 1, 8]), entero('valor', 0)], llamada: 'popArray(pila, &valor)' },
        { nombre: 'Un elemento', inicial: [pilaArray('pila', [4]), entero('valor', 0)], llamada: 'popArray(pila, &valor)' },
      ],
      observar: ['pila', 'valor'],
      codigo: c(`
        int popArray(PilaArray *pila, int *valor) {
            if (esVaciaArray(pila)) { return 0; }
            pila->cima--;
            if (valor != NULL) { *valor = pila->array[pila->cima]; }
            return 1;
        }`),
      lineasFallo: [3, 4],
      tiposFallo: ['array'],
      explicacion: 'Al bajar la cima antes de leer, se lee el que hay debajo de la cima (el 1 en lugar del 8) y, con un solo elemento, `array[-1]`. Primero se lee y después se baja.',
      solucion: c(`
        int popArray(PilaArray *pila, int *valor) {
            if (esVaciaArray(pila)) { return 0; }
            if (valor != NULL) { *valor = pila->array[pila->cima]; }
            pila->cima--;
            return 1;
        }`),
    },
    {
      id: '3-F9',
      tipo: 'fallo',
      titulo: 'popEnlazada que se deja algo',
      enunciado: 'La pila queda bien después de este `popEnlazada`. La memoria, no tanto.',
      ctx: E,
      casos: [
        { nombre: 'Pila vacía', inicial: [pilaEnlazada('pila', []), entero('valor', 0)], llamada: 'popEnlazada(pila, &valor)' },
        { nombre: 'Pila 4 1 8', inicial: [pilaEnlazada('pila', [4, 1, 8]), entero('valor', 0)], llamada: 'popEnlazada(pila, &valor)' },
      ],
      observar: ['pila', 'valor'],
      codigo: c(`
        int popEnlazada(PilaEnlazada *pila, int *valor) {
            if (esVaciaEnlazada(pila)) { return 0; }
            Nodo *borrar = pila->cima;
            if (valor != NULL) { *valor = borrar->valor; }
            pila->cima = borrar->siguiente;
            pila->tamano--;
            return 1;
        }`),
      lineasFallo: [5, 6],
      preguntaLinea: 'Marca la línea después de la que falta algo',
      tiposFallo: ['fuga'],
      explicacion: 'Falta `free(borrar);` después de mover la cima. `borrar` es una variable local: al salir de la función nadie apunta al nodo y ya no se puede liberar nunca.',
      solucion: c(`
        int popEnlazada(PilaEnlazada *pila, int *valor) {
            if (esVaciaEnlazada(pila)) { return 0; }
            Nodo *borrar = pila->cima;
            if (valor != NULL) { *valor = borrar->valor; }
            pila->cima = borrar->siguiente;
            free(borrar);
            pila->tamano--;
            return 1;
        }`),
    },
    {
      id: '3-F10',
      tipo: 'fallo',
      titulo: 'sumaArray que se deja la cima',
      enunciado: 'Con la pila vacía este `sumaArray` acierta. Con elementos, no.',
      ctx: A,
      casos: [
        { nombre: 'Pila vacía', inicial: [pilaArray('pila', [])], llamada: 'sumaArray(pila)' },
        { nombre: 'Pila 4 1 8', inicial: [pilaArray('pila', [4, 1, 8])], llamada: 'sumaArray(pila)' },
      ],
      observar: ['pila'],
      codigo: c(`
        int sumaArray(PilaArray *pila) {
            int suma = 0;
            for (int i = 0; i < pila->cima; i++)
                suma += pila->array[i];
            return suma;
        }`),
      lineasFallo: [3],
      tiposFallo: ['caso'],
      explicacion: '`cima` es el índice del último elemento, no cuántos hay: con `i < pila->cima` se queda fuera la cima (suma 5 en lugar de 13). Tiene que ser `i <= pila->cima`.',
      solucion: c(`
        int sumaArray(PilaArray *pila) {
            int suma = 0;
            for (int i = 0; i <= pila->cima; i++)
                suma += pila->array[i];
            return suma;
        }`),
    },
    // ------------------------------------------------------------ misteriosas
    {
      id: '3-M1',
      tipo: 'misterio',
      titulo: 'Qué sale de la pila',
      enunciado: 'Del cuadernillo a papel. La pila empieza vacía. Sigue las sentencias y predice cuánto vale `x` y cómo queda la pila al terminar.',
      ctx: A,
      casos: [{ nombre: 'Pila vacía', inicial: [pilaArray('pila', [])] }],
      observar: ['pila', 'x'],
      responder: ['x', 'pila'],
      solucion: c(`
        int x = 0;
        pushArray(pila, 1);
        pushArray(pila, 2);
        pushArray(pila, 3);
        popArray(pila, &x);
        pushArray(pila, x * 10);
        popArray(pila, &x);
        popArray(pila, &x);`),
      preguntaOpciones: '¿Qué valores han salido de la pila, en orden?',
      opciones: ['3, 30 y 2.', '1, 2 y 3.', '3, 2 y 1.', '30, 3 y 2.'],
      correcta: 0,
      explicacion: 'Sale el 3 (la cima), entra 30 encima del 2, sale el 30 y después el 2. Queda solo el 1, el primero que entró: es el último en salir.',
    },
    {
      id: '3-M2',
      tipo: 'misterio',
      titulo: 'Volcar y volver',
      enunciado: 'Predice qué devuelve y cómo queda la pila (del fondo a la cima) en cada caso. Después di qué hace.',
      ctx: A,
      casos: [
        { nombre: 'Pila 4 1 8', inicial: [pilaArray('pila', [4, 1, 8])], llamada: 'misterio(pila)' },
        { nombre: 'Pila 9 2', inicial: [pilaArray('pila', [9, 2])], llamada: 'misterio(pila)' },
        { nombre: 'Pila vacía', inicial: [pilaArray('pila', [])], llamada: 'misterio(pila)' },
      ],
      observar: ['pila'],
      responder: ['devuelve', 'pila'],
      solucion: c(`
        int misterio(PilaArray *pila) {
            PilaArray *aux = CrearPilaArray();
            int x = 0;
            int m = 0;
            while (popArray(pila, &x)) {
                if (x > m) m = x;
                pushArray(aux, x);
            }
            while (popArray(aux, &x)) pushArray(pila, x);
            destruirPilaArray(aux);
            return m;
        }`),
      opciones: ['Devuelve el mayor y deja la pila como estaba.', 'Devuelve el mayor y deja la pila vacía.', 'Devuelve el mayor y deja la pila al revés.', 'Devuelve la cima y deja la pila como estaba.'],
      correcta: 0,
      explicacion: 'El primer bucle vuelca la pila en `aux` (al revés) mirando el máximo; el segundo la vuelca otra vez, y dos vuelcos la dejan como estaba. Es la forma de recorrer una pila usando solo su interfaz. Con todos negativos devolvería 0, que no está: `m` debería empezar con el primero.',
    },
    {
      id: '3-M3',
      tipo: 'misterio',
      titulo: 'Hasta abajo',
      enunciado: 'Predice qué devuelve en cada caso. La pila se escribe del fondo a la cima.',
      ctx: E,
      casos: [
        { nombre: 'Pila 4 1 8', inicial: [pilaEnlazada('pila', [4, 1, 8])], llamada: 'misterio(pila)' },
        { nombre: 'Pila 7', inicial: [pilaEnlazada('pila', [7])], llamada: 'misterio(pila)' },
        { nombre: 'Pila vacía', inicial: [pilaEnlazada('pila', [])], llamada: 'misterio(pila)' },
      ],
      observar: ['pila'],
      responder: ['devuelve'],
      solucion: c(`
        int misterio(PilaEnlazada *pila) {
            Nodo *p = pila->cima;
            if (p == NULL) return -1;
            while (p->siguiente != NULL)
                p = p->siguiente;
            return p->valor;
        }`),
      opciones: ['Devuelve el del fondo (el primero que se apiló), o -1 si está vacía.', 'Devuelve la cima, o -1 si está vacía.', 'Devuelve cuántos elementos hay.', 'Devuelve el último que se apiló.'],
      correcta: 0,
      explicacion: 'En la pila enlazada la cima es el primer nodo y los enlaces bajan hacia el fondo: el último nodo de la cadena es el primero que entró. Llegar a él cuesta recorrer toda la pila, por eso una pila no lo ofrece.',
    },
    {
      id: '3-M4',
      tipo: 'misterio',
      titulo: 'Contando como la cima',
      enunciado: 'Predice qué devuelve en cada caso. La pila se escribe del fondo a la cima.',
      ctx: A,
      casos: [
        { nombre: 'Pila 4 8 1 8', inicial: [pilaArray('pila', [4, 8, 1, 8])], llamada: 'misterio(pila)' },
        { nombre: 'Pila 4 1 8', inicial: [pilaArray('pila', [4, 1, 8])], llamada: 'misterio(pila)' },
        { nombre: 'Pila vacía', inicial: [pilaArray('pila', [])], llamada: 'misterio(pila)' },
      ],
      observar: ['pila'],
      responder: ['devuelve'],
      solucion: c(`
        int misterio(PilaArray *pila) {
            if (esVaciaArray(pila)) { return 0; }
            int n = 0;
            for (int i = 0; i <= pila->cima; i++)
                if (pila->array[i] == pila->array[pila->cima]) n++;
            return n;
        }`),
      opciones: ['Cuenta cuántas veces está en la pila el valor de la cima (contando la propia cima).', 'Devuelve cuántos elementos hay.', 'Cuenta cuántos valores hay repetidos.', 'Devuelve la posición de la cima.'],
      correcta: 0,
      explicacion: 'Recorre el array de 0 a `cima` comparando con `array[cima]`. La cima se cuenta a sí misma, así que con la pila no vacía devuelve al menos 1.',
    },
    {
      id: '3-M5',
      tipo: 'misterio',
      titulo: 'Dos pop y dos push',
      enunciado: 'Predice cómo queda la pila (del fondo a la cima) en cada caso. Fíjate bien en el caso de un solo elemento.',
      ctx: A,
      casos: [
        { nombre: 'Pila 4 1 8', inicial: [pilaArray('pila', [4, 1, 8])], llamada: 'misterio(pila)' },
        { nombre: 'Pila 7', inicial: [pilaArray('pila', [7])], llamada: 'misterio(pila)' },
        { nombre: 'Pila vacía', inicial: [pilaArray('pila', [])], llamada: 'misterio(pila)' },
      ],
      observar: ['pila'],
      responder: ['pila'],
      solucion: c(`
        void misterio(PilaArray *pila) {
            int a = 0;
            int b = 0;
            if (popArray(pila, &a) && popArray(pila, &b)) {
                pushArray(pila, a);
                pushArray(pila, b);
            }
        }`),
      opciones: [
        'Intercambia los dos de arriba; si solo hay uno, lo pierde.',
        'Intercambia los dos de arriba; si solo hay uno, no hace nada.',
        'Deja la pila como estaba.',
        'Quita los dos de arriba.',
      ],
      correcta: 0,
      explicacion: 'Saca la cima (a) y la de debajo (b) y las mete en orden contrario, así que se intercambian. Pero con un elemento el primer `popArray` funciona, el segundo no, y el `if` no vuelve a meter `a`: se pierde. Habría que mirar antes que hay al menos dos (`tamanoArray(pila) >= 2`).',
    },
    {
      id: '3-M6',
      tipo: 'misterio',
      titulo: 'Buscando en una pila',
      enunciado: 'Predice qué devuelve y cómo queda la pila (del fondo a la cima) en cada caso. Después di qué hace.',
      ctx: E,
      casos: [
        { nombre: 'Pila 4 1 8, x = 1', inicial: [pilaEnlazada('pila', [4, 1, 8])], llamada: 'misterio(pila, 1)' },
        { nombre: 'Pila 4 1 8, x = 8', inicial: [pilaEnlazada('pila', [4, 1, 8])], llamada: 'misterio(pila, 8)' },
        { nombre: 'Pila 4 1 8, x = 5', inicial: [pilaEnlazada('pila', [4, 1, 8])], llamada: 'misterio(pila, 5)' },
      ],
      observar: ['pila'],
      responder: ['devuelve', 'pila'],
      solucion: c(`
        int misterio(PilaEnlazada *pila, int x) {
            int n = 0;
            int v = 0;
            while (popEnlazada(pila, &v)) {
                n++;
                if (v == x) return n;
            }
            return -1;
        }`),
      opciones: [
        'Desapila hasta sacar `x` y devuelve cuántos ha sacado; si no está, vacía la pila y devuelve -1.',
        'Devuelve a qué profundidad está `x` sin tocar la pila, o -1.',
        'Quita `x` de la pila, deje donde deje los demás.',
        'Devuelve cuántas veces está `x` y vacía la pila.',
      ],
      correcta: 0,
      explicacion: 'Con una pila solo se ve la cima: para encontrar algo hay que ir sacando. El que se busca también sale. Si no está, la pila acaba vacía: para buscar sin destruirla haría falta una pila auxiliar donde ir guardando lo sacado.',
    },
  ],
};
