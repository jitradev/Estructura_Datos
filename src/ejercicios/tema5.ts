import { c } from './tema2';
import { EjCoste, PasoCoste, Tema } from './tipos';

// The fragments of the topic 5 paper booklet (EDA-Tema05-Papel), plus a few on the
// structures of topics 2 to 4. The interpreter counts the turns: `contar` is the
// fragment with x counting what the question asks, when the shown code does not.

const VUELTAS = '¿Cuántas vueltas da el bucle?';
const TODAS = '¿Cuántas veces se ejecuta `x++`, sumando todas las vueltas?';

/** The usual three steps: turns, cost of one turn, total. */
const std = (vueltas: string, cadaVuelta: string, total: string): PasoCoste[] => [
  { titulo: 'Vueltas', texto: vueltas },
  { titulo: 'Cada vuelta cuesta', texto: cadaVuelta },
  { titulo: 'Total', texto: total },
];
const pasos = (...p: [string, string][]): PasoCoste[] => p.map(([titulo, texto]) => ({ titulo, texto }));

type Def = Omit<EjCoste, 'id' | 'tipo' | 'bloque' | 'n'> & { n?: number };

const bloques: [string, Def[]][] = [
  [
    'Bucles simples',
    [
      {
        titulo: 'Saltos de cinco',
        enunciado: '¿Qué coste tiene en función de `n`?',
        codigo: c(`
          for (i = 0; i < 2 * n; i += 5)
              x++;`),
        coste: 'O(n)',
        pasos: std('`i` va de 0 hasta 2n sumando 5 cada vez: unas 2n/5 vueltas.', 'una sentencia suelta, O(1).', '2n/5 × O(1). El 2/5 es una constante y se quita: **O(n)**.'),
      },
      {
        titulo: 'Un bucle que no mira n',
        enunciado: '¿Qué coste tiene en función de `n`?',
        pregunta: VUELTAS,
        codigo: c(`
          for (i = 0; i < 1000; i++)
              x += i;`),
        contar: 'for (i = 0; i < 1000; i++) x++;',
        coste: 'O(1)',
        pasos: std('siempre 1.000, sea `n` lo que sea.', 'O(1).', '1.000 × O(1) es una constante: **O(1)**. Que haya un `for` no lo hace lineal; lo que cuenta es de qué dependen las vueltas.'),
      },
      {
        titulo: 'Un if dentro del bucle',
        enunciado: '¿Qué coste tiene en función de `n`?',
        pregunta: VUELTAS,
        codigo: c(`
          for (i = 1; i <= n; i++)
              if (i % 2 == 0) x++;
              else            x--;`),
        contar: 'for (i = 1; i <= n; i++) x++;',
        coste: 'O(n)',
        pasos: std('`i` va de 1 a n de uno en uno: n vueltas.', 'un `if` con dos ramas de O(1). Solo se ejecuta una rama, así que cuesta lo que la más cara: O(1).', 'n × O(1) = **O(n)**.'),
      },
      {
        titulo: 'Hacia atrás y de dos en dos',
        enunciado: '¿Qué coste tiene en función de `n`?',
        codigo: c(`
          i = n;
          while (i > 0) {
              x++;
              i = i - 2;
          }`),
        coste: 'O(n)',
        pasos: std('`i` baja de n hasta 0 restando 2: unas n/2 vueltas.', 'O(1).', 'n/2 × O(1) = **O(n)**. Da igual que vaya hacia atrás: resta una constante.'),
      },
      {
        titulo: 'Dos bucles seguidos',
        enunciado: '¿Qué coste tiene en función de `n`? Fíjate en que los bucles van **uno detrás de otro**, no uno dentro de otro.',
        pregunta: '¿Cuántas veces se ejecuta `x++` entre los dos bucles?',
        codigo: c(`
          for (i = 0; i < n; i++)
              x++;
          for (j = 0; j < 3 * n; j++)
              x++;`),
        coste: 'O(n)',
        pasos: pasos(
          ['Trozo a trozo', 'el primero da n vueltas y el segundo 3n.'],
          ['Se suman', 'van uno detrás de otro: n + 3n = 4n.'],
          ['Total', '4n, quitando la constante: **O(n)**. Dos bucles seguidos se suman; solo se multiplican si uno va dentro del otro.'],
        ),
      },
    ],
  ],
  [
    'Bucles que multiplican o dividen',
    [
      {
        titulo: 'Dividir entre tres',
        enunciado: '¿Qué coste tiene en función de `n`?',
        codigo: c(`
          for (i = n; i >= 1; i = i / 3)
              x++;`),
        coste: 'O(log n)',
        pasos: std('`i` se divide entre 3 en cada vuelta hasta llegar a 0: unas log₃ n vueltas.', 'O(1).', 'log₃ n × O(1) = **O(log n)**. La base del logaritmo no importa: cambiarla es multiplicar por una constante.'),
      },
      {
        titulo: 'Doblar sumando',
        enunciado: '¿Qué coste tiene en función de `n`?',
        codigo: c(`
          i = 1;
          while (i < n) {
              x++;
              i = i + i;
          }`),
        coste: 'O(log n)',
        pasos: std(
          '`i + i` es lo mismo que `2 * i`: `i` se dobla cada vuelta, 1, 2, 4, 8…, hasta llegar a n. Unas log₂ n vueltas.',
          'O(1).',
          '**O(log n)**. Aunque se escriba con una suma, no se suma una constante: se suma `i`, que va creciendo.',
        ),
        alResolver: 'La regla «sumar → O(n), multiplicar → O(log n)» va sobre lo que le pasa a `i`, no sobre el símbolo que se lee.',
      },
      {
        titulo: 'Multiplicar por cuatro',
        enunciado: '¿Qué coste tiene en función de `n`?',
        pregunta: VUELTAS,
        codigo: c(`
          for (i = 1; i < n; i = i * 4)
              x += i;`),
        contar: 'for (i = 1; i < n; i = i * 4) x++;',
        coste: 'O(log n)',
        pasos: std('`i` vale 1, 4, 16, 64…: se multiplica por 4 hasta llegar a n. Unas log₄ n vueltas.', 'O(1).', '**O(log n)**.'),
        nCrecimiento: [16, 1024],
      },
      {
        titulo: 'Restar algo que depende de n',
        enunciado: '¿Qué coste tiene en función de `n`? Fíjate en lo que se resta.',
        codigo: c(`
          i = n;
          while (i > 0) {
              x++;
              i = i - (n / 4 + 1);
          }`),
        coste: 'O(1)',
        pasos: std(
          'cada vuelta resta `n / 4 + 1`, algo más de la cuarta parte de n. Para gastar n hacen falta como mucho 4 restas.',
          'O(1).',
          'como mucho 4 × O(1) = **O(1)**. Parece que resta «una cantidad», como en el de dos en dos, pero esa cantidad crece con n.',
        ),
        alResolver: 'Prueba abajo con n = 100 y n = 1000: salen 4 vueltas las dos veces.',
      },
      {
        titulo: 'Búsqueda binaria',
        enunciado: 'Se busca un valor en un array ordenado de `n` elementos (aquí `v[med]` vale `med`) y el valor buscado es mayor que todos, así que no está: es el peor caso. ¿Qué coste tiene?',
        pregunta: VUELTAS,
        codigo: c(`
          int izq = 0;
          int der = n - 1;
          while (izq <= der) {
              int med = (izq + der) / 2;
              if (med < n) izq = med + 1;
              else         der = med - 1;
          }`),
        contar: c(`
          int izq = 0;
          int der = n - 1;
          while (izq <= der) {
              x++;
              int med = (izq + der) / 2;
              if (med < n) izq = med + 1;
              else         der = med - 1;
          }`),
        coste: 'O(log n)',
        pasos: std(
          'cada vuelta descarta la mitad de lo que queda entre `izq` y `der`: n, n/2, n/4… hasta que no queda nada. Unas log₂ n + 1 vueltas.',
          'O(1).',
          '**O(log n)**. Es un bucle que divide, aunque no se vea ningún `/ 2` en la variable del bucle: lo que se divide es el tamaño del trozo.',
        ),
        alResolver: 'Con n = 1.000.000 son 20 vueltas. Una búsqueda lineal daría un millón.',
      },
    ],
  ],
  [
    'Bucles anidados',
    [
      {
        titulo: 'Un interior fijo',
        enunciado: '¿Qué coste tiene en función de `n`?',
        pregunta: TODAS,
        codigo: c(`
          for (i = 0; i < n; i++)
              for (j = 0; j < 10; j++)
                  x++;`),
        coste: 'O(n)',
        pasos: std('el de fuera da n vueltas.', 'el de dentro: siempre 10 vueltas de O(1), es decir, O(1).', 'n × 10 = 10n: **O(n)**. Dos bucles anidados no son siempre O(n²): depende de hasta dónde llegue el de dentro.'),
      },
      {
        titulo: 'Dos bucles completos',
        enunciado: '¿Qué coste tiene en función de `n`?',
        pregunta: TODAS,
        codigo: c(`
          for (i = 0; i < n; i++)
              for (j = 0; j < n; j++)
                  x++;`),
        coste: 'O(n²)',
        pasos: std('el de fuera da n vueltas.', 'el de dentro da n vueltas de O(1), es decir, O(n), y no depende de `i`.', 'n × n = **O(n²)**. Es el caso de manual: dos bucles hasta n, uno dentro de otro.'),
      },
      {
        titulo: 'El triángulo al revés',
        enunciado: '¿Qué coste tiene en función de `n`?',
        pregunta: TODAS,
        codigo: c(`
          for (i = 0; i < n; i++)
              for (j = n; j > i; j--)
                  x++;`),
        coste: 'O(n²)',
        pasos: pasos(
          ['Vueltas', 'el de fuera da n vueltas, pero el de dentro da **distinto** en cada una: n − i (con i = 0 da n, con i = 1 da n − 1…).'],
          ['Se suman', 'como cada vuelta cuesta distinto, no se multiplica: se suma. n + (n−1) + … + 2 + 1 = n(n+1)/2.'],
          ['Total', 'n(n+1)/2 = n²/2 + n/2. Se quitan la constante y el término pequeño: **O(n²)**.'],
        ),
      },
      {
        titulo: 'El exterior dobla, el interior recorre',
        enunciado: '¿Qué coste tiene en función de `n`?',
        pregunta: TODAS,
        codigo: c(`
          for (i = 1; i <= n; i = i * 2)
              for (j = 1; j <= n; j++)
                  x++;`),
        coste: 'O(n log n)',
        pasos: std('el de fuera dobla `i`: unas log₂ n vueltas.', 'el de dentro va de 1 a n sin mirar `i`: n vueltas de O(1), es decir, O(n).', 'log n × n = **O(n log n)**.'),
      },
      {
        titulo: 'El interior dobla hasta i',
        enunciado: '¿Qué coste tiene en función de `n`?',
        pregunta: TODAS,
        codigo: c(`
          for (i = 1; i <= n; i++)
              for (j = 1; j <= i; j = j * 2)
                  x++;`),
        coste: 'O(n log n)',
        pasos: std('el de fuera da n vueltas.', 'el de dentro dobla `j` hasta `i`: unas log₂ i vueltas. Como `i` llega como mucho a n, cada pasada cuesta como mucho log₂ n.', 'n × O(log n) = **O(n log n)**.'),
      },
      {
        titulo: 'El exterior dobla, el interior llega hasta i',
        enunciado: '¿Qué coste tiene en función de `n`? Ojo: no es igual que «El exterior dobla, el interior recorre».',
        pregunta: TODAS,
        codigo: c(`
          for (i = 1; i < n; i = i * 2)
              for (j = 0; j < i; j++)
                  x++;`),
        coste: 'O(n)',
        pasos: pasos(
          ['Vueltas', 'el de fuera dobla `i`: 1, 2, 4, 8… hasta n. El de dentro da `i` vueltas, **distintas** en cada pasada.'],
          ['Se suman', '1 + 2 + 4 + 8 + … + n/2. Cada término es el doble del anterior, y esa suma siempre da menos que n (1 + 2 + 4 + 8 = 15, menos que 16).'],
          ['Total', 'menos de n vueltas: **O(n)**. «log n pasadas × n como mucho» da O(n log n), que no es falso, pero se pasa: las pasadas no son todas de n.'],
        ),
        alResolver: 'El más difícil del bloque. Mira la tabla: al doblar n se dobla la cuenta, y eso es lineal.',
      },
      {
        titulo: 'Un interior de n²',
        enunciado: '¿Qué coste tiene en función de `n`?',
        pregunta: TODAS,
        codigo: c(`
          for (i = 0; i < n; i++)
              for (j = 0; j < n * n; j++)
                  x++;`),
        coste: 'O(n³)',
        pasos: std('el de fuera, n.', 'el de dentro llega hasta n·n: n² vueltas de O(1).', 'n × n² = **O(n³)**. Hay dos bucles, pero el límite del de dentro ya es cuadrático.'),
        nCrecimiento: [16, 48],
      },
      {
        titulo: 'Hasta i al cuadrado',
        enunciado: '¿Qué coste tiene en función de `n`?',
        pregunta: TODAS,
        codigo: c(`
          for (i = 0; i < n; i++)
              for (j = 0; j < i * i; j++)
                  x++;`),
        coste: 'O(n³)',
        pasos: pasos(
          ['Vueltas', 'el de dentro da i² vueltas, distintas en cada pasada.'],
          ['Se suman', '0 + 1 + 4 + 9 + … + (n−1)², que es del orden de n³/3. Sin hacer la suma también sale: hay n pasadas y ninguna da más de n² vueltas.'],
          ['Total', '**O(n³)**.'],
        ),
        nCrecimiento: [16, 64],
      },
      {
        titulo: 'Tres bucles, cada uno hasta el anterior',
        enunciado: '¿Qué coste tiene en función de `n`?',
        pregunta: TODAS,
        codigo: c(`
          for (i = 0; i < n; i++)
              for (j = 0; j < i; j++)
                  for (k = 0; k < j; k++)
                      x++;`),
        coste: 'O(n³)',
        pasos: pasos(
          ['Vueltas', 'tres bucles, y cada uno llega hasta la variable del de fuera: ninguno da más de n vueltas.'],
          ['Acota', 'como mucho n × n × n. La cuenta exacta es unas n³/6: cada bucle recorre menos que el anterior, pero todos dependen de n.'],
          ['Total', 'la sexta parte de n³ sigue siendo **O(n³)**.'],
        ),
        nCrecimiento: [16, 64],
      },
    ],
  ],
  [
    'Bloques, condicionales y llamadas',
    [
      {
        titulo: 'Tres trozos seguidos',
        enunciado: '¿Qué coste tiene en función de `n`?',
        pregunta: '¿Cuántas vueltas dan los tres trozos juntos?',
        codigo: c(`
          for (i = 0; i < n; i++) x++;

          for (i = 0; i < n; i++)
              for (j = 0; j < n; j++) x++;

          i = n;
          while (i > 1) i = i / 2;`),
        contar: c(`
          for (i = 0; i < n; i++) x++;
          for (i = 0; i < n; i++)
              for (j = 0; j < n; j++) x++;
          i = n;
          while (i > 1) { i = i / 2; x++; }`),
        coste: 'O(n²)',
        pasos: pasos(
          ['Trozo a trozo', 'el primero es O(n); el segundo, n × n = O(n²); el tercero divide entre 2, O(log n).'],
          ['Se suman', 'van uno detrás de otro: O(n) + O(n²) + O(log n).'],
          ['Total', 'manda el mayor: **O(n²)**.'],
        ),
      },
      {
        titulo: 'Dos ramas distintas',
        enunciado: '¿Qué coste tiene en función de `n`? Piensa en cualquier `n`, no solo en el 16.',
        pregunta: TODAS,
        codigo: c(`
          if (n % 2 == 0) {
              for (i = 0; i < n; i++) x++;
          } else {
              for (i = 0; i < n; i++)
                  for (j = 0; j < n; j++) x++;
          }`),
        coste: 'O(n²)',
        pasos: pasos(
          ['Cada rama', 'la del `if` es O(n); la del `else`, O(n²).'],
          ['Cuál manda', 'solo se ejecuta una, pero no sabemos cuál: la O tiene que valer para cualquier n, así que manda la más cara.'],
          ['Total', '**O(n²)**. Si supiéramos que n es siempre par, solo correría la primera y sería O(n).'],
        ),
        alResolver: 'Con n = 16 salen 16 vueltas, pero prueba abajo con n = 17: 289.',
        nCrecimiento: [33, 257],
      },
      {
        titulo: 'Llamar a una función lineal',
        enunciado: '¿Qué coste tiene en función de `n`? `suma(v, m)` suma los `m` primeros elementos de `v`.',
        pregunta: '¿Cuántas vueltas da, en total, el bucle de dentro de `suma`?',
        codigo: c(`
          int suma(const int v[], int m) {
              int s = 0;
              for (int k = 0; k < m; k++) s += v[k];
              return s;
          }

          for (i = 0; i < n; i++)
              total += suma(v, i);`),
        contar: c(`
          int vueltas(int m) {
              int s = 0;
              for (int k = 0; k < m; k++) s++;
              return s;
          }
          for (i = 0; i < n; i++)
              x += vueltas(i);`),
        coste: 'O(n²)',
        pasos: pasos(
          ['Vueltas', 'el `for` de abajo da n vueltas.'],
          ['Cada vuelta cuesta', 'lo que cueste `suma(v, i)`: su bucle da `i` vueltas. Distinto en cada vuelta, así que se suma: 0 + 1 + … + (n−1).'],
          ['Total', 'n(n−1)/2: **O(n²)**. Solo se ve un bucle, pero hay otro dentro de la función.'],
        ),
        alResolver: 'Se puede dejar en O(n): llevando la suma acumulada de la vuelta anterior en lugar de volver a sumar desde el principio.',
      },
    ],
  ],
  [
    'Con listas, pilas y colas',
    [
      {
        titulo: 'La longitud en la condición',
        enunciado:
          '¿Qué coste tiene en función de `n`? `longitud(l)` recorre la lista contando nodos y la lista tiene `n` nodos. La condición de un `while` se vuelve a evaluar **al principio de cada vuelta**, así que `longitud(l)` se llama cada vez.',
        pregunta: '¿Cuántos nodos recorre `longitud` en total?',
        codigo: c(`
          int i = 0;
          Nodo *p = l->primero;
          while (i < longitud(l)) {
              p->dato = 0;
              p = p->sig;
              i++;
          }`),
        contar: c(`
          for (i = 0; i <= n; i++)
              for (j = 0; j < n; j++)
                  x++;`),
        coste: 'O(n²)',
        pasos: pasos(
          ['Vueltas', 'n vueltas, una por nodo.'],
          ['Cada vuelta cuesta', 'la condición se evalúa en cada vuelta y `longitud(l)` recorre los n nodos cada vez: O(n). El cuerpo es O(1).'],
          ['Total', 'la condición se comprueba n + 1 veces (la última da falso) y cada vez recorre n nodos: n·(n+1), es decir, **O(n²)**.'],
        ),
        alResolver: 'Para dejarlo en O(n), calcula la longitud **una sola vez** antes del bucle (`int lon = longitud(l);` y `while (i < lon)`), o recorre con `while (p != NULL)`.',
      },
      {
        titulo: 'Dar la vuelta a una cola con una pila',
        enunciado: '¿Qué coste tiene en función de `n`? La cola tiene `n` elementos; `encolar`, `desencolar`, `apilar` y `desapilar` son O(1).',
        pregunta: '¿Cuántas vueltas dan los dos `while` juntos?',
        codigo: c(`
          while (!colaVacia(&c)) {
              desencolar(&c, &e);
              apilar(&p, e);
          }
          while (!pilaVacia(&p)) {
              desapilar(&p, &e);
              encolar(&c, e);
          }`),
        contar: c(`
          for (i = 0; i < n; i++) x++;
          for (i = 0; i < n; i++) x++;`),
        coste: 'O(n)',
        pasos: pasos(
          ['Trozo a trozo', 'el primer `while` saca los n elementos de la cola: n vueltas de O(1). El segundo los saca de la pila: otras n.'],
          ['Se suman', 'van uno detrás de otro: n + n = 2n.'],
          ['Total', '**O(n)**.'],
        ),
      },
      {
        titulo: 'Insertar n veces al final',
        enunciado:
          'La lista empieza vacía y se insertan `n` valores con el `insertarFinal` del tema 2, que recorre la lista hasta el último nodo con `p = p->siguiente`. ¿Qué coste tiene el bucle entero?',
        pregunta: '¿Cuántas veces se ejecuta `p = p->siguiente` en total?',
        codigo: c(`
          Nodo *cab = NULL;
          for (i = 0; i < n; i++)
              insertarFinal(&cab, i);`),
        contar: c(`
          for (i = 0; i < n; i++)
              for (j = 1; j < i; j++)
                  x++;`),
        coste: 'O(n²)',
        pasos: pasos(
          ['Vueltas', 'el `for` da n vueltas.'],
          ['Cada vuelta cuesta', 'con i nodos en la lista, `insertarFinal` da i − 1 saltos para llegar al último: distinto en cada vuelta, así que se suma. 0 + 0 + 1 + 2 + … + (n−2).'],
          ['Total', 'unos n²/2 saltos: **O(n²)**. Cada inserción es O(n), y se hacen n.'],
        ),
        alResolver: 'Con un puntero al último nodo (como el `final` de la cola enlazada del tema 4) cada inserción es O(1) y el bucle entero, O(n).',
      },
      {
        titulo: 'Vaciar una pila con pop',
        enunciado: 'La pila enlazada tiene `n` elementos y `popEnlazada` es O(1). Así es `limpiarEnlazada` en el proyecto Pilas. ¿Qué coste tiene?',
        pregunta: '¿Cuántas veces se llama a `popEnlazada`, contando la última, que devuelve 0?',
        codigo: c(`
          int limpiarEnlazada(PilaEnlazada *pila) {
              if (pila == NULL) { return 0; }
              while (popEnlazada(pila, NULL)) {}
              return 1;
          }`),
        contar: 'for (i = 0; i <= n; i++) x++;',
        coste: 'O(n)',
        pasos: std('una llamada por elemento más la última, que encuentra la pila vacía: n + 1.', 'O(1): `popEnlazada` solo toca la cima.', 'n + 1 → **O(n)**. Con la pila de array, `limpiarArray` solo pone `cima = -1`: O(1), porque no hay nodos que liberar.'),
      },
    ],
  ],
  [
    'Para nota',
    [
      {
        titulo: 'Hasta la raíz',
        enunciado: '¿Qué coste tiene en función de `n`?',
        pregunta: VUELTAS,
        codigo: c(`
          i = 0;
          while (i * i < n)
              i++;`),
        contar: c(`
          i = 0;
          while (i * i < n) { i++; x++; }`),
        coste: 'O(√n)',
        pasos: std('`i` sube de uno en uno y para cuando i² llega a n, es decir, cuando `i` llega a √n.', 'O(1).', '**O(√n)**. Va entre log n y n.'),
      },
      {
        titulo: 'Elevar al cuadrado',
        enunciado: '¿Qué coste tiene en función de `n`?',
        codigo: c(`
          for (i = 2; i < n; i = i * i)
              x++;`),
        coste: 'O(log log n)',
        pasos: std(
          '`i` vale 2, 4, 16, 256, 65.536…: cada vez se eleva al cuadrado, y el exponente (1, 2, 4, 8, 16…) se dobla. Hacen falta unas log₂(log₂ n) vueltas.',
          'O(1).',
          '**O(log log n)**. Crece todavía más despacio que log n: con n = 2⁶⁴ son 6 vueltas.',
        ),
        nCrecimiento: [16, 65537],
      },
      {
        titulo: 'Un puntero que nunca vuelve atrás',
        enunciado: '¿Qué coste tiene en función de `n`? Piensa cuántas veces **en total** puede ejecutarse `j++`. Para contar, `v` está ordenado: `v[i]` vale `i`.',
        pregunta: '¿Cuántas veces se ejecutan `j++` y `x++`, sumadas?',
        codigo: c(`
          j = 0;
          for (i = 0; i < n; i++) {
              while (j < n && v[j] < v[i])
                  j++;
              x++;
          }`),
        contar: c(`
          j = 0;
          for (i = 0; i < n; i++) {
              while (j < n && j < i) { j++; x++; }
              x++;
          }`),
        coste: 'O(n)',
        pasos: pasos(
          ['El for', 'n vueltas.'],
          ['El while, en total', '`j` empieza en 0 **una sola vez**, fuera del `for`, y solo sube. Como no puede pasar de n, sumando todas las pasadas el `while` da como mucho n vueltas. No se multiplica: se cuenta el total.'],
          ['Total', 'n del `for` + como mucho n del `while` = 2n: **O(n)**.'],
        ),
        alResolver: 'La regla «vueltas × cuerpo» supone que cada vuelta paga entero el interior. Cuando el interior comparte su contador entre vueltas, hay que contar el total.',
      },
    ],
  ],
];

let num = 0;
const ejercicios: EjCoste[] = bloques.flatMap(([bloque, defs]) =>
  defs.map((d) => ({ n: 16, ...d, id: `5-${String(++num).padStart(2, '0')}`, tipo: 'coste' as const, bloque })),
);

export const tema5: Tema = {
  id: '5',
  titulo: 'Análisis de algoritmos',
  resumen: 'El coste en notación O de bucles simples, que multiplican, anidados, seguidos y con llamadas. Primero cuentas las vueltas con un n pequeño y después eliges la O; la cuenta la comprueba el intérprete.',
  ejercicios,
};
