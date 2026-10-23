//
// Created by Jose Ignacio Trasobares Ibor on 22/10/2026.
//

#ifndef COLAS_NODOPRIORIDAD_H
#define COLAS_NODOPRIORIDAD_H

typedef struct NodoPrioridad NodoPrioridad;

NodoPrioridad *crearNodoPrioridad(int valor, int prioridad);
int establecerValorNodoPrioridad(NodoPrioridad *nodo, int valor);
int establecerSiguienteNodoPrioridad(NodoPrioridad *nodo, NodoPrioridad *siguiente);
int obtenerValorNodoPrioridad(NodoPrioridad *nodo);
int obtenerPrioridadNodoPrioridad(NodoPrioridad *nodo);
NodoPrioridad *obtenerSiguienteNodoPrioridad(NodoPrioridad *nodo);
int eliminarNodoPrioridad(NodoPrioridad *nodo);

#endif //COLAS_NODOPRIORIDAD_H
