//
// Created by Jose Ignacio Trasobares Ibor on 22/10/2026.
//

#ifndef COLAS_BICOLASARRAY_H
#define COLAS_BICOLASARRAY_H

#define TAM_BICOLA_ARRAY 100

typedef struct BicolaArray BicolaArray;

BicolaArray *crearBicolaArray();
int estaVaciaBicolaArray(BicolaArray *cola);
int estaLLenaBicolaArray(BicolaArray *cola);
int tamanoBicolaArray(BicolaArray *cola);
int principioBicolaArray(BicolaArray *cola, int *x);
int finalBicolaArray(BicolaArray *cola, int *x);
int eliminarPrincipioBicolaArray(BicolaArray *cola, int *x);
int eliminarFinalBicolaArray(BicolaArray *cola, int *x);
int insertarFinalBicolaArray(BicolaArray *cola, int x);
int insertarPrincipioBicolaArray(BicolaArray *cola, int x);
int vaciarBicolaArray(BicolaArray *cola);
int destruirBicolaArray(BicolaArray *cola);
void mostrarBicolaArray(BicolaArray *cola);

#endif //COLAS_BICOLASARRAY_H
