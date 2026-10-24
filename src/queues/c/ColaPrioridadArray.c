#include "ColaPrioridadArray.h"

#include <stdio.h>
#include <stdlib.h>

#include "ColaEnlazada.h"

struct ColaPrioridadArray {
    ColaEnlazada *colas[NUM_PRIORIDADES];
    int tamano;
};

ColaPrioridadArray *crearColaPrioridadArray() {
    ColaPrioridadArray *cola = malloc(sizeof(ColaPrioridadArray));
    if (cola == NULL) return NULL;
    for (int i = 0; i < NUM_PRIORIDADES; i++) {
        cola->colas[i] = crearColaEnlazada();
        if (cola->colas[i] == NULL) {
            for (int j = 0; j < i; j++) {
                destruirColaEnlazada(cola->colas[j]);
            }
            free(cola);
            return NULL;
        }
    }
    cola->tamano = 0;
    return cola;
}

int estaVaciaColaPrioridadArray(ColaPrioridadArray *cola) {
    if (cola == NULL || cola->tamano == 0) return 1;
    return 0;
}
int tamanoColaPrioridadArray(ColaPrioridadArray *cola) {
    if (cola == NULL) return -1;
    return cola->tamano;
}
int desencolarColaPrioridadArray(ColaPrioridadArray *cola, int *x) {
    if (estaVaciaColaPrioridadArray(cola) == 1) return 0;
    // Primera cola no vacía desde la prioridad 0
    for (int i = 0; i < NUM_PRIORIDADES; i++) {
        if (estaVaciaColaEnlazada(cola->colas[i]) == 0) {
            desencolarColaEnlazada(cola->colas[i], x);
            cola->tamano--;
            return 1;
        }
    }
    return 0;
}
int encolarColaPrioridadArray(ColaPrioridadArray *cola, int x, int prioridad) {
    if (cola == NULL) return 0;
    if (prioridad < 0 || prioridad >= NUM_PRIORIDADES) return 0;
    if (encolarColaEnlazada(cola->colas[prioridad], x) == 0) return 0;
    cola->tamano++;
    return 1;
}
int frenteColaPrioridadArray(ColaPrioridadArray *cola, int *x, int *prioridad) {
    if (estaVaciaColaPrioridadArray(cola) == 1) return 0;
    for (int i = 0; i < NUM_PRIORIDADES; i++) {
        if (frenteColaEnlazada(cola->colas[i], x) == 1) {
            if (prioridad != NULL) {
                *prioridad = i;
            }
            return 1;
        }
    }
    return 0;
}
int vaciarColaPrioridadArray(ColaPrioridadArray *cola) {
    if (cola == NULL) return 0;
    for (int i = 0; i < NUM_PRIORIDADES; i++) {
        vaciarColaEnlazada(cola->colas[i]);
    }
    cola->tamano = 0;
    return 1;
}
void mostrarColaPrioridadArray(ColaPrioridadArray *cola) {
    if (cola == NULL) return;
    printf("Cola Prioridad Array:");
    for (int i = 0; i < NUM_PRIORIDADES; i++) {
        printf("\n  [%d] ", i);
        mostrarColaEnlazada(cola->colas[i]);
    }
}
int destruirColaPrioridadArray(ColaPrioridadArray *cola) {
    if (cola == NULL) return 0;
    for (int i = 0; i < NUM_PRIORIDADES; i++) {
        destruirColaEnlazada(cola->colas[i]);
    }
    free(cola);
    return 1;
}
