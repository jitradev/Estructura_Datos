/* EDA - Tema 4: cola sobre array circular. Ver cola_array.h. */
#include <stdio.h>
#include "cola_array.h"

/* --- D13 ----------------------------------------------------------------- */
void crearCola(ColaCircular *c) {
    c->frente = 0; c->final = 0; c->n = 0;
}

int estaVacia(ColaCircular *c) { return c->n == 0;   }
int estaLlena(ColaCircular *c) { return c->n == MAX; }

/* --- D15 y D17 ----------------------------------------------------------------- */
int encolar(ColaCircular *c, int x) {
    if (estaLlena(c)) return 0;       /* sin esto se machaca el frente */
    c->datos[c->final] = x;
    c->final = (c->final + 1) % MAX;
    c->n++;
    return 1;
}

int desencolar(ColaCircular *c, int *x) {
    if (estaVacia(c)) return 0;
    *x = c->datos[c->frente];
    c->frente = (c->frente + 1) % MAX;
    c->n--;
    return 1;
}

/* ------------------------------------------------------------------------- */
int frente(ColaCircular *c, int *x) {
    if (estaVacia(c)) return 0;
    *x = c->datos[c->frente];          /* como desencolar, sin mover nada */
    return 1;
}

int  tamano(ColaCircular *c)  { return c->n; }
void limpiar(ColaCircular *c) { crearCola(c); }

void mostrar(ColaCircular *c) {
    printf("frente <");
    for (int k = 0, i = c->frente; k < c->n; k++, i = (i + 1) % MAX)
        printf(" %d", c->datos[i]);
    printf(" > final   (frente=%d, final=%d, n=%d)\n", c->frente, c->final, c->n);
}
