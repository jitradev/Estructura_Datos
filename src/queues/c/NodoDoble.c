#include "NodoDoble.h"

#include <stdlib.h>

struct NodoDoble {
    int valor;
    struct NodoDoble *anterior;
    struct NodoDoble *siguiente;
};

NodoDoble *crearNodoDoble(int valor) {
    NodoDoble *nodo = malloc(sizeof(NodoDoble));
    if (nodo == NULL) return NULL;
    nodo->valor = valor;
    nodo->anterior = NULL;
    nodo->siguiente = NULL;
    return nodo;
}
int establecerValorNodoDoble(NodoDoble *nodo, int valor) {
    if (nodo == NULL) return 0;
    nodo->valor = valor;
    return 1;
}
int establecerSiguienteNodoDoble(NodoDoble *nodo, NodoDoble *siguiente) {
    if (nodo == NULL) return 0;
    nodo->siguiente = siguiente;
    return 1;
}
int establecerAnteriorNodoDoble(NodoDoble *nodo, NodoDoble *anterior) {
    if (nodo == NULL) return 0;
    nodo->anterior = anterior;
    return 1;
}
int obtenerValorNodoDoble(NodoDoble *nodo) {
    if (nodo == NULL) return 0;
    return nodo->valor;
}
NodoDoble *obtenerSiguienteNodoDoble(NodoDoble *nodo) {
    if (nodo == NULL) return NULL;
    return nodo->siguiente;
}
NodoDoble *obtenerAnteriorNodoDoble(NodoDoble *nodo) {
    if (nodo == NULL) return NULL;
    return nodo->anterior;
}
int eliminarNodoDoble(NodoDoble *nodo) {
    if (nodo == NULL) return 0;
    free(nodo);
    return 1;
}
