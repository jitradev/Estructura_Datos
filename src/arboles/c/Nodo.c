#include "Nodo.h"

#include <stdlib.h>


struct Nodo {
    int valor;
    Nodo* derecha;
    Nodo* izquierda;
};

Nodo *crearNodo(int valor) {
    Nodo* nuevo = malloc(sizeof(Nodo));
    if (nuevo == NULL) {
        return NULL;
    }
    nuevo->valor = valor;
    nuevo->derecha = NULL;
    nuevo->izquierda = NULL;
    return nuevo;
}

int establecerValor(Nodo* nodo,int valor) {
    if (nodo == NULL) {
        return 0;
    }
    nodo->valor = valor;
    return 1;
}

int establecerIzquierda(Nodo* padre,Nodo* hijo) {
    if (padre == NULL) {
        return 0;
    }
    padre->izquierda = hijo;
    return 1;
}

int establecerDerecha(Nodo* padre,Nodo* hijo) {
    if (padre == NULL) {
        return 0;
    }
    padre->derecha = hijo;
    return 1;
}

int obtenerValor(Nodo* nodo) {
    if (nodo == NULL) {
        return -1;
    }
    return nodo->valor;
}

Nodo* obtenerIzquierda(Nodo* nodo) {
    if (nodo == NULL) {
        return NULL;
    }
    return nodo->izquierda;
}

Nodo* obtenerDerecha(Nodo* nodo) {
    if (nodo == NULL) {
        return NULL;
    }
    return nodo->derecha;
}

int liberarNodo(Nodo* nodo) {
    if (nodo == NULL) {
        return 0;
    }
    free(nodo);
    return 1;
}
