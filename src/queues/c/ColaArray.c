#include  "ColaArray.h"

#include <stdio.h>
#include <stdlib.h>

struct ColaArray {
    int array[TAM_COLA_ARRAY];
    int frente;
    int final;
    int numElementos;
};

ColaArray *crearColaArray() {
    ColaArray *cola = malloc(sizeof(ColaArray));
    if (cola == NULL) return NULL;
    cola->frente = 0;
    cola->final = 0;
    cola->numElementos = 0;
    return cola;
}

int estaVaciaColaArray(ColaArray *cola) {
    if(cola == NULL || cola->numElementos == 0) {
        return 1;
    }
    return 0;

}

int estaLLenaColaArray(ColaArray *cola) {
    if(cola == NULL || cola->numElementos == TAM_COLA_ARRAY) {
        return 1;
    }
    return 0;
}
int tamanoColaArray(ColaArray *cola) {
    if (cola == NULL) return -1;
    return cola->numElementos;
}

int desencolarColaArray(ColaArray *cola, int *x) {
    if(estaVaciaColaArray(cola) == 1) return 0;
    *x = cola->array[cola->frente];
    cola->frente = (cola->frente + 1) % TAM_COLA_ARRAY;
    cola->numElementos--;
    return 1;
}

int encolarColaArray(ColaArray *cola, int x) {
    if(estaLLenaColaArray(cola) == 1) return 0;
    cola->array[cola->final] = x;
    cola->final = (cola->final + 1) % TAM_COLA_ARRAY;
    cola->numElementos++;
    return 1;
}

int frenteColaArray(ColaArray *cola, int *x) {
    if(estaVaciaColaArray(cola) == 1) return 0;
    *x = cola->array[cola->frente];
    return 1;
}

int vaciarColaArray(ColaArray *cola) {
    if (cola == NULL) return 0;
    cola->frente = 0;
    cola->final = 0;
    cola->numElementos = 0;
    return 1;
}

void mostrarColaArray(ColaArray *cola) {
    if (cola == NULL) return;
    for (int i = 0; i < cola->numElementos; i++) {
        printf("%d ", cola->array[(i+ cola->frente) % TAM_COLA_ARRAY]);
    }
}
int destruirColaArray(ColaArray *cola) {
    if (cola == NULL) return 0;
    vaciarColaArray(cola);
    free(cola);
    return 1;
}
