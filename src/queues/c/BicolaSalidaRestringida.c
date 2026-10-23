#include "BicolaSalidaRestringida.h"

#include <stdio.h>
#include <stdlib.h>

#include "NodoSimple.h"

struct BicolaSalidaRestringida {
    NodoSimple *inicio;
    NodoSimple *final;
    int tamano;
};

BicolaSalidaRestringida *crearBicolaSalidaRestringida() {
    BicolaSalidaRestringida *cola = malloc(sizeof(BicolaSalidaRestringida));
    if (cola == NULL) return NULL;
    cola->tamano = 0;
    cola->inicio = NULL;
    cola->final = NULL;
    return cola;
}

int estaVaciaBicolaSalidaRestringida(BicolaSalidaRestringida *cola) {
    if (cola == NULL || cola->inicio == NULL) return 1;
    return 0;
}
int tamanoBicolaSalidaRestringida(BicolaSalidaRestringida *cola) {
    if (cola == NULL) return -1;
    return cola->tamano;
}
int principioBicolaSalidaRestringida(BicolaSalidaRestringida *cola, int *x) {
    if (estaVaciaBicolaSalidaRestringida(cola) == 1) return 0;
    *x = obtenerValorNodoSimple(cola->inicio);
    return 1;
}
int eliminarPrincipioBicolaSalidaRestringida(BicolaSalidaRestringida *cola, int *x) {
    if (estaVaciaBicolaSalidaRestringida(cola) == 1) return 0;
    NodoSimple *aux = cola->inicio;
    *x = obtenerValorNodoSimple(aux);
    cola->inicio = obtenerSiguienteNodoSimple(aux);
    if (cola->inicio == NULL) {
        cola->final = NULL;
    }
    cola->tamano--;
    return eliminarNodoSimple(aux);
}
int insertarFinalBicolaSalidaRestringida(BicolaSalidaRestringida *cola, int x) {
    if (cola == NULL) return 0;
    NodoSimple *aux = crearNodoSimple(x);
    if (aux == NULL) return 0;
    if (estaVaciaBicolaSalidaRestringida(cola) == 1) {
        cola->inicio = aux;
    } else {
        establecerSiguienteNodoSimple(cola->final, aux);
    }
    cola->final = aux;
    cola->tamano++;
    return 1;
}
int insertarPrincipioBicolaSalidaRestringida(BicolaSalidaRestringida *cola, int x) {
    if (cola == NULL) return 0;
    NodoSimple *aux = crearNodoSimple(x);
    if (aux == NULL) return 0;
    if (estaVaciaBicolaSalidaRestringida(cola) == 1) {
        cola->final = aux;
    } else {
        establecerSiguienteNodoSimple(aux, cola->inicio);
    }
    cola->inicio = aux;
    cola->tamano++;
    return 1;
}
int vaciarBicolaSalidaRestringida(BicolaSalidaRestringida *cola) {
    int aux = 0;
    while (estaVaciaBicolaSalidaRestringida(cola) == 0) {
        eliminarPrincipioBicolaSalidaRestringida(cola, &aux);
    }
    return 1;
}
void mostrarBicolaSalidaRestringida(BicolaSalidaRestringida *cola) {
    if (cola == NULL) return;
    NodoSimple *aux = cola->inicio;
    printf("Bicola Salida Restringida: ");
    while (aux != NULL) {
        printf("%d ", obtenerValorNodoSimple(aux));
        aux = obtenerSiguienteNodoSimple(aux);
    }
}
int destruirBicolaSalidaRestringida(BicolaSalidaRestringida *cola) {
    if (cola == NULL) return 0;
    vaciarBicolaSalidaRestringida(cola);
    free(cola);
    return 1;
}
