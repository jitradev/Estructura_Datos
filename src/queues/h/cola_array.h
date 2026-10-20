/* EDA - Tema 4: el TAD Cola (diapositiva 5) sobre un ARRAY CIRCULAR
 * (diapositivas 7 a 18).
 *
 * frente es el indice del primer elemento y final el del primer hueco libre;
 * los dos avanzan con % MAX, asi que el array se reutiliza dando vueltas y
 * ningun elemento cambia de sitio. Llena y vacia se distinguen con el
 * contador n (la segunda salida al dilema de la diapositiva 12).
 *
 * Copiado tal cual del deck: el struct, crearCola, estaVacia y estaLlena (D13),
 * encolar y desencolar (D15 y D17). frente, tamano, limpiar y mostrar completan la
 * especificacion. Los nombres son los de la D13 (estaVacia, estaLlena).
 */
#ifndef COLA_ARRAY_H
#define COLA_ARRAY_H

#define MAX 5

typedef struct {
    int datos[MAX];
    int frente;   /* indice del primer elemento */
    int final;    /* indice del primer hueco libre */
    int n;        /* elementos ocupados */
} ColaCircular;

void crearCola(ColaCircular *c);
int  estaVacia(ColaCircular *c);
int  estaLlena(ColaCircular *c);

int  encolar(ColaCircular *c, int x);       /* 0 si esta llena */
int  desencolar(ColaCircular *c, int *x);   /* 0 si esta vacia */
int  frente(ColaCircular *c, int *x);       /* consulta sin extraer */
int  tamano(ColaCircular *c);
void limpiar(ColaCircular *c);

void mostrar(ColaCircular *c);              /* en orden logico, y el array tal cual */

#endif
