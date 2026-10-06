//
// TAD Lista circular doblemente enlazada.
// El círculo en los dos sentidos: no hay ningún NULL. El último apunta hacia
// delante al primero y el primero apunta hacia atrás al último.
// El puntero de acceso señala al PRIMERO, y el último es siempre su anterior.
//
// Mismas operaciones que Lista.h con el sufijo "ListaCircularDoble".
// Al insertar un nodo, la lista pasa a ser dueña de él: las funciones de eliminar lo liberan.
//

#ifndef LISTAS_LISTACIRCULARDOBLE_H
#define LISTAS_LISTACIRCULARDOBLE_H
#include "NodoDoble.h"

typedef struct ListaCircularDoble ListaCircularDoble;

// ---------- Creación ----------

// Crea una lista circular doble vacía. Devuelve NULL si no hay memoria.
ListaCircularDoble* crearListaCircularDoble(void);

// ---------- Consulta ----------

// Devuelve la posición (0 = el primero) del primer nodo con ese valor, o -1 si no está.
int obtenerPosicionListaCircularDoble(ListaCircularDoble* lista, int valor);

// Devuelve el nodo que ocupa esa posición, o NULL si la posición no existe (no da vueltas).
NodoDoble* obtenerNodoListaCircularDoble(ListaCircularDoble* lista, int posicion);

// Devuelve cuántos nodos tiene la lista.
int obtenerLongitudListaCircularDoble(ListaCircularDoble* lista);

// Devuelve 1 si la lista no tiene nodos y 0 si tiene alguno.
int estaVacioListaCircularDoble(ListaCircularDoble* lista);

// Devuelve 1 si ese nodo (esa dirección de memoria) está en la lista y 0 si no.
int existeNodoListaCircularDoble(ListaCircularDoble* lista, NodoDoble* nodo);

// Devuelve 1 si algún nodo de la lista tiene ese valor y 0 si no.
int existeValorListaCircularDoble(ListaCircularDoble* lista, int valor);

// ---------- Inserción ----------
// Todas devuelven 1 si han insertado y 0 si no (nodo NULL, posición o valor no válidos).

// Inserta el nodo al principio: detrás del último, y el acceso pasa a ser el nuevo.
int insertarPrincipioListaCircularDoble(ListaCircularDoble* lista, NodoDoble* nodo);

// Inserta el nodo al final: detrás del último (el anterior del acceso), sin mover el acceso.
int insertarFinalListaCircularDoble(ListaCircularDoble* lista, NodoDoble* nodo);

// Inserta el nodo para que ocupe esa posición (0 = principio).
// Si la posición es mayor o igual que la longitud, lo inserta al final.
int insertarListaCircularDoble(ListaCircularDoble* lista, NodoDoble* nodo, int posicion);

// Inserta el nodo justo detrás del primer nodo que tenga ese valor (cuatro enlaces).
// Devuelve 0 si ningún nodo tiene ese valor.
int insertarTrasListaCircularDoble(ListaCircularDoble* lista, NodoDoble* nodo, int valor);

// ---------- Eliminación ----------
// Todas liberan el nodo eliminado y devuelven 1, o 0 si no había nada que eliminar.
// Si se borra el de acceso, el acceso avanza; si se borra el único, la lista queda vacía.

// Elimina el nodo que ocupa esa posición.
int eliminarNodoPosicionListaCircularDoble(ListaCircularDoble* lista, int posicion);

// Elimina ese nodo recorriendo los enlaces con un puntero doble.
int eliminarPorReferenciaListaCircularDoble(ListaCircularDoble* lista, NodoDoble* nodo);

// Elimina ese nodo usando su enlace al anterior (comprueba antes que esté en la lista).
int eliminarNodoListaCircularDoble(ListaCircularDoble* lista, NodoDoble* nodo);

// Elimina el primer nodo que tenga ese valor.
int eliminarPorValorListaCircularDoble(ListaCircularDoble* lista, int valor);

// Libera todos los nodos y la propia lista. Después no se puede volver a usar.
void eliminarListaCircularDoble(ListaCircularDoble* lista);

// ---------- Salida ----------

// Muestra la lista hacia delante: Lista circular doble: 1 <-> 2 <-> 3 <-> (vuelve al 1)
void mostrarListaCircularDoble(ListaCircularDoble* lista);

#endif //LISTAS_LISTACIRCULARDOBLE_H
