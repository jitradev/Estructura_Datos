#include "ListaDoble.h"

#include <stdio.h>
#include <stdlib.h>

struct ListaDoble {
    NodoDoble* cabeza;  // primer nodo; NULL si la lista está vacía
    NodoDoble* cola;    // último nodo; NULL si la lista está vacía
};

// ==================== Auxiliares (no están en el .h) ====================
// Solo se usan dentro de este archivo. Llevan el sufijo ListaDoble para no chocar
// con las de las otras listas.

// Engancha "nodo" justo detrás de "anterior": cuatro enlaces, no dos.
void enlazarTrasListaDoble(ListaDoble* lista, NodoDoble* anterior, NodoDoble* nodo) {
    NodoDoble* siguiente = obtenerSiguienteNodoDoble(anterior);
    // Primero el nuevo se engancha a sus dos vecinos...
    asignarSiguienteNodoDoble(nodo, siguiente);             // 1: el nuevo mira al de la derecha
    asignarAnteriorNodoDoble(nodo, anterior);               // 2: y al de la izquierda
    // ...y después los vecinos pasan a mirar al nuevo
    if (siguiente != NULL) {
        asignarAnteriorNodoDoble(siguiente, nodo);          // 3a: el de la derecha mira atrás al nuevo (el que se olvida)
    } else {
        lista->cola = nodo;                                 // 3b: no había derecha: el nuevo es la cola
    }
    asignarSiguienteNodoDoble(anterior, nodo);              // 4: el de la izquierda mira al nuevo
}

// Quita "muerto" de la lista y lo libera. Dos enlaces, porque el nodo conoce a sus
// dos vecinos; si no tiene anterior era la cabeza, y si no tiene siguiente era la cola.
int desenlazarListaDoble(ListaDoble* lista, NodoDoble* muerto) {
    NodoDoble* anterior = obtenerAnteriorNodoDoble(muerto);
    NodoDoble* siguiente = obtenerSiguienteNodoDoble(muerto);
    if (anterior != NULL) {
        asignarSiguienteNodoDoble(anterior, siguiente);     // 1a: el de la izquierda se lo salta
    } else {
        lista->cabeza = siguiente;                          // 1b: era la cabeza
    }
    if (siguiente != NULL) {
        asignarAnteriorNodoDoble(siguiente, anterior);      // 2a: el de la derecha se lo salta hacia atrás
    } else {
        lista->cola = anterior;                             // 2b: era la cola
    }
    return borrarNodoDoble(muerto);     // desenganchado antes, liberado después
}

// Devuelve el primer nodo con ese valor, o NULL si no está.
NodoDoble* buscarValorListaDoble(ListaDoble* lista, int valor) {
    NodoDoble* nodo = lista->cabeza;
    while (nodo != NULL && obtenerValorNodoDoble(nodo) != valor) {
        nodo = obtenerSiguienteNodoDoble(nodo);
    }
    return nodo;
}

// ==================== Creación ====================

ListaDoble* crearListaDoble(void) {
    ListaDoble* lista = malloc(sizeof(ListaDoble));
    if (lista == NULL) {
        return NULL;
    }
    lista->cabeza = NULL;
    lista->cola = NULL;
    return lista;
}

// ==================== Consulta ====================

int obtenerPosicionListaDoble(ListaDoble* lista, int valor) {
    int posicion = 0;
    for (NodoDoble* nodo = lista->cabeza; nodo != NULL; nodo = obtenerSiguienteNodoDoble(nodo)) {
        if (obtenerValorNodoDoble(nodo) == valor) {
            return posicion;
        }
        posicion++;
    }
    return -1;
}

NodoDoble* obtenerNodoListaDoble(ListaDoble* lista, int posicion) {
    if (posicion < 0) {
        return NULL;
    }
    NodoDoble* nodo = lista->cabeza;
    for (int i = 0; i < posicion && nodo != NULL; i++) {
        nodo = obtenerSiguienteNodoDoble(nodo);
    }
    return nodo;
}

int obtenerLongitudListaDoble(ListaDoble* lista) {
    int longitud = 0;
    for (NodoDoble* nodo = lista->cabeza; nodo != NULL; nodo = obtenerSiguienteNodoDoble(nodo)) {
        longitud++;
    }
    return longitud;
}

int estaVacioListaDoble(ListaDoble* lista) {
    return lista->cabeza == NULL;
}

int existeNodoListaDoble(ListaDoble* lista, NodoDoble* nodo) {
    for (NodoDoble* recorrer = lista->cabeza; recorrer != NULL;
         recorrer = obtenerSiguienteNodoDoble(recorrer)) {
        if (recorrer == nodo) {
            return 1;
        }
    }
    return 0;
}

int existeValorListaDoble(ListaDoble* lista, int valor) {
    return buscarValorListaDoble(lista, valor) != NULL;
}

// ==================== Inserción ====================

int insertarPrincipioListaDoble(ListaDoble* lista, NodoDoble* nodo) {
    if (nodo == NULL) {
        return 0;
    }
    // Va a ser el primero, así que no tiene anterior. Se pone a NULL por si el nodo
    // trae un enlace viejo (por ejemplo, si se reutiliza un nodo).
    asignarAnteriorNodoDoble(nodo, NULL);
    asignarSiguienteNodoDoble(nodo, lista->cabeza);         // 1: el nuevo mira al antiguo primero
    // 2: hay que avisar al otro lado, que es distinto según si la lista estaba vacía
    if (lista->cabeza != NULL) {
        asignarAnteriorNodoDoble(lista->cabeza, nodo);      // 2a: el antiguo primero mira atrás al nuevo
    } else {
        lista->cola = nodo;                                 // 2b: estaba vacía: el nuevo también es la cola
    }
    lista->cabeza = nodo;                                   // 3: la cabeza pasa a ser el nuevo
    return 1;
}

int insertarFinalListaDoble(ListaDoble* lista, NodoDoble* nodo) {
    if (nodo == NULL) {
        return 0;
    }
    // Es el espejo de insertarPrincipio: se cambia siguiente por anterior y cabeza por cola.
    // Va a ser el último, así que no tiene siguiente (por si trae un enlace viejo).
    asignarSiguienteNodoDoble(nodo, NULL);
    asignarAnteriorNodoDoble(nodo, lista->cola);            // 1: el nuevo mira atrás al antiguo último
    // 2: hay que avisar al otro lado, que es distinto según si la lista estaba vacía
    if (lista->cola != NULL) {
        asignarSiguienteNodoDoble(lista->cola, nodo);       // 2a: el antiguo último mira al nuevo
    } else {
        lista->cabeza = nodo;                               // 2b: estaba vacía: el nuevo también es la cabeza
    }
    lista->cola = nodo;                                     // 3: la cola pasa a ser el nuevo
    return 1;
}

int insertarListaDoble(ListaDoble* lista, NodoDoble* nodo, int posicion) {
    if (nodo == NULL || posicion < 0) {
        return 0;
    }
    if (posicion == 0) {
        return insertarPrincipioListaDoble(lista, nodo);
    }
    if (posicion >= obtenerLongitudListaDoble(lista)) {
        return insertarFinalListaDoble(lista, nodo);
    }
    enlazarTrasListaDoble(lista, obtenerNodoListaDoble(lista, posicion - 1), nodo);
    return 1;
}

int insertarTrasListaDoble(ListaDoble* lista, NodoDoble* nodo, int valor) {
    if (nodo == NULL) {
        return 0;
    }
    NodoDoble* anterior = buscarValorListaDoble(lista, valor);
    if (anterior == NULL) {
        return 0;                       // ningún nodo tiene ese valor
    }
    enlazarTrasListaDoble(lista, anterior, nodo);
    return 1;
}

// ==================== Eliminación ====================
// A diferencia de la lista simple, no hace falta buscar al anterior: el nodo lo lleva
// encima. Por eso todas acaban en desenlazarListaDoble, que solo necesita el nodo a borrar.

int eliminarNodoPosicionListaDoble(ListaDoble* lista, int posicion) {
    NodoDoble* muerto = obtenerNodoListaDoble(lista, posicion);
    if (muerto == NULL) {
        return 0;                       // la posición no existe
    }
    return desenlazarListaDoble(lista, muerto);
}

int eliminarPorReferenciaListaDoble(ListaDoble* lista, NodoDoble* nodo) {
    // Igual que en la lista simple: referencia apunta al enlace que hay que cambiar
    // (la cabeza o el siguiente de un nodo), así que la cabeza no es un caso aparte.
    // La diferencia es que en una lista doble también hay que arreglar el enlace hacia atrás.
    NodoDoble** referencia = &lista->cabeza;
    while (*referencia != NULL && *referencia != nodo) {
        referencia = obtenerReferenciaSiguienteNodoDoble(*referencia);
    }
    if (*referencia == NULL) {
        return 0;                       // el nodo no estaba en la lista
    }
    NodoDoble* siguiente = obtenerSiguienteNodoDoble(nodo);
    *referencia = siguiente;                                    // 1: se le salta hacia delante
    if (siguiente != NULL) {
        asignarAnteriorNodoDoble(siguiente, obtenerAnteriorNodoDoble(nodo));    // 2a: y hacia atrás
    } else {
        lista->cola = obtenerAnteriorNodoDoble(nodo);           // 2b: era la cola
    }
    return borrarNodoDoble(nodo);                               // 3: y ahora sí se libera
}

int eliminarNodoListaDoble(ListaDoble* lista, NodoDoble* nodo) {
    if (nodo == NULL || !existeNodoListaDoble(lista, nodo)) {
        return 0;
    }
    return desenlazarListaDoble(lista, nodo);
}

int eliminarPorValorListaDoble(ListaDoble* lista, int valor) {
    NodoDoble* muerto = buscarValorListaDoble(lista, valor);
    if (muerto == NULL) {
        return 0;                       // ningún nodo tiene ese valor
    }
    return desenlazarListaDoble(lista, muerto);
}

void eliminarListaDoble(ListaDoble* lista) {
    NodoDoble* nodo = lista->cabeza;
    while (nodo != NULL) {
        NodoDoble* siguiente = obtenerSiguienteNodoDoble(nodo); // guarda el enlace antes de...
        borrarNodoDoble(nodo);                                  // ...liberar el nodo actual
        nodo = siguiente;
    }
    free(lista);
}

// ==================== Salida ====================

void mostrarListaDoble(ListaDoble* lista) {
    printf("Lista doble: ");
    for (NodoDoble* nodo = lista->cabeza; nodo != NULL; nodo = obtenerSiguienteNodoDoble(nodo)) {
        printf("%d <-> ", obtenerValorNodoDoble(nodo));
    }
    printf("NULL\n");
}
