#include "PilaEnlazada.h"

#include <stdio.h>
#include <stdlib.h>

typedef struct Nodo {
    int valor;
    struct Nodo *siguiente;
} Nodo;

struct PilaEnlazada {
    Nodo *cima;
    int tamano;
};

PilaEnlazada *CrearPilaEnlazada(void) {
    PilaEnlazada *pila = malloc(sizeof(PilaEnlazada));
    if (pila == NULL) { return NULL; }
    pila->cima = NULL;
    pila->tamano = 0;
    return pila;
}

void destruirPilaEnlazada(PilaEnlazada *pila) {
    if (pila == NULL) { return; }
    limpiarEnlazada(pila);
    free(pila);
}

int esVaciaEnlazada(PilaEnlazada *pila) {
    return pila == NULL || pila->cima == NULL;
}

int cimaEnlazada(PilaEnlazada *pila, int *valor) {
    if (esVaciaEnlazada(pila) || valor == NULL) { return 0; }
    *valor = pila->cima->valor;
    return 1;
}

int tamanoEnlazada(PilaEnlazada *pila) {
    if (pila == NULL) { return 0; }
    return pila->tamano;
}

// No fixed capacity: push only fails if memory runs out
int pushEnlazada(PilaEnlazada *pila, int valor) {
    if (pila == NULL) { return 0; }
    Nodo *nuevo = malloc(sizeof(Nodo));
    if (nuevo == NULL) { return 0; }
    nuevo->valor = valor;
    nuevo->siguiente = pila->cima;
    pila->cima = nuevo;
    pila->tamano++;
    return 1;
}

int popEnlazada(PilaEnlazada *pila, int *valor) {
    if (esVaciaEnlazada(pila)) { return 0; }
    Nodo *borrar = pila->cima;
    if (valor != NULL) { *valor = borrar->valor; }
    pila->cima = borrar->siguiente;
    free(borrar);
    pila->tamano--;
    return 1;
}

int limpiarEnlazada(PilaEnlazada *pila) {
    if (pila == NULL) { return 0; }
    while (popEnlazada(pila, NULL)) {}
    return 1;
}

void imprimirPilaEnlazada(PilaEnlazada *pila) {
    int aux = 0;
    PilaEnlazada *pila2 = CrearPilaEnlazada();
    if (pila == NULL || pila2 == NULL) {
        destruirPilaEnlazada(pila2);
        return;
    }
    printf("cima [");
    while (!esVaciaEnlazada(pila)) {
        popEnlazada(pila, &aux);
        printf(" %d", aux);
        pushEnlazada(pila2, aux);
    }
    printf(" ] fondo\n");
    while (!esVaciaEnlazada(pila2)) {
        popEnlazada(pila2, &aux);
        pushEnlazada(pila, aux);
    }
    destruirPilaEnlazada(pila2);
}
