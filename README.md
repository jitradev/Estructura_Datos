# EDA · ejercicios interactivos de listas, pilas, colas y coste de algoritmos

Aplicación web, **solo frontend** (React + Vite + TypeScript), hermana de la de Lenguajes Formales. El alumnado escribe C (un C reducido: punteros, nodos, `malloc`, `free`, `if`, `while`, `for`), lo ejecuta y ve la memoria animada línea a línea con el convenio de los decks: en rojo lo que cambia, en gris lo que deja de valer, el nodo liberado con caja discontinua y aspa, y en ámbar los nodos a los que ya no llega nadie (fugas).

## Qué hay

| Tema | Programar a mano | Escribe la función | Encuentra el fallo | Función misteriosa |
|---|---|---|---|---|
| 2 · Listas | 8 | 10 | 13 | 8 |
| 3 · Pilas | 6 | 7 | 10 | 6 |
| 4 · Colas | 6 | 7 | 10 | 6 |

Varios vienen del cuadernillo a papel de cada tema (la traza de operaciones, los recorridos que fallan, el `suprimirTodos` con dos errores, el penúltimo, «qué sale» de la pila y de la cola, contar la cola sin mirar el contador). Y el tema 5 (Análisis de algoritmos), con 29 de **Calcula el coste**.

- **Programar a mano**: sentencias sueltas sobre una estructura dada (insertar al principio, quitar el primero, push a mano...).
- **Escribe la función**: completar una función de las cabeceras del tema (`insertarFinal`, `suprimir`, `pop`, `encolar`...). Se prueba con varios casos (lista vacía, un nodo, varios; pila llena o vacía...).
- **Encuentra el fallo**: una función con un fallo típico. Cuatro pasos: encontrar el caso que falla, marcar la línea, decir qué tipo de fallo es y arreglarlo.
- **Función misteriosa**: una función (o unas sentencias) sin decir qué hace. Primero se predice qué devuelve o cómo queda la estructura en cada caso (una lista se escribe desde la cabeza, una pila del fondo a la cima y una cola del frente al final) y después se elige qué hace entre cuatro descripciones. Al acabar se ve ejecutarse paso a paso.
- **Calcula el coste** (tema 5): un fragmento de código con bucles y solo hay que escribir su coste en notación O (vale `O(n^2)`, `n²`, `log(n)`, `sqrt(n)`...; si sobra una constante, como `O(2n)`, lo avisa). Al acabar salen los tres pasos del método y una tabla con la cuenta para n = 8, 16, 32 y 64 (y la que se quiera), para ver cuánto sube al doblar n. Son los 24 fragmentos del cuadernillo a papel del tema 5 más cinco nuevos (dos bucles seguidos, dos completos, búsqueda binaria, insertar n veces al final y vaciar una pila).
- **Laboratorio**: primero se elige con qué estructura trabajar, filtrando por listas, pilas o colas (`#/lab/listas`...): las cuatro listas, las dos pilas y las siete colas de los proyectos (`src/vistas/mesas.tsx`, sobre los catálogos de Visualizar). Empieza creada y vacía, con todas las funciones de su proyecto disponibles (se ejecutan en un solo paso), y se escribe código libre sobre ella (`#/lab/e/<id>`, donde un selector cambia a otra del mismo tipo y no hay paso a la calculadora), sin corrección; «Cargar un ejemplo» pone un código de muestra. Tiene una segunda pestaña, la **calculadora de O(n)** (`#/lab/coste`): da la O de cada bucle (vueltas × coste de una vuelta), de cada llamada y la del total. Por dentro plantea la ecuación del coste (un bucle es una suma sobre su variable) y la resuelve de dentro hacia fuera (`analizarCoste`, en `src/ejercicios/ecuacion.ts`). Los bucles que dependen de los datos no se pueden resolver: entonces dice por qué y, si el código cuenta con `x++`, estima la O ejecutándolo con n = 8 a 1024 (`estimarCoste`, en `src/ejercicios/coste.ts`).
- **Visualizar** (`#/ver`): las dos pilas del proyecto Pilas (`PilaArray` y `PilaEnlazada`, en `src/stacks/`), las del proyecto Colas (cola con array y enlazada; bicola con array, enlazada y de salida restringida; cola con prioridad con lista ordenada y con array de colas, en `src/queues/`) y las cuatro listas del TAD (simple, doble, circular y circular doble) dibujadas con sus structs, una tabla que las compara y, para cada una, sus operaciones paso a paso (insertar, eliminar, consultar) con la lista de partida y los parámetros que se quieran. Se ejecuta el código de `src/listas/c/*.c` tal cual: las funciones del TAD Nodo y las de consulta van de un solo paso y el resto se ve línea a línea.

Las listas usan los structs de `soluciones-codigo` con los nombres de campo del TAD Lista (`Nodo` con `valor` y `siguiente`, y `anterior` en el nodo doble). Las pilas y las colas usan los de los proyectos `Pilas` y `Colas`, los mismos que se ejecutan en Visualizar: `PilaArray` (`TAM` vale 8 en los ejercicios) y `PilaEnlazada`; `ColaArray` (`TAM_COLA_ARRAY` 10) y `ColaEnlazada` sobre el TAD `NodoSimple`. En cada ejercicio están disponibles todas las funciones del proyecto; en los de «a mano», `prohibidos` veta la que se pide escribir (una entrada que acaba en `()` es una función).

## Cómo se corrige

No hay soluciones escritas a mano: cada ejercicio trae su código de referencia (`solucion`) y la app lo ejecuta sobre cada caso. El del alumno se compara «por forma» con el de referencia (desde las variables observadas se tiene que llegar a los mismos valores con la misma forma), más lo que devuelve y las fugas. Los errores de memoria paran la ejecución en su línea: acceso a NULL, uso tras `free`, doble `free`, variable sin inicializar, fuera del array y bucle infinito.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # intérprete + catálogo: cada solución pasa sus casos sin fugas y cada fallo falla en algún caso
npm run build    # genera dist/
```

## Publicar en Vercel

Igual que la de Lenguajes Formales: subir la carpeta a un repositorio de GitHub e importarlo en Vercel. `vercel.json` ya fija `npm run build` y `dist`, y las rutas van con `#` (`/#/ej/2-F2`).

## Cómo añadir ejercicios

Están en `src/ejercicios/tema2.ts`, `tema3.ts`, `tema4.ts` y `tema5.ts`. Cada uno lleva `ctx` (los structs del tema, de `src/memoria/construir.ts`), `casos` (estado inicial y, si es una función, la llamada), `observar` (las variables de main que se comparan) y `solucion`. Los de fallo llevan además `codigo`, `lineasFallo`, `tiposFallo` y `explicacion`. Los misteriosos enseñan `solucion` y llevan `responder` (`'devuelve'` o variables de main), `opciones`, `correcta` y `explicacion`; lo que hay que predecir lo calcula el intérprete. Al añadir uno, `npm test` comprueba solo que la solución funciona y que el fallo falla.

Los de coste (`tema5.ts`) no tienen casos: llevan `codigo`, la `pregunta` de qué se cuenta, `contar` (el mismo fragmento dejando la cuenta en `x`, si el que se enseña no lo hace; `n`, `x`, `i`, `j` y `k` ya están declaradas), el `coste` y los tres `pasos` de la explicación. La cuenta no se escribe a mano: la hace el intérprete (`src/ejercicios/coste.ts`). `npm test` comprueba que se cuenta sin errores y que la cuenta crece como dice `coste` entre dos valores de n (`nCrecimiento`, por defecto 32 y 256; en el peor caso si depende de n).

## Visualizar: el código de las listas

`src/listas/c/` y `src/listas/h/` son copias de la carpeta `Listas` (el proyecto CMake del TAD). Si se cambia allí, basta con copiar los `.c` y `.h` de nuevo: la app los trocea por funciones (`src/listas/trocear.ts`) y `npm test` repite el `main.c` y comprueba que cada operación funciona en una lista vacía, con un nodo y con varios, sin fugas. Las operaciones que se ofrecen están en `src/listas/catalogo.ts`.

## Visualizar: el código de las pilas

`src/stacks/c/` y `src/stacks/h/` son copias del proyecto `Pilas`. Se ejecuta solo la función elegida paso a paso; el resto (`esVacia`, `limpiar` dentro de `destruir`...) va de un solo paso. Las funciones `imprimir` no se cargan. `TAM` vale 1024 en el código y 8 en el dibujo (`TAM_DIBUJO` en `src/stacks/catalog.ts`). `npm test` repite el `main.c` de las pilas.

## Visualizar: el código de las colas

`src/queues/c/` y `src/queues/h/` son copias del proyecto `Colas`, con una función de consulta añadida en cada cola (`frenteColaArray`, `principioBicolaArray`, `finalBicolaArray`...), que está en el TAD de las diapositivas. Como en las pilas, main tiene el puntero `cola` que devuelve `crear...` y `x`; se ejecuta solo la función elegida paso a paso y el resto (las del mismo archivo, las del TAD del nodo y, en la de prioridad con array, las de `ColaEnlazada`) va de un solo paso. Las funciones `mostrar` no se cargan. `TAM_COLA_ARRAY` vale 10, como en el código; `TAM_BICOLA_ARRAY` vale 100 en el código y 10 en el dibujo (`TAM_BICOLA_DIBUJO` en `src/queues/catalog.ts`). `npm test` repite el `main.c` de las colas.

## Temas ocultos

Los temas que no se ven en la web están en `OCULTOS`, en `src/ejercicios/registro.ts` (ahora ninguno). Los tests los siguen comprobando.

## Pendiente

- Ejercicios de C «de verdad» compilados en el navegador (Clang en WebAssembly), según el plan.
- Ejercicios de lista doble y circular (ya se dibujan en Visualizar, pero aún no hay ejercicios corregidos).
- Limitaciones: todo es frontend, así que las soluciones viajan en el JavaScript; y el progreso se guarda por navegador.
