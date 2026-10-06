//
// Created by Jose Ignacio Trasobares Ibor on 30/09/2026.
//
// TAD Lista circular simple.
// No hay NULL al final: el último nodo apunta otra vez al primero.
// El puntero de acceso señala al ÚLTIMO nodo, así que el primero es su siguiente
// y se puede insertar tanto al principio como al final sin recorrer nada.
//
// Mismas operaciones que Lista.h con el sufijo "ListaCircular".
// Al insertar un nodo, la lista pasa a ser dueña de él: las funciones de eliminar lo liberan.
//

#ifndef LISTAS_LISTACIRCULAR_H
#define LISTAS_LISTACIRCULAR_H
#include "Nodo.h"

typedef struct ListaCircular ListaCircular;

// ---------- Creación ----------

// Crea una lista circular vacía. Devuelve NULL si no hay memoria.
ListaCircular* crearListaCircular(void);

// ---------- Consulta ----------

// Devuelve la posición (0 = el primero) del primer nodo con ese valor, o -1 si no está.
int obtenerPosicionListaCircular(ListaCircular* lista, int valor);

// Devuelve el nodo que ocupa esa posición, o NULL si la posición no existe (no da vueltas).
Nodo* obtenerNodoListaCircular(ListaCircular* lista, int posicion);

// Devuelve cuántos nodos tiene la lista.
int obtenerLongitudListaCircular(ListaCircular* lista);

// Devuelve 1 si la lista no tiene nodos y 0 si tiene alguno.
int estaVacioListaCircular(ListaCircular* lista);

// Devuelve 1 si ese nodo (esa dirección de memoria) está en la lista y 0 si no.
int existeNodoListaCircular(ListaCircular* lista, Nodo* nodo);

// Devuelve 1 si algún nodo de la lista tiene ese valor y 0 si no.
int existeValorListaCircular(ListaCircular* lista, int valor);

// ---------- Inserción ----------
// Todas devuelven 1 si han insertado y 0 si no (nodo NULL, posición o valor no válidos).

// Inserta el nodo al principio: detrás del último, sin mover el acceso.
int insertarPrincipioListaCircular(ListaCircular* lista, Nodo* nodo);

// Inserta el nodo para que ocupe esa posición (0 = principio).
// Si la posición es mayor o igual que la longitud, lo inserta al final
// (detrás del último, y el acceso pasa a ser el nuevo).
int insertarListaCircular(ListaCircular* lista, Nodo* nodo, int posicion);

// Inserta el nodo justo detrás del primer nodo que tenga ese valor.
// Si ese nodo era el último, el nuevo pasa a ser el último. Devuelve 0 si el valor no está.
int insertarTrasListaCircular(ListaCircular* lista, Nodo* nodo, int valor);

// ---------- Eliminación ----------
// Todas liberan el nodo eliminado y devuelven 1, o 0 si no había nada que eliminar.
// Si se borra el último, el acceso retrocede; si se borra el único, la lista queda vacía.

// Elimina el nodo que ocupa esa posición.
int eliminarNodoPosicionListaCircular(ListaCircular* lista, int posicion);

// Elimina ese nodo recorriendo los enlaces con un puntero doble.
int eliminarPorReferenciaListaCircular(ListaCircular* lista, Nodo* nodo);

// Elimina ese nodo buscando antes a su anterior.
int eliminarNodoListaCircular(ListaCircular* lista, Nodo* nodo);

// Elimina el primer nodo que tenga ese valor.
int eliminarPorValorListaCircular(ListaCircular* lista, int valor);

// Libera todos los nodos y la propia lista. Después no se puede volver a usar.
void eliminarListaCircular(ListaCircular* lista);

// ---------- Salida ----------

// Muestra la lista por pantalla: Lista circular: 1 -> 2 -> 3 -> (vuelve al 1)
void mostrarListaCircular(ListaCircular* lista);

#endif //LISTAS_LISTACIRCULAR_H
