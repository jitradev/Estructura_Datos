//
// Created by Jose Ignacio Trasobares Ibor on 22/10/2026.
//

#ifndef COLAS_NODOSIMPLE_H
#define COLAS_NODOSIMPLE_H

typedef struct NodoSimple NodoSimple;

NodoSimple *crearNodoSimple(int valor);
int establecerValorNodoSimple(NodoSimple *nodo, int valor);
int establecerSiguienteNodoSimple(NodoSimple *nodo, NodoSimple* siguiente);
int obtenerValorNodoSimple(NodoSimple *nodo);
NodoSimple* obtenerSiguienteNodoSimple(NodoSimple *nodo);
int eliminarNodoSimple(NodoSimple *nodo);

#endif //COLAS_NODOSIMPLE_H
