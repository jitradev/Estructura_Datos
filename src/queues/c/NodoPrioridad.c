#include "NodoPrioridad.h"

#include <stdlib.h>

struct NodoPrioridad {
    int valor;
    int prioridad;
    struct NodoPrioridad *siguiente;
};

NodoPrioridad *crearNodoPrioridad(int valor, int prioridad) {
    NodoPrioridad *nodo = malloc(sizeof(NodoPrioridad));
    if (nodo == NULL) return NULL;
    nodo->valor = valor;
    nodo->prioridad = prioridad;
    nodo->siguiente = NULL;
    return nodo;
}
int establecerValorNodoPrioridad(NodoPrioridad *nodo, int valor) {
    if (nodo == NULL) return 0;
    nodo->valor = valor;
    return 1;
}
int establecerSiguienteNodoPrioridad(NodoPrioridad *nodo, NodoPrioridad *siguiente) {
    if (nodo == NULL) return 0;
    nodo->siguiente = siguiente;
    return 1;
}
int obtenerValorNodoPrioridad(NodoPrioridad *nodo) {
    if (nodo == NULL) return 0;
    return nodo->valor;
}
int obtenerPrioridadNodoPrioridad(NodoPrioridad *nodo) {
    if (nodo == NULL) return -1;
    return nodo->prioridad;
}
NodoPrioridad *obtenerSiguienteNodoPrioridad(NodoPrioridad *nodo) {
    if (nodo == NULL) return NULL;
    return nodo->siguiente;
}
int eliminarNodoPrioridad(NodoPrioridad *nodo) {
    if (nodo == NULL) return 0;
    free(nodo);
    return 1;
}
