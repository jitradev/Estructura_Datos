import { CTX_TABLA_ABIERTA, tablaAbierta } from '../memoria/construir';
import { c } from './tema2';
import { OpHash, Tema } from './tipos';

// The fill-the-table ones are simulated (dispersion.ts). The code ones use tabla_abierta.c,
// the open table of the slides: TAM 10, hash(x) = x % TAM, linear probing and the three
// marks VACIA (0), OCUPADA (1) and BORRADA (2). A table is written as in the booklet:
// «.» empty, «B33» deleted (it still holds the old key) and a number for an occupied cell.
const CT = CTX_TABLA_ABIERTA;
const T = (celdas: string) => [tablaAbierta('t', celdas)];

const ins = (...xs: number[]): OpHash[] => xs.map((clave) => ({ op: 'insertar', clave }));
const bus = (clave: number): OpHash => ({ op: 'buscar', clave });
const eli = (clave: number): OpHash => ({ op: 'eliminar', clave });

const MARCAS = 'En el dibujo, `marca` vale 0 (VACIA), 1 (OCUPADA) o 2 (BORRADA).';

export const tema6: Tema = {
  id: '6',
  titulo: 'Tablas hash',
  resumen:
    'Encadenamiento (cada cubo es una lista) y direccionamiento abierto con exploración lineal, cuadrática y doble hashing, con la marca de borrada. Las trazas del cuadernillo a papel y el código de tabla_abierta.c: TAM 10 y hash(x) = x % TAM.',
  ejercicios: [
    // ------------------------------------------------------------ encadenamiento
    {
      id: '6-01',
      tipo: 'dispersion',
      titulo: 'Dibujar la tabla con encadenamiento',
      bloque: 'Encadenamiento',
      enunciado: 'Del cuadernillo a papel. Tabla de 7 cubos, insertando **por delante** de la lista como en clase. Inserta 15, 3, 22, 9, 17, 28 y 36, y después busca el 15 y el 43.',
      tam: 7,
      sondeo: 'encadenamiento',
      ops: [...ins(15, 3, 22, 9, 17, 28, 36), bus(15), bus(43)],
      traza: true,
      preguntas: [{ texto: '¿Cuánto vale α (claves / cubos)?', respuesta: 1 }],
      explicacion:
        'Como se inserta por delante, en el cubo 1 el último en llegar va el primero: 36 → 22 → 15. `buscar(15)` mira 3 nodos, porque es el último de su lista, y `buscar(43)` también: 43 % 7 = 1 y recorre la lista entera sin encontrarlo. Tres claves en un cubo y tres cubos vacíos con α = 1: así de desigual reparte una hash con pocos datos.',
    },
    {
      id: '6-02',
      tipo: 'dispersion',
      titulo: 'Borrar es quitar un nodo',
      bloque: 'Encadenamiento',
      enunciado: 'Tabla de 5 cubos, insertando por delante. Sigue las operaciones: cuenta los nodos que mira cada búsqueda y cada borrado.',
      tam: 5,
      sondeo: 'encadenamiento',
      ops: [...ins(12, 7, 3, 17, 22, 8), eli(7), bus(22), eli(4), bus(2)],
      traza: true,
      preguntas: [{ texto: '¿Cuánto vale α al final?', respuesta: 1 }],
      explicacion:
        'El 7 está en el cubo 2 detrás del 22 y el 17: mirar 3 nodos y quitarlo como en una lista simple, sin marcas. `eliminar(4)` mira 0 nodos (el cubo 4 está vacío) y `buscar(2)` recorre los 3 que quedan en el cubo 2. Con encadenamiento, borrar no deja rastro.',
    },
    {
      id: '6-03',
      tipo: 'dispersion',
      titulo: 'Más claves que cubos',
      bloque: 'Encadenamiento',
      enunciado: 'Tabla de 5 cubos, insertando por delante: 10, 21, 33, 5, 14, 46, 19, 27 y 40. Dibuja los cubos y haz las cuentas.',
      tam: 5,
      sondeo: 'encadenamiento',
      ops: ins(10, 21, 33, 5, 14, 46, 19, 27, 40),
      preguntas: [
        { texto: '¿Cuánto vale α?', respuesta: 1.8 },
        { texto: '¿Cuántos nodos mira `buscar(35)`?', respuesta: 3 },
      ],
      explicacion:
        'α = 9/5 = 1,8. Con encadenamiento α puede pasar de 1: es la longitud media de las listas. `buscar(35)` va al cubo 0 (40 → 5 → 10) y mira los 3 sin encontrarlo. En direccionamiento abierto esto no cabría: cada clave ocupa una casilla.',
    },
    // ------------------------------------------------------------ exploración lineal
    {
      id: '6-04',
      tipo: 'dispersion',
      titulo: 'Exploración lineal: el racimo',
      bloque: 'Exploración lineal',
      enunciado: 'La tabla de clase: 10 casillas y exploración lineal. Inserta 23, 43, 13, 27, 33, 9 y 19.',
      tam: 10,
      sondeo: 'lineal',
      ops: ins(23, 43, 13, 27, 33, 9, 19),
      preguntas: [
        { texto: '¿Cuánto vale α?', respuesta: 0.7 },
        { texto: '¿Cuántas casillas mira `buscar(53)`, contando la vacía donde para?', respuesta: 6 },
      ],
      explicacion:
        'Cuatro claves con hash 3 forman un bloque de la 3 a la 6, y el 27 lo alarga hasta la 7. El 19 cae en la 9, ocupada, y da la vuelta a la 0. `buscar(53)` recorre 3, 4, 5, 6, 7 y para en la 8: 6 casillas para decir que no está. Eso es el agrupamiento primario: los bloques crecen y cada clave que cae en ellos los alarga.',
    },
    {
      id: '6-05',
      tipo: 'dispersion',
      titulo: 'Exploración lineal con borrados',
      bloque: 'Exploración lineal',
      enunciado:
        'Del cuadernillo a papel. Tabla de 7 casillas, exploración lineal y marca de borrada. `insertar` reutiliza la primera borrada, pero solo después de comprobar que la clave no está más adelante.',
      pistas: ['Una B no para la búsqueda: detrás puede haber una clave que la saltó para colocarse. Solo una casilla vacía dice «aquí ya no hay nada».'],
      tam: 7,
      sondeo: 'lineal',
      ops: [...ins(10, 17, 24), eli(17), bus(24), ...ins(31), bus(17), ...ins(5)],
      traza: true,
      explicacion:
        'Las dos filas que importan: en `buscar(24)` la casilla 4 está borrada y hay que **seguir**; si se parara, diría que el 24 no está. En `insertar(31)` se ve la B en la 4, pero se sigue hasta la vacía 6 para asegurar que el 31 no está, y solo entonces se vuelve a la 4 a dejarlo.',
    },
    {
      id: '6-06',
      tipo: 'dispersion',
      titulo: 'La clave que ya estaba detrás de la B',
      bloque: 'Exploración lineal',
      enunciado: 'Tabla de 7 casillas, exploración lineal. Fíjate en el segundo `insertar(22)`: ¿se queda en la borrada?',
      tam: 7,
      sondeo: 'lineal',
      ops: [...ins(8, 15, 22), eli(15), ...ins(22, 29), bus(15), eli(8), bus(22)],
      traza: true,
      explicacion:
        'El segundo `insertar(22)` ve la B en la 2, pero sigue y encuentra el 22 en la 3: ya estaba. Si se quedara en la primera borrada sin mirar más, habría dos 22. El 29 sí acaba en la B. Y al borrar el 8, la casilla 1 queda B: `buscar(22)` la salta y lo sigue encontrando.',
    },
    {
      id: '6-07',
      tipo: 'dispersion',
      titulo: 'Tabla llena',
      bloque: 'Exploración lineal',
      enunciado: 'Tabla de 5 casillas, exploración lineal. Llénala y prueba a meter una más y a buscar una que no está.',
      tam: 5,
      sondeo: 'lineal',
      ops: [...ins(4, 9, 14, 3, 8, 13), bus(19)],
      traza: true,
      explicacion:
        'Con la tabla llena no hay ninguna vacía que pare la búsqueda: `insertar(13)` y `buscar(19)` dan la vuelta entera, las 5 casillas. Por eso el bucle de `posicion` lleva `pasos < TAM`: sin él no acabaría nunca. Y por eso se redimensiona mucho antes de llegar aquí.',
    },
    // ------------------------------------------------------------ cuadrática y doble
    {
      id: '6-08',
      tipo: 'dispersion',
      titulo: 'Exploración cuadrática',
      bloque: 'Cuadrática y doble hashing',
      enunciado: 'Del cuadernillo a papel. Tabla de 11 casillas, exploración **cuadrática**: el intento i prueba la casilla (h + i²) % 11. Inserta 4, 15, 26, 37 y 5.',
      pistas: ['Las cuatro primeras tienen el mismo hash. Lo que cambia con cada intento es i, no la clave: 4, 4+1, 4+4, 4+9...'],
      tam: 11,
      sondeo: 'cuadratica',
      ops: ins(4, 15, 26, 37, 5),
      traza: true,
      explicacion:
        'El 15, el 26 y el 37 siguen la misma secuencia 4, 5, 8, 2...: la cuadrática deshace el bloque de la lineal, pero las claves con el mismo hash siguen pisándose. Es el agrupamiento secundario.',
    },
    {
      id: '6-09',
      tipo: 'dispersion',
      titulo: 'Doble hashing',
      bloque: 'Cuadrática y doble hashing',
      enunciado: 'Del cuadernillo a papel. Las mismas claves, 4, 15, 26, 37 y 5, en una tabla de 11 con **doble hashing**: el intento i prueba (h + i·h2) % 11.',
      pistas: ['Calcula h y h2 de las cinco claves antes de colocar ninguna. h2 es el tamaño del salto de cada clave.'],
      tam: 11,
      sondeo: 'doble',
      q: 7,
      ops: ins(4, 15, 26, 37, 5),
      traza: true,
      explicacion: 'Cada clave salta con su paso: 6 el 15, 2 el 26, 5 el 37. Ninguna pasa de 2 casillas, frente a las 4 del 37 con la cuadrática. Es lo que se gana con la segunda hash.',
    },
    {
      id: '6-10',
      tipo: 'dispersion',
      titulo: 'La cuadrática que no encuentra sitio',
      bloque: 'Cuadrática y doble hashing',
      enunciado: 'Tabla de 7 casillas, exploración cuadrática. Inserta 0, 7, 14, 21 y 28: todas tienen hash 0.',
      pistas: ['Apunta i² % 7 para i = 0...6: 0, 1, 4, 2, 2, 4, 1. ¿Cuántas casillas distintas salen?'],
      tam: 7,
      sondeo: 'cuadratica',
      ops: ins(0, 7, 14, 21, 28),
      traza: true,
      preguntas: [{ texto: '¿Cuánto vale α cuando el 28 ya no cabe?', respuesta: 4 / 7 }],
      explicacion:
        'La secuencia 0, 1, 4, 2, 2, 4, 1 solo visita 4 de las 7 casillas, así que el 28 no cabe aunque quedan 3 libres (α ≈ 0,57). Con TAM primo, la cuadrática solo garantiza sitio si la tabla está como mucho a la mitad: otra razón para mantener α bajo.',
    },
    {
      id: '6-11',
      tipo: 'dispersion',
      titulo: 'Doble hashing con borrados',
      bloque: 'Cuadrática y doble hashing',
      enunciado: 'Tabla de 7 casillas con doble hashing y marca de borrada. Las cuatro claves tienen hash 3.',
      tam: 7,
      sondeo: 'doble',
      q: 5,
      ops: [...ins(10, 17, 24), eli(17), bus(24), ...ins(31)],
      traza: true,
      explicacion:
        'Con el mismo hash, cada clave salta distinto: el 17 de 3 en 3 (3, 6), el 24 de 1 en 1 (3, 4) y el 31 de 4 en 4 (3, 0). Por eso la B de la 6 no estorba al 24 ni al 31: sus secuencias no pasan por ella.',
    },
    // ------------------------------------------------------------ programar a mano
    {
      id: '6-P1',
      tipo: 'programar',
      titulo: 'Insertar el 23 a mano',
      enunciado: `Inserta el **23** en la tabla \`t\` sin llamar a \`insertar\`. Sabes que no está. Empieza en \`hash(23)\` y avanza mientras la casilla esté OCUPADA. ${MARCAS}`,
      pistas: ['`int i = hash(23);` y luego `while (t->marca[i] == OCUPADA) i = (i + 1) % TAM;`', 'Al salir: la clave, la marca y el contador `n`.'],
      ctx: CT,
      casos: [
        { nombre: '13 y 33 en la 3 y la 4', inicial: T('. . . 13 33 . . . . .') },
        { nombre: 'Con una borrada', inicial: T('. . . 13 B33 43 . . . .') },
      ],
      observar: ['t'],
      prohibidos: ['insertar()'],
      solucion: c(`
        int i = hash(23);
        while (t->marca[i] == OCUPADA) i = (i + 1) % TAM;
        t->claves[i] = 23;
        t->marca[i] = OCUPADA;
        t->n++;`),
    },
    {
      id: '6-P2',
      tipo: 'programar',
      titulo: 'Borrar el 33 a mano',
      enunciado: `Borra el **33** de \`t\` sin llamar a \`eliminar\`. Sabes que está, pero no en qué casilla. ${MARCAS}`,
      pistas: ['Se busca desde `hash(33)` hasta dar con una casilla OCUPADA que tenga el 33.', 'La casilla no se vacía: se marca BORRADA.'],
      ctx: CT,
      casos: [
        { nombre: 'En la 4', inicial: T('. . . 13 33 43 . . . .') },
        { nombre: 'Tras una borrada', inicial: T('. . . 13 B23 33 . . . .') },
      ],
      observar: ['t'],
      prohibidos: ['eliminar()', 'posicion()'],
      solucion: c(`
        int i = hash(33);
        while (t->marca[i] != OCUPADA || t->claves[i] != 33) i = (i + 1) % TAM;
        t->marca[i] = BORRADA;
        t->n--;`),
    },
    // ------------------------------------------------------------ escribe la función
    {
      id: '6-E1',
      tipo: 'programar',
      titulo: 'Escribe posicion',
      enunciado: `Completa \`posicion\`: devuelve la casilla donde está \`clave\`, o -1. Para en una VACIA, sigue en una BORRADA y no da más de TAM pasos. \`buscar\` y \`eliminar\` la usan. ${MARCAS}`,
      pistas: ['Una BORRADA no para la búsqueda: detrás puede estar la clave.', 'Cuenta los pasos: con la tabla llena no hay ninguna VACIA que te pare.'],
      ctx: CT,
      casos: [
        { nombre: 'En su casilla', inicial: T('. . . 13 33 43 . . . .'), llamada: 'posicion(t, 13)' },
        { nombre: 'Tras una borrada', inicial: T('. . . 13 B33 43 . . . .'), llamada: 'posicion(t, 43)' },
        { nombre: 'No está', inicial: T('. . . 13 B33 43 . . . .'), llamada: 'posicion(t, 53)' },
        { nombre: 'Da la vuelta', inicial: T('29 . . . . . . . 8 19'), llamada: 'posicion(t, 29)' },
        { nombre: 'Llena, sin la clave', inicial: T('0 1 2 3 4 5 6 7 8 9'), llamada: 'posicion(t, 10)' },
      ],
      observar: ['t'],
      codigoInicial: c(`
        int posicion(TablaHash *t, int clave) {

        }`),
      solucion: c(`
        int posicion(TablaHash *t, int clave) {
            int i = hash(clave), pasos = 0;
            while (pasos < TAM) {
                if (t->marca[i] == VACIA) return -1;
                if (t->marca[i] == OCUPADA && t->claves[i] == clave) return i;
                i = (i + 1) % TAM;
                pasos++;
            }
            return -1;
        }`),
    },
    {
      id: '6-E2',
      tipo: 'programar',
      titulo: 'Escribe insertar',
      enunciado: 'Completa `insertar`: devuelve 0 si la clave ya estaba o si la tabla está llena, y 1 si la ha metido. Una BORRADA sirve para dejarla, pero antes hay que asegurarse de que la clave no está más adelante. Tienes `buscar(t, clave)`.',
      pistas: ['Primero `if (buscar(t, clave)) return 0;`.', 'Después, desde `hash(clave)`, la primera casilla que no esté OCUPADA.'],
      ctx: CT,
      casos: [
        { nombre: 'Vacía', inicial: T('. . . . . . . . . .'), llamada: 'insertar(t, 7)' },
        { nombre: 'Colisión', inicial: T('. . . 13 . . . . . .'), llamada: 'insertar(t, 23)' },
        { nombre: 'Reutiliza la borrada', inicial: T('. . . 13 B33 43 . . . .'), llamada: 'insertar(t, 53)' },
        { nombre: 'Ya estaba, tras la borrada', inicial: T('. . . 13 B33 43 . . . .'), llamada: 'insertar(t, 43)' },
        { nombre: 'Llena', inicial: T('0 1 2 3 4 5 6 7 8 9'), llamada: 'insertar(t, 10)' },
      ],
      observar: ['t'],
      codigoInicial: c(`
        int insertar(TablaHash *t, int clave) {

        }`),
      solucion: c(`
        int insertar(TablaHash *t, int clave) {
            if (buscar(t, clave)) return 0;
            int i = hash(clave), pasos = 0;
            while (pasos < TAM) {
                if (t->marca[i] != OCUPADA) {
                    t->claves[i] = clave;
                    t->marca[i]  = OCUPADA;
                    t->n++;
                    return 1;
                }
                i = (i + 1) % TAM;
                pasos++;
            }
            return 0;
        }`),
    },
    {
      id: '6-E3',
      tipo: 'programar',
      titulo: 'Escribe eliminar',
      enunciado: 'Completa `eliminar`: devuelve 0 si la clave no estaba y 1 si la ha borrado. La casilla no se vacía, se marca BORRADA. Tienes `posicion(t, clave)`, que da la casilla o -1.',
      ctx: CT,
      casos: [
        { nombre: 'Está', inicial: T('. . . 13 33 43 . . . .'), llamada: 'eliminar(t, 33)' },
        { nombre: 'Tras una borrada', inicial: T('. . . 13 B33 43 . . . .'), llamada: 'eliminar(t, 43)' },
        { nombre: 'No está', inicial: T('. . . 13 33 43 . . . .'), llamada: 'eliminar(t, 53)' },
      ],
      observar: ['t'],
      codigoInicial: c(`
        int eliminar(TablaHash *t, int clave) {

        }`),
      solucion: c(`
        int eliminar(TablaHash *t, int clave) {
            int i = posicion(t, clave);
            if (i < 0) return 0;
            t->marca[i] = BORRADA;
            t->n--;
            return 1;
        }`),
    },
    {
      id: '6-E4',
      tipo: 'programar',
      titulo: 'Escribe contarBorradas',
      enunciado: 'Completa `contarBorradas`, que devuelve cuántas casillas están BORRADA. Es lo que se mira para decidir un rehash aunque `n` sea pequeño: las borradas alargan las búsquedas igual que las ocupadas.',
      ctx: CT,
      casos: [
        { nombre: 'Ninguna', inicial: T('. . . 13 33 43 . . . .'), llamada: 'contarBorradas(t)' },
        { nombre: 'Dos', inicial: T('B10 . . 13 B33 43 . . . .'), llamada: 'contarBorradas(t)' },
        { nombre: 'Todas', inicial: T('B0 B1 B2 B3 B4 B5 B6 B7 B8 B9'), llamada: 'contarBorradas(t)' },
      ],
      observar: ['t'],
      codigoInicial: c(`
        int contarBorradas(TablaHash *t) {

        }`),
      solucion: c(`
        int contarBorradas(TablaHash *t) {
            int k = 0;
            for (int i = 0; i < TAM; i++)
                if (t->marca[i] == BORRADA) k++;
            return k;
        }`),
      alResolver: 'Con todas BORRADA y `n = 0`, la tabla está vacía y aun así `buscar` mira las 10 casillas. El rehash la deja limpia.',
    },
    // ------------------------------------------------------------ fallos
    {
      id: '6-F1',
      tipo: 'fallo',
      titulo: 'posicion que para en la borrada',
      enunciado: `La caza del error de las diapositivas: esta \`posicion\` va bien hasta que se borra algo. \`buscar\` la usa. ${MARCAS}`,
      ctx: CT,
      casos: [
        { nombre: 'Sin borradas', inicial: T('. . . 13 33 43 . . . .'), llamada: 'buscar(t, 43)' },
        { nombre: 'Con una borrada', inicial: T('. . . 13 B33 43 . . . .'), llamada: 'buscar(t, 43)' },
      ],
      observar: ['t'],
      codigo: c(`
        int posicion(TablaHash *t, int clave) {
            int i = hash(clave), pasos = 0;
            while (pasos < TAM) {
                if (t->marca[i] != OCUPADA) return -1;
                if (t->claves[i] == clave) return i;
                i = (i + 1) % TAM;
                pasos++;
            }
            return -1;
        }`),
      lineasFallo: [4],
      tiposFallo: ['caso'],
      explicacion: 'Trata la BORRADA como si fuera VACIA: el 43 se colocó saltando el 33, y al borrar el 33 la búsqueda para justo antes de llegar. Solo una VACIA dice que no hay nada más: `if (t->marca[i] == VACIA) return -1;` y comparar la clave solo si está OCUPADA.',
      solucion: c(`
        int posicion(TablaHash *t, int clave) {
            int i = hash(clave), pasos = 0;
            while (pasos < TAM) {
                if (t->marca[i] == VACIA) return -1;
                if (t->marca[i] == OCUPADA && t->claves[i] == clave) return i;
                i = (i + 1) % TAM;
                pasos++;
            }
            return -1;
        }`),
    },
    {
      id: '6-F2',
      tipo: 'fallo',
      titulo: 'insertar que se queda en la primera borrada',
      enunciado: 'Este `insertar` comprueba los repetidos mientras avanza, sin llamar a `buscar`. Prueba a meter una clave que ya está.',
      ctx: CT,
      casos: [
        { nombre: 'Clave nueva', inicial: T('. . . 13 . . . . . .'), llamada: 'insertar(t, 23)' },
        { nombre: 'Ya estaba', inicial: T('. . . 13 23 . . . . .'), llamada: 'insertar(t, 23)' },
        { nombre: 'Ya estaba, tras una borrada', inicial: T('. . . 13 B33 23 . . . .'), llamada: 'insertar(t, 23)' },
      ],
      observar: ['t'],
      codigo: c(`
        int insertar(TablaHash *t, int clave) {
            int i = hash(clave), pasos = 0;
            while (pasos < TAM) {
                if (t->marca[i] != OCUPADA) {
                    t->claves[i] = clave;
                    t->marca[i] = OCUPADA;
                    t->n++;
                    return 1;
                }
                if (t->claves[i] == clave) return 0;
                i = (i + 1) % TAM;
                pasos++;
            }
            return 0;
        }`),
      lineasFallo: [4],
      tiposFallo: ['caso'],
      explicacion: 'Se queda en la primera casilla no ocupada, y si es una BORRADA la clave puede estar más adelante: el 23 queda dos veces. Antes de usar la borrada hay que llegar a la VACIA (o dar la vuelta) para saber que no está; lo más sencillo es `if (buscar(t, clave)) return 0;` al principio.',
      solucion: c(`
        int insertar(TablaHash *t, int clave) {
            if (buscar(t, clave)) return 0;
            int i = hash(clave), pasos = 0;
            while (pasos < TAM) {
                if (t->marca[i] != OCUPADA) {
                    t->claves[i] = clave;
                    t->marca[i] = OCUPADA;
                    t->n++;
                    return 1;
                }
                i = (i + 1) % TAM;
                pasos++;
            }
            return 0;
        }`),
    },
    {
      id: '6-F3',
      tipo: 'fallo',
      titulo: 'eliminar que vacía la casilla',
      enunciado: 'Este `eliminar` deja la casilla como nueva. Borra el 13 y después busca el 23, que está detrás.',
      ctx: CT,
      casos: [
        { nombre: 'Borrar uno que no está', inicial: T('. . . 13 23 . . . . .'), llamada: 'eliminar(t, 53)' },
        { nombre: 'Borrar el 13', inicial: T('. . . 13 23 . . . . .'), llamada: 'eliminar(t, 13)' },
      ],
      observar: ['t'],
      codigo: c(`
        int eliminar(TablaHash *t, int clave) {
            int i = posicion(t, clave);
            if (i < 0) return 0;
            t->marca[i] = VACIA;
            t->n--;
            return 1;
        }`),
      lineasFallo: [4],
      tiposFallo: ['pierde', 'caso'],
      explicacion: 'Con la 3 VACIA, `buscar(23)` empieza en la 3 y para en seco: el 23 sigue en la 4 pero ya no se encuentra nunca. Por eso existe la tercera marca: `t->marca[i] = BORRADA;`.',
      solucion: c(`
        int eliminar(TablaHash *t, int clave) {
            int i = posicion(t, clave);
            if (i < 0) return 0;
            t->marca[i] = BORRADA;
            t->n--;
            return 1;
        }`),
    },
    {
      id: '6-F4',
      tipo: 'fallo',
      titulo: 'posicion sin contar los pasos',
      enunciado: 'Esta `posicion` para en la VACIA y salta las BORRADA. Parece correcta... hasta que no queda ninguna VACIA.',
      ctx: CT,
      casos: [
        { nombre: 'Está', inicial: T('. . . 13 B33 43 . . . .'), llamada: 'buscar(t, 43)' },
        { nombre: 'Sin vacías, no está', inicial: T('0 1 2 3 4 B5 6 7 8 9'), llamada: 'buscar(t, 15)' },
      ],
      observar: ['t'],
      codigo: c(`
        int posicion(TablaHash *t, int clave) {
            int i = hash(clave);
            while (t->marca[i] != VACIA) {
                if (t->marca[i] == OCUPADA && t->claves[i] == clave) return i;
                i = (i + 1) % TAM;
            }
            return -1;
        }`),
      lineasFallo: [3],
      tiposFallo: ['bucle'],
      explicacion: 'Si no queda ninguna VACIA (llena, o con borradas en lugar de vacías) y la clave no está, da vueltas para siempre. Hay que contar los pasos: `while (pasos < TAM)`, con un `pasos++` en cada vuelta.',
      solucion: c(`
        int posicion(TablaHash *t, int clave) {
            int i = hash(clave), pasos = 0;
            while (pasos < TAM) {
                if (t->marca[i] == VACIA) return -1;
                if (t->marca[i] == OCUPADA && t->claves[i] == clave) return i;
                i = (i + 1) % TAM;
                pasos++;
            }
            return -1;
        }`),
    },
    {
      id: '6-F5',
      tipo: 'fallo',
      titulo: 'insertar que no da la vuelta',
      enunciado: 'Este `insertar` funciona casi siempre. Prueba con una clave cuyo hash caiga en la última casilla ocupada.',
      ctx: CT,
      casos: [
        { nombre: 'Colisión en medio', inicial: T('. . . 13 . . . . . .'), llamada: 'insertar(t, 23)' },
        { nombre: 'Colisión al final', inicial: T('. . . . . . . . . 9'), llamada: 'insertar(t, 19)' },
      ],
      observar: ['t'],
      codigo: c(`
        int insertar(TablaHash *t, int clave) {
            if (buscar(t, clave)) return 0;
            int i = hash(clave), pasos = 0;
            while (pasos < TAM) {
                if (t->marca[i] != OCUPADA) {
                    t->claves[i] = clave;
                    t->marca[i] = OCUPADA;
                    t->n++;
                    return 1;
                }
                i = i + 1;
                pasos++;
            }
            return 0;
        }`),
      lineasFallo: [11],
      tiposFallo: ['array'],
      explicacion: 'Sin `% TAM`, después de la 9 viene la 10, fuera del array. La exploración es circular: `i = (i + 1) % TAM;`, igual que en la cola con array.',
      solucion: c(`
        int insertar(TablaHash *t, int clave) {
            if (buscar(t, clave)) return 0;
            int i = hash(clave), pasos = 0;
            while (pasos < TAM) {
                if (t->marca[i] != OCUPADA) {
                    t->claves[i] = clave;
                    t->marca[i] = OCUPADA;
                    t->n++;
                    return 1;
                }
                i = (i + 1) % TAM;
                pasos++;
            }
            return 0;
        }`),
    },
    // ------------------------------------------------------------ misteriosas
    {
      id: '6-M1',
      tipo: 'misterio',
      titulo: 'Las que están en su sitio',
      enunciado: `Predice qué devuelve en cada caso. Después di qué hace. ${MARCAS}`,
      ctx: CT,
      casos: [
        { nombre: '13 33 43 y 7', inicial: T('. . . 13 33 43 . 7 . .'), llamada: 'misterio(t)' },
        { nombre: '20 2 y 9, con una borrada', inicial: T('20 . 2 B12 . . . . . 9'), llamada: 'misterio(t)' },
      ],
      observar: ['t'],
      responder: ['devuelve'],
      solucion: c(`
        int misterio(TablaHash *t) {
            int k = 0;
            for (int i = 0; i < TAM; i++)
                if (t->marca[i] == OCUPADA && hash(t->claves[i]) == i) k++;
            return k;
        }`),
      opciones: [
        'Cuántas claves están en la casilla que les da su hash, sin haber tenido que buscar otra.',
        'Cuántas casillas ocupadas hay.',
        'Cuántas claves han colisionado al insertarlas.',
        'Cuántas casillas no están vacías.',
      ],
      correcta: 0,
      explicacion: 'Una clave está en su sitio si `hash(clave) == i`. Las demás se colocaron explorando: el 33 y el 43 tienen hash 3 y están en la 4 y la 5. Buscar las que están en su sitio cuesta una casilla; las otras, más.',
    },
    {
      id: '6-M2',
      tipo: 'misterio',
      titulo: 'El bloque más largo',
      enunciado: 'Predice qué devuelve en cada caso. Después di qué hace.',
      ctx: CT,
      casos: [
        { nombre: '13 33 43, y 7 8', inicial: T('. . . 13 33 43 . 7 8 .'), llamada: 'misterio(t)' },
        { nombre: '1, 3 y de la 5 a la 8', inicial: T('1 . 3 B4 5 6 7 8 . .'), llamada: 'misterio(t)' },
      ],
      observar: ['t'],
      responder: ['devuelve'],
      solucion: c(`
        int misterio(TablaHash *t) {
            int mejor = 0, seguidas = 0;
            for (int i = 0; i < TAM; i++) {
                if (t->marca[i] == OCUPADA) seguidas++;
                else seguidas = 0;
                if (seguidas > mejor) mejor = seguidas;
            }
            return mejor;
        }`),
      opciones: [
        'La longitud del bloque más largo de casillas ocupadas seguidas (sin dar la vuelta).',
        'Cuántas casillas ocupadas hay.',
        'La casilla donde empieza el bloque más largo.',
        'Cuántos bloques de casillas ocupadas hay.',
      ],
      correcta: 0,
      explicacion: 'Cuenta ocupadas seguidas y se queda con el máximo: es el racimo del agrupamiento primario. Una búsqueda sin éxito que cae al principio de un bloque de 4 mira las 4 y la vacía de después. Ojo: la BORRADA corta el bloque aquí, pero no corta la búsqueda.',
    },
    {
      id: '6-M3',
      tipo: 'misterio',
      titulo: 'Cuánto cuesta buscar',
      enunciado: 'Predice qué devuelve en cada caso. Después di qué hace.',
      ctx: CT,
      casos: [
        { nombre: 'misterio(t, 43)', inicial: T('. . . 13 B33 43 . . . .'), llamada: 'misterio(t, 43)' },
        { nombre: 'misterio(t, 53)', inicial: T('. . . 13 B33 43 . . . .'), llamada: 'misterio(t, 53)' },
        { nombre: 'misterio(t, 7)', inicial: T('. . . 13 B33 43 . . . .'), llamada: 'misterio(t, 7)' },
      ],
      observar: ['t'],
      responder: ['devuelve'],
      solucion: c(`
        int misterio(TablaHash *t, int clave) {
            int i = hash(clave);
            int k = 1;
            while (t->marca[i] != VACIA) {
                if (t->marca[i] == OCUPADA && t->claves[i] == clave) return k;
                i = (i + 1) % TAM;
                k++;
            }
            return k;
        }`),
      opciones: [
        'Cuántas casillas mira buscar(clave), contando la vacía en la que para si no está.',
        'La casilla donde está la clave.',
        'Cuántas claves hay en la tabla con el mismo hash.',
        'Cuántas casillas borradas se salta la búsqueda.',
      ],
      correcta: 0,
      explicacion: 'Es `posicion` contando casillas en lugar de devolver dónde: 3 para el 43 (la 3, la B y la 5), 4 para el 53, que no está (hasta la vacía 6), y 1 para el 7. Es el número con el que se comparan de verdad las estrategias.',
    },
  ],
};
