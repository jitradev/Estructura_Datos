//
// Created by Jose Ignacio Trasobares Ibor on 22/10/2026.
//

#ifndef COLAS_NODODOBLE_H
#define COLAS_NODODOBLE_H

typedef struct NodoDoble NodoDoble;

NodoDoble *crearNodoDoble(int valor);
int establecerValorNodoDoble(NodoDoble *nodo, int valor);
int establecerSiguienteNodoDoble(NodoDoble *nodo, NodoDoble *siguiente);
int establecerAnteriorNodoDoble(NodoDoble *nodo, NodoDoble *anterior);
int obtenerValorNodoDoble(NodoDoble *nodo);
NodoDoble *obtenerSiguienteNodoDoble(NodoDoble *nodo);
NodoDoble *obtenerAnteriorNodoDoble(NodoDoble *nodo);
int eliminarNodoDoble(NodoDoble *nodo);

#endif //COLAS_NODODOBLE_H
