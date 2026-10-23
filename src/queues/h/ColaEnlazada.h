//
// Created by Jose Ignacio Trasobares Ibor on 22/10/2026.
//

#ifndef COLAS_COLAENLAZADA_H
#define COLAS_COLAENLAZADA_H

typedef struct ColaEnlazada ColaEnlazada;

ColaEnlazada *crearColaEnlazada();
int estaVaciaColaEnlazada(ColaEnlazada *cola);
int tamanoColaEnlazada(ColaEnlazada *cola);
int frenteColaEnlazada(ColaEnlazada *cola, int *x);
int desencolarColaEnlazada(ColaEnlazada *cola, int *x);
int encolarColaEnlazada(ColaEnlazada *cola, int x);
int vaciarColaEnlazada(ColaEnlazada *cola);
int destruirColaEnlazada(ColaEnlazada *cola);
void mostrarColaEnlazada(ColaEnlazada *cola);


#endif //COLAS_COLAENLAZADA_H
