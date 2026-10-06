#include "Nodo.h"

#include <stdlib.h>

struct Nodo {
    int valor;          // la información
    Nodo* siguiente;    // el enlace: la dirección del siguiente nodo
};

Nodo* crearNodo(void) {
    Nodo* nodo = malloc(sizeof(Nodo));
    if (nodo == NULL) {
        return NULL;                // malloc puede fallar
    }
    nodo->valor = 0;
    nodo->siguiente = NULL;         // nodo suelto: todavía no enlaza con nada
    return nodo;
}

int borrarNodo(Nodo* nodo) {
    free(nodo);
    return 1;
}

void asignarValor(Nodo* nodo, int valor) {
    nodo->valor = valor;
}

int obtenerValor(Nodo* nodo) {
    return nodo->valor;
}

void asignarSiguiente(Nodo* nodo, Nodo* siguiente) {
    nodo->siguiente = siguiente;
}

Nodo* obtenerSiguiente(Nodo* nodo) {
    return nodo->siguiente;
}

Nodo** obtenerReferenciaSiguiente(Nodo* nodo) {
    // El campo siguiente vive dentro del nodo (en el montón), así que su
    // dirección sigue siendo válida mientras el nodo exista.
    return &nodo->siguiente;
}
