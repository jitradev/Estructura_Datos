#include "ColaPrioridadLista.h"

#include <stdio.h>
#include <stdlib.h>

#include "NodoPrioridad.h"

struct ColaPrioridadLista {
    NodoPrioridad *inicio;
    int tamano;
};

ColaPrioridadLista *crearColaPrioridadLista() {
    ColaPrioridadLista *cola = malloc(sizeof(ColaPrioridadLista));
    if (cola == NULL) return NULL;
    cola->inicio = NULL;
    cola->tamano = 0;
    return cola;
}

int estaVaciaColaPrioridadLista(ColaPrioridadLista *cola) {
    if (cola == NULL || cola->inicio == NULL) return 1;
    return 0;
}
int tamanoColaPrioridadLista(ColaPrioridadLista *cola) {
    if (cola == NULL) return -1;
    return cola->tamano;
}
int frenteColaPrioridadLista(ColaPrioridadLista *cola, int *x) {
    if (estaVaciaColaPrioridadLista(cola) == 1) return 0;
    // La lista está ordenada: el más prioritario es siempre el primero
    *x = obtenerValorNodoPrioridad(cola->inicio);
    return 1;
}
int desencolarColaPrioridadLista(ColaPrioridadLista *cola, int *x) {
    if (estaVaciaColaPrioridadLista(cola) == 1) return 0;
    NodoPrioridad *aux = cola->inicio;
    *x = obtenerValorNodoPrioridad(aux);
    cola->inicio = obtenerSiguienteNodoPrioridad(aux);
    cola->tamano--;
    return eliminarNodoPrioridad(aux);
}
int encolarColaPrioridadLista(ColaPrioridadLista *cola, int x, int prioridad) {
    if (cola == NULL) return 0;
    if (prioridad < 0 || prioridad >= NUM_PRIORIDADES) return 0;
    NodoPrioridad *nuevo = crearNodoPrioridad(x, prioridad);
    if (nuevo == NULL) return 0;

    // <= mantiene el orden FIFO entre prioridades iguales
    NodoPrioridad *anterior = NULL;
    NodoPrioridad *actual = cola->inicio;
    while (actual != NULL && obtenerPrioridadNodoPrioridad(actual) <= prioridad) {
        anterior = actual;
        actual = obtenerSiguienteNodoPrioridad(actual);
    }

    establecerSiguienteNodoPrioridad(nuevo, actual);
    if (anterior == NULL) {
        cola->inicio = nuevo;
    } else {
        establecerSiguienteNodoPrioridad(anterior, nuevo);
    }
    cola->tamano++;
    return 1;
}
int vaciarColaPrioridadLista(ColaPrioridadLista *cola) {
    int aux = 0;
    while (estaVaciaColaPrioridadLista(cola) == 0) {
        desencolarColaPrioridadLista(cola, &aux);
    }
    return 1;
}
void mostrarColaPrioridadLista(ColaPrioridadLista *cola) {
    if (cola == NULL) return;
    NodoPrioridad *aux = cola->inicio;
    printf("Cola Prioridad Lista: ");
    while (aux != NULL) {
        printf("%d(p%d) ", obtenerValorNodoPrioridad(aux), obtenerPrioridadNodoPrioridad(aux));
        aux = obtenerSiguienteNodoPrioridad(aux);
    }
}
int destruirColaPrioridadLista(ColaPrioridadLista *cola) {
    if (cola == NULL) return 0;
    vaciarColaPrioridadLista(cola);
    free(cola);
    return 1;
}
