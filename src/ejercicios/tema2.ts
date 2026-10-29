import { CTX_LISTA, lista } from '../memoria/construir';
import { Tema } from './tipos';

/** Quita el primer salto de línea y el sangrado común: así los números de línea son los que se ven. */
export function c(s: string): string {
  const lineas = s.replace(/^\n/, '').replace(/\s+$/, '').split('\n');
  const sangria = Math.min(...lineas.filter((l) => l.trim()).map((l) => l.match(/^ */)![0].length));
  return lineas.map((l) => l.slice(sangria)).join('\n');
}

const ctx = CTX_LISTA;
const L = (...v: number[]) => [lista('cab', v)];

export const tema2: Tema = {
  id: '2',
  titulo: 'Listas enlazadas',
  resumen: 'Crear, enlazar y liberar nodos sin perder el resto; después, las funciones de lista.h y sus fallos típicos.',
  ejercicios: [
    // ------------------------------------------------------------ a mano
    {
      id: '2-01',
      tipo: 'programar',
      titulo: 'Insertar el 1 al principio',
      enunciado: 'Escribe las sentencias que ponen un nodo con el **1** delante de la lista, sin perder nada.',
      pistas: ['Crea el nodo con `malloc(sizeof(Nodo))` y dale su dato.', 'Primero engancha el nuevo a la lista y después mueve `cab`. Al revés, pierdes la lista.'],
      alResolver: 'Es exactamente `insertarPrincipio`: dos enlaces, y el orden importa.',
      ctx,
      casos: [{ nombre: '9 → 3 → 7', inicial: L(9, 3, 7) }],
      observar: ['cab'],
      solucion: c(`
        Nodo *nuevo = malloc(sizeof(Nodo));
        nuevo->valor = 1;
        nuevo->siguiente = cab;
        cab = nuevo;`),
    },
    {
      id: '2-02',
      tipo: 'programar',
      titulo: 'Quitar el primero',
      enunciado: 'Quita el primer nodo de la lista y libéralo. Sin tocar ningún `valor`.',
      pistas: ['Si mueves `cab` antes de guardar el primero, ya no podrás liberarlo.', 'Y si lo liberas antes de mover `cab`, ya no puedes leer su `siguiente`.'],
      alResolver: 'Guardar, saltar y liberar: el mismo orden que en `suprimir`.',
      ctx,
      casos: [{ nombre: '9 → 3 → 7', inicial: L(9, 3, 7) }],
      observar: ['cab'],
      prohibidos: ['valor'],
      solucion: c(`
        Nodo *aux = cab;
        cab = cab->siguiente;
        free(aux);`),
    },
    {
      id: '2-03',
      tipo: 'programar',
      titulo: 'Insertar el 5 entre el 3 y el 7',
      enunciado: 'La lista es `9 → 3 → 7`. Mete un nodo con el **5** entre el 3 y el 7. Al 3 llegas con `cab->siguiente`.',
      pistas: ['El nuevo tiene que apuntar al 7 antes de que el 3 deje de hacerlo.'],
      ctx,
      casos: [{ nombre: '9 → 3 → 7', inicial: L(9, 3, 7) }],
      observar: ['cab'],
      solucion: c(`
        Nodo *nuevo = malloc(sizeof(Nodo));
        nuevo->valor = 5;
        nuevo->siguiente = cab->siguiente->siguiente;
        cab->siguiente->siguiente = nuevo;`),
    },
    {
      id: '2-04',
      tipo: 'programar',
      titulo: 'Suprimir el del medio',
      enunciado: 'Quita el **3** de `9 → 3 → 7` y libéralo. Sin tocar ningún `valor`.',
      ctx,
      casos: [{ nombre: '9 → 3 → 7', inicial: L(9, 3, 7) }],
      observar: ['cab'],
      prohibidos: ['valor'],
      solucion: c(`
        Nodo *aux = cab->siguiente;
        cab->siguiente = aux->siguiente;
        free(aux);`),
    },
    {
      id: '2-05',
      tipo: 'programar',
      titulo: 'Intercambiar los dos primeros',
      enunciado: 'Deja la lista `9 → 3 → 7` como `3 → 9 → 7` **moviendo enlaces**: no se puede tocar ningún `valor`.',
      pistas: ['Necesitas un puntero auxiliar al segundo nodo.', 'Son tres enlaces que cambian: `cab`, el `siguiente` del 9 y el `siguiente` del 3.'],
      alResolver: 'Cambiar datos habría sido más corto, pero en un videojuego el nodo suele ser un struct enorme: mover punteros es lo barato.',
      ctx,
      casos: [{ nombre: '9 → 3 → 7', inicial: L(9, 3, 7) }],
      observar: ['cab'],
      prohibidos: ['valor'],
      solucion: c(`
        Nodo *segundo = cab->siguiente;
        cab->siguiente = segundo->siguiente;
        segundo->siguiente = cab;
        cab = segundo;`),
    },
    {
      id: '2-06',
      tipo: 'programar',
      titulo: 'Pasar el primero al final',
      enunciado: 'Mueve el primer nodo al final: `9 → 3 → 7` queda `3 → 7 → 9`. Sin `malloc`, sin `free` y sin tocar `valor`. Necesitarás un `while` para llegar al último.',
      pistas: ['Recorre con un puntero auxiliar mientras `p->siguiente != NULL`.', 'No olvides que el que pasa a ser último tiene que apuntar a NULL.'],
      ctx,
      casos: [{ nombre: '9 → 3 → 7', inicial: L(9, 3, 7) }],
      observar: ['cab'],
      prohibidos: ['valor'],
      solucion: c(`
        Nodo *primero = cab;
        cab = cab->siguiente;
        Nodo *p = cab;
        while (p->siguiente != NULL)
            p = p->siguiente;
        p->siguiente = primero;
        primero->siguiente = NULL;`),
    },
    // ------------------------------------------------------------ funciones
    {
      id: '2-07',
      tipo: 'programar',
      titulo: 'Escribe insertarFinal',
      enunciado: 'Completa `insertarFinal`. Se prueba con la lista vacía, con un nodo y con varios.',
      pistas: ['La lista vacía es un caso aparte: ahí cambia `*cab`.', 'Para el resto, busca el último con un auxiliar; no avances con `*cab`.'],
      ctx,
      casos: [
        { nombre: 'Lista vacía', inicial: L(), llamada: 'insertarFinal(&cab, 5)' },
        { nombre: 'Un nodo', inicial: L(9), llamada: 'insertarFinal(&cab, 5)' },
        { nombre: '9 → 3 → 7', inicial: L(9, 3, 7), llamada: 'insertarFinal(&cab, 5)' },
      ],
      observar: ['cab'],
      codigoInicial: c(`
        void insertarFinal(Nodo **cab, int x)
        {

        }`),
      solucion: c(`
        void insertarFinal(Nodo **cab, int x)
        {
            Nodo *nuevo = malloc(sizeof(Nodo));
            nuevo->valor = x;
            nuevo->siguiente = NULL;
            if (*cab == NULL) {
                *cab = nuevo;
                return;
            }
            Nodo *p = *cab;
            while (p->siguiente != NULL)
                p = p->siguiente;
            p->siguiente = nuevo;
        }`),
    },
    {
      id: '2-08',
      tipo: 'programar',
      titulo: 'Escribe longitud',
      enunciado: 'Completa `longitud`: devuelve cuántos nodos tiene la lista, sin cambiarla.',
      ctx,
      casos: [
        { nombre: 'Lista vacía', inicial: L(), llamada: 'longitud(cab)' },
        { nombre: '9 → 3 → 7', inicial: L(9, 3, 7), llamada: 'longitud(cab)' },
      ],
      observar: ['cab'],
      codigoInicial: c(`
        int longitud(Nodo *cab)
        {

        }`),
      solucion: c(`
        int longitud(Nodo *cab)
        {
            int n = 0;
            Nodo *p = cab;
            while (p != NULL) {
                n++;
                p = p->siguiente;
            }
            return n;
        }`),
    },
    {
      id: '2-09',
      tipo: 'programar',
      titulo: 'Escribe anular',
      enunciado: 'Completa `anular`: libera todos los nodos y deja `cab` a NULL. Sin fugas y sin usar nada ya liberado.',
      pistas: ['Antes de liberar un nodo, guarda a dónde apunta su `siguiente`.'],
      ctx,
      casos: [
        { nombre: 'Lista vacía', inicial: L(), llamada: 'anular(&cab)' },
        { nombre: '9 → 3 → 7', inicial: L(9, 3, 7), llamada: 'anular(&cab)' },
      ],
      observar: ['cab'],
      codigoInicial: c(`
        void anular(Nodo **cab)
        {

        }`),
      solucion: c(`
        void anular(Nodo **cab)
        {
            Nodo *p = *cab;
            while (p != NULL) {
                Nodo *siguiente = p->siguiente;
                free(p);
                p = siguiente;
            }
            *cab = NULL;
        }`),
    },
    {
      id: '2-10',
      tipo: 'programar',
      titulo: 'Escribe suprimir',
      enunciado: 'Completa `suprimir`: quita la primera aparición de `x`, la libera y devuelve 1; si no está, devuelve 0. Tiene que valer para el primero, uno del medio y el último.',
      pistas: ['Con un puntero doble (`Nodo **p = cab`) los tres casos son uno solo.', 'Avanza con `p = &(*p)->siguiente`.'],
      ctx,
      casos: [
        { nombre: 'El primero (9)', inicial: L(9, 3, 7), llamada: 'suprimir(&cab, 9)' },
        { nombre: 'Uno del medio (3)', inicial: L(9, 3, 7), llamada: 'suprimir(&cab, 3)' },
        { nombre: 'El último (7)', inicial: L(9, 3, 7), llamada: 'suprimir(&cab, 7)' },
        { nombre: 'No está (8)', inicial: L(9, 3, 7), llamada: 'suprimir(&cab, 8)' },
        { nombre: 'Lista vacía', inicial: L(), llamada: 'suprimir(&cab, 9)' },
      ],
      observar: ['cab'],
      prohibidos: ['valor'],
      codigoInicial: c(`
        int suprimir(Nodo **cab, int x)
        {

        }`),
      solucion: c(`
        int suprimir(Nodo **cab, int x)
        {
            Nodo **p = cab;
            while (*p != NULL && (*p)->valor != x)
                p = &(*p)->siguiente;
            if (*p == NULL) return 0;
            Nodo *muerto = *p;
            *p = muerto->siguiente;
            free(muerto);
            return 1;
        }`),
    },
    {
      id: '2-11',
      tipo: 'programar',
      titulo: 'Escribe insertarOrdenado',
      enunciado: 'Completa `insertarOrdenado`: la lista está ordenada de menor a mayor y tiene que seguir así después de meter `x`.',
      pistas: ['El mismo puntero doble de `suprimir`: para cuando `(*p)->valor` ya no sea menor que `x`.'],
      ctx,
      casos: [
        { nombre: 'Lista vacía', inicial: L(), llamada: 'insertarOrdenado(&cab, 5)' },
        { nombre: 'Al principio', inicial: L(3, 7, 9), llamada: 'insertarOrdenado(&cab, 1)' },
        { nombre: 'En medio', inicial: L(3, 7, 9), llamada: 'insertarOrdenado(&cab, 5)' },
        { nombre: 'Al final', inicial: L(3, 7, 9), llamada: 'insertarOrdenado(&cab, 12)' },
      ],
      observar: ['cab'],
      codigoInicial: c(`
        void insertarOrdenado(Nodo **cab, int x)
        {

        }`),
      solucion: c(`
        void insertarOrdenado(Nodo **cab, int x)
        {
            Nodo **p = cab;
            while (*p != NULL && (*p)->valor < x)
                p = &(*p)->siguiente;
            Nodo *nuevo = malloc(sizeof(Nodo));
            nuevo->valor = x;
            nuevo->siguiente = *p;
            *p = nuevo;
        }`),
    },
    {
      id: '2-12',
      tipo: 'programar',
      titulo: 'Dar la vuelta a la lista',
      enunciado: 'Completa `invertir` con tres punteros: `9 → 3 → 7` queda `7 → 3 → 9`. Sin `malloc` y sin tocar `valor`.',
      pistas: ['Tres punteros: el anterior, el actual y el siguiente.', 'En cada vuelta, el actual pasa a apuntar al anterior. Guarda antes su siguiente.'],
      ctx,
      casos: [
        { nombre: 'Lista vacía', inicial: L(), llamada: 'invertir(&cab)' },
        { nombre: 'Un nodo', inicial: L(9), llamada: 'invertir(&cab)' },
        { nombre: '9 → 3 → 7', inicial: L(9, 3, 7), llamada: 'invertir(&cab)' },
      ],
      observar: ['cab'],
      prohibidos: ['valor'],
      codigoInicial: c(`
        void invertir(Nodo **cab)
        {

        }`),
      solucion: c(`
        void invertir(Nodo **cab)
        {
            Nodo *anterior = NULL;
            Nodo *act = *cab;
            while (act != NULL) {
                Nodo *siguiente = act->siguiente;
                act->siguiente = anterior;
                anterior = act;
                act = siguiente;
            }
            *cab = anterior;
        }`),
    },
    {
      id: '2-13',
      tipo: 'programar',
      titulo: 'Quitar el último',
      enunciado: 'Quita el último nodo de la lista `9 → 3 → 7` y libéralo: tiene que quedar `9 → 3`.',
      pistas: ['Para quitar el último hay que pararse en el **penúltimo**: el que cumple `p->siguiente->siguiente == NULL`.', 'Después de `free`, el penúltimo sigue apuntando al nodo liberado: ponlo a NULL.'],
      ctx,
      casos: [{ nombre: '9 → 3 → 7', inicial: L(9, 3, 7) }],
      observar: ['cab'],
      solucion: c(`
        Nodo *p = cab;
        while (p->siguiente->siguiente != NULL)
            p = p->siguiente;
        free(p->siguiente);
        p->siguiente = NULL;`),
    },
    {
      id: '2-14',
      tipo: 'programar',
      titulo: 'Escribe buscar',
      enunciado: 'Completa `buscar`: devuelve 1 si `x` está en la lista y 0 si no, sin cambiarla.',
      pistas: ['Recorre con un auxiliar y para en cuanto lo encuentres: `return 1` dentro del bucle.'],
      ctx,
      casos: [
        { nombre: 'Lista vacía', inicial: L(), llamada: 'buscar(cab, 3)' },
        { nombre: 'Está', inicial: L(9, 3, 7), llamada: 'buscar(cab, 3)' },
        { nombre: 'Es el último', inicial: L(9, 3, 7), llamada: 'buscar(cab, 7)' },
        { nombre: 'No está', inicial: L(9, 3, 7), llamada: 'buscar(cab, 5)' },
      ],
      observar: ['cab'],
      codigoInicial: c(`
        int buscar(Nodo *cab, int x)
        {

        }`),
      solucion: c(`
        int buscar(Nodo *cab, int x)
        {
            Nodo *p = cab;
            while (p != NULL) {
                if (p->valor == x) return 1;
                p = p->siguiente;
            }
            return 0;
        }`),
    },
    {
      id: '2-15',
      tipo: 'programar',
      titulo: 'Escribe contar',
      enunciado: 'Completa `contar`: devuelve cuántas veces aparece `x` en la lista.',
      ctx,
      casos: [
        { nombre: 'Lista vacía', inicial: L(), llamada: 'contar(cab, 3)' },
        { nombre: '3 → 9 → 3 → 3', inicial: L(3, 9, 3, 3), llamada: 'contar(cab, 3)' },
        { nombre: 'No está', inicial: L(9, 7), llamada: 'contar(cab, 3)' },
      ],
      observar: ['cab'],
      codigoInicial: c(`
        int contar(Nodo *cab, int x)
        {

        }`),
      solucion: c(`
        int contar(Nodo *cab, int x)
        {
            int n = 0;
            for (Nodo *p = cab; p != NULL; p = p->siguiente)
                if (p->valor == x) n++;
            return n;
        }`),
    },
    {
      id: '2-16',
      tipo: 'programar',
      titulo: 'Escribe suprimirTodos',
      enunciado: 'Completa `suprimirTodos`: quita y libera **todos** los nodos que valen `x`. Pueden estar al principio, seguidos o al final.',
      pistas: [
        'Primero, mientras el primero valga `x`, quítalo cambiando `*cab`.',
        'Después recorre mirando `p->siguiente`: si vale `x`, sáltalo y libéralo **sin avanzar** `p` (el nuevo siguiente también puede valer `x`); si no, avanza.',
      ],
      ctx,
      casos: [
        { nombre: 'Lista vacía', inicial: L(), llamada: 'suprimirTodos(&cab, 3)' },
        { nombre: '3 → 3 → 9 → 3 → 3 → 7 → 3', inicial: L(3, 3, 9, 3, 3, 7, 3), llamada: 'suprimirTodos(&cab, 3)' },
        { nombre: 'No está', inicial: L(9, 7), llamada: 'suprimirTodos(&cab, 3)' },
        { nombre: 'Todos valen 3', inicial: L(3, 3), llamada: 'suprimirTodos(&cab, 3)' },
      ],
      observar: ['cab'],
      codigoInicial: c(`
        void suprimirTodos(Nodo **cab, int x)
        {

        }`),
      solucion: c(`
        void suprimirTodos(Nodo **cab, int x)
        {
            while (*cab != NULL && (*cab)->valor == x) {
                Nodo *borrar = *cab;
                *cab = borrar->siguiente;
                free(borrar);
            }
            if (*cab == NULL) return;
            Nodo *p = *cab;
            while (p->siguiente != NULL) {
                if (p->siguiente->valor == x) {
                    Nodo *borrar = p->siguiente;
                    p->siguiente = borrar->siguiente;
                    free(borrar);
                } else {
                    p = p->siguiente;
                }
            }
        }`),
    },
    {
      id: '2-17',
      tipo: 'programar',
      titulo: 'Tres operaciones seguidas',
      enunciado: 'Partiendo de `4 → 9 → 2`, y en este orden: inserta el **7** al principio, inserta el **5** detrás del 9 y suprime el **4**. Tiene que quedar `7 → 9 → 5 → 2`. Es el ejercicio 1 del cuadernillo a papel: dibújalo antes.',
      pistas: ['Cuando vayas a quitar el 4 ya no es el primero: el enlace que lo salta sale del 7, no de `cab`.', 'Guarda el 4 en un auxiliar antes de saltarlo, para poder hacer `free`.'],
      ctx,
      casos: [{ nombre: '4 → 9 → 2', inicial: L(4, 9, 2) }],
      observar: ['cab'],
      solucion: c(`
        Nodo *nuevo = malloc(sizeof(Nodo));
        nuevo->valor = 7;
        nuevo->siguiente = cab;
        cab = nuevo;
        Nodo *nueve = cab->siguiente->siguiente;
        Nodo *cinco = malloc(sizeof(Nodo));
        cinco->valor = 5;
        cinco->siguiente = nueve->siguiente;
        nueve->siguiente = cinco;
        Nodo *borrar = cab->siguiente;
        cab->siguiente = borrar->siguiente;
        free(borrar);`),
    },
    {
      id: '2-18',
      tipo: 'programar',
      titulo: 'Escribe penultimo',
      enunciado: 'Completa `penultimo`: devuelve el valor del penúltimo nodo, o -1 si la lista tiene menos de dos. En una sola pasada, sin contar antes cuántos hay.',
      pistas: ['Dos punteros que avanzan a la vez, uno un paso por detrás del otro.', 'Con un solo nodo, `cab->siguiente->...` revienta: compruébalo antes de entrar.'],
      ctx,
      casos: [
        { nombre: 'Lista vacía', inicial: L(), llamada: 'penultimo(cab)' },
        { nombre: 'Un nodo', inicial: L(9), llamada: 'penultimo(cab)' },
        { nombre: '9 → 3', inicial: L(9, 3), llamada: 'penultimo(cab)' },
        { nombre: '4 → 8 → 2', inicial: L(4, 8, 2), llamada: 'penultimo(cab)' },
      ],
      observar: ['cab'],
      codigoInicial: c(`
        int penultimo(Nodo *cab)
        {

        }`),
      solucion: c(`
        int penultimo(Nodo *cab)
        {
            if (cab == NULL || cab->siguiente == NULL) return -1;
            Nodo *ant = cab;
            Nodo *p = cab->siguiente;
            while (p->siguiente != NULL) {
                ant = p;
                p = p->siguiente;
            }
            return ant->valor;
        }`),
    },
    // ------------------------------------------------------------ fallos
    {
      id: '2-F1',
      tipo: 'fallo',
      titulo: 'insertarPrincipio con dos líneas al revés',
      enunciado: 'Este `insertarPrincipio` compila sin avisos, pero algo hace mal.',
      ctx,
      casos: [
        { nombre: 'Lista vacía', inicial: L(), llamada: 'insertarPrincipio(&cab, 1)' },
        { nombre: '9 → 3 → 7', inicial: L(9, 3, 7), llamada: 'insertarPrincipio(&cab, 1)' },
      ],
      observar: ['cab'],
      codigo: c(`
        void insertarPrincipio(Nodo **cab, int x)
        {
            Nodo *nuevo = malloc(sizeof(Nodo));
            nuevo->valor = x;
            *cab = nuevo;
            nuevo->siguiente = *cab;
        }`),
      lineasFallo: [5, 6],
      tiposFallo: ['pierde'],
      explicacion: 'Al mover `*cab` primero, el nuevo nodo se apunta a sí mismo y el resto de la lista queda sin nadie que la apunte: se pierde (y son fugas).',
      solucion: c(`
        void insertarPrincipio(Nodo **cab, int x)
        {
            Nodo *nuevo = malloc(sizeof(Nodo));
            nuevo->valor = x;
            nuevo->siguiente = *cab;
            *cab = nuevo;
        }`),
    },
    {
      id: '2-F2',
      tipo: 'fallo',
      titulo: 'insertarFinal que casi siempre funciona',
      enunciado: 'Esta versión le funcionaba a un compañero en todas sus pruebas. Hay un caso en el que se rompe.',
      ctx,
      casos: [
        { nombre: 'Lista vacía', inicial: L(), llamada: 'insertarFinal(&cab, 5)' },
        { nombre: 'Un nodo', inicial: L(9), llamada: 'insertarFinal(&cab, 5)' },
        { nombre: '9 → 3 → 7', inicial: L(9, 3, 7), llamada: 'insertarFinal(&cab, 5)' },
      ],
      observar: ['cab'],
      codigo: c(`
        void insertarFinal(Nodo **cab, int x)
        {
            Nodo *nuevo = malloc(sizeof(Nodo));
            nuevo->valor = x;
            nuevo->siguiente = NULL;
            Nodo *aux = *cab;
            while (aux->siguiente != NULL)
                aux = aux->siguiente;
            aux->siguiente = nuevo;
        }`),
      lineasFallo: [7],
      preguntaLinea: 'Marca la línea donde se rompe',
      tiposFallo: ['nulo', 'caso'],
      explicacion: 'Con la lista vacía `aux` nace a NULL y `aux->siguiente` no existe. Peta en el `while`, pero lo que falta está antes: el caso de lista vacía, donde el nuevo pasa a ser `*cab`.',
      solucion: c(`
        void insertarFinal(Nodo **cab, int x)
        {
            Nodo *nuevo = malloc(sizeof(Nodo));
            nuevo->valor = x;
            nuevo->siguiente = NULL;
            if (*cab == NULL) {
                *cab = nuevo;
                return;
            }
            Nodo *aux = *cab;
            while (aux->siguiente != NULL)
                aux = aux->siguiente;
            aux->siguiente = nuevo;
        }`),
    },
    {
      id: '2-F3',
      tipo: 'fallo',
      titulo: 'insertarFinal que avanza con la cabeza',
      enunciado: 'Esta versión sí contempla la lista vacía. Aun así, algo sale mal.',
      ctx,
      casos: [
        { nombre: 'Lista vacía', inicial: L(), llamada: 'insertarFinal(&cab, 5)' },
        { nombre: 'Un nodo', inicial: L(9), llamada: 'insertarFinal(&cab, 5)' },
        { nombre: '9 → 3 → 7', inicial: L(9, 3, 7), llamada: 'insertarFinal(&cab, 5)' },
      ],
      observar: ['cab'],
      codigo: c(`
        void insertarFinal(Nodo **cab, int x)
        {
            Nodo *nuevo = malloc(sizeof(Nodo));
            nuevo->valor = x;
            nuevo->siguiente = NULL;
            if (*cab == NULL) {
                *cab = nuevo;
                return;
            }
            while ((*cab)->siguiente != NULL)
                *cab = (*cab)->siguiente;
            (*cab)->siguiente = nuevo;
        }`),
      lineasFallo: [10, 11],
      tiposFallo: ['pierde', 'fuga'],
      explicacion: 'Avanzar con `*cab` mueve la cabeza de la lista de main: al acabar, `cab` apunta al que era el último y todos los de delante se pierden. Para recorrer se usa un auxiliar.',
      solucion: c(`
        void insertarFinal(Nodo **cab, int x)
        {
            Nodo *nuevo = malloc(sizeof(Nodo));
            nuevo->valor = x;
            nuevo->siguiente = NULL;
            if (*cab == NULL) {
                *cab = nuevo;
                return;
            }
            Nodo *p = *cab;
            while (p->siguiente != NULL)
                p = p->siguiente;
            p->siguiente = nuevo;
        }`),
    },
    {
      id: '2-F4',
      tipo: 'fallo',
      titulo: 'suprimir que libera demasiado pronto',
      enunciado: 'Este `suprimir` usa bien el puntero doble, pero el orden de dos líneas lo estropea.',
      ctx,
      casos: [
        { nombre: 'No está (8)', inicial: L(9, 3, 7), llamada: 'suprimir(&cab, 8)' },
        { nombre: 'Uno del medio (3)', inicial: L(9, 3, 7), llamada: 'suprimir(&cab, 3)' },
        { nombre: 'El primero (9)', inicial: L(9, 3, 7), llamada: 'suprimir(&cab, 9)' },
      ],
      observar: ['cab'],
      codigo: c(`
        int suprimir(Nodo **cab, int x)
        {
            Nodo **p = cab;
            while (*p != NULL && (*p)->valor != x)
                p = &(*p)->siguiente;
            if (*p == NULL) return 0;
            free(*p);
            *p = (*p)->siguiente;
            return 1;
        }`),
      lineasFallo: [7, 8],
      tiposFallo: ['liberado'],
      explicacion: 'Después de `free(*p)` ese nodo ya no es tuyo: leer su `siguiente` es usar memoria liberada. En CLion muchas veces «funciona», y AddressSanitizer lo marca como heap-use-after-free.',
      solucion: c(`
        int suprimir(Nodo **cab, int x)
        {
            Nodo **p = cab;
            while (*p != NULL && (*p)->valor != x)
                p = &(*p)->siguiente;
            if (*p == NULL) return 0;
            Nodo *muerto = *p;
            *p = muerto->siguiente;
            free(muerto);
            return 1;
        }`),
    },
    {
      id: '2-F5',
      tipo: 'fallo',
      titulo: 'anular que lee lo que acaba de liberar',
      enunciado: 'Este `anular` es cortito. Demasiado.',
      ctx,
      casos: [
        { nombre: 'Lista vacía', inicial: L(), llamada: 'anular(&cab)' },
        { nombre: '9 → 3 → 7', inicial: L(9, 3, 7), llamada: 'anular(&cab)' },
      ],
      observar: ['cab'],
      codigo: c(`
        void anular(Nodo **cab)
        {
            while (*cab != NULL) {
                free(*cab);
                *cab = (*cab)->siguiente;
            }
        }`),
      lineasFallo: [4, 5],
      tiposFallo: ['liberado'],
      explicacion: 'Tras liberar el nodo, `(*cab)->siguiente` lee de memoria liberada. Hay que guardar el siguiente antes de hacer free.',
      solucion: c(`
        void anular(Nodo **cab)
        {
            while (*cab != NULL) {
                Nodo *muerto = *cab;
                *cab = muerto->siguiente;
                free(muerto);
            }
        }`),
    },
    {
      id: '2-F6',
      tipo: 'fallo',
      titulo: 'insertarTras que da vueltas',
      enunciado: 'Se llama con `insertarTras(cab->siguiente, 5)` para meter el 5 detrás del 3.',
      ctx,
      casos: [{ nombre: '9 → 3 → 7', inicial: L(9, 3, 7), llamada: 'insertarTras(cab->siguiente, 5)' }],
      observar: ['cab'],
      codigo: c(`
        int insertarTras(Nodo *n, int x)
        {
            if (n == NULL) return 0;
            Nodo *nuevo = malloc(sizeof(Nodo));
            nuevo->valor = x;
            n->siguiente = nuevo;
            nuevo->siguiente = n->siguiente;
            return 1;
        }`),
      lineasFallo: [6, 7],
      tiposFallo: ['pierde', 'fuga'],
      explicacion: 'Cuando `n->siguiente` ya apunta al nuevo, `nuevo->siguiente = n->siguiente` hace que el nuevo se apunte a sí mismo: un ciclo, y el 7 se pierde.',
      solucion: c(`
        int insertarTras(Nodo *n, int x)
        {
            if (n == NULL) return 0;
            Nodo *nuevo = malloc(sizeof(Nodo));
            nuevo->valor = x;
            nuevo->siguiente = n->siguiente;
            n->siguiente = nuevo;
            return 1;
        }`),
    },
    {
      id: '2-F7',
      tipo: 'fallo',
      titulo: 'longitud que se queda corta',
      enunciado: 'Este `longitud` tiene la condición del bucle mal. Pruébalo con los dos casos.',
      ctx,
      casos: [
        { nombre: '9 → 3 → 7', inicial: L(9, 3, 7), llamada: 'longitud(cab)' },
        { nombre: 'Lista vacía', inicial: L(), llamada: 'longitud(cab)' },
      ],
      observar: ['cab'],
      codigo: c(`
        int longitud(Nodo *cab)
        {
            int n = 0;
            Nodo *p = cab;
            while (p->siguiente != NULL) {
                n++;
                p = p->siguiente;
            }
            return n;
        }`),
      lineasFallo: [5],
      tiposFallo: ['nulo', 'caso'],
      explicacion: '`p->siguiente != NULL` para en el último sin contarlo, y con la lista vacía ni siquiera empieza: `p` ya es NULL. Para contar todos, la condición es `p != NULL`.',
      solucion: c(`
        int longitud(Nodo *cab)
        {
            int n = 0;
            Nodo *p = cab;
            while (p != NULL) {
                n++;
                p = p->siguiente;
            }
            return n;
        }`),
    },
    {
      id: '2-F8',
      tipo: 'fallo',
      titulo: 'anular que deja la cabeza colgando',
      enunciado: 'Este `anular` libera bien todos los nodos. Mira cómo queda `cab` al volver a main.',
      ctx,
      casos: [
        { nombre: 'Lista vacía', inicial: L(), llamada: 'anular(&cab)' },
        { nombre: '9 → 3 → 7', inicial: L(9, 3, 7), llamada: 'anular(&cab)' },
      ],
      observar: ['cab'],
      codigo: c(`
        void anular(Nodo **cab)
        {
            Nodo *p = *cab;
            while (p != NULL) {
                Nodo *siguiente = p->siguiente;
                free(p);
                p = siguiente;
            }
        }`),
      lineasFallo: [8, 9],
      preguntaLinea: 'Marca la línea donde falta algo',
      tiposFallo: ['colgante'],
      explicacion: 'Los nodos se liberan, pero `cab` sigue apuntando a donde estaba el primero: un puntero colgando. Falta `*cab = NULL;` al final.',
      solucion: c(`
        void anular(Nodo **cab)
        {
            Nodo *p = *cab;
            while (p != NULL) {
                Nodo *siguiente = p->siguiente;
                free(p);
                p = siguiente;
            }
            *cab = NULL;
        }`),
    },
    {
      id: '2-F9',
      tipo: 'fallo',
      titulo: 'buscar que mira demasiado lejos',
      enunciado: 'Este `buscar` encuentra todo lo que está en la lista. ¿Y lo que no está?',
      ctx,
      casos: [
        { nombre: 'Está', inicial: L(9, 3, 7), llamada: 'buscar(cab, 3)' },
        { nombre: 'No está', inicial: L(9, 3, 7), llamada: 'buscar(cab, 5)' },
      ],
      observar: ['cab'],
      codigo: c(`
        int buscar(Nodo *cab, int x)
        {
            Nodo *p = cab;
            while (p->valor != x && p != NULL)
                p = p->siguiente;
            return p != NULL;
        }`),
      lineasFallo: [4],
      tiposFallo: ['nulo'],
      explicacion: 'Las dos condiciones están bien, pero en mal orden. Cuando `x` no está, `p` llega a NULL y lo primero que se evalúa es `p->valor`: acceso a NULL. Con `p != NULL && p->valor != x`, el `&&` no mira la segunda si la primera es falsa.',
      solucion: c(`
        int buscar(Nodo *cab, int x)
        {
            Nodo *p = cab;
            while (p != NULL && p->valor != x)
                p = p->siguiente;
            return p != NULL;
        }`),
    },
    {
      id: '2-F10',
      tipo: 'fallo',
      titulo: 'suprimirUltimo que se olvida de un caso',
      enunciado: 'Este `suprimirUltimo` contempla la lista vacía y la de varios nodos. Le falta uno.',
      ctx,
      casos: [
        { nombre: 'Lista vacía', inicial: L(), llamada: 'suprimirUltimo(&cab)' },
        { nombre: '9 → 3 → 7', inicial: L(9, 3, 7), llamada: 'suprimirUltimo(&cab)' },
        { nombre: 'Un nodo', inicial: L(9), llamada: 'suprimirUltimo(&cab)' },
      ],
      observar: ['cab'],
      codigo: c(`
        void suprimirUltimo(Nodo **cab)
        {
            if (*cab == NULL) return;
            Nodo *p = *cab;
            while (p->siguiente->siguiente != NULL)
                p = p->siguiente;
            free(p->siguiente);
            p->siguiente = NULL;
        }`),
      lineasFallo: [3, 4, 5],
      preguntaLinea: 'Marca la línea que falla (o donde falta lo que la evita)',
      tiposFallo: ['caso', 'nulo'],
      explicacion: 'Con un solo nodo no hay penúltimo: `p->siguiente` es NULL y `p->siguiente->siguiente` accede a NULL. Ese caso va aparte: se libera el único nodo y `*cab` pasa a NULL.',
      solucion: c(`
        void suprimirUltimo(Nodo **cab)
        {
            if (*cab == NULL) return;
            if ((*cab)->siguiente == NULL) {
                free(*cab);
                *cab = NULL;
                return;
            }
            Nodo *p = *cab;
            while (p->siguiente->siguiente != NULL)
                p = p->siguiente;
            free(p->siguiente);
            p->siguiente = NULL;
        }`),
    },
    {
      id: '2-F11',
      tipo: 'fallo',
      titulo: 'suprimirTodos con dos errores',
      enunciado: 'Del cuadernillo a papel: este `suprimirTodos` con `ant` tiene **dos** errores. Encuentra el primero y arregla los dos.',
      ctx,
      casos: [
        { nombre: 'No está', inicial: L(9, 7), llamada: 'suprimirTodos(&cab, 3)' },
        { nombre: '9 → 3 → 7', inicial: L(9, 3, 7), llamada: 'suprimirTodos(&cab, 3)' },
        { nombre: '9 → 3 → 3 → 7', inicial: L(9, 3, 3, 7), llamada: 'suprimirTodos(&cab, 3)' },
      ],
      observar: ['cab'],
      codigo: c(`
        void suprimirTodos(Nodo **cab, int v)
        {
            Nodo *p = *cab;
            Nodo *ant = NULL;
            while (p != NULL) {
                if (p->valor == v) {
                    if (ant != NULL) ant->siguiente = p->siguiente;
                    else             *cab = p->siguiente;
                    free(p);
                }
                ant = p;
                p = p->siguiente;
            }
        }`),
      lineasFallo: [9, 11, 12],
      tiposFallo: ['liberado'],
      explicacion: 'Tras `free(p)` se lee `p->siguiente`: memoria liberada. Y hay otro: al borrar, `ant` pasa a ser el nodo borrado, así que con dos 3 seguidos el segundo se engancha a un nodo muerto. Se guarda `Nodo *sig = p->siguiente;` antes del `free` y `ant` solo avanza cuando no se borra.',
      solucion: c(`
        void suprimirTodos(Nodo **cab, int v)
        {
            Nodo *p = *cab;
            Nodo *ant = NULL;
            while (p != NULL) {
                Nodo *sig = p->siguiente;
                if (p->valor == v) {
                    if (ant != NULL) ant->siguiente = sig;
                    else             *cab = sig;
                    free(p);
                } else {
                    ant = p;
                }
                p = sig;
            }
        }`),
    },
    {
      id: '2-F12',
      tipo: 'fallo',
      titulo: 'sumar que se para antes',
      enunciado: 'Es el recorrido B del cuadernillo a papel, sumando en lugar de imprimir. Pruébalo con varias listas.',
      ctx,
      casos: [
        { nombre: '3 → 8 → 3 → 1', inicial: L(3, 8, 3, 1), llamada: 'sumar(cab)' },
        { nombre: 'Lista vacía', inicial: L(), llamada: 'sumar(cab)' },
      ],
      observar: ['cab'],
      codigo: c(`
        int sumar(Nodo *cab)
        {
            int s = 0;
            Nodo *p = cab;
            while (p->siguiente != NULL) {
                s += p->valor;
                p = p->siguiente;
            }
            return s;
        }`),
      lineasFallo: [5],
      tiposFallo: ['caso', 'nulo'],
      explicacion: 'La condición `p->siguiente != NULL` para en el último sin sumarlo (da 14 y no 15), y con la lista vacía `p` es NULL y `p->siguiente` revienta. Para recorrerla entera, `while (p != NULL)`.',
      solucion: c(`
        int sumar(Nodo *cab)
        {
            int s = 0;
            Nodo *p = cab;
            while (p != NULL) {
                s += p->valor;
                p = p->siguiente;
            }
            return s;
        }`),
    },
    {
      id: '2-F13',
      tipo: 'fallo',
      titulo: 'contar que no termina',
      enunciado: 'Es el recorrido C del cuadernillo a papel. A veces cuenta bien. Otras no acaba nunca.',
      ctx,
      casos: [
        { nombre: 'No está', inicial: L(8, 1), llamada: 'contar(cab, 3)' },
        { nombre: '3 → 8 → 3 → 1', inicial: L(3, 8, 3, 1), llamada: 'contar(cab, 3)' },
      ],
      observar: ['cab'],
      codigo: c(`
        int contar(Nodo *cab, int x)
        {
            int n = 0;
            Nodo *p = cab;
            while (p != NULL) {
                if (p->valor == x) {
                    n++;
                    continue;
                }
                p = p->siguiente;
            }
            return n;
        }`),
      lineasFallo: [8],
      preguntaLinea: 'Marca la línea que hace que `p` no avance',
      tiposFallo: ['bucle'],
      explicacion: 'El `continue` salta a la condición sin pasar por `p = p->siguiente`: en el primer nodo que vale `x`, `p` no avanza nunca y el bucle no termina. Se quita el `continue` (o se avanza antes).',
      solucion: c(`
        int contar(Nodo *cab, int x)
        {
            int n = 0;
            Nodo *p = cab;
            while (p != NULL) {
                if (p->valor == x) n++;
                p = p->siguiente;
            }
            return n;
        }`),
    },
    // ------------------------------------------------------------ misteriosas
    {
      id: '2-M1',
      tipo: 'misterio',
      titulo: 'Un recorrido que se queda con uno',
      enunciado: 'Lee la función sin ejecutarla. Predice qué devuelve en cada caso y después di qué hace.',
      ctx,
      casos: [
        { nombre: '4 → 9 → 2', inicial: L(4, 9, 2), llamada: 'misterio(cab)' },
        { nombre: '3 → 1 → 8', inicial: L(3, 1, 8), llamada: 'misterio(cab)' },
        { nombre: 'Un nodo', inicial: L(7), llamada: 'misterio(cab)' },
      ],
      observar: ['cab'],
      responder: ['devuelve'],
      solucion: c(`
        int misterio(Nodo *cab)
        {
            int m = cab->valor;
            for (Nodo *p = cab->siguiente; p != NULL; p = p->siguiente)
                if (p->valor > m) m = p->valor;
            return m;
        }`),
      opciones: ['Devuelve el mayor valor de la lista.', 'Devuelve el último valor de la lista.', 'Devuelve el primer valor que es mayor que el anterior.', 'Devuelve la suma de los valores.'],
      correcta: 0,
      explicacion: 'Es el máximo: `m` empieza con el primero y se cambia cada vez que aparece uno mayor. Ojo, con la lista vacía revienta en la primera línea: `cab->valor` con `cab` a NULL.',
    },
    {
      id: '2-M2',
      tipo: 'misterio',
      titulo: 'Un contador que se escapa',
      enunciado: 'Predice qué devuelve en cada caso y después di qué hace.',
      ctx,
      casos: [
        { nombre: '4 → 9 → 2, x = 9', inicial: L(4, 9, 2), llamada: 'misterio(cab, 9)' },
        { nombre: '4 → 9 → 2, x = 4', inicial: L(4, 9, 2), llamada: 'misterio(cab, 4)' },
        { nombre: '4 → 9 → 2, x = 5', inicial: L(4, 9, 2), llamada: 'misterio(cab, 5)' },
        { nombre: '3 → 3, x = 3', inicial: L(3, 3), llamada: 'misterio(cab, 3)' },
      ],
      observar: ['cab'],
      responder: ['devuelve'],
      solucion: c(`
        int misterio(Nodo *cab, int x)
        {
            int i = 0;
            for (Nodo *p = cab; p != NULL; p = p->siguiente) {
                if (p->valor == x) return i;
                i++;
            }
            return -1;
        }`),
      opciones: [
        'Devuelve la posición (contando desde 0) de la primera vez que aparece `x`, o -1 si no está.',
        'Devuelve cuántas veces aparece `x`, o -1 si no está.',
        'Devuelve la posición de la última vez que aparece `x`, o -1 si no está.',
        'Devuelve 1 si `x` está y -1 si no.',
      ],
      correcta: 0,
      explicacion: 'El `return i` dentro del bucle sale en cuanto encuentra el primero, así que con `3 → 3` devuelve 0. Si el bucle acaba, no estaba: -1.',
    },
    {
      id: '2-M3',
      tipo: 'misterio',
      titulo: 'De dos en dos',
      enunciado: 'Esta función no devuelve nada. Predice cómo queda la lista en cada caso y después di qué hace.',
      ctx,
      casos: [
        { nombre: '1 → 2 → 3 → 4', inicial: L(1, 2, 3, 4), llamada: 'misterio(cab)' },
        { nombre: '1 → 2 → 3 → 4 → 5', inicial: L(1, 2, 3, 4, 5), llamada: 'misterio(cab)' },
        { nombre: 'Un nodo', inicial: L(7), llamada: 'misterio(cab)' },
      ],
      observar: ['cab'],
      responder: ['cab'],
      solucion: c(`
        void misterio(Nodo *cab)
        {
            Nodo *p = cab;
            while (p != NULL && p->siguiente != NULL) {
                int aux = p->valor;
                p->valor = p->siguiente->valor;
                p->siguiente->valor = aux;
                p = p->siguiente->siguiente;
            }
        }`),
      opciones: ['Intercambia los valores por parejas: el 1.º con el 2.º, el 3.º con el 4.º…', 'Da la vuelta a la lista.', 'Pasa el primero al final.', 'Ordena la lista de mayor a menor.'],
      correcta: 0,
      explicacion: 'Cambia los valores de cada pareja y salta dos nodos. Si el número de nodos es impar, el último se queda donde estaba. No mueve enlaces: los nodos son los mismos, solo cambian sus valores.',
    },
    {
      id: '2-M4',
      tipo: 'misterio',
      titulo: 'Nodos que aparecen',
      enunciado: 'Predice cómo queda la lista en cada caso y después di qué hace.',
      ctx,
      casos: [
        { nombre: '1 → 2 → 3', inicial: L(1, 2, 3), llamada: 'misterio(cab)' },
        { nombre: 'Lista vacía', inicial: L(), llamada: 'misterio(cab)' },
      ],
      observar: ['cab'],
      responder: ['cab'],
      solucion: c(`
        void misterio(Nodo *cab)
        {
            Nodo *p = cab;
            while (p != NULL) {
                Nodo *n = malloc(sizeof(Nodo));
                n->valor = p->valor;
                n->siguiente = p->siguiente;
                p->siguiente = n;
                p = n->siguiente;
            }
        }`),
      opciones: ['Duplica cada nodo: detrás de cada uno inserta otro con el mismo valor.', 'Copia la lista entera al final de sí misma.', 'No termina nunca: siempre hay un nodo nuevo detrás.', 'Inserta un 0 detrás de cada nodo.'],
      correcta: 0,
      explicacion: 'Tras insertar la copia, `p` salta a `n->siguiente`, que es el nodo que venía detrás del original: así no vuelve a pasar por la copia y el bucle termina. Si avanzara con `p = p->siguiente`, caería en la copia y no acabaría nunca.',
    },
  ],
};
