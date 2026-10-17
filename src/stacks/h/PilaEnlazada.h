#ifndef PILAS_PILAENLAZADA_H
#define PILAS_PILAENLAZADA_H


typedef struct PilaEnlazada PilaEnlazada;
PilaEnlazada *CrearPilaEnlazada(void);
void destruirPilaEnlazada(PilaEnlazada *pila);
int esVaciaEnlazada(PilaEnlazada *pila);
int cimaEnlazada(PilaEnlazada *pila, int *valor);
int tamanoEnlazada(PilaEnlazada *pila);
int pushEnlazada(PilaEnlazada *pila, int valor);
int popEnlazada(PilaEnlazada *pila, int *valor);
int limpiarEnlazada(PilaEnlazada *pila);
void imprimirPilaEnlazada(PilaEnlazada *pila);

#endif
