#include "NodoDoble.h"

#include <stdlib.h>

struct NodoDoble {
    int valor;              // la información
    NodoDoble* siguiente;   // enlace al siguiente
    NodoDoble* anterior;    // enlace al anterior
};

NodoDoble* crearNodoDoble(void) {
    NodoDoble* nodo = malloc(sizeof(NodoDoble));
    if (nodo == NULL) {
        return NULL;                // malloc puede fallar
    }
    nodo->valor = 0;
    nodo->siguiente = NULL;         // los dos enlaces nacen a NULL: nodo suelto
    nodo->anterior = NULL;
    return nodo;
}

int borrarNodoDoble(NodoDoble* nodo) {
    free(nodo);
    return 1;
}

void asignarValorNodoDoble(NodoDoble* nodo, int valor) {
    nodo->valor = valor;
}

int obtenerValorNodoDoble(NodoDoble* nodo) {
    return nodo->valor;
}

void asignarSiguienteNodoDoble(NodoDoble* nodo, NodoDoble* siguiente) {
    nodo->siguiente = siguiente;
}

NodoDoble* obtenerSiguienteNodoDoble(NodoDoble* nodo) {
    return nodo->siguiente;
}

NodoDoble** obtenerReferenciaSiguienteNodoDoble(NodoDoble* nodo) {
    return &nodo->siguiente;
}

void asignarAnteriorNodoDoble(NodoDoble* nodo, NodoDoble* anterior) {
    nodo->anterior = anterior;
}

NodoDoble* obtenerAnteriorNodoDoble(NodoDoble* nodo) {
    return nodo->anterior;
}
