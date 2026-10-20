/* EDA - Tema 4: el TAD Cola (diapositiva 5) como lista ENLAZADA
 * (diapositivas 19 a 24).
 *
 * Hacen falta dos punteros: frente, por donde se desencola, y final, por donde
 * se encola. Con uno solo, encolar obligaria a recorrer hasta el ultimo nodo.
 * No hay tamano maximo: solo lo limita la memoria.
 *
 * Copiado tal cual del deck: los dos tipos, crearCola, esVacia y encolar (D20 y D22)
 * y desencolar (D24). frente, tamano, limpiar y mostrar completan la
 * especificacion.
 */
#ifndef COLA_ENLAZADA_H
#define COLA_ENLAZADA_H

typedef struct Nodo { int dato; struct Nodo *sig; } Nodo;
typedef struct { Nodo *frente; Nodo *final; int n; } Cola;

void crearCola(Cola *c);
int  esVacia(Cola *c);

int  encolar(Cola *c, int x);       /* 0 solo si malloc falla */
int  desencolar(Cola *c, int *x);   /* 0 si esta vacia */
int  frente(Cola *c, int *x);       /* consulta sin extraer */
int  tamano(Cola *c);
void limpiar(Cola *c);              /* libera todos los nodos */

void mostrar(Cola *c);

#endif
