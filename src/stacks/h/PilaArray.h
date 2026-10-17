//
// Created by Jose Ignacio Trasobares Ibor on 15/10/2026.
//

#ifndef PILAS_PILAARRAY_H
#define PILAS_PILAARRAY_H


typedef struct  PilaArray PilaArray;
PilaArray *CrearPilaArray(void);
void destruirPilaArray(PilaArray *pila);
int esVaciaArray(PilaArray *pila);
int esLLenaArray(PilaArray *pila);
int cimaArray(PilaArray *pila, int *valor);
int tamanoArray(PilaArray *pila);
int pushArray(PilaArray *pila, int valor);
int popArray(PilaArray *pila, int *valor);
int limpiarArray(PilaArray *pila);
void imprimirPilaArray(PilaArray *pila);
void imprimirPilaArrayV2(PilaArray *pila);

#endif
