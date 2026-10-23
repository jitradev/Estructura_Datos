//
// Created by Jose Ignacio Trasobares Ibor on 22/10/2026.
//

#ifndef COLAS_COLAPRIORIDADARRAY_H
#define COLAS_COLAPRIORIDADARRAY_H

#define NUM_PRIORIDADES 4


typedef struct ColaPrioridadArray ColaPrioridadArray;

ColaPrioridadArray *crearColaPrioridadArray();
int estaVaciaColaPrioridadArray(ColaPrioridadArray *cola);
int tamanoColaPrioridadArray(ColaPrioridadArray *cola);
int frenteColaPrioridadArray(ColaPrioridadArray *cola, int *x);
int desencolarColaPrioridadArray(ColaPrioridadArray *cola, int *x);
int encolarColaPrioridadArray(ColaPrioridadArray *cola, int x, int prioridad);
int vaciarColaPrioridadArray(ColaPrioridadArray *cola);
int destruirColaPrioridadArray(ColaPrioridadArray *cola);
void mostrarColaPrioridadArray(ColaPrioridadArray *cola);

#endif //COLAS_COLAPRIORIDADARRAY_H
