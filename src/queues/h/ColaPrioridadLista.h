//
// Created by Jose Ignacio Trasobares Ibor on 22/10/2026.
//

#ifndef COLAS_COLAPRIORIDADLISTA_H
#define COLAS_COLAPRIORIDADLISTA_H

#define NUM_PRIORIDADES 4


typedef struct ColaPrioridadLista ColaPrioridadLista;

ColaPrioridadLista *crearColaPrioridadLista();
int estaVaciaColaPrioridadLista(ColaPrioridadLista *cola);
int tamanoColaPrioridadLista(ColaPrioridadLista *cola);
int frenteColaPrioridadLista(ColaPrioridadLista *cola, int *x);
int desencolarColaPrioridadLista(ColaPrioridadLista *cola, int *x);
int encolarColaPrioridadLista(ColaPrioridadLista *cola, int x, int prioridad);
int vaciarColaPrioridadLista(ColaPrioridadLista *cola);
int destruirColaPrioridadLista(ColaPrioridadLista *cola);
void mostrarColaPrioridadLista(ColaPrioridadLista *cola);

#endif //COLAS_COLAPRIORIDADLISTA_H
