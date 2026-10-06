//
// TAD Lista doblemente enlazada.
// Cada nodo apunta al siguiente y al anterior; el primero tiene anterior = NULL y el
// último siguiente = NULL. La lista guarda sus dos extremos, cabeza y cola, así que
// se puede entrar por cualquiera de los dos y recorrerla en los dos sentidos.
//
// Mismas operaciones que Lista.h con el sufijo "ListaDoble".
// Al insertar un nodo, la lista pasa a ser dueña de él: las funciones de eliminar lo liberan.
//

#ifndef LISTAS_LISTADOBLE_H
#define LISTAS_LISTADOBLE_H
#include "NodoDoble.h"

typedef struct ListaDoble ListaDoble;

// ---------- Creación ----------

// Crea una lista doble vacía. Devuelve NULL si no hay memoria.
ListaDoble* crearListaDoble(void);

// ---------- Consulta ----------

// Devuelve la posición (0, 1, 2...) del primer nodo con ese valor, o -1 si no está.
int obtenerPosicionListaDoble(ListaDoble* lista, int valor);

// Devuelve el nodo que ocupa esa posición, o NULL si la posición no existe.
NodoDoble* obtenerNodoListaDoble(ListaDoble* lista, int posicion);

// Devuelve cuántos nodos tiene la lista.
int obtenerLongitudListaDoble(ListaDoble* lista);

// Devuelve 1 si la lista no tiene nodos y 0 si tiene alguno.
int estaVacioListaDoble(ListaDoble* lista);

// Devuelve 1 si ese nodo (esa dirección de memoria) está en la lista y 0 si no.
int existeNodoListaDoble(ListaDoble* lista, NodoDoble* nodo);

// Devuelve 1 si algún nodo de la lista tiene ese valor y 0 si no.
int existeValorListaDoble(ListaDoble* lista, int valor);

// ---------- Inserción ----------
// Todas devuelven 1 si han insertado y 0 si no (nodo NULL, posición o valor no válidos).

// Inserta el nodo al principio: pasa a ser la cabeza. Toca dos enlaces.
int insertarPrincipioListaDoble(ListaDoble* lista, NodoDoble* nodo);

// Inserta el nodo al final: pasa a ser la cola. No recorre nada gracias a la cola.
int insertarFinalListaDoble(ListaDoble* lista, NodoDoble* nodo);

// Inserta el nodo para que ocupe esa posición (0 = principio).
// Si la posición es mayor o igual que la longitud, lo inserta al final.
int insertarListaDoble(ListaDoble* lista, NodoDoble* nodo, int posicion);

// Inserta el nodo justo detrás del primer nodo que tenga ese valor (toca cuatro enlaces).
// Devuelve 0 si ningún nodo tiene ese valor.
int insertarTrasListaDoble(ListaDoble* lista, NodoDoble* nodo, int valor);

// ---------- Eliminación ----------
// Todas liberan el nodo eliminado y devuelven 1, o 0 si no había nada que eliminar.
// No hace falta buscar al anterior: cada nodo lo lleva encima.

// Elimina el nodo que ocupa esa posición.
int eliminarNodoPosicionListaDoble(ListaDoble* lista, int posicion);

// Elimina ese nodo recorriendo los enlaces con un puntero doble.
int eliminarPorReferenciaListaDoble(ListaDoble* lista, NodoDoble* nodo);

// Elimina ese nodo usando su enlace al anterior (comprueba antes que esté en la lista).
int eliminarNodoListaDoble(ListaDoble* lista, NodoDoble* nodo);

// Elimina el primer nodo que tenga ese valor.
int eliminarPorValorListaDoble(ListaDoble* lista, int valor);

// Libera todos los nodos y la propia lista. Después no se puede volver a usar.
void eliminarListaDoble(ListaDoble* lista);

// ---------- Salida ----------

// Muestra la lista de la cabeza a la cola: Lista doble: 9 <-> 3 <-> 7 <-> NULL
void mostrarListaDoble(ListaDoble* lista);

#endif //LISTAS_LISTADOBLE_H
