#include "BicolaEnlazada.h"

#include <stdio.h>
#include <stdlib.h>

#include "NodoDoble.h"

struct BicolaEnlazada {
    NodoDoble *inicio;
    NodoDoble *final;
    int tamano;
};

BicolaEnlazada *crearBicolaEnlazada() {
    BicolaEnlazada *cola = malloc(sizeof(BicolaEnlazada));
    if (cola == NULL) return NULL;
    cola->tamano = 0;
    cola->inicio = NULL;
    cola->final = NULL;
    return cola;
}

int estaVaciaBicolaEnlazada(BicolaEnlazada *cola) {
    if (cola == NULL || cola->inicio == NULL) return 1;
    return 0;
}
int tamanoBicolaEnlazada(BicolaEnlazada *cola) {
    if (cola == NULL) return -1;
    return cola->tamano;
}
int principioBicolaEnlazada(BicolaEnlazada *cola, int *x) {
    if (estaVaciaBicolaEnlazada(cola) == 1) return 0;
    *x = obtenerValorNodoDoble(cola->inicio);
    return 1;
}
int finalBicolaEnlazada(BicolaEnlazada *cola, int *x) {
    if (estaVaciaBicolaEnlazada(cola) == 1) return 0;
    *x = obtenerValorNodoDoble(cola->final);
    return 1;
}
int eliminarPrincipioBicolaEnlazada(BicolaEnlazada *cola, int *x) {
    if (estaVaciaBicolaEnlazada(cola) == 1) return 0;
    NodoDoble *aux = cola->inicio;
    *x = obtenerValorNodoDoble(aux);
    cola->inicio = obtenerSiguienteNodoDoble(aux);
    if (cola->inicio == NULL) {
        cola->final = NULL;
    } else {
        establecerAnteriorNodoDoble(cola->inicio, NULL);
    }
    cola->tamano--;
    return eliminarNodoDoble(aux);
}
int eliminarFinalBicolaEnlazada(BicolaEnlazada *cola, int *x) {
    if (estaVaciaBicolaEnlazada(cola) == 1) return 0;
    NodoDoble *aux = cola->final;
    *x = obtenerValorNodoDoble(aux);
    // Penúltimo, sin recorrer la lista
    cola->final = obtenerAnteriorNodoDoble(aux);
    if (cola->final == NULL) {
        cola->inicio = NULL;
    } else {
        establecerSiguienteNodoDoble(cola->final, NULL);
    }
    cola->tamano--;
    return eliminarNodoDoble(aux);
}
int insertarFinalBicolaEnlazada(BicolaEnlazada *cola, int x) {
    if (cola == NULL) return 0;
    NodoDoble *aux = crearNodoDoble(x);
    if (aux == NULL) return 0;
    if (estaVaciaBicolaEnlazada(cola) == 1) {
        cola->inicio = aux;
    } else {
        establecerAnteriorNodoDoble(aux, cola->final);
        establecerSiguienteNodoDoble(cola->final, aux);
    }
    cola->final = aux;
    cola->tamano++;
    return 1;
}
int insertarPrincipioBicolaEnlazada(BicolaEnlazada *cola, int x) {
    if (cola == NULL) return 0;
    NodoDoble *aux = crearNodoDoble(x);
    if (aux == NULL) return 0;
    if (estaVaciaBicolaEnlazada(cola) == 1) {
        cola->final = aux;
    } else {
        establecerSiguienteNodoDoble(aux, cola->inicio);
        establecerAnteriorNodoDoble(cola->inicio, aux);
    }
    cola->inicio = aux;
    cola->tamano++;
    return 1;
}
int vaciarBicolaEnlazada(BicolaEnlazada *cola) {
    int aux = 0;
    while (estaVaciaBicolaEnlazada(cola) == 0) {
        eliminarPrincipioBicolaEnlazada(cola, &aux);
    }
    return 1;
}
void mostrarBicolaEnlazada(BicolaEnlazada *cola) {
    if (cola == NULL) return;
    NodoDoble *aux = cola->inicio;
    printf("Bicola Enlazada: ");
    while (aux != NULL) {
        printf("%d ", obtenerValorNodoDoble(aux));
        aux = obtenerSiguienteNodoDoble(aux);
    }
}
int destruirBicolaEnlazada(BicolaEnlazada *cola) {
    if (cola == NULL) return 0;
    vaciarBicolaEnlazada(cola);
    free(cola);
    return 1;
}
