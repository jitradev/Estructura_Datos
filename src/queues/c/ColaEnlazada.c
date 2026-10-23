#include "ColaEnlazada.h"

#include <stdio.h>
#include <stdlib.h>

#include "NodoSimple.h"


struct ColaEnlazada {
    NodoSimple *inicio;
    NodoSimple *final;
    int tamano;
};


ColaEnlazada *crearColaEnlazada() {
    ColaEnlazada *cola = malloc(sizeof(ColaEnlazada));
    if(cola == NULL) return NULL;
    cola->tamano = 0;
    cola->inicio = NULL;
    cola->final = NULL;
    return cola;
}


int estaVaciaColaEnlazada(ColaEnlazada *cola) {
    if (cola == NULL || cola->inicio == NULL) return 1;
    return 0;
}
int tamanoColaEnlazada(ColaEnlazada *cola) {
    if (cola == NULL) return -1;
    return cola->tamano;
}

int frenteColaEnlazada(ColaEnlazada *cola, int *x) {
    if (estaVaciaColaEnlazada(cola) == 1) return 0;
    *x = obtenerValorNodoSimple(cola->inicio);
    return 1;
}
int desencolarColaEnlazada(ColaEnlazada *cola, int *x) {
    if (estaVaciaColaEnlazada(cola) == 1) return 0;
    *x = obtenerValorNodoSimple(cola->inicio);
    NodoSimple *aux = cola->inicio;
    cola->inicio = obtenerSiguienteNodoSimple(cola->inicio);
    if (cola->inicio == NULL) {
        cola->final = NULL;
    }
    cola->tamano--;
    if (eliminarNodoSimple(aux) == 1) return 1;

    return 0;
}
int encolarColaEnlazada(ColaEnlazada *cola, int x) {
    if (cola == NULL) return 0;
    NodoSimple *aux = crearNodoSimple(x);
    if (aux == NULL) return 0;
    if (estaVaciaColaEnlazada(cola) == 1) {
        cola->inicio = aux;
    }else {
        establecerSiguienteNodoSimple(cola->final, aux);
    }
    cola->final = aux;
    cola->tamano++;
    return 1;
}
int vaciarColaEnlazada(ColaEnlazada *cola) {
    int aux = 0;
    while (estaVaciaColaEnlazada(cola) == 0) {
        desencolarColaEnlazada(cola, &aux);
    }
    return 1;
}
void mostrarColaEnlazada(ColaEnlazada *cola) {
    if (cola == NULL) return;
    NodoSimple *aux = cola->inicio;
    printf("Cola Enlazada: ");
    while (aux != NULL) {
        printf("%d ", obtenerValorNodoSimple(aux));
        aux = obtenerSiguienteNodoSimple(aux);
    }
}
int destruirColaEnlazada(ColaEnlazada *cola) {
    if (cola == NULL) return 0;
    vaciarColaEnlazada(cola);
    free(cola);
    return 1;
}
