//
// Created by Jose Ignacio Trasobares Ibor on 24/09/2026.
//
// TAD Lista simplemente enlazada.
// Cada nodo apunta al siguiente y el último apunta a NULL.
// La lista se representa con un único puntero, la cabeza; si cabeza == NULL, está vacía.
//
// Los nodos se crean fuera (crearNodo + asignarValor) y se le pasan a la lista.
// Al insertarlo, la lista pasa a ser dueña del nodo: las funciones de eliminar lo liberan.
// No se debe insertar un nodo que ya esté en una lista.
//

#ifndef LISTAS_LISTA_H
#define LISTAS_LISTA_H
#include "Nodo.h"

typedef struct Lista Lista;

// ---------- Creación ----------

// Crea una lista vacía. Devuelve NULL si no hay memoria.
Lista* crearLista(void);

// ---------- Consulta ----------

// Devuelve la posición (0, 1, 2...) del primer nodo con ese valor, o -1 si no está.
int obtenerPosicion(Lista* lista, int valor);

// Devuelve el nodo que ocupa esa posición, o NULL si la posición no existe.
Nodo* obtenerNodo(Lista* lista, int posicion);

// Devuelve cuántos nodos tiene la lista.
int obtenerLongitud(Lista* lista);

// Devuelve 1 si la lista no tiene nodos y 0 si tiene alguno.
int estaVacio(Lista* lista);

// Devuelve 1 si ese nodo (esa dirección de memoria) está en la lista y 0 si no.
int existeNodo(Lista* lista, Nodo* nodo);

// Devuelve 1 si algún nodo de la lista tiene ese valor y 0 si no.
int existeValor(Lista* lista, int valor);

// ---------- Inserción ----------
// Todas devuelven 1 si han insertado y 0 si no (nodo NULL, posición o valor no válidos).

// Inserta el nodo al principio: pasa a ser la cabeza.
int insertarPrincipio(Lista* lista, Nodo* nodo);

// Inserta el nodo al final. Recorre la lista hasta el último.
int insertarFinal(Lista* lista, Nodo* nodo);

// Inserta el nodo para que ocupe esa posición (0 = principio).
// Si la posición es mayor o igual que la longitud, lo inserta al final.
int insertar(Lista* lista, Nodo* nodo, int posicion);

// Inserta el nodo justo detrás del primer nodo que tenga ese valor.
// Devuelve 0 si ningún nodo tiene ese valor.
int insertarTras(Lista* lista, Nodo* nodo, int valor);

// ---------- Eliminación ----------
// Todas liberan el nodo eliminado y devuelven 1, o 0 si no había nada que eliminar.

// Elimina el nodo que ocupa esa posición.
int eliminarNodoPosicion(Lista* lista, int posicion);

// Elimina ese nodo usando el truco del puntero doble (sin caso aparte para la cabeza).
int eliminarPorReferencia(Lista* lista, Nodo* nodo);

// Elimina ese nodo buscando antes a su anterior (con la cabeza como caso aparte).
int eliminarNodo(Lista* lista, Nodo* nodo);

// Elimina el primer nodo que tenga ese valor.
int eliminarPorValor(Lista* lista, int valor);

// Libera todos los nodos y la propia lista. Después no se puede volver a usar.
void eliminarLista(Lista* lista);

// ---------- Salida ----------

// Muestra la lista por pantalla: Lista: 9 -> 3 -> 7 -> NULL
void mostrarLista(Lista* lista);

#endif //LISTAS_LISTA_H
