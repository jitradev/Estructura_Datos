/* EDA - Tema 4: cola con prioridad como lista ordenada. Ver cola_prioridad_lista.h. */
#include <stdio.h>
#include <stdlib.h>
#include "cola_prioridad_lista.h"

/* --- D45 y D47 ----------------------------------------------------------------- */
int encolarPrio(ColaPrio *c, int x, int prio) {
    if (prio < 0 || prio >= NPRIO) return 0;
    NodoP *nuevo = malloc(sizeof(NodoP));  if (!nuevo) return 0;
    nuevo->dato = x;  nuevo->prio = prio;
    NodoP **p = &c->cabeza;                     /* el puntero doble del tema 2 */
    while (*p != NULL && (*p)->prio <= prio)    /* <= : detras de sus iguales */
        p = &(*p)->sig;
    nuevo->sig = *p;                            /* 1 */
    *p = nuevo;                                 /* 2 */
    c->n++;
    return 1;
}

/* --- D45 y D48 ----------------------------------------------------------------- */
int desencolarPrio(ColaPrio *c, int *x) {
    NodoP *v = c->cabeza;                       /* sale siempre la cabeza */
    if (v == NULL) return 0;
    *x = v->dato;  c->cabeza = v->sig;
    free(v); c->n--;
    return 1;
}

void crearColaPrio(ColaPrio *c) { c->cabeza = NULL; c->n = 0; }
int  esVaciaPrio(ColaPrio *c)   { return c->cabeza == NULL; }

/* ------------------------------------------------------------------------- */
int tamanoPrio(ColaPrio *c) { return c->n; }

int frentePrio(ColaPrio *c, int *x, int *prio) {
    if (esVaciaPrio(c)) return 0;
    *x = c->cabeza->dato;  *prio = c->cabeza->prio;
    return 1;
}

void liberarColaPrio(ColaPrio *c) {
    int basura;
    while (desencolarPrio(c, &basura)) { }
}

void mostrarPrio(ColaPrio *c) {
    printf("sale primero <");
    for (NodoP *p = c->cabeza; p != NULL; p = p->sig)
        printf(" %d(p%d)", p->dato, p->prio);
    printf(" >   (n=%d)\n", c->n);
}

const char *implementacion(void) { return "una lista ordenada (opcion 1)"; }
