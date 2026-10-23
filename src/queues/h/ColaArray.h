//
// Created by Jose Ignacio Trasobares Ibor on 21/10/2026.
//

#ifndef COLAS_COLAARRAY_H
#define COLAS_COLAARRAY_H


#define TAM_COLA_ARRAY 10

typedef struct ColaArray ColaArray;

ColaArray *crearColaArray();
int estaVaciaColaArray(ColaArray *cola);
int estaLLenaColaArray(ColaArray *cola);
int tamanoColaArray(ColaArray *cola);
int frenteColaArray(ColaArray *cola, int *x);
int desencolarColaArray(ColaArray *cola, int *x);
int encolarColaArray(ColaArray *cola, int x);
int vaciarColaArray(ColaArray *cola);
int destruirColaArray(ColaArray *cola);
void mostrarColaArray(ColaArray *cola);


#endif //COLAS_COLAARRAY_H
