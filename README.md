# EDA · ejercicios interactivos de listas, pilas y colas

Aplicación web, **solo frontend** (React + Vite + TypeScript), hermana de la de Lenguajes Formales. El alumnado escribe C (un C reducido: punteros, nodos, `malloc`, `free`, `if`, `while`, `for`), lo ejecuta y ve la memoria animada línea a línea con el convenio de los decks: en rojo lo que cambia, en gris lo que deja de valer, el nodo liberado con caja discontinua y aspa, y en ámbar los nodos a los que ya no llega nadie (fugas).

## Qué hay

| Tema | Programar a mano | Escribe la función | Encuentra el fallo |
|---|---|---|---|
| 2 · Listas | 6 | 6 | 8 |
| 3 · Pilas | 3 | 5 | 5 |
| 4 · Colas | 4 | 4 | 6 |

- **Programar a mano**: sentencias sueltas sobre una estructura dada (insertar al principio, quitar el primero, push a mano...).
- **Escribe la función**: completar una función de las cabeceras del tema (`insertarFinal`, `suprimir`, `pop`, `encolar`...). Se prueba con varios casos (lista vacía, un nodo, varios; pila llena o vacía...).
- **Encuentra el fallo**: una función con un fallo típico. Cuatro pasos: encontrar el caso que falla, marcar la línea, decir qué tipo de fallo es y arreglarlo.
- **Laboratorio**: lista, pila o cola de partida y código libre, sin corrección.
- **Visualizar** (`#/ver`): las dos pilas del proyecto Pilas (`PilaArray` y `PilaEnlazada`, en `src/stacks/`), las del proyecto Colas (cola con array y enlazada; bicola con array, enlazada y de salida restringida; cola con prioridad con lista ordenada y con array de colas, en `src/queues/`) y las cuatro listas del TAD (simple, doble, circular y circular doble) dibujadas con sus structs, una tabla que las compara y, para cada una, sus operaciones paso a paso (insertar, eliminar, consultar) con la lista de partida y los parámetros que se quieran. Se ejecuta el código de `src/listas/c/*.c` tal cual: las funciones del TAD Nodo y las de consulta van de un solo paso y el resto se ve línea a línea.

Los structs son los de `soluciones-codigo` con los nombres de campo del TAD Lista (`Nodo` con `valor` y `siguiente`, y `anterior` en el nodo doble; `MAX` 6 en la pila y 5 en la cola circular con contador).

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

Están en `src/ejercicios/tema2.ts`, `tema3.ts` y `tema4.ts`. Cada uno lleva `ctx` (los structs del tema, de `src/memoria/construir.ts`), `casos` (estado inicial y, si es una función, la llamada), `observar` (las variables de main que se comparan) y `solucion`. Los de fallo llevan además `codigo`, `lineasFallo`, `tiposFallo` y `explicacion`. Al añadir uno, `npm test` comprueba solo que la solución funciona y que el fallo falla.

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
