#include "Lista.h"

#include <stdio.h>
#include <stdlib.h>

struct Lista {
    Nodo* cabeza;   // primer nodo; NULL si la lista está vacía
};

// ==================== Creación ====================

Lista* crearLista(void) {
    Lista* lista = malloc(sizeof(Lista));
    if (lista == NULL) {
        return NULL;
    }
    lista->cabeza = NULL;
    return lista;
}

// ==================== Consulta ====================

int obtenerPosicion(Lista* lista, int valor) {
    // Se recorre con un puntero auxiliar, nunca moviendo la cabeza
    Nodo* nodo = lista->cabeza;
    int posicion = 0;
    while (nodo != NULL) {
        if (obtenerValor(nodo) == valor) {
            return posicion;
        }
        posicion++;
        nodo = obtenerSiguiente(nodo);
    }
    return -1;
}

Nodo* obtenerNodo(Lista* lista, int posicion) {
    if (posicion < 0) {
        return NULL;
    }
    Nodo* nodo = lista->cabeza;
    for (int i = 0; i < posicion && nodo != NULL; i++) {
        nodo = obtenerSiguiente(nodo);
    }
    return nodo;                    // NULL si la lista se acabó antes
}

int obtenerLongitud(Lista* lista) {
    int longitud = 0;
    for (Nodo* nodo = lista->cabeza; nodo != NULL; nodo = obtenerSiguiente(nodo)) {
        longitud++;
    }
    return longitud;
}

int estaVacio(Lista* lista) {
    return lista->cabeza == NULL;
}

int existeNodo(Lista* lista, Nodo* nodo) {
    for (Nodo* recorrer = lista->cabeza; recorrer != NULL; recorrer = obtenerSiguiente(recorrer)) {
        if (recorrer == nodo) {
            return 1;
        }
    }
    return 0;
}

int existeValor(Lista* lista, int valor) {
    return obtenerPosicion(lista, valor) != -1;
}

// ==================== Inserción ====================

int insertarPrincipio(Lista* lista, Nodo* nodo) {
    if (nodo == NULL) {
        return 0;
    }
    // El orden de estas dos líneas no es negociable:
    asignarSiguiente(nodo, lista->cabeza);      // 1: enlaza con la lista antigua
    lista->cabeza = nodo;                       // 2: la cabeza pasa a ser el nuevo
    return 1;
}

int insertarFinal(Lista* lista, Nodo* nodo) {
    if (nodo == NULL) {
        return 0;
    }
    asignarSiguiente(nodo, NULL);               // va a ser el último
    if (estaVacio(lista)) {                     // la lista vacía es un caso aparte
        lista->cabeza = nodo;
        return 1;
    }
    Nodo* ultimo = lista->cabeza;
    while (obtenerSiguiente(ultimo) != NULL) {  // busca el último
        ultimo = obtenerSiguiente(ultimo);
    }
    asignarSiguiente(ultimo, nodo);
    return 1;
}

int insertar(Lista* lista, Nodo* nodo, int posicion) {
    if (nodo == NULL || posicion < 0) {
        return 0;
    }
    if (posicion == 0) {
        return insertarPrincipio(lista, nodo);
    }
    if (posicion >= obtenerLongitud(lista)) {
        return insertarFinal(lista, nodo);
    }
    Nodo* anterior = obtenerNodo(lista, posicion - 1);
    asignarSiguiente(nodo, obtenerSiguiente(anterior));     // 1: el nuevo mira al resto
    asignarSiguiente(anterior, nodo);                       // 2: y el anterior mira al nuevo
    return 1;
}

int insertarTras(Lista* lista, Nodo* nodo, int valor) {
    if (nodo == NULL) {
        return 0;
    }
    Nodo* anterior = lista->cabeza;
    while (anterior != NULL && obtenerValor(anterior) != valor) {
        anterior = obtenerSiguiente(anterior);
    }
    if (anterior == NULL) {
        return 0;                               // ningún nodo tiene ese valor
    }
    asignarSiguiente(nodo, obtenerSiguiente(anterior));     // 1
    asignarSiguiente(anterior, nodo);                       // 2
    return 1;
}

// ==================== Eliminación ====================
// Siempre en el mismo orden: primero se le salta desde fuera, después se libera.
// Al revés se leería memoria ya liberada.
//
// Para saltar un nodo hay que cambiar el enlace que apunta a él, y ese enlace es
// el siguiente de su ANTERIOR. La cabeza no tiene anterior (el enlace que la apunta
// es lista->cabeza), por eso eliminarNodoPosicion, eliminarNodo y eliminarPorValor
// la tratan como caso aparte. eliminarPorReferencia evita ese caso con el puntero doble.

int eliminarNodoPosicion(Lista* lista, int posicion) {
    if (posicion < 0 || posicion >= obtenerLongitud(lista)) {
        return 0;
    }
    if (posicion == 0) {                        // caso aparte: la cabeza no tiene anterior
        Nodo* muerto = lista->cabeza;
        lista->cabeza = obtenerSiguiente(muerto);   // 1: la cabeza pasa al segundo
        return borrarNodo(muerto);                  // 2: y se libera el antiguo primero
    }
    Nodo* muertoAnterior = obtenerNodo(lista, posicion - 1);
    Nodo* muerto = obtenerSiguiente(muertoAnterior);
    asignarSiguiente(muertoAnterior, obtenerSiguiente(muerto));    // 1: se le salta desde fuera
    return borrarNodo(muerto);                                      // 2: y ahora sí se libera
}

int eliminarPorReferencia(Lista* lista, Nodo* nodo) {
    // referencia guarda la DIRECCIÓN de un enlace: al principio la cabeza,
    // luego el siguiente de un nodo. Así borrar la cabeza no es un caso aparte.
    Nodo** referencia = &lista->cabeza;
    while (*referencia != NULL && *referencia != nodo) {
        referencia = obtenerReferenciaSiguiente(*referencia);
    }
    if (*referencia == NULL) {
        return 0;                               // el nodo no estaba en la lista
    }
    Nodo* muerto = *referencia;
    *referencia = obtenerSiguiente(muerto);     // 1: se le salta desde fuera...
    return borrarNodo(muerto);                  // 2: ...y ahora sí se libera
}

int eliminarNodo(Lista* lista, Nodo* nodo) {
    if (estaVacio(lista) || nodo == NULL) {
        return 0;
    }
    if (lista->cabeza == nodo) {                // caso aparte: la cabeza no tiene anterior
        lista->cabeza = obtenerSiguiente(nodo);     // 1
        return borrarNodo(nodo);                    // 2
    }
    // Se busca el ANTERIOR al nodo, no el nodo: es el único que puede saltarlo
    Nodo* anterior = lista->cabeza;
    while (obtenerSiguiente(anterior) != NULL && obtenerSiguiente(anterior) != nodo) {
        anterior = obtenerSiguiente(anterior);
    }
    if (obtenerSiguiente(anterior) != nodo) {
        return 0;                               // el nodo no estaba en la lista
    }
    asignarSiguiente(anterior, obtenerSiguiente(nodo));     // 1: se le salta desde fuera
    return borrarNodo(nodo);                                // 2: y ahora sí se libera
}

int eliminarPorValor(Lista* lista, int valor) {
    if (estaVacio(lista)) {
        return 0;
    }
    if (obtenerValor(lista->cabeza) == valor) { // caso aparte: la cabeza no tiene anterior
        Nodo* muerto = lista->cabeza;
        lista->cabeza = obtenerSiguiente(muerto);   // 1
        return borrarNodo(muerto);                  // 2
    }
    // Se mira el valor del SIGUIENTE para quedarse parado en el anterior
    Nodo* anterior = lista->cabeza;
    while (obtenerSiguiente(anterior) != NULL &&
           obtenerValor(obtenerSiguiente(anterior)) != valor) {
        anterior = obtenerSiguiente(anterior);
    }
    Nodo* muerto = obtenerSiguiente(anterior);
    if (muerto == NULL) {
        return 0;                               // ningún nodo tiene ese valor
    }
    asignarSiguiente(anterior, obtenerSiguiente(muerto));   // 1: se le salta desde fuera
    return borrarNodo(muerto);                              // 2: y ahora sí se libera
}

void eliminarLista(Lista* lista) {
    Nodo* nodo = lista->cabeza;
    while (nodo != NULL) {
        Nodo* siguiente = obtenerSiguiente(nodo);   // guarda el enlace antes de...
        borrarNodo(nodo);                           // ...liberar el nodo actual
        nodo = siguiente;
    }
    free(lista);
}

// ==================== Salida ====================

void mostrarLista(Lista* lista) {
    printf("Lista: ");
    for (Nodo* nodo = lista->cabeza; nodo != NULL; nodo = obtenerSiguiente(nodo)) {
        printf("%d -> ", obtenerValor(nodo));
    }
    printf("NULL\n");
}
