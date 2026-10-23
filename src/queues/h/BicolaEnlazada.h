//
// Created by Jose Ignacio Trasobares Ibor on 22/10/2026.
//

#ifndef COLAS_BICOLAENLAZADA_H
#define COLAS_BICOLAENLAZADA_H

typedef struct BicolaEnlazada BicolaEnlazada;

BicolaEnlazada *crearBicolaEnlazada();
int estaVaciaBicolaEnlazada(BicolaEnlazada *cola);
int tamanoBicolaEnlazada(BicolaEnlazada *cola);
int principioBicolaEnlazada(BicolaEnlazada *cola, int *x);
int finalBicolaEnlazada(BicolaEnlazada *cola, int *x);
int eliminarPrincipioBicolaEnlazada(BicolaEnlazada *cola, int *x);
int eliminarFinalBicolaEnlazada(BicolaEnlazada *cola, int *x);
int insertarFinalBicolaEnlazada(BicolaEnlazada *cola, int x);
int insertarPrincipioBicolaEnlazada(BicolaEnlazada *cola, int x);
int vaciarBicolaEnlazada(BicolaEnlazada *cola);
int destruirBicolaEnlazada(BicolaEnlazada *cola);
void mostrarBicolaEnlazada(BicolaEnlazada *cola);

#endif //COLAS_BICOLAENLAZADA_H
