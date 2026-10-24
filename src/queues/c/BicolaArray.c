#include <stdio.h>
#include <stdlib.h>

#include "BicolasArray.h"

struct BicolaArray {
    int array[TAM_BICOLA_ARRAY];
    int frente;
    int final;
    int numElementos;
};

BicolaArray *crearBicolaArray() {
    BicolaArray *cola = malloc(sizeof(BicolaArray));
    if (cola == NULL) return NULL;
    cola->frente = 0;
    cola->final = 0;
    cola->numElementos = 0;
    return cola;
}

int estaVaciaBicolaArray(BicolaArray *cola) {
    if(cola == NULL || cola->numElementos == 0) {
        return 1;
    }
    return 0;

}

int estaLLenaBicolaArray(BicolaArray *cola) {
    if(cola == NULL || cola->numElementos == TAM_BICOLA_ARRAY) {
        return 1;
    }
    return 0;
}
int tamanoBicolaArray(BicolaArray *cola) {
    if (cola == NULL) return -1;
    return cola->numElementos;
}

int eliminarPrincipioBicolaArray(BicolaArray *cola, int *x) {
    if(estaVaciaBicolaArray(cola) == 1) return 0;
    *x = cola->array[cola->frente];
    cola->frente = (cola->frente + 1) % TAM_BICOLA_ARRAY;
    cola->numElementos--;
    return 1;
}

int eliminarFinalBicolaArray(BicolaArray *cola, int *x) {
    if(estaVaciaBicolaArray(cola) == 1) return 0;
    cola->final = (cola->final - 1 + TAM_BICOLA_ARRAY) % TAM_BICOLA_ARRAY;
    *x = cola->array[cola->final];
    cola->numElementos--;
    return 1;
}



int insertarFinalBicolaArray(BicolaArray *cola, int x) {
    if(estaLLenaBicolaArray(cola) == 1) return 0;
    cola->array[cola->final] = x;
    cola->final = (cola->final + 1) % TAM_BICOLA_ARRAY;
    cola->numElementos++;
    return 1;
}

int insertarPrincipioBicolaArray(BicolaArray *cola, int x) {
    if(estaLLenaBicolaArray(cola) == 1) return 0;
    cola->frente = (cola->frente - 1 + TAM_BICOLA_ARRAY) % TAM_BICOLA_ARRAY;
    cola->array[cola->frente] = x;
    cola->numElementos++;
    return 1;
}

int principioBicolaArray(BicolaArray *cola, int *x) {
    if(estaVaciaBicolaArray(cola) == 1) return 0;
    *x = cola->array[cola->frente];
    return 1;
}

int finalBicolaArray(BicolaArray *cola, int *x) {
    if(estaVaciaBicolaArray(cola) == 1) return 0;
    *x = cola->array[(cola->final - 1 + TAM_BICOLA_ARRAY) % TAM_BICOLA_ARRAY];
    return 1;
}

int vaciarBicolaArray(BicolaArray *cola) {
    if (cola == NULL) return 0;
    cola->frente = 0;
    cola->final = 0;
    cola->numElementos = 0;
    return 1;
}

void mostrarBicolaArray(BicolaArray *cola) {
    if (cola == NULL) return;
    for (int i = 0; i < cola->numElementos; i++) {
        printf("%d ", cola->array[(i+ cola->frente) % TAM_BICOLA_ARRAY]);
    }
}
int destruirBicolaArray(BicolaArray *cola) {
    if (cola == NULL) return 0;
    vaciarBicolaArray(cola);
    free(cola);
    return 1;
}
