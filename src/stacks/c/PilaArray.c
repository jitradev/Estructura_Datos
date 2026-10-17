#include "PilaArray.h"

#include <stdio.h>
#include <stdlib.h>
#define TAM 1024

struct PilaArray {
    int array[TAM];
    int cima;
};

PilaArray *CrearPilaArray(void) {
    PilaArray *pila = malloc(sizeof(PilaArray));
    if (pila == NULL) { return NULL; }
    pila->cima = -1;
    return pila;
}

void destruirPilaArray(PilaArray *pila) {
    free(pila);
}

int esVaciaArray(PilaArray *pila) {
    // A missing stack is treated as empty
    return pila == NULL || pila->cima == -1;
}

int esLLenaArray(PilaArray *pila) {
    return pila != NULL && pila->cima == TAM - 1;
}

int cimaArray(PilaArray *pila, int *valor) {
    if (esVaciaArray(pila) || valor == NULL) { return 0; }
    *valor = pila->array[pila->cima];
    return 1;
}

int tamanoArray(PilaArray *pila) {
    if (pila == NULL) { return 0; }
    return pila->cima + 1;
}

int pushArray(PilaArray *pila, int valor) {
    if (pila == NULL || esLLenaArray(pila)) { return 0; }
    pila->cima++;
    pila->array[pila->cima] = valor;
    return 1;
}

int popArray(PilaArray *pila, int *valor) {
    if (esVaciaArray(pila)) { return 0; }
    if (valor != NULL) { *valor = pila->array[pila->cima]; }
    pila->cima--;
    return 1;
}

int limpiarArray(PilaArray *pila) {
    if (pila == NULL) { return 0; }
    pila->cima = -1;
    return 1;
}

// Prints from top to bottom using only stack operations; the stack is left unchanged
void imprimirPilaArray(PilaArray *pila) {
    int aux = 0;
    PilaArray *pila2 = CrearPilaArray();
    if (pila == NULL || pila2 == NULL) {
        destruirPilaArray(pila2);
        return;
    }
    printf("cima [");
    while (!esVaciaArray(pila)) {
        popArray(pila, &aux);
        printf(" %d", aux);
        pushArray(pila2, aux);
    }
    printf(" ] fondo\n");
    while (!esVaciaArray(pila2)) {
        popArray(pila2, &aux);
        pushArray(pila, aux);
    }
    destruirPilaArray(pila2);
}

void imprimirPilaArrayV2(PilaArray *pila) {
    if (pila == NULL) { return; }
    printf("fondo [");
    for (int i = 0; i <= pila->cima; i++) printf(" %d", pila->array[i]);
    printf(" ] cima   (cima=%d)\n", pila->cima);
}
