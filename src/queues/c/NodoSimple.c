#include "NodoSimple.h"

#include <stdlib.h>

struct NodoSimple {
    int valor;
    struct NodoSimple *siguiente;
};

NodoSimple *crearNodoSimple(int valor) {
    NodoSimple* nodo = malloc(sizeof(NodoSimple));
    if (nodo == NULL) return NULL;
    nodo->valor = valor;
    nodo->siguiente = NULL;
    return nodo;

}
int establecerValorNodoSimple(NodoSimple *nodo, int valor) {
    if (nodo == NULL) return 0;
    nodo->valor = valor;
    return 1;
}
int establecerSiguienteNodoSimple(NodoSimple *nodo, NodoSimple* siguiente) {
    if (nodo == NULL) return 0;
    nodo->siguiente = siguiente;
    return 1;
}
int obtenerValorNodoSimple(NodoSimple *nodo) {
    if (nodo == NULL) return 0;
    return nodo->valor;
}
NodoSimple* obtenerSiguienteNodoSimple(NodoSimple *nodo) {
    if (nodo == NULL) return NULL;
    return nodo->siguiente;
}
int eliminarNodoSimple(NodoSimple *nodo) {
    if (nodo == NULL) return 0;
    free(nodo);
    return 1;
}