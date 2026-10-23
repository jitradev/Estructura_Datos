//
// Created by Jose Ignacio Trasobares Ibor on 22/10/2026.
//

#ifndef COLAS_BICOLASALIDARESTRINGIDA_H
#define COLAS_BICOLASALIDARESTRINGIDA_H

typedef struct BicolaSalidaRestringida BicolaSalidaRestringida;

BicolaSalidaRestringida *crearBicolaSalidaRestringida();
int estaVaciaBicolaSalidaRestringida(BicolaSalidaRestringida *cola);
int tamanoBicolaSalidaRestringida(BicolaSalidaRestringida *cola);
int principioBicolaSalidaRestringida(BicolaSalidaRestringida *cola, int *x);
int eliminarPrincipioBicolaSalidaRestringida(BicolaSalidaRestringida *cola, int *x);
int insertarFinalBicolaSalidaRestringida(BicolaSalidaRestringida *cola, int x);
int insertarPrincipioBicolaSalidaRestringida(BicolaSalidaRestringida *cola, int x);
int vaciarBicolaSalidaRestringida(BicolaSalidaRestringida *cola);
int destruirBicolaSalidaRestringida(BicolaSalidaRestringida *cola);
void mostrarBicolaSalidaRestringida(BicolaSalidaRestringida *cola);

#endif //COLAS_BICOLASALIDARESTRINGIDA_H
