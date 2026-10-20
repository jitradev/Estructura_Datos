/* EDA - Tema 4: cola enlazada. Ver cola_enlazada.h. */
#include <stdio.h>
#include <stdlib.h>
#include "cola_enlazada.h"

/* --- D20 y D22 ----------------------------------------------------------------- */
void crearCola(Cola *c) { c->frente = c->final = NULL; c->n = 0; }
int  esVacia(Cola *c)   { return c->frente == NULL; }

int encolar(Cola *c, int x) {
    Nodo *nuevo = malloc(sizeof(Nodo));
    if (!nuevo) return 0;
    nuevo->dato = x; nuevo->sig = NULL;
    if (esVacia(c)) c->frente = nuevo;
    else            c->final->sig = nuevo;
    c->final = nuevo;             /* en los dos casos */
    c->n++;
    return 1;
}

/* --- D24 ----------------------------------------------------------------- */
int desencolar(Cola *c, int *x) {
    Nodo *v;
    if (esVacia(c)) return 0;
    v = c->frente; *x = v->dato;
    c->frente = v->sig;             /* 1: se salta el nodo */
    if (c->frente == NULL)
        c->final = NULL;            /* se ha quedado vacia */
    free(v); c->n--;                /* 2: y ahora si se libera */
    return 1;
}

/* ------------------------------------------------------------------------- */
int frente(Cola *c, int *x) {
    if (esVacia(c)) return 0;
    *x = c->frente->dato;
    return 1;
}

int tamano(Cola *c) { return c->n; }

void limpiar(Cola *c) {
    int basura;
    while (desencolar(c, &basura)) { }   /* desencolar ya libera cada nodo */
}

void mostrar(Cola *c) {
    printf("frente <");
    for (Nodo *p = c->frente; p != NULL; p = p->sig)
        printf(" %d", p->dato);
    printf(" > final   (n=%d)\n", c->n);
}
